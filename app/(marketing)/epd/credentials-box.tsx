'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { DemoCredentials } from '@/content/schemas/manifesto'

interface CredentialsBoxProps {
  credentials: DemoCredentials
}

export function CredentialsBox({ credentials }: CredentialsBoxProps) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 md:p-8">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-24 font-medium text-slate-700">
            Email:
          </div>
          <div className="flex-1 font-mono text-slate-900 bg-white px-3 py-2 rounded border border-green-300">
            {credentials.email}
          </div>
          <button
            onClick={() => copyToClipboard(credentials.email, 'email')}
            className="flex-shrink-0 p-2 hover:bg-green-100 rounded transition-colors"
            aria-label="Kopieer email"
          >
            {copiedEmail ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-24 font-medium text-slate-700">
            Wachtwoord:
          </div>
          <div className="flex-1 font-mono text-slate-900 bg-white px-3 py-2 rounded border border-green-300">
            {credentials.password}
          </div>
          <button
            onClick={() => copyToClipboard(credentials.password, 'password')}
            className="flex-shrink-0 p-2 hover:bg-green-100 rounded transition-colors"
            aria-label="Kopieer wachtwoord"
          >
            {copiedPassword ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-600 italic">
        {credentials.note}
      </p>

      <div className="mt-6">
        <a
          href="/app/login"
          className="inline-block w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-center"
        >
          Log in op het prototype
        </a>
      </div>
    </div>
  )
}
