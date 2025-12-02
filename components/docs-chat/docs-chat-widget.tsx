'use client'

import { useState } from 'react'
import { Sparkles, X, FileText } from 'lucide-react'

import { cn } from '@/lib/utils'
import { usePatientContext } from '@/app/epd/components/patient-context'

import { ChatInput } from './chat-input'
import { ChatMessages } from './chat-messages'
import { ChatSuggestions } from './chat-suggestions'
import { RateLimitMessage } from './rate-limit-message'
import { useDocsChat } from './use-docs-chat'

/**
 * Helper to format patient name from FHIR structure
 */
function formatPatientName(patient: { name?: Array<{ given?: string[]; family?: string; prefix?: string[] }> } | null): string | undefined {
  if (!patient?.name?.[0]) return undefined
  const name = patient.name[0]
  const given = name.given?.join(' ') || ''
  const prefix = name.prefix?.join(' ') || ''
  const family = name.family || ''
  return `${given} ${prefix ? prefix + ' ' : ''}${family}`.trim() || undefined
}

/**
 * Floating chat widget for documentation assistant
 *
 * UI Specs (uit FO):
 * - Trigger button: 56x56px, amber gradient, Sparkles icon, fixed bottom-6 right-6
 * - Panel: 384px breed, max 80vh, slide-in animatie
 */
export function DocsChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  // Get patient context for client-aware chat
  const { patient } = usePatientContext()
  const patientName = formatPatientName(patient)

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    isRateLimited,
    rateLimitResetTime,
    sendMessage,
    clearError,
    clearRateLimit,
    hasClientContext,
    clientName,
  } = useDocsChat({
    clientId: patient?.id,
    clientName: patientName,
  })

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-amber-400 to-amber-600',
          'text-white shadow-lg',
          'flex items-center justify-center',
          'hover:from-amber-500 hover:to-amber-700',
          'hover:scale-105 hover:shadow-xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open documentatie assistent"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-96 max-h-[80vh]',
          'bg-white rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'border border-slate-200',
          'transition-all duration-300 ease-out',
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-amber-100/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">
                EPD Assistent
              </h2>
              <p className="text-xs text-slate-500">
                {hasClientContext ? 'Stel vragen over de client of het EPD' : 'Stel vragen over het EPD'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={cn(
              'w-8 h-8 rounded-lg',
              'flex items-center justify-center',
              'text-slate-400 hover:text-slate-600',
              'hover:bg-slate-100',
              'transition-colors duration-150'
            )}
            aria-label="Sluit chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client indicator - shown when in patient dossier */}
        {hasClientContext && clientName && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Dossier: <span className="font-medium">{clientName}</span>
            </span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              Sluiten
            </button>
          </div>
        )}

        {/* Messages */}
        <ChatMessages messages={messages} isStreaming={isStreaming} />

        {/* Rate limit message */}
        {isRateLimited && (
          <RateLimitMessage
            resetTime={rateLimitResetTime}
            onReset={clearRateLimit}
          />
        )}

        {/* Suggestions - show only when just welcome message and not rate limited */}
        {!isRateLimited && messages.length === 1 && messages[0].id === 'welcome' && (
          <ChatSuggestions
            onSelect={sendMessage}
            disabled={isLoading || isStreaming}
            mode={hasClientContext ? 'client' : 'documentation'}
          />
        )}

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || isStreaming || isRateLimited}
        />
      </div>
    </>
  )
}
