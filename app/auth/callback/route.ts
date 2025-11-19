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
  const next = requestUrl.searchParams.get('next') ?? '/epd/clients'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
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
