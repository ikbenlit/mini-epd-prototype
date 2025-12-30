/**
 * Cortex Type Definitions
 *
 * Core types for the Cortex Contextual UI system.
 */

import type { VerpleegkundigCategory } from '@/lib/types/report';

// Intent types
export type CortexIntent =
  | 'dagnotitie'
  | 'zoeken'
  | 'overdracht'
  | 'agenda_query'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'unknown';

export type BlockType = Exclude<CortexIntent, 'unknown'> | 'patient-dashboard';

// Shift types
export type ShiftType = 'nacht' | 'ochtend' | 'middag' | 'avond';

// Intent classification result
export interface IntentClassificationResult {
  intent: CortexIntent;
  confidence: number;
  entities: ExtractedEntities;
  source: 'local' | 'ai';
}

// Extracted entities from user input
export interface ExtractedEntities {
  // Common entities
  patientName?: string;
  patientId?: string;

  // Dagnotitie entities
  category?: VerpleegkundigCategory;
  content?: string;

  // Search entities
  query?: string;

  // Agenda entities
  dateRange?: {
    start: Date;
    end: Date;
    label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week' | 'custom';
  };
  datetime?: {
    date: Date;
    time: string; // "HH:mm" format
  };
  appointmentType?: 'intake' | 'behandeling' | 'follow-up' | 'telefonisch' |
                    'huisbezoek' | 'online' | 'crisis' | 'overig';
  location?: 'praktijk' | 'online' | 'thuis';
  identifier?: {
    type: 'patient' | 'time' | 'both';
    patientName?: string;
    patientId?: string;
    time?: string;
    date?: Date;
    encounterId?: string;
  };
  newDatetime?: {
    date: Date;
    time: string;
  };

  // Legacy fields (for backward compatibility)
  date?: string;
  time?: string;
}

// Block sizes
export type BlockSize = 'sm' | 'md' | 'lg' | 'full';

// Block configuration
export interface BlockConfig {
  type: BlockType;
  title: string;
  size: BlockSize;
  icon: string;
}

// Block configs for each type
export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  dagnotitie: {
    type: 'dagnotitie',
    title: 'Dagnotitie',
    size: 'md',
    icon: 'FileText',
  },
  zoeken: {
    type: 'zoeken',
    title: 'Patiënt zoeken',
    size: 'md',
    icon: 'Search',
  },
  overdracht: {
    type: 'overdracht',
    title: 'Overdracht',
    size: 'lg',
    icon: 'ArrowRightLeft',
  },
  agenda_query: {
    type: 'agenda_query',
    title: 'Agenda',
    size: 'lg',
    icon: 'Calendar',
  },
  create_appointment: {
    type: 'create_appointment',
    title: 'Nieuwe afspraak',
    size: 'lg',
    icon: 'Plus',
  },
  cancel_appointment: {
    type: 'cancel_appointment',
    title: 'Afspraak annuleren',
    size: 'lg',
    icon: 'X',
  },
  reschedule_appointment: {
    type: 'reschedule_appointment',
    title: 'Afspraak verzetten',
    size: 'lg',
    icon: 'Clock',
  },
  'patient-dashboard': {
    type: 'patient-dashboard',
    title: 'Patiëntoverzicht',
    size: 'lg',
    icon: 'LayoutDashboard',
  },
};

// Recent action type
export interface RecentAction {
  id: string;
  intent: CortexIntent;
  label: string;
  timestamp: Date;
  patientName?: string;
}
