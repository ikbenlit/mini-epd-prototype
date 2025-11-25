import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/auth/server'
import { createClient as createDeepgramClient } from '@deepgram/sdk'

// Rate limiting configuratie
const MAX_TOKENS_PER_USER_PER_HOUR = 5      // Per gebruiker
const MAX_TOKENS_GLOBAL_PER_HOUR = 50       // Totaal voor hele app
const MAX_RECORDING_MINUTES_PER_DAY = 30    // Geschatte minuten per dag (globaal)
const TOKEN_TTL_SECONDS = 600               // Token geldig voor 10 min (korter = veiliger)
const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_MS = 24 * 60 * 60 * 1000

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  reason?: string
}

// Per-user rate limiting
const userRateLimitStore = new Map<string, RateLimitEntry>()

// Global rate limiting (beschermt tegen misbruik door meerdere users)
let globalHourlyCount = 0
let globalHourlyResetAt = Date.now() + HOUR_IN_MS
let globalDailyMinutes = 0
let globalDailyResetAt = Date.now() + DAY_IN_MS

function consumeRateLimit(userId: string): RateLimitResult {
  const now = Date.now()

  // Reset global counters if needed
  if (now >= globalHourlyResetAt) {
    globalHourlyCount = 0
    globalHourlyResetAt = now + HOUR_IN_MS
  }
  if (now >= globalDailyResetAt) {
    globalDailyMinutes = 0
    globalDailyResetAt = now + DAY_IN_MS
  }

  // Check global hourly limit
  if (globalHourlyCount >= MAX_TOKENS_GLOBAL_PER_HOUR) {
    console.log('[RateLimit] Global hourly limit reached:', globalHourlyCount)
    return {
      allowed: false,
      remaining: 0,
      resetAt: globalHourlyResetAt,
      reason: 'Globale limiet bereikt. Probeer later opnieuw.',
    }
  }

  // Check global daily minutes (rough estimate: 1 token ≈ 10 min recording)
  const estimatedMinutes = globalHourlyCount * 10
  if (estimatedMinutes >= MAX_RECORDING_MINUTES_PER_DAY) {
    console.log('[RateLimit] Daily recording limit reached:', estimatedMinutes, 'min')
    return {
      allowed: false,
      remaining: 0,
      resetAt: globalDailyResetAt,
      reason: 'Dagelijkse opnamelimiet bereikt.',
    }
  }

  // Check per-user limit
  const entry = userRateLimitStore.get(userId)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + HOUR_IN_MS
    userRateLimitStore.set(userId, { count: 1, resetAt })
    globalHourlyCount++
    return {
      allowed: true,
      remaining: MAX_TOKENS_PER_USER_PER_HOUR - 1,
      resetAt,
    }
  }

  if (entry.count >= MAX_TOKENS_PER_USER_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      reason: 'Je hebt de limiet van 5 opnames per uur bereikt.',
    }
  }

  entry.count += 1
  globalHourlyCount++

  return {
    allowed: true,
    remaining: MAX_TOKENS_PER_USER_PER_HOUR - entry.count,
    resetAt: entry.resetAt,
  }
}

function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': `${MAX_TOKENS_PER_USER_PER_HOUR}`,
    'X-RateLimit-Remaining': `${Math.max(result.remaining, 0)}`,
    'X-RateLimit-Reset': `${Math.floor(result.resetAt / 1000)}`,
  }
}

export async function POST() {
  console.log('[API /deepgram/token] POST request received')
  try {
    const skipAuthCheck = process.env.SKIP_AUTH_CHECK === 'true'
    let userId = 'demo-user'

    // Auth check (skip in development/demo mode)
    if (!skipAuthCheck) {
      console.log('[API /deepgram/token] Checking auth...')
      const supabase = await createSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('[API /deepgram/token] Auth error:', authError)
        return NextResponse.json(
          { error: 'Kon sessie niet ophalen' },
          { status: 500 }
        )
      }

      if (!authData?.user) {
        console.log('[API /deepgram/token] No user found - returning 401')
        return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
      }

      userId = authData.user.id
      console.log('[API /deepgram/token] Auth OK, userId:', userId.slice(0, 8) + '...')
    } else {
      console.log('[API /deepgram/token] Auth check skipped (SKIP_AUTH_CHECK=true)')
    }

    // Prefer admin key (can generate tokens), fallback to regular key
    const apiKey = process.env.DEEPGRAM_ADMIN_API_KEY || process.env.DEEPGRAM_API_KEY
    const keyType = process.env.DEEPGRAM_ADMIN_API_KEY ? 'ADMIN' : 'REGULAR'
    console.log('[API /deepgram/token] Using', keyType, 'API key, present:', !!apiKey)

    if (!apiKey) {
      console.error('[API /deepgram/token] No Deepgram API key configured!')
      return NextResponse.json(
        { error: 'Deepgram API key ontbreekt in server configuratie' },
        { status: 500 }
      )
    }

    const rateLimit = consumeRateLimit(userId)
    const headers = buildRateLimitHeaders(rateLimit)
    console.log('[API /deepgram/token] Rate limit check:', { allowed: rateLimit.allowed, remaining: rateLimit.remaining })

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      )
      console.log('[API /deepgram/token] Rate limit exceeded:', rateLimit.reason, 'retry after:', retryAfterSeconds)
      return NextResponse.json(
        { error: rateLimit.reason || 'Rate limit bereikt.' },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': `${retryAfterSeconds}`,
          },
        }
      )
    }

    // Check if we should use direct API key (for development when grantToken doesn't work)
    const useDirectKey = process.env.DEEPGRAM_USE_DIRECT_KEY === 'true'

    if (useDirectKey) {
      console.log('[API /deepgram/token] Using direct API key (DEEPGRAM_USE_DIRECT_KEY=true)')
      return NextResponse.json(
        {
          token: apiKey,
          expiresIn: TOKEN_TTL_SECONDS,
        },
        { headers }
      )
    }

    console.log('[API /deepgram/token] Requesting token from Deepgram...')
    console.log('[API /deepgram/token] API key length:', apiKey.length, 'starts with:', apiKey.slice(0, 8))
    const deepgram = createDeepgramClient(apiKey)

    let tokenResponse
    try {
      tokenResponse = await deepgram.auth.grantToken({
        ttl_seconds: TOKEN_TTL_SECONDS,
      })
      console.log('[API /deepgram/token] Deepgram response:', JSON.stringify(tokenResponse, null, 2))
    } catch (deepgramError) {
      console.error('[API /deepgram/token] Deepgram SDK threw error:', deepgramError)
      return NextResponse.json(
        { error: 'Deepgram SDK error: ' + (deepgramError instanceof Error ? deepgramError.message : String(deepgramError)) },
        { status: 502, headers }
      )
    }

    if (!tokenResponse.result) {
      console.error('[API /deepgram/token] Deepgram API error - no result. Full response:', tokenResponse)
      console.log('[API /deepgram/token] TIP: Set DEEPGRAM_USE_DIRECT_KEY=true in .env.local to use API key directly')
      return NextResponse.json(
        { error: 'Genereren van tijdelijk token mislukt', details: tokenResponse.error },
        { status: 502, headers }
      )
    }

    console.log('[API /deepgram/token] Token generated successfully, expiresIn:', tokenResponse.result.expires_in)
    return NextResponse.json(
      {
        token: tokenResponse.result.access_token,
        expiresIn: tokenResponse.result.expires_in,
      },
      { headers }
    )
  } catch (error) {
    console.error('[API /deepgram/token] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout bij genereren token' },
      { status: 500 }
    )
  }
}
