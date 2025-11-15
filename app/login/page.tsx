'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithMagicLink, loginWithPassword } from '@/lib/auth/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showDemoLogin, setShowDemoLogin] = useState(false)

  // Magic link login
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await loginWithMagicLink(email)
      setMessage({
        type: 'success',
        text: result.message
      })
      setEmail('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Er ging iets mis. Probeer opnieuw.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Password login (demo accounts)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await loginWithPassword(email, password)
      setMessage({
        type: 'success',
        text: 'Ingelogd! Redirect naar EPD...'
      })

      // Redirect to EPD
      setTimeout(() => {
        router.push('/clients')
      }, 1000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ongeldige credentials.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Quick demo login
  const handleQuickDemoLogin = async () => {
    setEmail('demo@mini-ecd.demo')
    setPassword('Demo2024!')
    setShowDemoLogin(true)

    // Auto-submit
    setLoading(true)
    try {
      await loginWithPassword('demo@mini-ecd.demo', 'Demo2024!')
      router.push('/clients')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: 'Demo login mislukt. Probeer handmatig in te loggen.'
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mini-ECD Login
          </h1>
          <p className="text-gray-600">
            AI-powered EPD voor de GGZ sector
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Magic Link Login */}
          {!showDemoLogin && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📧 Login met Magic Link
              </h2>

              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nieuw? Account wordt automatisch aangemaakt!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verzenden...' : 'Stuur Magic Link'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">of</span>
                </div>
              </div>

              {/* Demo Account Toggle */}
              <button
                onClick={() => setShowDemoLogin(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                🎯 Login met Demo Account
              </button>

              {/* Quick Demo Button */}
              <button
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="mt-3 w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-800 text-sm font-medium py-2 px-4 rounded-lg border border-yellow-200 transition-colors disabled:opacity-50"
              >
                ⚡ Snelle Demo Login
              </button>
            </div>
          )}

          {/* Demo Password Login */}
          {showDemoLogin && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  🎯 Demo Account Login
                </h2>
                <button
                  onClick={() => {
                    setShowDemoLogin(false)
                    setPassword('')
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Terug
                </button>
              </div>

              {/* Demo Credentials Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  📋 Demo Credentials:
                </p>
                <div className="text-xs text-yellow-700 font-mono space-y-1">
                  <p>Email: demo@mini-ecd.demo</p>
                  <p>Password: Demo2024!</p>
                </div>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="demo-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@mini-ecd.demo"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Inloggen...' : 'Login'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Build in Public door{' '}
          <a
            href="https://ikbenlit.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            AI Speedrun
          </a>
        </p>
      </div>
    </div>
  )
}
