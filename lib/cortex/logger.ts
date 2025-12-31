/**
 * Cortex Classification Logger
 *
 * Logging utility with PII sanitization for classification results.
 * In development: full logging for debugging.
 * In production: sanitized logging (no names, BSN, phone numbers).
 */

import { isFeatureEnabled } from '@/lib/config/feature-flags';
import type { LocalClassificationResult, IntentChain } from './types';

// PII patterns to sanitize in production
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // BSN (9 digits)
  { pattern: /\b\d{9}\b/g, replacement: '[BSN]' },
  // Dutch phone numbers
  { pattern: /\b0[1-9]\d{8}\b/g, replacement: '[TEL]' },
  { pattern: /\b06[-\s]?\d{8}\b/g, replacement: '[TEL]' },
  { pattern: /\+31[-\s]?\d{9}\b/g, replacement: '[TEL]' },
  // Dates (dd-mm-yyyy format)
  { pattern: /\b\d{2}[-/]\d{2}[-/]\d{4}\b/g, replacement: '[DATUM]' },
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
  // Common Dutch first names (case insensitive)
  {
    pattern:
      /\b(Jan|Piet|Klaas|Marie|Anna|Lisa|Eva|Emma|Sophie|Thomas|Lucas|Daan|Sem|Liam|Noah|Julia|Sara|Lotte|Henk|Willem|Pieter|Johan|Marieke|Sandra|Linda|Monique|Peter|Hans|Jeroen|Bart|Mark|Erik|Rob|Kees|Cor|Arie|Gerrit|Hendrik|Johannes)\b/gi,
    replacement: '[NAAM]',
  },
  // Common Dutch family name prefixes + word after
  {
    pattern: /\b(van|de|den|der|het|ter|ten)\s+[A-Z][a-z]+\b/gi,
    replacement: '[NAAM]',
  },
];

/**
 * Sanitize input string by removing PII
 * In development: returns original input
 * In production: replaces PII with placeholders
 */
export function sanitizeForLogging(input: string): string {
  if (process.env.NODE_ENV === 'development') {
    return input;
  }

  let sanitized = input;
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Log a classification result (Reflex or Orchestrator)
 * Only logs if CORTEX_LOGGING feature flag is enabled
 */
export function logClassification(
  input: string,
  result: LocalClassificationResult | IntentChain
): void {
  if (!isFeatureEnabled('CORTEX_LOGGING')) {
    return;
  }

  const sanitizedInput = sanitizeForLogging(input);
  const timestamp = new Date().toISOString();

  if ('shouldEscalateToAI' in result) {
    // LocalClassificationResult (Reflex Arc)
    const logData = {
      input: sanitizedInput,
      intent: result.intent,
      confidence: result.confidence.toFixed(2),
      escalate: result.shouldEscalateToAI,
      reason: result.escalationReason || null,
      timeMs: result.processingTimeMs,
    };

    if (result.shouldEscalateToAI) {
      console.log(`[Cortex:Reflex→AI] ${timestamp}`, logData);
    } else {
      console.log(`[Cortex:Reflex] ${timestamp}`, logData);
    }
  } else {
    // IntentChain (Orchestrator)
    console.log(`[Cortex:Orchestrator] ${timestamp}`, {
      input: sanitizedInput,
      actionCount: result.actions.length,
      intents: result.actions.map((a) => a.intent),
      source: result.meta.source,
      timeMs: result.meta.processingTimeMs,
      reasoning: result.meta.aiReasoning
        ? sanitizeForLogging(result.meta.aiReasoning).slice(0, 100)
        : null,
    });
  }
}

/**
 * Log an escalation event (Reflex → Orchestrator)
 */
export function logEscalation(
  input: string,
  reason: LocalClassificationResult['escalationReason'],
  reflexResult: LocalClassificationResult
): void {
  if (!isFeatureEnabled('CORTEX_LOGGING')) {
    return;
  }

  console.log(`[Cortex:Escalation] ${new Date().toISOString()}`, {
    input: sanitizeForLogging(input),
    reason,
    reflexIntent: reflexResult.intent,
    reflexConfidence: reflexResult.confidence.toFixed(2),
    secondBest: reflexResult.secondBestIntent || null,
    secondBestConfidence: reflexResult.secondBestConfidence?.toFixed(2) || null,
  });
}

/**
 * Log a nudge suggestion event
 */
export function logNudge(
  triggeredBy: string,
  suggestionMessage: string,
  accepted: boolean
): void {
  if (!isFeatureEnabled('CORTEX_LOGGING')) {
    return;
  }

  console.log(`[Cortex:Nudge] ${new Date().toISOString()}`, {
    trigger: triggeredBy,
    suggestion: sanitizeForLogging(suggestionMessage),
    accepted,
  });
}

/**
 * Log performance metrics
 */
export function logPerformance(
  layer: 'reflex' | 'orchestrator',
  durationMs: number,
  success: boolean
): void {
  if (!isFeatureEnabled('CORTEX_LOGGING')) {
    return;
  }

  const emoji = success ? '✓' : '✗';
  const threshold = layer === 'reflex' ? 20 : 800;
  const status = durationMs <= threshold ? 'OK' : 'SLOW';

  console.log(
    `[Cortex:Perf] ${layer} ${emoji} ${durationMs}ms [${status}]`
  );
}
