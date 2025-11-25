import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/auth/server'
import { createClient as createDeepgramClient } from '@deepgram/sdk'

const MAX_TOKENS_PER_HOUR = 10
const TOKEN_TTL_SECONDS = 3600
const HOUR_IN_MS = 60 * 60 * 1000

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

function consumeRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + HOUR_IN_MS
    rateLimitStore.set(userId, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: MAX_TOKENS_PER_HOUR - 1,
      resetAt,
    }
  }

  if (entry.count >= MAX_TOKENS_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  entry.count += 1

  return {
    allowed: true,
    remaining: MAX_TOKENS_PER_HOUR - entry.count,
    resetAt: entry.resetAt,
  }
}

function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': `${MAX_TOKENS_PER_HOUR}`,
    'X-RateLimit-Remaining': `${Math.max(result.remaining, 0)}`,
    'X-RateLimit-Reset': `${Math.floor(result.resetAt / 1000)}`,
  }
}

export async function POST() {
  try {
    const skipAuthCheck = process.env.SKIP_AUTH_CHECK === 'true'
    let userId = 'demo-user'

    // Auth check (skip in development/demo mode)
    if (!skipAuthCheck) {
      const supabase = await createSupabaseClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Deepgram token: auth error', authError)
        return NextResponse.json(
          { error: 'Kon sessie niet ophalen' },
          { status: 500 }
        )
      }

      if (!authData?.user) {
        return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
      }

      userId = authData.user.id
    } else {
      console.log('🔓 Deepgram token: Auth check overgeslagen (demo mode)')
    }

    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key ontbreekt in server configuratie' },
        { status: 500 }
      )
    }

    const rateLimit = consumeRateLimit(userId)
    const headers = buildRateLimitHeaders(rateLimit)

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      )
      return NextResponse.json(
        { error: 'Rate limit overschreden. Max 10 tokens per uur.' },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': `${retryAfterSeconds}`,
          },
        }
      )
    }

    const deepgram = createDeepgramClient(apiKey)
    const tokenResponse = await deepgram.auth.grantToken({
      ttl_seconds: TOKEN_TTL_SECONDS,
    })

    if (!tokenResponse.result) {
      console.error('Deepgram token: API error', tokenResponse.error)
      return NextResponse.json(
        { error: 'Genereren van tijdelijk token mislukt' },
        { status: 502, headers }
      )
    }

    return NextResponse.json(
      {
        token: tokenResponse.result.access_token,
        expiresIn: tokenResponse.result.expires_in,
      },
      { headers }
    )
  } catch (error) {
    console.error('Deepgram token: onverwachte fout', error)
    return NextResponse.json(
      { error: 'Onverwachte fout bij genereren token' },
      { status: 500 }
    )
  }
}
