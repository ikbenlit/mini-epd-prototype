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

/** Calculate current shift based on time of day */
export function getCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 7) return 'nacht';
  if (hour >= 7 && hour < 12) return 'ochtend';
  if (hour >= 12 && hour < 17) return 'middag';
  return 'avond';
}

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

// =============================================================================
// Cortex V2 Types — Three-Layer Architecture
// =============================================================================

// -----------------------------------------------------------------------------
// Layer 1: Reflex Arc Types
// -----------------------------------------------------------------------------

/** Reasons why Reflex Arc escalates to Orchestrator */
export type EscalationReason =
  | 'low_confidence'
  | 'ambiguous'
  | 'multi_intent_detected'
  | 'needs_context'
  | 'relative_time';

/** Local classification result from Reflex Arc */
export interface LocalClassificationResult {
  intent: CortexIntent;
  confidence: number;
  /** Second best match for ambiguity detection */
  secondBestIntent?: CortexIntent;
  secondBestConfidence?: number;
  matchedPattern?: string;
  processingTimeMs: number;
  shouldEscalateToAI: boolean;
  escalationReason?: EscalationReason;
}

/** Confidence threshold for high-confidence local classification */
export const CONFIDENCE_THRESHOLD = 0.7;

/** Threshold for ambiguity detection (delta between top-2 scores) */
export const AMBIGUITY_THRESHOLD = 0.1;

// -----------------------------------------------------------------------------
// Layer 2: Orchestrator Types
// -----------------------------------------------------------------------------

/** Context provided to AI for intelligent classification */
export interface CortexContext {
  activePatient: {
    id: string;
    name: string;
    recentNotes?: string[];
    upcomingAppointments?: { date: Date; type: string }[];
  } | null;
  currentView: 'dashboard' | 'patient-detail' | 'agenda' | 'reports' | 'chat';
  shift: ShiftType;
  currentTime: Date;
  agendaToday: {
    time: string;
    patientName: string;
    patientId: string;
    type: string;
  }[];
  recentIntents: {
    intent: CortexIntent;
    patientName?: string;
    timestamp: Date;
  }[];
  userPreferences?: {
    confirmationLevel: 'always' | 'destructive' | 'never';
    frequentIntents: CortexIntent[];
  };
}

/** Action status in an intent chain */
export type IntentActionStatus =
  | 'pending'
  | 'confirming'
  | 'executing'
  | 'success'
  | 'failed'
  | 'skipped';

/** Single action in a multi-intent chain */
export interface IntentAction {
  id: string;
  sequence: number;
  intent: CortexIntent;
  confidence: number;
  entities: ExtractedEntities;
  status: IntentActionStatus;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  startedAt?: Date;
  completedAt?: Date;
}

/** Chain status */
export type IntentChainStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'partial'
  | 'failed';

/** Multi-intent container from single user input */
export interface IntentChain {
  id: string;
  originalInput: string;
  createdAt: Date;
  actions: IntentAction[];
  status: IntentChainStatus;
  meta: {
    source: 'local' | 'ai';
    processingTimeMs: number;
    aiReasoning?: string;
  };
}

// -----------------------------------------------------------------------------
// Layer 3: Nudge Types
// -----------------------------------------------------------------------------

/** Nudge suggestion priority */
export type NudgePriority = 'low' | 'medium' | 'high';

/** Nudge suggestion status */
export type NudgeStatus = 'pending' | 'accepted' | 'dismissed' | 'expired';

/** Proactive suggestion after action completion */
export interface NudgeSuggestion {
  id: string;
  trigger: {
    actionId: string;
    intent: CortexIntent;
    entities: ExtractedEntities;
  };
  suggestion: {
    intent: CortexIntent;
    entities: Partial<ExtractedEntities>;
    message: string;
    rationale: string;
  };
  status: NudgeStatus;
  priority: NudgePriority;
  expiresAt?: Date;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Clarification Types
// -----------------------------------------------------------------------------

/** Clarification request when AI needs user input */
export interface ClarificationRequest {
  question: string;
  options: string[];
  originalInput: string;
}
