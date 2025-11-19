/**
 * Auth Callback Route
 *
 * Handles Supabase auth callbacks after magic link click
 * or OAuth provider authentication
 */

import { createClient } from '@/lib/auth/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token') // Fallback for older templates
  const token_hash = requestUrl.searchParams.get('token_hash') // Supabase uses this for email links
  const type = requestUrl.searchParams.get('type') // recovery, signup, etc
  const next = requestUrl.searchParams.get('next') ?? '/epd/clients'

  // Debug logging - ALWAYS log to diagnose redirect issues
  console.log('🔍 Auth Callback Debug:', {
    url: request.url,
    code: !!code,
    token: !!token,
    token_hash: !!token_hash,
    codeValue: code?.substring(0, 10) + '...',
    type,
    next,
    allParams: Object.fromEntries(requestUrl.searchParams)
  })

  // Use code, token, or token_hash (different Supabase versions use different params)
  const authCode = code || token || token_hash

  if (authCode) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)

    if (error) {
      console.error('❌ Auth Callback Exchange Error:', {
        message: error.message,
        status: error.status,
        code: error.code
      })
    }

    if (!error && data.user) {
      // PRIORITY: If next is /update-password, ALWAYS go there (password reset flow)
      if (next === '/update-password' || next.includes('update-password')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Redirecting to /update-password (next parameter detected)')
        }
        return NextResponse.redirect(new URL('/update-password', request.url))
      }

      // Password recovery flow detection:
      // Check type parameter (Supabase adds this automatically for recovery)
      if (type === 'recovery') {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Redirecting to /update-password (recovery type detected)')
        }
        return NextResponse.redirect(new URL('/update-password', request.url))
      }

      // Check if new user (first login)
      const isNewUser = new Date(data.user.created_at).getTime() ===
        new Date(data.user.last_sign_in_at || '').getTime()

      // Check if user signed up with password (has identity provider = 'email')
      const hasPassword = data.user.identities?.some(
        identity => identity.provider === 'email'
      )

      if (isNewUser && !hasPassword) {
        // Redirect new magic link users to set-password page (optional)
        return NextResponse.redirect(new URL('/set-password', request.url))
      }

      // Redirect to the specified next URL or default to /epd/clients
      // This includes: password signups, confirmed email users, and returning users
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_error', request.url)
  )
}
