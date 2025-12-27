/**
 * Swift Type Definitions
 *
 * Core types for the Swift Contextual UI system.
 */

import type { VerpleegkundigCategory } from '@/lib/types/report';

// Intent types
export type SwiftIntent = 'dagnotitie' | 'zoeken' | 'overdracht' | 'unknown';

export type BlockType = Exclude<SwiftIntent, 'unknown'> | 'patient-dashboard';

// Shift types
export type ShiftType = 'nacht' | 'ochtend' | 'middag' | 'avond';

// Intent classification result
export interface IntentClassificationResult {
  intent: SwiftIntent;
  confidence: number;
  entities: ExtractedEntities;
  source: 'local' | 'ai';
}

// Extracted entities from user input
export interface ExtractedEntities {
  patientName?: string;
  patientId?: string;
  category?: VerpleegkundigCategory;
  content?: string;
  query?: string;
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
  intent: SwiftIntent;
  label: string;
  timestamp: Date;
  patientName?: string;
}
