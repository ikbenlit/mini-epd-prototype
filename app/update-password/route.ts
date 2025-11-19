/**
 * Update Password Route Handler
 *
 * Handles password reset callback from Supabase
 * Exchanges the code for a session and shows the update password page
 */

import { createClient } from '@/lib/auth/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Update Password Route Handler:', {
      url: request.url,
      code: !!code,
      type,
      allParams: Object.fromEntries(requestUrl.searchParams)
    })
  }

  // If there's a code, exchange it for a session
  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Code exchange error:', error)
      return NextResponse.redirect(
        new URL('/login?error=password_reset_failed', request.url)
      )
    }

    if (data.user) {
      // Successfully exchanged code - redirect to update password page (without code)
      // The page will check for an active session
      const redirectUrl = new URL('/update-password', request.url)
      // Remove code and type from URL to clean it up
      redirectUrl.searchParams.delete('code')
      redirectUrl.searchParams.delete('type')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // No code or exchange failed - just show the update password page
  // It will check if user has an active session
  return NextResponse.next()
}

