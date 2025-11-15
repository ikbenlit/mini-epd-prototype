import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase server environment variables. Check your .env.local file.')
}

/**
 * Supabase client for server-side operations.
 * Uses service role key - NEVER expose to client!
 * Bypasses Row Level Security (RLS) - use with caution.
 *
 * Use this for:
 * - API routes that need admin access
 * - Database migrations/seeding
 * - Server-side operations
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
