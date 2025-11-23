/**
 * Supabase Auth Server Utilities
 *
 * Server-side auth helpers for API routes, middleware, and server components
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Create Supabase client for server-side use
 * Handles cookies for session management
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get current session (server-side)
 */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) throw error

  return session
}

/**
 * Get current user (server-side)
 */
export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) throw error

  return user
}

/**
 * Require authentication - throws if not authenticated
 * Use in API routes and server actions
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    throw new Error('Authentication required')
  }

  return session
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

/**
 * Check if current user is a demo user (server-side)
 * @deprecated Demo users are no longer supported
 */
export async function isDemoUser(): Promise<boolean> {
  return false
}

/**
 * Get demo user info (server-side)
 * @deprecated Demo users are no longer supported
 */
export async function getDemoUserInfo() {
  return null
}

/**
 * Check if demo user has write access
 * @deprecated All authenticated users can write
 */
export async function canWrite(): Promise<boolean> {
  return true
}

/**
 * Track demo user login
 * @deprecated Demo users are no longer supported
 */
export async function trackDemoLogin(_userId: string) {
  // No-op
}
