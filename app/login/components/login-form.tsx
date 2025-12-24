'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap, Layout } from 'lucide-react'
import { loginWithPassword, signUpWithPassword } from '@/lib/auth/client'

type InterfacePreference = 'swift' | 'klassiek'

export function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [interfacePreference, setInterfacePreference] = useState<InterfacePreference>('klassiek')

  // Redirect path based on interface preference
  const getRedirectPath = () => {
    return interfacePreference === 'swift' ? '/epd/swift' : '/epd/clients'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Wachtwoorden komen niet overeen')
        }

        const result = await signUpWithPassword(email, password)
        if (result.session) {
          setMessage({ type: 'success', text: 'Account aangemaakt! Je wordt doorgestuurd...' })
          setTimeout(() => {
            router.push(getRedirectPath())
          }, 1000)
        } else {
          setMessage({
            type: 'success',
            text: 'Check je inbox voor een verificatie link om je account te activeren.'
          })
        }
      } else {
        await loginWithPassword(email, password)
        setMessage({ type: 'success', text: 'Ingelogd! Je wordt doorgestuurd...' })
        setTimeout(() => {
          router.push(getRedirectPath())
        }, 1000)
      }
    } catch (error: any) {
      if (error.code === 'user_already_registered' && error.data?.session) {
        setMessage({ type: 'success', text: 'Dit emailadres bestaat al. Je bent nu ingelogd!' })
        setTimeout(() => {
          router.push(getRedirectPath())
        }, 1000)
      } else if (error.code === 'user_already_registered') {
        setMessage({
          type: 'error',
          text: error.message || 'Dit emailadres is al geregistreerd. Probeer in te loggen.'
        })
        setTimeout(() => {
          setMode('login')
          setPassword('')
          setConfirmPassword('')
        }, 2000)
      } else if (error.code === 'invalid_credentials' && mode === 'login') {
        setMessage({ type: 'error', text: error.message || 'Email of wachtwoord is onjuist.' })
      } else if (error.code === 'email_not_confirmed') {
        setMessage({ type: 'error', text: error.message || 'Je email is nog niet geverifieerd. Check je inbox.' })
      } else {
        setMessage({ type: 'error', text: error.message || 'Er ging iets mis. Probeer opnieuw.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoLogin = async () => {
    setMode('login')
    setEmail('demo@mini-ecd.demo')
    setPassword('Demo2024!')
    setLoading(true)
    try {
      await loginWithPassword('demo@mini-ecd.demo', 'Demo2024!')
      router.push(getRedirectPath())
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Demo login mislukt. Probeer handmatig in te loggen.' })
      setLoading(false)
    }
  }

  return (
    <div className="md:w-2/5 bg-white p-8 md:p-12 flex flex-col justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {mode === 'login' ? 'Welkom terug' : 'Maak een account'}
          </h2>
          <p className="text-slate-600">
            {mode === 'login'
              ? 'Log in om toegang te krijgen tot het EPD'
              : 'Start vandaag nog met snellere rapportages'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setMode('login')}
          >
            Inloggen
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setMode('signup')}
          >
            Registreren
          </button>
        </div>

        {/* Interface Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Interface voorkeur
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInterfacePreference('klassiek')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                interfacePreference === 'klassiek'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Layout className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Klassiek</div>
                <div className="text-xs opacity-70">Menu navigatie</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setInterfacePreference('swift')}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                interfacePreference === 'swift'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Zap className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium text-sm">Swift</div>
                <div className="text-xs opacity-70">Spraak & AI</div>
              </div>
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {mode === 'login' && (
              <div className="mt-1 text-right">
                <Link href="/reset-password" className="text-xs text-slate-500 hover:text-teal-600">
                  Wachtwoord vergeten?
                </Link>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Bevestig Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Laden...' : mode === 'login' ? 'Inloggen' : 'Registreren'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">of</span>
          </div>
        </div>

        <button
          onClick={handleQuickDemoLogin}
          disabled={loading}
          className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-medium py-2 px-4 rounded-lg border border-amber-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          Demo Account Proberen
        </button>

        <p className="text-center text-xs text-slate-500 mt-8">
          Build in Public door{' '}
          <a
            href="https://ikbenlit.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            AI Speedrun
          </a>
        </p>
      </div>
    </div>
  )
}
