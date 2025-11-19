'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithPassword, signUpWithPassword } from '@/lib/auth/client'
import { Brain, Zap, Target, Clock } from 'lucide-react'
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid'
import Link from 'next/link'

// Bento grid features with different sizes for visual interest
const bentoFeatures = [
  {
    name: 'AI Intake Samenvatting',
    description: 'Van 30 minuten handmatig werk naar 5 seconden automatisch. AI leest, begrijpt en structureert intake gesprekken.',
    icon: Brain,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-teal-600/20" />
    ),
    href: '#',
    cta: 'Meer info'
  },
  {
    name: '90%+ Tijdsbesparing',
    description: 'Gemiddeld bespaar je 2+ uur per dag op documentatie',
    icon: Clock,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/20" />
    ),
    href: '#',
    cta: 'Zie metrics'
  },
  {
    name: 'DSM Classificatie',
    description: 'Automatische categorisatie in 3 seconden vs 15 minuten handmatig',
    icon: Zap,
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
    ),
    href: '#',
    cta: 'Ontdekken'
  },
  {
    name: 'SMART Behandelplannen',
    description: 'Gestructureerde doelen en interventies in 10 seconden. AI genereert evidence-based plannen.',
    icon: Target,
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20" />
    ),
    href: '#',
    cta: 'Bekijk voorbeeld'
  }
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // Only for signup
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signup') {
        // Signup Flow
        if (password !== confirmPassword) {
          throw new Error('Wachtwoorden komen niet overeen')
        }
        
        // Sign up
        const result = await signUpWithPassword(email, password)
        
        // Check if user got a session immediately (email confirmation disabled)
        if (result.session) {
          // User is logged in immediately
          setMessage({
            type: 'success',
            text: 'Account aangemaakt! Je wordt doorgestuurd...'
          })
          setTimeout(() => {
            router.push('/epd/clients')
          }, 1000)
        } else {
          // Email confirmation required - user needs to check inbox
          setMessage({
            type: 'success',
            text: 'Check je inbox voor een verificatie link om je account te activeren.'
          })
        } 
        
      } else {
        // Login Flow
        await loginWithPassword(email, password)
        
        setMessage({
          type: 'success',
          text: 'Ingelogd! Redirect naar EPD...'
        })

        // Redirect to EPD
        setTimeout(() => {
          router.push('/epd/clients')
        }, 1000)
      }
      } catch (error: any) {
        // Check for duplicate email error with auto-login
        if (error.code === 'user_already_registered' && error.data?.session) {
          // User was auto-logged in (client-side detection succeeded)
          setMessage({
            type: 'success',
            text: 'Dit emailadres bestaat al. Je bent nu ingelogd!'
          })
          setTimeout(() => {
            router.push('/epd/clients')
          }, 1000)
        }
        // Check for duplicate email error (from Auth Hook or client-side)
        else if (error.code === 'user_already_registered') {
          setMessage({
            type: 'error',
            text: error.message || 'Dit emailadres is al geregistreerd. Probeer in te loggen.'
          })
          // Switch to login mode after 2 seconds
          setTimeout(() => {
            setMode('login')
            setPassword('')
            setConfirmPassword('')
          }, 2000)
        }
        // Generic error handling
        else {
          setMessage({
            type: 'error',
            text: error.message || 'Er ging iets mis. Probeer opnieuw.'
          })
        }
      } finally {
      setLoading(false)
    }
  }

  // Quick demo login
  const handleQuickDemoLogin = async () => {
    setMode('login')
    setEmail('demo@mini-ecd.demo')
    setPassword('Demo2024!')

    // Auto-submit
    setLoading(true)
    try {
      await loginWithPassword('demo@mini-ecd.demo', 'Demo2024!')
      router.push('/epd/clients')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: 'Demo login mislukt. Probeer handmatig in te loggen.'
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Bento Grid Showcase (60%) */}
      <div className="lg:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <a href="/" className="inline-block mb-6 text-slate-300 hover:text-white transition-colors">
              ← Terug naar home
            </a>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              AI-Gestuurde EPD Workflows
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
              Van uren documentatie naar seconden. Ontdek hoe AI je dagelijkse workflow transformeert.
            </p>
          </div>

          {/* Bento Grid */}
          <BentoGrid className="mb-8">
            {bentoFeatures.map((feature, index) => (
              <BentoCard
                key={index}
                name={feature.name}
                description={feature.description}
                Icon={feature.icon}
                className={feature.className}
                background={feature.background}
                href={feature.href}
                cta={feature.cta}
              />
            ))}
          </BentoGrid>

          {/* Stats Footer */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">90%+</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Tijdsbesparing</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">&lt; 5 sec</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Gemiddelde respons</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl md:text-3xl font-bold text-slate-300">4 weken</div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">Build tijd</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form (40%) */}
      <div className="md:w-2/5 bg-white p-8 md:p-12 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {mode === 'login' ? 'Welkom terug' : 'Maak een account'}
            </h2>
            <p className="text-slate-600">
              {mode === 'login' 
                ? 'Log in om toegang te krijgen tot het EPD' 
                : 'Start vandaag nog met snellere rapportages'
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setMode('login')}
            >
              Inloggen
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setMode('signup')}
            >
              Registreren
            </button>
          </div>

          {/* Message Display */}
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
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
              {mode === 'login' && (
                <div className="mt-1 text-right">
                  <Link
                    href="/reset-password"
                    className="text-xs text-slate-500 hover:text-teal-600"
                  >
                    Wachtwoord vergeten?
                  </Link>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Bevestig Wachtwoord
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? 'Laden...' 
                : mode === 'login' ? 'Inloggen' : 'Registreren'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">of</span>
            </div>
          </div>

          {/* Quick Demo Button */}
          <button
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-medium py-2 px-4 rounded-lg border border-amber-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            Demo Account Proberen
          </button>

          {/* Footer */}
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
    </div>
  )
}
