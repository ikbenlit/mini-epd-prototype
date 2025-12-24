/**
 * Supabase Auth Client Utilities
 *
 * Client-side auth helpers for login, logout, and session management
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'

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
 * Sign up with email + password
 * Returns data with user and session (if email confirmation is disabled)
 * 
 * Note: If email confirmation is enabled and email already exists,
 * Supabase returns success but no user object (security feature)
 */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  // DEBUG: Log response to see what Supabase returns when hook throws error
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 SignUp Response:', { 
      hasError: !!error, 
      errorMessage: error?.message, 
      errorCode: error?.code,
      errorStatus: (error as any)?.status,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      identities: data?.user?.identities?.length || 0
    })
  }

  if (error) {
    // Check for explicit duplicate email errors (from Auth Hook or Supabase)
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code?.toLowerCase() || ''
    
    if (errorMessage.includes('already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('al geregistreerd') ||  // Auth Hook (NL)
        errorMessage.includes('emailadres is al') ||   // Extra check voor hook message
        errorCode === 'user_already_registered' ||
        (error as any)?.status === 400) {  // Hook errors typically have 400 status
      // If it's from Auth Hook, preserve the original message
      const duplicateError = new Error(error.message || 'Dit emailadres is al geregistreerd. Probeer in te loggen of gebruik "Wachtwoord vergeten?".')
      ;(duplicateError as any).code = 'user_already_registered'
      throw duplicateError
    }
    throw error
  }

  // Check if user was created but has no identities (indicates duplicate email)
  // This happens when Supabase creates a user object but doesn't actually create the account
  // because the email already exists (security feature - email enumeration protection)
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    // User object exists but no identities = duplicate email detected by Supabase
    // Try to login to confirm and get proper error message
    const loginAttempt = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (loginAttempt.data?.user) {
      // Login succeeded - account already exists!
      const duplicateError = new Error('Dit emailadres is al geregistreerd. Je bent nu ingelogd.')
      ;(duplicateError as any).code = 'user_already_registered'
      ;(duplicateError as any).data = loginAttempt.data
      throw duplicateError
    } else {
      // Login failed - account exists but password is wrong
      // This is the duplicate email case that the hook should have caught
      const duplicateError = new Error('Dit emailadres is al geregistreerd. Probeer in te loggen of gebruik "Wachtwoord vergeten?".')
      ;(duplicateError as any).code = 'user_already_registered'
      throw duplicateError
    }
  }

  // If email confirmation is enabled, Supabase doesn't return a user/session
  // for new signups (email is sent instead)
  // However, if email already exists, Supabase also returns no user but doesn't send email
  // Try to detect this by attempting a login
  if (!data.user && !data.session) {
    // Try to login to check if account already exists
    // This is a fallback detection method if the hook doesn't work
    const loginAttempt = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (loginAttempt.data?.user) {
      // Login succeeded - account already exists!
      // This means the hook didn't catch it, but we can detect it client-side
      const duplicateError = new Error('Dit emailadres is al geregistreerd. Je bent nu ingelogd.')
      ;(duplicateError as any).code = 'user_already_registered'
      ;(duplicateError as any).data = loginAttempt.data // Include session data
      throw duplicateError
    }
    
    // Login failed - could be new account OR wrong password for existing account
    // If it's a wrong password, we can't distinguish from a new account
    // (Supabase security feature - email enumeration protection)
    // Return the signup data (which has no user/session) and let UI show generic message
    // Note: If hook is working, we should have gotten an error above, so this is fallback
  }

  return data
}

/**
 * Send password reset email
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient()
  // Force Supabase to bounce back via the auth callback with next=/update-password
  const params = new URLSearchParams({ next: '/update-password' })
  const redirectTo = `${window.location.origin}/auth/callback?${params.toString()}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  })

  if (error) throw error
  return true
}

/**
 * Update user password (requires active session)
 */
export async function updateUserPassword(password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) throw error
  return true
}

/**
 * Login with email + password (for demo accounts and regular users)
 */
export async function loginWithPassword(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    // Provide user-friendly error messages
    const errorMessage = error.message?.toLowerCase() || ''

    // Invalid login credentials (account doesn't exist OR wrong password)
    if (errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid credentials') ||
        error.status === 400) {
      const friendlyError = new Error('Email of wachtwoord is onjuist. Controleer je gegevens en probeer opnieuw.')
      ;(friendlyError as any).code = 'invalid_credentials'
      throw friendlyError
    }

    // Email not confirmed
    if (errorMessage.includes('email not confirmed')) {
      const friendlyError = new Error('Je email is nog niet geverifieerd. Check je inbox voor de verificatie link.')
      ;(friendlyError as any).code = 'email_not_confirmed'
      throw friendlyError
    }

    // Generic error fallback
    throw error
  }

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

/**
 * Update user's preferred interface (Swift or Klassiek)
 * Stored in user_metadata.preferred_interface
 */
export type InterfacePreference = 'swift' | 'klassiek'

export async function updateInterfacePreference(preference: InterfacePreference) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({
    data: { preferred_interface: preference }
  })

  if (error) {
    console.error('Failed to update interface preference:', error)
    throw error
  }

  return true
}

/**
 * Get user's preferred interface from metadata
 * Returns 'klassiek' as default if not set
 */
export async function getInterfacePreference(): Promise<InterfacePreference> {
  const user = await getUser()
  const preference = user?.user_metadata?.preferred_interface as InterfacePreference | undefined
  return preference || 'klassiek'
}
