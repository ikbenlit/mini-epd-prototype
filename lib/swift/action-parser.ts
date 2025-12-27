/**
 * Action Parser for Swift Medical Scribe
 *
 * Parses JSON action objects from AI responses and validates them.
 *
 * Epic: E3 (Chat API & Medical Scribe)
 * Story: E3.S4 (Intent detection in response)
 */

import { z } from 'zod';
import type { ChatAction, SwiftIntent, BlockType } from '@/stores/swift-store';

// Validation schema for action objects
const ActionSchema = z.object({
  type: z.literal('action'),
  intent: z.enum([
    'dagnotitie',
    'zoeken',
    'overdracht',
    'agenda_query',
    'create_appointment',
    'cancel_appointment',
    'reschedule_appointment',
    'unknown',
  ]),
  entities: z.object({
    patientName: z.string().optional(),
    patientId: z.string().optional(),
    category: z.enum(['medicatie', 'adl', 'gedrag', 'incident', 'observatie']).optional(),
    content: z.string().optional(),
    query: z.string().optional(), // For zoeken intent
    date: z.string().optional(),
    time: z.string().optional(),
    identifier: z.string().optional(),
  }),
  confidence: z.number().min(0).max(1),
  artifact: z
    .object({
      type: z.enum([
        'dagnotitie',
        'zoeken',
        'overdracht',
        'agenda_query',
        'create_appointment',
        'cancel_appointment',
        'reschedule_appointment',
        'fallback',
        'patient-dashboard',
      ]),
      prefill: z.record(z.string(), z.any()),
    })
    .optional(),
});

export interface ParsedActionResult {
  action: ChatAction | null;
  textContent: string; // Text without JSON block
  rawJson?: string; // Raw JSON string if found
}

/**
 * Extract JSON code block from markdown text
 * Looks for ```json ... ``` blocks
 */
function extractJsonBlock(text: string): string | null {
  // Match ```json ... ``` blocks (with newlines)
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/;
  const match = text.match(jsonBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Remove JSON code blocks from text
 */
function removeJsonBlocks(text: string): string {
  return text.replace(/```json\s*\n[\s\S]*?\n```/g, '').trim();
}

/**
 * Parse action object from AI response
 *
 * Extracts and validates JSON action objects from markdown code blocks.
 *
 * @param responseText - Full AI response text
 * @returns Parsed action (if valid), cleaned text content, and raw JSON
 */
export function parseActionFromResponse(responseText: string): ParsedActionResult {
  // Extract JSON block from markdown
  const jsonString = extractJsonBlock(responseText);

  if (!jsonString) {
    return {
      action: null,
      textContent: responseText,
    };
  }

  // Try to parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON action:', error);
    return {
      action: null,
      textContent: responseText,
      rawJson: jsonString,
    };
  }

  // Validate against schema
  const validation = ActionSchema.safeParse(parsedJson);

  if (!validation.success) {
    console.error('Action validation failed:', validation.error);
    return {
      action: null,
      textContent: removeJsonBlocks(responseText),
      rawJson: jsonString,
    };
  }

  // Valid action found
  const action: ChatAction = {
    intent: validation.data.intent,
    entities: validation.data.entities,
    confidence: validation.data.confidence,
    artifact: validation.data.artifact,
  };

  return {
    action,
    textContent: removeJsonBlocks(responseText),
    rawJson: jsonString,
  };
}

/**
 * Check if confidence is high enough to open artifact
 */
export function shouldOpenArtifact(confidence: number): boolean {
  return confidence >= 0.7;
}

/**
 * Get user-friendly confidence label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Zeer zeker';
  if (confidence >= 0.7) return 'Redelijk zeker';
  if (confidence >= 0.5) return 'Onzeker';
  return 'Zeer onzeker';
}

/**
 * Validate that artifact type matches intent
 */
export function validateArtifactType(intent: SwiftIntent, artifactType?: BlockType): boolean {
  if (!artifactType) return true; // No artifact is valid
  if (artifactType === 'patient-dashboard') return true;

  // Intent should match artifact type (except for 'unknown' and 'fallback')
  if (intent === 'unknown') return artifactType === 'fallback';

  // For agenda intents, all map to agenda block types
  const agendaIntents: SwiftIntent[] = [
    'agenda_query',
    'create_appointment',
    'cancel_appointment',
    'reschedule_appointment',
  ];
  if (agendaIntents.includes(intent)) {
    return agendaIntents.includes(artifactType as SwiftIntent);
  }

  return intent === artifactType;
}

/**
 * Route intent to appropriate artifact configuration
 *
 * Maps intents (especially agenda intents) to the correct artifact type with prefill data.
 * Implements Epic 5.S1 routing logic.
 *
 * @param intent - The classified intent
 * @param entities - Extracted entities from user input
 * @param confidence - Intent classification confidence (0-1)
 * @returns Artifact configuration or null if confidence too low or required data missing
 */
export function routeIntentToArtifact(
  intent: SwiftIntent,
  entities: Record<string, any>,
  confidence: number
): { type: BlockType; prefill: Record<string, any>; title: string } | null {
  // Confidence threshold: return null if too low
  // This triggers fallback/clarification question in UI
  if (confidence < 0.7) {
    return null;
  }

  // Route agenda intents to AgendaBlock with appropriate configuration
  switch (intent) {
    case 'agenda_query':
      return {
        type: 'agenda_query',
        title: 'Agenda',
        prefill: {
          dateRange: entities.dateRange,
        },
      };

    case 'create_appointment':
      // Require patient for create
      if (!entities.patientName && !entities.patientId) {
        return null; // Missing required entity - trigger clarification
      }
      return {
        type: 'create_appointment',
        title: 'Nieuwe afspraak',
        prefill: {
          patientName: entities.patientName,
          patientId: entities.patientId,
          datetime: entities.datetime,
          appointmentType: entities.appointmentType,
          location: entities.location,
        },
      };

    case 'cancel_appointment':
      return {
        type: 'cancel_appointment',
        title: 'Afspraak annuleren',
        prefill: {
          identifier: entities.identifier,
        },
      };

    case 'reschedule_appointment':
      // Require identifier to know which appointment
      if (!entities.identifier) {
        return null; // Missing required entity - trigger clarification
      }
      return {
        type: 'reschedule_appointment',
        title: 'Afspraak verzetten',
        prefill: {
          identifier: entities.identifier,
          newDatetime: entities.newDatetime,
        },
      };

    // Non-agenda intents - direct mapping
    case 'dagnotitie':
      return {
        type: 'dagnotitie',
        title: 'Dagnotitie',
        prefill: entities,
      };

    case 'zoeken':
      return {
        type: 'zoeken',
        title: 'Patiënt zoeken',
        prefill: entities,
      };

    case 'overdracht':
      return {
        type: 'overdracht',
        title: 'Overdracht',
        prefill: entities,
      };

    case 'unknown':
      // Unknown intent - show fallback picker
      return {
        type: 'fallback',
        title: 'Keuze maken',
        prefill: entities,
      };

    default:
      return null;
  }
}
