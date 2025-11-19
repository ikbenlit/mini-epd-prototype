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
  const type = requestUrl.searchParams.get('type') // recovery, signup, etc
  const next = requestUrl.searchParams.get('next') ?? '/epd/clients'

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Auth Callback Debug:', {
      url: request.url,
      code: !!code,
      type,
      next,
      allParams: Object.fromEntries(requestUrl.searchParams)
    })
  }

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Password recovery flow detection:
      // 1. Check type parameter (Supabase adds this automatically)
      // 2. Check if next contains update-password (our explicit redirect)
      // 3. Check if this is a recovery session by looking at the user's recovery metadata
      const isRecoveryFlow = 
        type === 'recovery' || 
        next.includes('/update-password') ||
        requestUrl.pathname.includes('update-password')

      if (isRecoveryFlow) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Redirecting to /update-password (recovery flow detected)')
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
