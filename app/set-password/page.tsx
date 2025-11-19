'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserPassword } from '@/lib/auth/client'

export default function SetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSetPassword(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Wachtwoorden komen niet overeen')
            return
        }

        if (password.length < 8) {
            setError('Wachtwoord minimaal 8 tekens')
            return
        }

        setLoading(true)

        try {
            await updateUserPassword(password)
            router.push('/epd/clients')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleSkip() {
        router.push('/epd/clients')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Stel een Wachtwoord In (Optioneel)
                </h1>
                <p className="text-slate-600 mb-6">
                    Met een wachtwoord kun je sneller inloggen zonder magic link.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSetPassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Wachtwoord
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 tekens"
                            minLength={8}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                            minLength={8}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50"
                    >
                        {loading ? 'Instellen...' : 'Wachtwoord Instellen'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSkip}
                        className="w-full text-slate-600 hover:text-slate-900 text-sm font-medium py-2"
                    >
                        Sla over (blijf magic link gebruiken)
                    </button>
                </form>
            </div>
        </div>
    )
}
