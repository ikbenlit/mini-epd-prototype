'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Auth Code Handler
 * 
 * Handles auth codes that Supabase redirects to the home page
 * Redirects to /auth/callback to process the code exchange
 */
export function AuthCodeHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  useEffect(() => {
    if (code) {
      // Build callback URL with all parameters
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('code', code)
      if (type) {
        callbackUrl.searchParams.set('type', type)
      }
      // If it's a recovery flow, ensure we redirect to update-password
      if (type === 'recovery') {
        callbackUrl.searchParams.set('next', '/update-password')
      }

      // Redirect to callback route
      router.replace(callbackUrl.pathname + callbackUrl.search)
    }
  }, [code, type, router])

  return null
}

