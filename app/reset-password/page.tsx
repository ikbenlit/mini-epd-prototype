'use client'

import { useState } from 'react'
import { resetPasswordForEmail } from '@/lib/auth/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await resetPasswordForEmail(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-4">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold text-slate-900">Email Verstuurd!</h1>
          <p className="text-slate-600">
            Check je inbox voor de reset link. De link is 1 uur geldig.
          </p>
          <p className="text-sm text-slate-500">
            Niet ontvangen? Check je spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Terug naar login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Wachtwoord Vergeten?
          </h1>
          <p className="text-slate-600">
            Geen probleem! Vul je email in en we sturen je een reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verzenden...' : 'Stuur Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Terug naar login
          </Link>
        </div>
      </div>
    </div>
  )
}

