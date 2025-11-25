interface SpeechTelemetryContext {
  context: string
  patientId?: string
  intakeId?: string
  reportId?: string
}

export type SpeechTelemetryAction = 'start' | 'stop' | 'final'

export type SpeechTelemetryPayload = SpeechTelemetryContext & {
  action: SpeechTelemetryAction
  metadata?: Record<string, unknown>
}

export function logSpeechUsage(payload: SpeechTelemetryPayload) {
  if (typeof window === 'undefined') return
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/telemetry/speech', blob)
      return
    } catch (error) {
      console.warn('sendBeacon speech telemetry failed, falling back to fetch', error)
    }
  }

  fetch('/api/telemetry/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    credentials: 'same-origin',
    keepalive: true,
  }).catch((error) => {
    console.warn('Speech telemetry fetch failed', error)
  })
}

export type SpeechTelemetryOptions = SpeechTelemetryContext
