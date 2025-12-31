/**
 * Reflex Classifier (Layer 1)
 *
 * Fast, local pattern matching for Cortex V2.
 * Target: <20ms response time with escalation-aware logic.
 *
 * Key differences from V1 intent-classifier.ts:
 * - Returns LocalClassificationResult with escalation info
 * - Tracks top-2 matches for ambiguity detection
 * - Detects escalation triggers before pattern matching
 */

import type {
  CortexIntent,
  LocalClassificationResult,
  EscalationReason,
} from './types';
import { CONFIDENCE_THRESHOLD, AMBIGUITY_THRESHOLD } from './types';

interface PatternConfig {
  pattern: RegExp;
  weight: number;
}

// Intent patterns - copied from V1 intent-classifier.ts for SOC
// Weight 1.0 = exact match, 0.8 = strong match, 0.6 = partial match
const INTENT_PATTERNS: Record<Exclude<CortexIntent, 'unknown'>, PatternConfig[]> = {
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
    { pattern: /^[A-Z][a-z]+$/i, weight: 0.5 },
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

  agenda_query: [
    // Exact commands
    { pattern: /^agenda\b/i, weight: 1.0 },
    { pattern: /^mijn\s+agenda\b/i, weight: 0.95 },
    { pattern: /^volgende\s+afspraak\b/i, weight: 0.95 },

    // Question patterns
    { pattern: /^wat\s+zijn\s+(mijn\s+)?afspraken\b/i, weight: 1.0 },
    { pattern: /^(wat|wanneer)\s+is\s+(mijn\s+)?volgende\s+afspraak\b/i, weight: 1.0 },

    // Date scoped queries
    { pattern: /^afspraken\s+(vandaag|deze\s+week)\b/i, weight: 0.95 },
    { pattern: /^(vandaag|deze\s+week)\s+afspraken\b/i, weight: 0.9 },
    { pattern: /^agenda\s+(vandaag|deze\s+week)\b/i, weight: 0.9 },
    { pattern: /^planning\s+(vandaag|deze\s+week)\b/i, weight: 0.85 },
    { pattern: /^afspraken\b(?!\s+(maken|plannen|inplannen|annuleren|verzetten|verplaatsen|verschuiven))/i, weight: 0.85 },

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
    { pattern: /^annuleer\s+\w+/i, weight: 0.7 },
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
    { pattern: /^verzet\s+\w+\s+naar\b/i, weight: 0.85 },
  ],
};

/**
 * Escalation trigger patterns (E1.S2)
 *
 * These patterns detect inputs that require AI processing:
 * - multi_intent: Multiple actions in one command
 * - needs_context: References to previous context (pronouns)
 * - relative_time: Time expressions that need date calculation
 */
const ESCALATION_PATTERNS = {
  // Multi-intent indicators: conjunctions that connect actions
  // "zeg jan af en maak notitie" → two actions
  // "eerst zoeken dan notitie" → sequence of actions
  multi_intent: /\b(en\b(?=.*\b(maak|zoek|plan|annuleer|verzet|schrijf|registreer))|daarna|dan\b(?=\s)|eerst\b|vervolgens|ook\s+nog)\b/i,

  // Context-dependent pronouns: need prior context to resolve
  // "maak notitie voor hem" → who is "hem"?
  // "verzet zijn afspraak" → whose appointment?
  needs_context: /\b(hij|zij|hem|haar|zijn|hun|die|deze|dat|dezelfde|diegene|er)\b/i,

  // Relative time expressions: require date calculation
  // "morgen", "overmorgen", "volgende week" → need AI to resolve
  relative_time: /\b(morgen|overmorgen|volgende\s+week|over\s+\d+\s+dagen?|komende\s+(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag))\b/i,
};

/**
 * Detect escalation triggers in input.
 * Returns the reason if escalation is needed, null otherwise.
 */
function detectEscalationTriggers(input: string): EscalationReason | null {
  if (ESCALATION_PATTERNS.multi_intent.test(input)) {
    return 'multi_intent_detected';
  }
  if (ESCALATION_PATTERNS.needs_context.test(input)) {
    return 'needs_context';
  }
  if (ESCALATION_PATTERNS.relative_time.test(input)) {
    return 'relative_time';
  }
  return null;
}

