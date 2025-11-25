'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TranscriptWord } from '@/hooks/use-deepgram-streaming'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfidenceTextProps {
  /** Array van woorden met confidence scores */
  words: TranscriptWord[]
  /** Extra CSS classes voor de container */
  className?: string
  /** Drempel voor medium confidence (default: 0.9) */
  mediumThreshold?: number
  /** Drempel voor low confidence (default: 0.7) */
  lowThreshold?: number
}

type ConfidenceLevel = 'high' | 'medium' | 'low'

// ─────────────────────────────────────────────────────────────────────────────
// Confidence Word Component
// ─────────────────────────────────────────────────────────────────────────────

function ConfidenceWord({
  word,
  confidence,
  level,
}: {
  word: string
  confidence: number
  level: ConfidenceLevel
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  const confidencePercent = Math.round(confidence * 100)

  // High confidence - geen markering
  if (level === 'high') {
    return <span>{word} </span>
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={cn(
          'cursor-help border-b-2 border-dotted',
          level === 'medium' && 'border-amber-400 bg-amber-50/50',
          level === 'low' && 'border-orange-500 bg-orange-50/50'
        )}
      >
        {word}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <span
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap z-50',
            level === 'medium' && 'bg-amber-100 text-amber-800 border border-amber-200',
            level === 'low' && 'bg-orange-100 text-orange-800 border border-orange-200'
          )}
        >
          Zekerheid: {confidencePercent}%
          {level === 'low' && (
            <span className="block text-[10px] opacity-75">
              Mogelijk onjuist herkend
            </span>
          )}
        </span>
      )}
      {' '}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConfidenceText({
  words,
  className,
  mediumThreshold = 0.9,
  lowThreshold = 0.7,
}: ConfidenceTextProps) {
  if (!words || words.length === 0) {
    return null
  }

  const getConfidenceLevel = (confidence: number): ConfidenceLevel => {
    if (confidence >= mediumThreshold) return 'high'
    if (confidence >= lowThreshold) return 'medium'
    return 'low'
  }

  // Statistieken voor samenvatting
  const lowConfidenceCount = words.filter(
    (w) => w.confidence < lowThreshold
  ).length
  const mediumConfidenceCount = words.filter(
    (w) => w.confidence >= lowThreshold && w.confidence < mediumThreshold
  ).length

  const hasIssues = lowConfidenceCount > 0 || mediumConfidenceCount > 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Tekst met confidence markering */}
      <div className="text-sm text-slate-900 leading-relaxed">
        {words.map((word, index) => (
          <ConfidenceWord
            key={`${word.word}-${word.start}-${index}`}
            word={word.word}
            confidence={word.confidence}
            level={getConfidenceLevel(word.confidence)}
          />
        ))}
      </div>

      {/* Samenvatting indien er issues zijn */}
      {hasIssues && (
        <div className="text-xs text-slate-500 flex items-center gap-3 pt-1 border-t border-slate-100">
          {mediumConfidenceCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {mediumConfidenceCount} woord{mediumConfidenceCount !== 1 && 'en'}{' '}
              &lt;90% zeker
            </span>
          )}
          {lowConfidenceCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {lowConfidenceCount} woord{lowConfidenceCount !== 1 && 'en'}{' '}
              &lt;70% zeker
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Confidence Preview (voor in de recorder)
// ─────────────────────────────────────────────────────────────────────────────

export function ConfidencePreview({
  words,
  className,
}: {
  words: TranscriptWord[]
  className?: string
}) {
  if (!words || words.length === 0) return null

  const lowCount = words.filter((w) => w.confidence < 0.7).length
  const mediumCount = words.filter(
    (w) => w.confidence >= 0.7 && w.confidence < 0.9
  ).length

  if (lowCount === 0 && mediumCount === 0) return null

  return (
    <div
      className={cn(
        'text-xs flex items-center gap-2 px-2 py-1 rounded bg-slate-50',
        className
      )}
    >
      <span className="text-slate-500">Onzekere woorden:</span>
      {mediumCount > 0 && (
        <span className="text-amber-600 font-medium">
          {mediumCount}
          <span className="text-amber-400 ml-0.5">●</span>
        </span>
      )}
      {lowCount > 0 && (
        <span className="text-orange-600 font-medium">
          {lowCount}
          <span className="text-orange-500 ml-0.5">●</span>
        </span>
      )}
    </div>
  )
}

