'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Pause, Play, Square, Settings, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDeepgramStreaming,
  type ConnectionStatus,
  type TranscriptResult,
  type TranscriptWord,
} from '@/hooks/use-deepgram-streaming'
import { ConfidencePreview } from '@/components/confidence-text'
import { logSpeechUsage, type SpeechTelemetryOptions } from '@/lib/telemetry/speech'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SpeechRecorderStreamingProps {
  /** Callback wanneer er een final transcript is */
  onTranscript: (transcript: string) => void
  /** Callback voor interim transcripts (optioneel, voor live preview) */
  onInterimTranscript?: (interim: string) => void
  /** Callback voor woorden met confidence scores */
  onWordsUpdate?: (words: TranscriptWord[]) => void
  /** Disabled state */
  disabled?: boolean
  /** Extra CSS classes */
  className?: string
  /** Callback wanneer opname start (voor cursor positioning) */
  onRecordingStart?: () => void
  /** Callback wanneer opname stopt */
  onRecordingStop?: () => void
  /** Optionele context voor telemetrie */
  telemetryContext?: SpeechTelemetryOptions
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Display Component
// ─────────────────────────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  const config: Record<
    ConnectionStatus,
    { icon: string; color: string; label: string }
  > = {
    disconnected: {
      icon: '◯',
      color: 'text-slate-400',
      label: 'Niet verbonden',
    },
    connecting: {
      icon: '◐',
      color: 'text-amber-500',
      label: 'Verbinden...',
    },
    connected: {
      icon: '●',
      color: 'text-emerald-500',
      label: 'Verbonden & streaming',
    },
    reconnecting: {
      icon: '⚠',
      color: 'text-orange-500',
      label: 'Herverbinden...',
    },
    error: {
      icon: '✕',
      color: 'text-red-500',
      label: 'Fout',
    },
  }

  const { icon, color, label } = config[status]

  return (
    <span className={cn('text-xs flex items-center gap-1', color)}>
      <span className="text-sm">{icon}</span>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Waveform Visualizer Component
// ─────────────────────────────────────────────────────────────────────────────

function WaveformVisualizer({
  analyserNode,
  isActive,
}: {
  analyserNode: AnalyserNode | null
  isActive: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!analyserNode || !canvasRef.current || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyserNode.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.fillStyle = '#f8fafc' // slate-50
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barCount = 32
      const barWidth = (canvas.width - (barCount - 1) * 2) / barCount
      const maxBarHeight = canvas.height - 8

      for (let i = 0; i < barCount; i++) {
        // Sample from frequency data
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const value = dataArray[dataIndex] / 255

        const barHeight = Math.max(4, value * maxBarHeight)
        const x = i * (barWidth + 2)
        const y = (canvas.height - barHeight) / 2

        // Gradient from slate to emerald based on value
        const intensity = Math.floor(value * 255)
        ctx.fillStyle =
          value > 0.3
            ? `rgb(${16 + (1 - value) * 50}, ${185 - (1 - value) * 100}, ${129 - (1 - value) * 50})`
            : '#64748b' // slate-500

        // Rounded bars
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 2)
        ctx.fill()
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyserNode, isActive])

  if (!isActive) return null

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={40}
      className="rounded bg-slate-50"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function SpeechRecorderStreaming({
  onTranscript,
  onInterimTranscript,
  onWordsUpdate,
  disabled = false,
  className,
  onRecordingStart,
  onRecordingStop,
  telemetryContext,
}: SpeechRecorderStreamingProps) {
  const [interimText, setInterimText] = useState('')
  const [allWords, setAllWords] = useState<TranscriptWord[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [isAutoPaused, setIsAutoPaused] = useState(false)

  // Accumulate final transcript parts
  const finalPartsRef = useRef<string[]>([])
  const autoPauseTriggeredRef = useRef(false)
  const telemetryRef = useRef<SpeechTelemetryOptions | undefined>(telemetryContext)

  useEffect(() => {
    telemetryRef.current = telemetryContext
  }, [telemetryContext])

  const trackSpeechUsage = useCallback(
    (action: 'start' | 'stop' | 'final', metadata?: Record<string, unknown>) => {
      if (!telemetryRef.current) return
      logSpeechUsage({ ...telemetryRef.current, action, metadata })
    },
    []
  )

  const handleTranscript = useCallback(
    (result: TranscriptResult) => {
      if (result.isFinal) {
        // Final transcript - accumulate en stuur naar parent
        finalPartsRef.current.push(result.transcript)
        setInterimText('')

        // Update words met confidence
        setAllWords((prev) => {
          const next = [...prev, ...result.words]
          onWordsUpdate?.(next)
          return next
        })

        // Stuur volledige tekst naar parent
        onTranscript(finalPartsRef.current.join(' '))
        trackSpeechUsage('final', {
          chunkLength: result.transcript.length,
          totalLength: finalPartsRef.current.join(' ').length,
        })

        // Check voor auto-pause na speech_final (3 sec stilte gedetecteerd door Deepgram)
        if (result.speechFinal && !autoPauseTriggeredRef.current) {
          autoPauseTriggeredRef.current = true
          setIsAutoPaused(true)
        }
      } else {
        // Interim transcript - alleen preview
        setInterimText(result.transcript)
        onInterimTranscript?.(result.transcript)
        
        // Reset auto-pause state bij nieuwe interim speech
        if (isAutoPaused) {
          setIsAutoPaused(false)
          autoPauseTriggeredRef.current = false
        }
      }
    },
    [onTranscript, onInterimTranscript, onWordsUpdate, isAutoPaused, trackSpeechUsage]
  )

  const handleError = useCallback((error: Error) => {
    setLocalError(error.message)
  }, [])

  const {
    status,
    isRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    error: hookError,
    analyserNode,
    isBrowserSupported,
  } = useDeepgramStreaming({
    onTranscript: handleTranscript,
    onError: handleError,
  })

  const error = localError || hookError

  const handleStart = async () => {
    setLocalError(null)
    finalPartsRef.current = []
    setAllWords([])
    setInterimText('')
    setIsAutoPaused(false)
    autoPauseTriggeredRef.current = false
    onRecordingStart?.()
    await startRecording()
    trackSpeechUsage('start')
  }

  const handleStop = () => {
    stopRecording()
    setIsAutoPaused(false)
    autoPauseTriggeredRef.current = false
    onRecordingStop?.()
    trackSpeechUsage('stop', {
      totalLength: finalPartsRef.current.join(' ').length,
    })
  }

  const handlePauseResume = () => {
    if (isPaused || isAutoPaused) {
      setIsAutoPaused(false)
      autoPauseTriggeredRef.current = false
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  const isConnecting = status === 'connecting'
  const isReconnecting = status === 'reconnecting'
  const showWaveform = isRecording && !isPaused && !isAutoPaused && status === 'connected'
  const effectivelyPaused = isPaused || isAutoPaused

  useEffect(() => {
    if (isAutoPaused && isRecording && !isPaused) {
      pauseRecording()
    }
  }, [isAutoPaused, isRecording, isPaused, pauseRecording])

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 space-y-3',
        isRecording && status === 'connected' && 'border-emerald-500 border-2 shadow-emerald-500/20 shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-900">Opname</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            aria-label="Instellingen"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Browser not supported message */}
      {!isBrowserSupported && (
        <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          ⚠ Spraakopname wordt niet ondersteund in deze browser. Gebruik Chrome, Firefox of Edge voor de beste ervaring.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          ⚠ {error}
        </div>
      )}

      {/* Reconnecting message */}
      {isReconnecting && (
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Herverbinden... Transcript blijft behouden.
        </div>
      )}

      {/* Interim text preview */}
      {interimText && (
        <div className="text-sm text-slate-500 italic bg-slate-50 p-2 rounded">
          {interimText}
        </div>
      )}

      {/* Waveform */}
      <WaveformVisualizer analyserNode={analyserNode} isActive={showWaveform} />

      {/* Confidence preview */}
      {allWords.length > 0 && (
        <ConfidencePreview words={allWords} />
      )}

      {/* Auto-pause message (3 sec stilte) */}
      {isAutoPaused && isRecording && (
        <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            <strong>Automatisch gepauzeerd</strong>
            <span className="text-amber-600 ml-1">(3 seconden stilte)</span>
          </span>
        </div>
      )}

      {/* Manual pause message */}
      {isPaused && !isAutoPaused && isRecording && (
        <div className="text-sm text-slate-600 bg-slate-100 p-2 rounded flex items-center gap-2">
          <Pause className="h-4 w-4" />
          Gepauzeerd
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={disabled || isConnecting || !isBrowserSupported}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              'bg-emerald-600 text-white hover:bg-emerald-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verbinden...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start opname
              </>
            )}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePauseResume}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                effectivelyPaused
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              {effectivelyPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Hervat
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pauzeer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleStop}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                'bg-red-600 text-white hover:bg-red-700'
              )}
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  )
}