/**
 * Build result for early escalation (before pattern matching).
 */
function buildEscalatedResult(
  input: string,
  reason: EscalationReason,
  startTime: number
): LocalClassificationResult {
  // Still try to find a likely intent for context
  const quickMatch = findBestMatch(input);

  return {
    intent: quickMatch.intent,
    confidence: quickMatch.confidence,
    matchedPattern: quickMatch.pattern,
    processingTimeMs: performance.now() - startTime,
    shouldEscalateToAI: true,
    escalationReason: reason,
  };
}

/**
 * Find best matching intent (helper for quick lookups).
 */
function findBestMatch(input: string): { intent: CortexIntent; confidence: number; pattern: string } {
  let best = { intent: 'unknown' as CortexIntent, confidence: 0, pattern: '' };

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(input)) {
        if (weight > best.confidence) {
          best = { intent: intent as CortexIntent, confidence: weight, pattern: pattern.source };
        }
        if (weight === 1.0) break;
      }
    }
    if (best.confidence === 1.0) break;
  }

  return best;
}

/**
 * Build the final classification result with escalation decision.
 */
function buildResult(
  best: { intent: CortexIntent; confidence: number; pattern: string },
  secondBest: { intent: CortexIntent; confidence: number },
  startTime: number
): LocalClassificationResult {
  const processingTimeMs = performance.now() - startTime;

  // Low confidence → escalate
  if (best.confidence < CONFIDENCE_THRESHOLD) {
    return {
      intent: best.intent,
      confidence: best.confidence,
      secondBestIntent: secondBest.intent,
      secondBestConfidence: secondBest.confidence,
      matchedPattern: best.pattern,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };
  }

  // Ambiguous (top-2 too close) → escalate
  const delta = best.confidence - secondBest.confidence;
  if (delta < AMBIGUITY_THRESHOLD && secondBest.confidence > 0) {
    return {
      intent: best.intent,
      confidence: best.confidence,
      secondBestIntent: secondBest.intent,
      secondBestConfidence: secondBest.confidence,
      matchedPattern: best.pattern,
      processingTimeMs,
      shouldEscalateToAI: true,
      escalationReason: 'ambiguous',
    };
  }

  // High confidence, unambiguous → no escalation
  return {
    intent: best.intent,
    confidence: best.confidence,
    secondBestIntent: secondBest.confidence > 0 ? secondBest.intent : undefined,
    secondBestConfidence: secondBest.confidence > 0 ? secondBest.confidence : undefined,
    matchedPattern: best.pattern,
    processingTimeMs,
    shouldEscalateToAI: false,
  };
}

/**
 * Classify user input using the Reflex Arc (Layer 1).
 *
 * Fast, local pattern matching with escalation-aware logic.
 * Target: <20ms processing time.
 *
 * @param input - User input string
 * @returns LocalClassificationResult with intent, confidence, and escalation info
 */
export function classifyWithReflex(input: string): LocalClassificationResult {
  const startTime = performance.now();
  const normalizedInput = input.trim();

  // Empty input
  if (!normalizedInput) {
    return {
      intent: 'unknown',
      confidence: 0,
      processingTimeMs: performance.now() - startTime,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };
  }

  // 1. Check escalation triggers FIRST
  const escalationReason = detectEscalationTriggers(normalizedInput);
  if (escalationReason) {
    return buildEscalatedResult(normalizedInput, escalationReason, startTime);
  }

  // 2. Pattern matching with top-2 tracking
  let bestMatch = { intent: 'unknown' as CortexIntent, confidence: 0, pattern: '' };
  let secondBest = { intent: 'unknown' as CortexIntent, confidence: 0 };

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const { pattern, weight } of patterns) {
      if (pattern.test(normalizedInput)) {
        if (weight > bestMatch.confidence) {
          // Current best becomes second best
          secondBest = { intent: bestMatch.intent, confidence: bestMatch.confidence };
          bestMatch = { intent: intent as CortexIntent, confidence: weight, pattern: pattern.source };
        } else if (weight > secondBest.confidence && intent !== bestMatch.intent) {
          // Track second best (different intent)
          secondBest = { intent: intent as CortexIntent, confidence: weight };
        }
      }
    }
  }

  // 3. Build result with escalation decision
  return buildResult(bestMatch, secondBest, startTime);
}
