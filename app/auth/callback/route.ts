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

  const supabase = await createClient()
  let data: any = null
  let error: any = null

  // Check if this is a token_hash flow (email magic links, password reset)
  if (token_hash && type) {
    console.log('🔐 Using verifyOtp for token_hash flow')

    // For email links (magic link, password reset), use verifyOtp
    const result = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any // 'recovery', 'signup', 'magiclink', etc.
    })

    data = result.data
    error = result.error
  }
  // Check if this is a PKCE code flow (OAuth callbacks)
  else if (code) {
    console.log('🔐 Using exchangeCodeForSession for PKCE flow')

    const result = await supabase.auth.exchangeCodeForSession(code)
    data = result.data
    error = result.error
  }
  // Fallback for older 'token' parameter
  else if (token) {
    console.log('🔐 Using exchangeCodeForSession for legacy token flow')

    const result = await supabase.auth.exchangeCodeForSession(token)
    data = result.data
    error = result.error
  }

  // Handle errors
  if (error) {
    console.error('❌ Auth Callback Error:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
    // Redirect to debug page with error info
    const debugParams = new URLSearchParams(requestUrl.searchParams)
    debugParams.set('auth_error', error.message)
    debugParams.set('error_code', error.code || 'unknown')
    return NextResponse.redirect(
      new URL('/auth/debug?' + debugParams.toString(), request.url)
    )
  }

  // Success - user authenticated
  if (data?.user) {
    console.log('✅ Auth successful, user:', data.user.email)

    // PRIORITY: If next is /update-password, ALWAYS go there (password reset flow)
    if (next === '/update-password' || next.includes('update-password')) {
      console.log('✅ Redirecting to /update-password (next parameter detected)')
      return NextResponse.redirect(new URL('/update-password', request.url))
    }

    // Password recovery flow detection:
    // Check type parameter (Supabase adds this automatically for recovery)
    if (type === 'recovery') {
      console.log('✅ Redirecting to /update-password (recovery type detected)')
      return NextResponse.redirect(new URL('/update-password', request.url))
    }

    // Check if new user (first login)
    const isNewUser = new Date(data.user.created_at).getTime() ===
      new Date(data.user.last_sign_in_at || '').getTime()

    // Check if user signed up with password (has identity provider = 'email')
    const hasPassword = data.user.identities?.some(
      (identity: any) => identity.provider === 'email'
    )

    if (isNewUser && !hasPassword) {
      // Redirect new magic link users to set-password page (optional)
      return NextResponse.redirect(new URL('/set-password', request.url))
    }

    // Redirect to the specified next URL or default to /epd/clients
    // This includes: password signups, confirmed email users, and returning users
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Return the user to debug page to see what parameters came through
  console.error('❌ Auth Callback Failed - No auth token received')
  return NextResponse.redirect(
    new URL('/auth/debug?' + requestUrl.searchParams.toString(), request.url)
  )
}
