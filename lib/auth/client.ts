/**
 * Supabase Auth Client Utilities
 *
 * Client-side auth helpers for login, logout, and session management
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Create Supabase client for browser/client-side use
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Send magic link to user's email
 * Auto-creates account if user doesn't exist
 */
export async function loginWithMagicLink(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: true, // Auto-create account on first login
    }
  })

  if (error) throw error

  return {
    success: true,
    message: 'Check je email voor de magic link!',
    data
  }
}

/**
 * Login with email + password (for demo accounts)
 */
export async function loginWithPassword(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  return {
    success: true,
    user: data.user,
    session: data.session
  }
}

/**
 * Logout current user
 */
export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw error

  // Redirect to login
  window.location.href = '/login'
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) throw error

  return session
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) throw error

  return user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const supabase = createClient()

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    callback
  )

  return subscription
}

/**
 * Check if current user is a demo user
 * @deprecated Demo users are no longer supported
 */
export async function isDemoUser(): Promise<boolean> {
  return false
}

/**
 * Get demo user access level
 * @deprecated Demo users are no longer supported
 */
export async function getDemoAccessLevel(): Promise<'read_only' | 'interactive' | 'presenter' | null> {
  return null
}
