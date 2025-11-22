/**
 * Leads API Endpoint
 *
 * POST /api/leads - Submit contact form lead
 *
 * Security:
 * - Rate limiting via headers
 * - Input validation
 * - Server-side Supabase client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/types'

interface RateLimitEntry {
  allowance: number
  resetAt: number
}

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase anon environment variables. Check your .env.local file.')
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.SITE_URL,
  'http://localhost:3000',
].filter(Boolean) as string[]

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5
const rateLimitStore: Map<string, RateLimitEntry> = new Map()

// Validation schema
const leadSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
  email: z.string().email('Ongeldig email adres'),
  company: z.string().optional(),
  projectType: z.string().min(1, 'Selecteer een project type'),
  budget: z.string().optional(),
  message: z.string().min(20, 'Beschrijving moet minimaal 20 karakters zijn'),
  captchaToken: z.string().min(1, 'Captcha verificatie is vereist'),
})

export type LeadFormData = z.infer<typeof leadSchema>

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

const isOriginAllowed = (origin: string | null): origin is string => {
  return Boolean(origin && allowedOrigins.includes(origin))
}

const buildCorsHeaders = (origin: string | null): HeadersInit | undefined => {
  if (!isOriginAllowed(origin)) {
    return undefined
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

const jsonWithCors = <T>(
  body: T,
  init: ResponseInit = {},
  origin: string | null
): NextResponse<T> => {
  const headers = new Headers(init.headers)
  const corsHeaders = buildCorsHeaders(origin)

  if (corsHeaders) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })
  }

  return NextResponse.json(body, { ...init, headers })
}

const enforceRateLimit = (ip: string): { ok: boolean; retryAfter?: number } => {
  const now = Date.now()
  const existingEntry = rateLimitStore.get(ip)

  if (!existingEntry || existingEntry.resetAt < now) {
    rateLimitStore.set(ip, {
      allowance: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return { ok: true }
  }

  if (existingEntry.allowance <= 0) {
    return { ok: false, retryAfter: Math.ceil((existingEntry.resetAt - now) / 1000) }
  }

  rateLimitStore.set(ip, {
    allowance: existingEntry.allowance - 1,
    resetAt: existingEntry.resetAt,
  })

  return { ok: true }
}

const verifyTurnstile = async (
  token: string,
  ip: string,
  userAgent: string
): Promise<boolean> => {
  if (!turnstileSecretKey) {
    throw new Error('Missing TURNSTILE_SECRET_KEY environment variable')
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': userAgent,
      },
      body: new URLSearchParams({
        secret: turnstileSecretKey,
        response: token,
        remoteip: ip,
      }).toString(),
    })

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success) {
      console.warn('Turnstile verification failed', data['error-codes'])
    }

    return data.success
  } catch (verificationError) {
    console.error('Failed to verify Turnstile token', verificationError)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin')
    if (origin && !isOriginAllowed(origin)) {
      return jsonWithCors({ error: 'Niet toegestane origin' }, { status: 403 }, origin)
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = leadSchema.parse(body)

    // Get client IP and user agent for tracking
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || 'direct'

    const rateLimitResult = enforceRateLimit(ip)
    if (!rateLimitResult.ok) {
      return jsonWithCors(
        { error: 'Te veel aanvragen, probeer het later opnieuw.' },
        {
          status: 429,
          headers: rateLimitResult.retryAfter
            ? { 'Retry-After': rateLimitResult.retryAfter.toString() }
            : {},
        },
        origin
      )
    }

    const captchaValid = await verifyTurnstile(validatedData.captchaToken, ip, userAgent)

    if (!captchaValid) {
      return jsonWithCors(
        { error: 'Captcha verificatie mislukt' },
        { status: 400 },
        origin
      )
    }

    const leadPayload: Database['public']['Tables']['leads']['Insert'] = {
      name: validatedData.name,
      email: validatedData.email,
      company: validatedData.company || null,
      project_type: validatedData.projectType,
      budget: validatedData.budget || null,
      message: validatedData.message,
      status: 'new',
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer,
      source: 'website',
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(leadPayload)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return jsonWithCors(
        { error: 'Database error', details: error.message },
        { status: 500 },
        origin
      )
    }

    // Return success
    return jsonWithCors(
      {
        success: true,
        message: 'Lead ontvangen',
        leadId: data.id
      },
      { status: 201 },
      origin
    )

  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return jsonWithCors(
        {
          error: 'Validatie fout',
          issues: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 },
        request.headers.get('origin')
      )
    }

    // Generic error
    console.error('Unexpected error:', error)
    return jsonWithCors(
      { error: 'Interne server fout' },
      { status: 500 },
      request.headers.get('origin')
    )
  }
}

// OPTIONS for CORS (if needed)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!origin || !isOriginAllowed(origin)) {
    return jsonWithCors({ error: 'Niet toegestane origin' }, { status: 403 }, origin)
  }

  return jsonWithCors({}, { status: 200 }, origin)
}
