'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock } from 'lucide-react'

interface RateLimitMessageProps {
  resetTime: number | null
  onReset: () => void
}

/**
 * Informative message shown when rate limit is reached
 * Includes countdown timer and explains what the chat can be used for
 */
export function RateLimitMessage({ resetTime, onReset }: RateLimitMessageProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!resetTime) return 0
    return Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))
  })

  useEffect(() => {
    if (!resetTime) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        onReset()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [resetTime, onReset])

  return (
    <div className="px-4 pb-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-amber-900 text-sm mb-1">
              Even pauze
            </h3>
            <p className="text-xs text-amber-800 mb-3">
              Je hebt het maximum aantal vragen voor deze minuut bereikt.
              Dit is een demo-omgeving met beperkte capaciteit.
            </p>

            <div className="bg-white/60 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Waar kan deze assistent bij helpen?
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Uitleg over EPD-functies en navigatie</li>
                <li>• Hoe je intakes, screenings en rapportages maakt</li>
                <li>• Hulp bij spraakherkenning en dicteren</li>
                <li>• Vragen over cliëntbeheer en dossiers</li>
              </ul>
            </div>

            {secondsLeft > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Je kunt weer vragen stellen over <strong>{secondsLeft}</strong> {secondsLeft === 1 ? 'seconde' : 'seconden'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
