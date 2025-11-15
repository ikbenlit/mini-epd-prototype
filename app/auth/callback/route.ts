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
  const next = requestUrl.searchParams.get('next') ?? '/clients'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if this is a demo user and track login
        const { data: demoUser } = await supabase
          .from('demo_users')
          .select('id, access_level')
          .eq('user_id', user.id)
          .single()

        if (demoUser) {
          // Track demo user login
          await supabase
            .from('demo_users')
            .update({
              usage_count: supabase.sql`usage_count + 1`,
              last_login_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
        }
      }

      // Redirect to the specified next URL or default to /clients
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_error', request.url)
  )
}
