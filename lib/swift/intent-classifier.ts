/**
 * Local Intent Classifier
 *
 * Fast regex-based intent classification for Swift.
 * Target: <50ms response time.
 */

import type { SwiftIntent } from './types';

export interface ClassificationResult {
  intent: SwiftIntent;
  confidence: number;
  matchedPattern?: string;
  processingTimeMs: number;
}

interface PatternConfig {
  pattern: RegExp;
  weight: number; // Higher weight = higher confidence
}

// Intent patterns with weights
// Weight 1.0 = exact match, 0.8 = strong match, 0.6 = partial match
const INTENT_PATTERNS: Record<Exclude<SwiftIntent, 'unknown'>, PatternConfig[]> = {
  dagnotitie: [
    // Exact commands
    { pattern: /^dagnotitie\b/i, weight: 1.0 },
    { pattern: /^notitie\b/i, weight: 1.0 },
    { pattern: /^nieuwe?\s+notitie\b/i, weight: 1.0 },

    // Pattern: "notitie [naam]" or "[naam] notitie"
    { pattern: /^notitie\s+\w+/i, weight: 0.95 },
    { pattern: /^\w+\s+notitie\b/i, weight: 0.85 },

    // Pattern: "[naam] [categorie]" (e.g., "jan medicatie")
    { pattern: /^\w+\s+(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 0.9 },

    // Pattern: "notitie [naam] [categorie]"
    { pattern: /^notitie\s+\w+\s+(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 1.0 },

    // Categorie-first patterns
    { pattern: /^(medicatie|adl|gedrag|incident|observatie)\s+\w+/i, weight: 0.85 },
    { pattern: /^(medicatie|adl|gedrag|incident|observatie)\b/i, weight: 0.7 },

    // Schrijf patterns
    { pattern: /^schrijf\b/i, weight: 0.8 },
    { pattern: /^rapporteer\b/i, weight: 0.8 },
    { pattern: /^registreer\b/i, weight: 0.8 },
  ],

  zoeken: [
    // Exact commands
    { pattern: /^zoek\b/i, weight: 1.0 },
    { pattern: /^vind\b/i, weight: 1.0 },
    { pattern: /^zoeken\b/i, weight: 1.0 },

    // Question patterns
    { pattern: /^wie\s+is\b/i, weight: 1.0 },
    { pattern: /^waar\s+is\b/i, weight: 0.9 },
    { pattern: /^welke\s+pati[eë]nt/i, weight: 0.9 },

    // Pattern: "zoek [naam]"
    { pattern: /^zoek\s+\w+/i, weight: 1.0 },
    { pattern: /^vind\s+\w+/i, weight: 1.0 },

    // Info requests
    { pattern: /^info\s+\w+/i, weight: 0.8 },
    { pattern: /^gegevens\s+\w+/i, weight: 0.8 },
    { pattern: /^dossier\s+\w+/i, weight: 0.85 },

    // Partial name lookups (single word that could be a name)
    { pattern: /^[A-Z][a-z]+$/i, weight: 0.5 }, // Single capitalized word
  ],

  overdracht: [
    // Exact commands
    { pattern: /^overdracht\b/i, weight: 1.0 },
    { pattern: /^dienst\s*overdracht\b/i, weight: 1.0 },

    // Dienst patterns
    { pattern: /^dienst\s+(klaar|afronden|be[eë]indigen)\b/i, weight: 1.0 },
    { pattern: /^einde?\s+dienst\b/i, weight: 1.0 },
    { pattern: /^dienst\s+einde?\b/i, weight: 1.0 },

    // Question patterns
    { pattern: /^wat\s+moet\s+ik\s+weten\b/i, weight: 1.0 },
    { pattern: /^wat\s+is\s+er\s+gebeurd\b/i, weight: 0.9 },
    { pattern: /^updates?\b/i, weight: 0.7 },
    { pattern: /^samenvatting\b/i, weight: 0.85 },

    // Start dienst
    { pattern: /^start\s+dienst\b/i, weight: 0.9 },
    { pattern: /^begin\s+dienst\b/i, weight: 0.9 },
    { pattern: /^nieuwe?\s+dienst\b/i, weight: 0.85 },
  ],
  // Agenda intents
  agenda_query: [
    // Exact commands
    { pattern: /^agenda\b/i, weight: 1.0 },
    { pattern: /^mijn\s+agenda\b/i, weight: 0.95 },
    { pattern: /^volgende\s+afspraak\b/i, weight: 0.95 },

    // Question patterns
    { pattern: /^wat\s+zijn\s+(mijn\s+)?afspraken\b/i, weight: 1.0 },
    { pattern: /^(wat|wanneer)\s+is\s+(mijn\s+)?volgende\s+afspraak\b/i, weight: 1.0 },

    // Date scoped queries
    { pattern: /^afspraken\s+(vandaag|morgen|deze\s+week|volgende\s+week)\b/i, weight: 0.95 },
    { pattern: /^(vandaag|morgen|deze\s+week|volgende\s+week)\s+afspraken\b/i, weight: 0.9 },
    { pattern: /^agenda\s+(vandaag|morgen|deze\s+week|volgende\s+week)\b/i, weight: 0.9 },
    { pattern: /^planning\s+(vandaag|morgen|deze\s+week|volgende\s+week)\b/i, weight: 0.85 },
    { pattern: /^afspraken\b(?!\s+(maken|plannen|inplannen|annuleren|verzetten|verplaatsen|verschuiven))\b/i, weight: 0.85 },

    // Verb patterns
    { pattern: /^toon\s+agenda\b/i, weight: 0.9 },
    { pattern: /^laat\s+(mijn\s+)?agenda\s+zien\b/i, weight: 0.85 },
  ],
  create_appointment: [
    // Exact commands
    { pattern: /^maak\s+afspraak\b/i, weight: 1.0 },
    { pattern: /^plan\s+(een\s+)?(afspraak|intake|gesprek)\b/i, weight: 1.0 },
    { pattern: /^afspraak\s+(maken|plannen|inplannen)\b/i, weight: 0.95 },
    { pattern: /^afspraken\s+(maken|plannen|inplannen)\b/i, weight: 0.95 },
    { pattern: /^nieuwe?\s+afspraak\b/i, weight: 0.95 },

    // Type-first patterns
    { pattern: /^maak\s+(een\s+)?(intake|behandeling|gesprek)\b/i, weight: 0.9 },
    { pattern: /^(intake|behandeling|gesprek)\s+(met\s+)?\w+/i, weight: 0.85 },
    { pattern: /^afspraak\s+met\s+\w+/i, weight: 0.9 },
    { pattern: /^plan\s+afspraak\s+met\s+\w+/i, weight: 0.9 },
  ],
  cancel_appointment: [
    // Exact commands
    { pattern: /^annuleer\s+(de\s+)?afspraak\b/i, weight: 1.0 },
    { pattern: /^cancel\s+(de\s+)?afspraak\b/i, weight: 1.0 },
    { pattern: /^verwijder\s+afspraak\b/i, weight: 0.95 },
    { pattern: /^afspraak\s+annuleren\b/i, weight: 0.95 },
    { pattern: /^zeg\s+afspraak\s+af\b/i, weight: 0.95 },

    // Short forms
    { pattern: /^annuleer\s+\w+/i, weight: 0.7 }, // "annuleer jan"
  ],
  reschedule_appointment: [
    // Exact commands
    { pattern: /^verzet\s+(de\s+)?afspraak\b/i, weight: 1.0 },
    { pattern: /^verplaats\s+(de\s+)?afspraak\b/i, weight: 1.0 },
    { pattern: /^verschuif\s+afspraak\b/i, weight: 0.95 },
    { pattern: /^afspraak\s+verzetten\b/i, weight: 0.95 },

    // Time shifts
    { pattern: /^\d{1,2}[:.]\d{2}\s+naar\s+\d{1,2}[:.]\d{2}\b/i, weight: 0.9 },
    { pattern: /^(verzet|verplaats)\s+\d{1,2}[:.]\d{2}\b/i, weight: 0.9 },
    { pattern: /^verzet\s+\w+\s+naar\b/i, weight: 0.85 }, // "verzet jan naar dinsdag"
  ],
};

// Help patterns (separate, always check)
const HELP_PATTERNS: PatternConfig[] = [
  { pattern: /^help\b/i, weight: 1.0 },
  { pattern: /^hulp\b/i, weight: 1.0 },
  { pattern: /^\?\s*$/i, weight: 1.0 },
  { pattern: /^wat\s+kan\s+(ik|je|swift)\b/i, weight: 1.0 },
  { pattern: /^hoe\s+werkt\b/i, weight: 0.9 },
  { pattern: /^voorbeelden?\b/i, weight: 0.9 },
];

/**
 * Classify user input into an intent using local regex patterns.
 * Fast, runs entirely client-side.
 */
export function classifyIntent(input: string): ClassificationResult {
  const startTime = performance.now();
  const trimmedInput = input.trim();

  // Empty input
  if (!trimmedInput) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs: performance.now() - startTime,
    };
  }

  // Check for help first
  for (const { pattern, weight } of HELP_PATTERNS) {
    if (pattern.test(trimmedInput)) {
      return {
        intent: 'unknown', // Help is handled separately, return unknown to trigger help UI
        confidence: weight,
        matchedPattern: pattern.toString(),
        processingTimeMs: performance.now() - startTime,
      };
    }
  }

  // Find best matching intent
  let bestMatch: { intent: SwiftIntent; confidence: number; pattern: string } | null = null;

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(trimmedInput)) {
        if (!bestMatch || weight > bestMatch.confidence) {
          bestMatch = {
            intent: intent as SwiftIntent,
            confidence: weight,
            pattern: pattern.toString(),
          };
        }
        // If we found a perfect match, we can stop
        if (weight === 1.0) break;
      }
    }
    // Early exit on perfect match
    if (bestMatch?.confidence === 1.0) break;
  }

  const processingTimeMs = performance.now() - startTime;

  if (bestMatch) {
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      matchedPattern: bestMatch.pattern,
      processingTimeMs,
    };
  }

  // No match found
  return {
    intent: 'unknown',
    confidence: 0,
    processingTimeMs,
  };
}

/**
 * Check if classification confidence is high enough to proceed without AI fallback.
 */
export function isHighConfidence(result: ClassificationResult): boolean {
  return result.confidence >= 0.8;
}

/**
 * Check if we should show the fallback picker.
 */
export function shouldShowFallback(result: ClassificationResult): boolean {
  return result.intent === 'unknown' || result.confidence < 0.5;
}
