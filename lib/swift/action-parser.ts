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
  intent: z.enum(['dagnotitie', 'zoeken', 'overdracht', 'unknown']),
  entities: z.object({
    patientName: z.string().optional(),
    patientId: z.string().optional(),
    category: z.enum(['medicatie', 'adl', 'gedrag', 'incident', 'observatie']).optional(),
    content: z.string().optional(),
    query: z.string().optional(), // For zoeken intent
  }),
  confidence: z.number().min(0).max(1),
  artifact: z
    .object({
      type: z.enum(['dagnotitie', 'zoeken', 'overdracht', 'fallback']),
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

  // Intent should match artifact type (except for 'unknown' and 'fallback')
  if (intent === 'unknown') return artifactType === 'fallback';

  return intent === artifactType;
}
