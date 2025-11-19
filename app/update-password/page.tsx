'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserPassword, getSession } from '@/lib/auth/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if user has an active session (required for password update)
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession()
        if (!session) {
          // No session - redirect to login
          router.push('/login?error=session_required')
          return
        }
        setCheckingSession(false)
      } catch (err) {
        console.error('Session check error:', err)
        router.push('/login?error=session_check_failed')
      }
    }

    checkSession()
  }, [router])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    setLoading(true)

    try {
      await updateUserPassword(password)
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-slate-900">Bezig met laden...</h1>
          <p className="text-slate-600">
            Even geduld terwijl we je sessie controleren...
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900">Wachtwoord Gewijzigd!</h1>
          <p className="text-slate-600">
            Je wordt doorgestuurd naar de login pagina...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Nieuw Wachtwoord Instellen
          </h1>
          <p className="text-slate-600">
            Kies een sterk wachtwoord (minimaal 8 tekens).
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nieuw Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bevestig Wachtwoord
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Wachtwoord Wijzigen...' : 'Wachtwoord Wijzigen'}
          </button>
        </form>
      </div>
    </div>
  )
}

