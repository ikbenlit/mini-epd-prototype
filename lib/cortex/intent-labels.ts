/**
 * Intent Labels & Status Styles
 *
 * Shared Dutch labels and styling for Cortex V2 UI components.
 * Used by ActionChainCard, ActionItem, and ClarificationCard.
 *
 * Epic: E3 (UI Components)
 */

import type { CortexIntent, IntentActionStatus, NudgePriority, ExtractedEntities } from './types';

/**
 * Dutch labels for intent types
 */
export const INTENT_LABELS: Record<CortexIntent, string> = {
  dagnotitie: 'Dagnotitie',
  zoeken: 'Patiënt zoeken',
  overdracht: 'Overdracht',
  agenda_query: 'Agenda bekijken',
  create_appointment: 'Afspraak maken',
  cancel_appointment: 'Afspraak annuleren',
  reschedule_appointment: 'Afspraak verzetten',
  unknown: 'Onbekend',
};

/**
 * Status styling for IntentAction items
 */
export const STATUS_STYLES: Record<
  IntentActionStatus,
  { bg: string; border: string; text: string; icon: string }
> = {
  pending: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    icon: 'text-slate-300',
  },
  confirming: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  executing: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  failed: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  skipped: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-400',
    icon: 'text-slate-400',
  },
};

/**
 * Get confidence badge styling based on confidence score
 * >= 0.9: green (high confidence)
 * >= 0.7: amber (medium confidence)
 * < 0.7:  red (low confidence)
 */
export function getConfidenceStyle(confidence: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (confidence >= 0.9) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Hoog',
    };
  }
  if (confidence >= 0.7) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      label: 'Gemiddeld',
    };
  }
  return {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Laag',
  };
}

/**
 * Priority styling for NudgeSuggestion toasts
 */
export const PRIORITY_STYLES: Record<
  NudgePriority,
  { bg: string; border: string; text: string }
> = {
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
  },
};

/**
 * Format entity summary for display in ActionItem
 */
export function formatEntitySummary(
  intent: CortexIntent,
  entities: ExtractedEntities
): string {
  const parts: string[] = [];

  // Patient name
  if (entities.patientName) {
    parts.push(`Patiënt: ${entities.patientName}`);
  }

  // Content/query
  if (entities.content && typeof entities.content === 'string') {
    const truncated =
      entities.content.length > 50
        ? `${entities.content.slice(0, 50)}...`
        : entities.content;
    parts.push(truncated);
  }

  if (entities.query && typeof entities.query === 'string') {
    parts.push(`Zoekterm: "${entities.query}"`);
  }

  // Date/time
  if (entities.datetime) {
    const dt = entities.datetime;
    // datetime.date is a Date object, format it
    const dateStr = dt.date ? dt.date.toLocaleDateString('nl-NL') : null;
    if (dateStr && dt.time) {
      parts.push(`${dateStr} om ${dt.time}`);
    } else if (dateStr) {
      parts.push(dateStr);
    } else if (dt.time) {
      parts.push(`om ${dt.time}`);
    }
  }

  // Category for dagnotitie
  if (intent === 'dagnotitie' && entities.category) {
    const categoryLabels: Record<string, string> = {
      medicatie: 'Medicatie',
      adl: 'ADL',
      gedrag: 'Gedrag',
      incident: 'Incident',
      observatie: 'Observatie',
    };
    const label = categoryLabels[entities.category as string] || entities.category;
    parts.push(`Categorie: ${label}`);
  }

  return parts.join(' • ') || 'Geen details';
}
