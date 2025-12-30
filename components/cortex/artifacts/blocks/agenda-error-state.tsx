'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * AgendaErrorState Component
 *
 * Reusable error display for agenda operations.
 * Epic 5.S3 - Provides user-friendly error messages with fallback links.
 */

interface AgendaErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  showFallbackLink?: boolean;
  context?: 'query' | 'create' | 'cancel' | 'reschedule';
}

/**
 * Get user-friendly error message based on error type and context
 */
function getUserFriendlyMessage(error: string | Error, context?: string): string {
  const errorString = error instanceof Error ? error.message : error;

  // Check for specific error types
  if (errorString.includes('401') || errorString.includes('Niet geautoriseerd')) {
    return 'Je sessie is verlopen. Log opnieuw in.';
  }

  if (errorString.includes('404')) {
    return 'De gevraagde afspraak kon niet worden gevonden.';
  }

  if (errorString.includes('403')) {
    return 'Je hebt geen toegang tot deze afspraak.';
  }

  if (errorString.includes('500') || errorString.includes('server')) {
    return 'Er ging iets mis op de server. Probeer het opnieuw.';
  }

  if (errorString.includes('network') || errorString.includes('Failed to fetch')) {
    return 'Geen internetverbinding. Controleer je netwerkverbinding.';
  }

  if (errorString.includes('timeout')) {
    return 'De aanvraag duurde te lang. Probeer het opnieuw.';
  }

  // Context-specific messages
  if (context === 'query') {
    return 'Er ging iets mis bij het ophalen van je afspraken.';
  }

  if (context === 'create') {
    return 'Er ging iets mis bij het aanmaken van de afspraak.';
  }

  if (context === 'cancel') {
    return 'Er ging iets mis bij het annuleren van de afspraak.';
  }

  if (context === 'reschedule') {
    return 'Er ging iets mis bij het verzetten van de afspraak.';
  }

  // Fallback to provided error or generic message
  return errorString || 'Er is een onverwachte fout opgetreden.';
}

export function AgendaErrorState({
  error,
  onRetry,
  showFallbackLink = true,
  context,
}: AgendaErrorStateProps) {
  const userMessage = getUserFriendlyMessage(error, context);

  // Check if this is an auth error (should redirect)
  const isAuthError = userMessage.includes('sessie') || userMessage.includes('Log opnieuw in');

  if (isAuthError) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>

      <h3 className="font-semibold text-gray-900 mb-2">Er ging iets mis</h3>

      <p className="text-sm text-gray-600 mb-6 max-w-md">
        {userMessage}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <RefreshCw className="h-4 w-4" />
            Probeer opnieuw
          </Button>
        )}

        {showFallbackLink && (
          <Button
            onClick={() => {
              window.location.href = '/epd/agenda';
            }}
            variant={onRetry ? 'ghost' : 'outline'}
            className="gap-2 text-teal-700 hover:bg-teal-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open volledige agenda
          </Button>
        )}
      </div>

      {/* Technical details (collapsed by default) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left w-full max-w-md">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            Technische details (dev only)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-gray-700">
            {error instanceof Error ? error.stack : error}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Inline error alert (for forms)
 */
interface AgendaErrorAlertProps {
  error: string | Error;
  onDismiss?: () => void;
  showFallbackLink?: boolean;
}

export function AgendaErrorAlert({
  error,
  onDismiss,
  showFallbackLink = false,
}: AgendaErrorAlertProps) {
  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-sm text-red-700">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p>{userMessage}</p>
        {showFallbackLink && (
          <a
            href="/epd/agenda"
            className="text-xs underline hover:no-underline mt-1 inline-block"
          >
            Open volledige agenda →
          </a>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600"
          aria-label="Sluit melding"
        >
          ×
        </button>
      )}
    </div>
  );
}
