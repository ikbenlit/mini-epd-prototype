/**
 * Logout API Route
 *
 * Handles user logout and session cleanup
 */

import { createClient } from '@/lib/auth/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Sign out
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Redirect to login page
  return NextResponse.redirect(new URL('/login', request.url))
}

export async function GET(request: NextRequest) {
  // Support GET method for simple logout links
  return POST(request)
}
