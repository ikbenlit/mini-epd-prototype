/**
 * Cortex Suggestion Data
 *
 * Defines categories and example sentences for the Intent Helper UI.
 * Based on implemented intents in lib/cortex/types.ts
 */

import type { CortexIntent } from './types';

export interface SuggestionCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  examples: SuggestionExample[];
}

export interface SuggestionExample {
  text: string;
  intent: CortexIntent;
  /** Placeholder marker for patient name */
  hasPatientPlaceholder?: boolean;
}

/**
 * Suggestion categories with examples
 * Based on the 7 implemented intents:
 * - dagnotitie
 * - zoeken
 * - overdracht
 * - agenda_query
 * - create_appointment
 * - cancel_appointment
 * - reschedule_appointment
 */
export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'notities',
    label: 'Notities',
    icon: '📝',
    description: 'Dagnotities en rapportages maken',
    examples: [
      { text: 'Notitie [naam] medicatie gegeven', intent: 'dagnotitie', hasPatientPlaceholder: true },
      { text: '[naam] is rustig vandaag', intent: 'dagnotitie', hasPatientPlaceholder: true },
      { text: 'Incident: patient gevallen', intent: 'dagnotitie' },
      { text: 'ADL: hulp bij douchen gegeven', intent: 'dagnotitie' },
    ],
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: '📅',
    description: 'Afspraken bekijken en beheren',
    examples: [
      { text: 'Agenda vandaag', intent: 'agenda_query' },
      { text: 'Plan intake [naam] morgen', intent: 'create_appointment', hasPatientPlaceholder: true },
      { text: 'Annuleer afspraak [naam]', intent: 'cancel_appointment', hasPatientPlaceholder: true },
      { text: 'Verzet afspraak naar volgende week', intent: 'reschedule_appointment' },
    ],
  },
  {
    id: 'zoeken',
    label: 'Zoeken',
    icon: '🔍',
    description: 'Patiënten en dossiers zoeken',
    examples: [
      { text: 'Zoek [naam]', intent: 'zoeken', hasPatientPlaceholder: true },
      { text: 'Wie is mevrouw de Vries?', intent: 'zoeken' },
      { text: 'Dossier Jan Pietersen', intent: 'zoeken' },
      { text: 'Patiënt kamer 12', intent: 'zoeken' },
    ],
  },
  {
    id: 'overdracht',
    label: 'Overdracht',
    icon: '📋',
    description: 'Dienstoverdrachten en samenvattingen',
    examples: [
      { text: 'Overdracht', intent: 'overdracht' },
      { text: 'Wat is er gebeurd vandaag?', intent: 'overdracht' },
      { text: 'Samenvatting voor collega', intent: 'overdracht' },
      { text: 'Aandachtspunten voor de nacht', intent: 'overdracht' },
    ],
  },
];

/**
 * Get a flat list of all examples for quick access
 */
export function getAllExamples(): SuggestionExample[] {
  return SUGGESTION_CATEGORIES.flatMap((category) => category.examples);
}

/**
 * Get examples for a specific category
 */
export function getExamplesByCategory(categoryId: string): SuggestionExample[] {
  const category = SUGGESTION_CATEGORIES.find((c) => c.id === categoryId);
  return category?.examples ?? [];
}

/**
 * Replace placeholder [naam] with actual patient name
 */
export function replacePlaceholder(text: string, patientName?: string): string {
  if (!patientName) return text;
  return text.replace(/\[naam\]/g, patientName);
}

