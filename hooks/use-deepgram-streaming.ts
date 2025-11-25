'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
} from '@deepgram/sdk'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'

export interface TranscriptWord {
  word: string
  confidence: number
  start: number
  end: number
}

export interface TranscriptResult {
  transcript: string
  isFinal: boolean
  confidence: number
  words: TranscriptWord[]
  speechFinal: boolean
}

export interface UseDeepgramStreamingProps {
  /** Callback voor transcript updates (zowel interim als final) */
  onTranscript: (result: TranscriptResult) => void
  /** Callback voor errors */
  onError?: (error: Error) => void
  /** Callback wanneer verbinding status verandert */
  onStatusChange?: (status: ConnectionStatus) => void
  /** Taal voor transcriptie (default: 'nl') */
  language?: string
  /** Deepgram model (default: 'nova-2') */
  model?: string
  /** Endpointing timeout in ms (default: 3000) */
  endpointingMs?: number
}

export interface UseDeepgramStreamingReturn {
  /** Huidige verbindingsstatus */
  status: ConnectionStatus
  /** Of er actief wordt opgenomen */
  isRecording: boolean
  /** Start opname en streaming */
  startRecording: () => Promise<void>
  /** Stop opname en streaming */
  stopRecording: () => void
  /** Pauzeer opname (behoud verbinding) */
  pauseRecording: () => void
  /** Hervat opname na pause */
  resumeRecording: () => void
  /** Of opname gepauzeerd is */
  isPaused: boolean
  /** Huidige error message (indien aanwezig) */
  error: string | null
  /** Audio analyser node voor waveform visualisatie */
  analyserNode: AnalyserNode | null
  /** Of de browser alle vereiste APIs ondersteunt */
  isBrowserSupported: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Support Check
// ─────────────────────────────────────────────────────────────────────────────

function checkBrowserSupport(): boolean {
  if (typeof window === 'undefined') return false
  
  const hasMediaDevices = !!(navigator.mediaDevices?.getUserMedia)
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined'
  const hasAudioContext = typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined'
  const hasWebSocket = typeof WebSocket !== 'undefined'
  
  return hasMediaDevices && hasMediaRecorder && hasAudioContext && hasWebSocket
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_BASE_DELAY_MS = 1000
const AUDIO_CHUNK_INTERVAL_MS = 250

// ─────────────────────────────────────────────────────────────────────────────
// Hook Implementation
// ─────────────────────────────────────────────────────────────────────────────

export function useDeepgramStreaming({
  onTranscript,
  onError,
  onStatusChange,
  language = 'nl',
  model = 'nova-2',
  endpointingMs = 3000,
}: UseDeepgramStreamingProps): UseDeepgramStreamingReturn {
  // State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)

  // Check browser support on mount
  useEffect(() => {
    setIsBrowserSupported(checkBrowserSupport())
  }, [])

  // Refs
  const liveClientRef = useRef<LiveClient | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const shouldReconnectRef = useRef(false)
  const isPausedRef = useRef(isPaused)

  // Callback refs voor stabiele referenties
  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef = useRef(onError)
  const onStatusChangeRef = useRef(onStatusChange)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
    onErrorRef.current = onError
    onStatusChangeRef.current = onStatusChange
  }, [onTranscript, onError, onStatusChange])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Status update helper
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus)
    onStatusChangeRef.current?.(newStatus)
  }, [])

  // Fetch token van onze proxy endpoint
  const fetchToken = useCallback(async (): Promise<string> => {
    const response = await fetch('/api/deepgram/token', { method: 'POST' })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (response.status === 429) {
        throw new Error('Rate limit bereikt. Probeer over een uur opnieuw.')
      }
      if (response.status === 401) {
        throw new Error('Niet ingelogd. Log opnieuw in.')
      }
      throw new Error(data.error || 'Kon geen token ophalen')
    }

    const data = await response.json()
    return data.token
  }, [])

  // Setup WebSocket verbinding met Deepgram
  const connect = useCallback(async () => {
    try {
      updateStatus('connecting')
      setError(null)

      const token = await fetchToken()
      const deepgram = createClient(token)

      const connection = deepgram.listen.live({
        model,
        language,
        smart_format: true,
        interim_results: true,
        endpointing: endpointingMs,
        punctuate: true,
        utterances: true,
      })

      // Event handlers
      connection.on(LiveTranscriptionEvents.Open, () => {
        updateStatus('connected')
        reconnectAttemptsRef.current = 0
        setError(null)
      })

      connection.on(
        LiveTranscriptionEvents.Transcript,
        (data: LiveTranscriptionEvent) => {
          const alternative = data.channel?.alternatives?.[0]
          if (!alternative) return

          const transcript = alternative.transcript || ''
          if (!transcript.trim()) return

          const words: TranscriptWord[] = (alternative.words || []).map(
            (w: { word: string; confidence: number; start: number; end: number }) => ({
              word: w.word,
              confidence: w.confidence,
              start: w.start,
              end: w.end,
            })
          )

          const result: TranscriptResult = {
            transcript,
            isFinal: data.is_final ?? false,
            confidence: alternative.confidence ?? 1,
            words,
            speechFinal: data.speech_final ?? false,
          }

          onTranscriptRef.current(result)
        }
      )

      connection.on(LiveTranscriptionEvents.Error, (err: Error) => {
        console.error('Deepgram WebSocket error:', err)
        setError(err.message || 'WebSocket fout')
        updateStatus('error')
        onErrorRef.current?.(err)

        // Probeer te reconnecten als we nog aan het opnemen waren
        if (shouldReconnectRef.current) {
          handleReconnect()
        }
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          handleReconnect()
        } else {
          updateStatus('disconnected')
        }
      })

      liveClientRef.current = connection
    } catch (err) {
      console.error('Connection error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Verbindingsfout'
      setError(errorMessage)
      updateStatus('error')
      onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage))

      if (shouldReconnectRef.current) {
        handleReconnect()
      }
    }
  }, [fetchToken, model, language, endpointingMs, updateStatus])

  // Reconnect met exponential backoff
  const handleReconnect = useCallback(async () => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('Kon niet herverbinden na 3 pogingen')
      updateStatus('error')
      shouldReconnectRef.current = false
      return
    }

    reconnectAttemptsRef.current++
    updateStatus('reconnecting')

    const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current - 1)
    await new Promise((resolve) => setTimeout(resolve, delay))

    if (shouldReconnectRef.current) {
      await connect()
    }
  }, [connect, updateStatus])

  // Setup audio stream en analyser
  const setupAudio = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStreamRef.current = stream

    // Setup Web Audio API voor waveform
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    audioContextRef.current = audioContext
    setAnalyserNode(analyser)

    // Bepaal beste mimeType (Safari ondersteunt geen audio/webm)
    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : undefined // Browser default

    // Setup MediaRecorder voor streaming naar Deepgram
    const mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && liveClientRef.current && !isPausedRef.current) {
        liveClientRef.current.send(event.data)
      }
    }

    mediaRecorder.start(AUDIO_CHUNK_INTERVAL_MS)
    mediaRecorderRef.current = mediaRecorder
  }, [])

  // Start opname
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      shouldReconnectRef.current = true

      // Eerst WebSocket verbinding opzetten
      await connect()

      // Dan audio stream starten
      await setupAudio()

      setIsRecording(true)
      setIsPaused(false)
    } catch (err) {
      console.error('Start recording error:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Kon opname niet starten'

      if (
        err instanceof Error &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      ) {
        setError('Microfoontoegang geweigerd. Sta toegang toe in je browser.')
      } else {
        setError(errorMessage)
      }

      updateStatus('error')
      onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage))
    }
  }, [connect, setupAudio, updateStatus])

  // Stop opname
  const stopRecording = useCallback(() => {
    shouldReconnectRef.current = false

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    // Stop alle audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    mediaStreamRef.current = null

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    audioContextRef.current = null
    setAnalyserNode(null)

    // Close WebSocket
    if (liveClientRef.current) {
      liveClientRef.current.requestClose()
    }
    liveClientRef.current = null

    setIsRecording(false)
    setIsPaused(false)
    updateStatus('disconnected')
  }, [updateStatus])

  // Pauzeer opname
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }, [])

  // Hervat opname
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }, [])

  // Cleanup bij unmount
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false
      stopRecording()
    }
  }, [stopRecording])

  return {
    status,
    isRecording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    error,
    analyserNode,
    isBrowserSupported,
  }
}
