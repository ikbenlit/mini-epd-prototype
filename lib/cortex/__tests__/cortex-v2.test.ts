/**
 * Cortex V2 Integration Tests
 *
 * Tests the three-layer architecture end-to-end:
 * - Layer 1: Reflex Arc (local pattern matching)
 * - Layer 2: Intent Orchestrator (AI classification)
 * - Layer 3: Nudge Engine (protocol-based suggestions)
 *
 * Run with: pnpm tsx lib/cortex/__tests__/cortex-v2.test.ts
 */

import { classifyWithReflex } from '../reflex-classifier';
import {
  parseAIResponse,
  buildChainFromReflex,
  buildFallbackChain,
  formatContextForPrompt,
  FALLBACK_CONFIDENCE_CAP,
} from '../orchestrator';
import { evaluateNudge, PROTOCOL_RULES } from '../nudge';
import type { CortexContext, LocalClassificationResult, ExtractedEntities } from '../types';

// Simple test runner (same pattern as reflex-classifier.test.ts)
let passed = 0;
let failed = 0;

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error instanceof Error ? error.message : error}`);
    failed++;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy, got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy, got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected defined, got undefined`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    },
    toContain(expected: string) {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
  };
}

// ============================================================================
// Test Data
// ============================================================================

const mockContext: CortexContext = {
  activePatient: {
    id: 'p-123',
    name: 'Jan de Vries',
    recentNotes: ['Medicatie aangepast', 'Goed gesprek gehad'],
    upcomingAppointments: [
      { date: new Date(), type: 'follow-up' },
    ],
  },
  currentView: 'patient-detail',
  shift: 'ochtend',
  currentTime: new Date(),
  agendaToday: [
    { time: '10:00', patientName: 'Marie', patientId: 'p-456', type: 'intake' },
    { time: '14:00', patientName: 'Jan de Vries', patientId: 'p-123', type: 'follow-up' },
  ],
  recentIntents: [],
};

// ============================================================================
// Tests
// ============================================================================

console.log('='.repeat(60));
console.log('Cortex V2 Integration Tests');
console.log('='.repeat(60));

// ----------------------------------------------------------------------------
// Scenario 1: Simple Input → Reflex Handles (No AI)
// ----------------------------------------------------------------------------

describe('Scenario 1: Simple input → Reflex handles', () => {
  it('"agenda vandaag" is handled locally without escalation', () => {
    const result = classifyWithReflex('agenda vandaag');
    expect(result.intent).toBe('agenda_query');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"zoek marie" is handled locally', () => {
    const result = classifyWithReflex('zoek marie');
    expect(result.intent).toBe('zoeken');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"notitie jan medicatie" is handled locally', () => {
    const result = classifyWithReflex('notitie jan medicatie');
    expect(result.intent).toBe('dagnotitie');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('Reflex result builds valid single-action chain', () => {
    const reflexResult = classifyWithReflex('agenda vandaag');
    const chain = buildChainFromReflex('agenda vandaag', reflexResult);

    expect(chain.actions.length).toBe(1);
    expect(chain.actions[0].intent).toBe('agenda_query');
    expect(chain.status).toBe('pending');
    expect(chain.meta.source).toBe('local');
  });
});

// ----------------------------------------------------------------------------
// Scenario 2: Multi-Intent → Orchestrator Handles
// ----------------------------------------------------------------------------

describe('Scenario 2: Multi-intent → Orchestrator handles', () => {
  it('"zeg jan af en maak notitie" triggers escalation', () => {
    const result = classifyWithReflex('zeg jan af en maak notitie');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('multi_intent_detected');
  });

  it('AI response with multiple actions parses correctly', () => {
    const mockAIResponse = JSON.stringify({
      actions: [
        {
          intent: 'cancel_appointment',
          confidence: 0.92,
          entities: { patientName: 'Jan' },
          requiresConfirmation: true,
        },
        {
          intent: 'dagnotitie',
          confidence: 0.88,
          entities: { patientName: 'Jan', content: 'griep' },
          requiresConfirmation: false,
        },
      ],
      reasoning: 'Two actions detected via "en" conjunction',
      needsClarification: false,
    });

    const parsed = parseAIResponse(mockAIResponse);

    expect(parsed.actions.length).toBe(2);
    expect(parsed.actions[0].intent).toBe('cancel_appointment');
    expect(parsed.actions[1].intent).toBe('dagnotitie');
    expect(parsed.needsClarification).toBe(false);
  });

  it('AI response with markdown code blocks is cleaned', () => {
    const mockAIResponse = '```json\n{"actions":[{"intent":"dagnotitie","confidence":0.9,"entities":{}}],"reasoning":"test","needsClarification":false}\n```';
    const parsed = parseAIResponse(mockAIResponse);

    expect(parsed.actions.length).toBe(1);
    expect(parsed.actions[0].intent).toBe('dagnotitie');
  });

  it('Invalid JSON returns fallback response', () => {
    const invalidResponse = 'This is not JSON at all';
    const parsed = parseAIResponse(invalidResponse);

    // Should return a valid structure with empty/unknown actions
    expect(parsed.actions).toBeDefined();
    expect(parsed.needsClarification).toBeDefined();
  });
});

// ----------------------------------------------------------------------------
// Scenario 3: Context-Dependent → Pronoun Resolution
// ----------------------------------------------------------------------------

describe('Scenario 3: Context-dependent → Pronoun resolution', () => {
  it('"maak notitie voor hem" triggers escalation for context', () => {
    const result = classifyWithReflex('maak notitie voor hem');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('needs_context');
  });

  it('"verzet zijn afspraak" triggers escalation', () => {
    const result = classifyWithReflex('verzet zijn afspraak');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('needs_context');
  });

  it('Context is formatted correctly for AI prompt', () => {
    const formatted = formatContextForPrompt(mockContext);

    expect(formatted).toContain('Jan de Vries');
    expect(formatted).toContain('Patiëntdossier'); // Dutch translation of patient-detail
    expect(formatted).toContain('ochtend');
  });

  it('AI response with pronoun resolution includes patientResolution', () => {
    const mockAIResponse = JSON.stringify({
      actions: [
        {
          intent: 'dagnotitie',
          confidence: 0.85,
          entities: {
            patientName: 'Jan de Vries',
            patientResolution: 'pronoun',
          },
          requiresConfirmation: false,
        },
      ],
      reasoning: '"Hem" resolved to active patient Jan de Vries',
      needsClarification: false,
    });

    const parsed = parseAIResponse(mockAIResponse);
    expect(parsed.actions[0].entities.patientResolution).toBe('pronoun');
  });
});

// ----------------------------------------------------------------------------
// Scenario 4: Wondzorg Notitie → Nudge Suggestion
// ----------------------------------------------------------------------------

describe('Scenario 4: Wondzorg notitie → Nudge suggestion', () => {
  it('Protocol rules include wondzorg-controle rule', () => {
    const wondzorgRule = PROTOCOL_RULES.find((r) => r.id === 'wondzorg-controle');
    expect(wondzorgRule).toBeDefined();
    expect(wondzorgRule?.enabled).toBe(true);
  });

  it('Dagnotitie with "wond" triggers wondcontrole suggestion', () => {
    const input = {
      intent: 'dagnotitie' as const,
      actionId: 'test-action-1',
      entities: { patientName: 'Jan' } as ExtractedEntities,
      content: 'Wond verzorgd en verbonden',
    };

    const suggestions = evaluateNudge(input);

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].suggestion.intent).toBe('create_appointment');
    expect(suggestions[0].suggestion.message).toContain('Wondcontrole');
    expect(suggestions[0].priority).toBe('medium');
  });

  it('Dagnotitie without "wond" does not trigger wondcontrole suggestion', () => {
    const input = {
      intent: 'dagnotitie' as const,
      actionId: 'test-action-2',
      entities: { patientName: 'Marie' } as ExtractedEntities,
      content: 'Medicatie gegeven om 14:00',
    };

    const suggestions = evaluateNudge(input);
    const wondzorgSuggestion = suggestions.find((s) =>
      s.suggestion.message.includes('Wondcontrole')
    );

    expect(wondzorgSuggestion).toBeUndefined();
  });

  it('Non-dagnotitie intent does not trigger dagnotitie rules', () => {
    const input = {
      intent: 'zoeken' as const,
      actionId: 'test-action-3',
      entities: { patientName: 'Jan' } as ExtractedEntities,
      content: 'wond zoeken',
    };

    const suggestions = evaluateNudge(input);
    const wondzorgSuggestion = suggestions.find((s) =>
      s.suggestion.message.includes('Wondcontrole')
    );

    expect(wondzorgSuggestion).toBeUndefined();
  });
});

// ----------------------------------------------------------------------------
// Scenario 5: Graceful Fallback
// ----------------------------------------------------------------------------

describe('Scenario 5: Graceful fallback on AI failure', () => {
  it('Fallback chain uses Reflex result with capped confidence', () => {
    const reflexResult: LocalClassificationResult = {
      intent: 'dagnotitie',
      confidence: 0.85,
      processingTimeMs: 5,
      shouldEscalateToAI: true,
      escalationReason: 'multi_intent_detected',
    };

    const fallbackChain = buildFallbackChain('test input', reflexResult);

    expect(fallbackChain.actions.length).toBe(1);
    expect(fallbackChain.actions[0].intent).toBe('dagnotitie');
    expect(fallbackChain.actions[0].confidence).toBeLessThanOrEqual(FALLBACK_CONFIDENCE_CAP);
    expect(fallbackChain.meta.source).toBe('local');
  });

  it('FALLBACK_CONFIDENCE_CAP is 0.6', () => {
    expect(FALLBACK_CONFIDENCE_CAP).toBe(0.6);
  });

  it('Unknown intent in fallback still returns valid chain', () => {
    const reflexResult: LocalClassificationResult = {
      intent: 'unknown',
      confidence: 0.1,
      processingTimeMs: 5,
      shouldEscalateToAI: true,
      escalationReason: 'low_confidence',
    };

    const fallbackChain = buildFallbackChain('xyz gibberish', reflexResult);

    // Should still have valid chain structure
    expect(fallbackChain.id).toBeDefined();
    expect(fallbackChain.originalInput).toBe('xyz gibberish');
    expect(fallbackChain.meta.source).toBe('local');
  });
});

// ----------------------------------------------------------------------------
// Scenario 6: Chain Building
// ----------------------------------------------------------------------------

describe('Scenario 6: Chain building from various sources', () => {
  it('buildChainFromReflex creates proper chain structure', () => {
    const reflexResult = classifyWithReflex('zoek jan');
    const chain = buildChainFromReflex('zoek jan', reflexResult);

    expect(chain.id).toBeDefined();
    expect(chain.originalInput).toBe('zoek jan');
    expect(chain.status).toBe('pending');
    expect(chain.actions.length).toBe(1);
    expect(chain.actions[0].sequence).toBe(1);
    expect(chain.actions[0].status).toBe('pending'); // Initial status is pending
    expect(chain.meta.source).toBe('local');
    expect(chain.meta.processingTimeMs).toBeDefined();
  });

  it('Chain actions have required fields', () => {
    const reflexResult = classifyWithReflex('agenda vandaag');
    const chain = buildChainFromReflex('agenda vandaag', reflexResult);
    const action = chain.actions[0];

    expect(action.id).toBeDefined();
    expect(action.intent).toBeDefined();
    expect(action.confidence).toBeDefined();
    expect(action.entities).toBeDefined();
    expect(action.status).toBeDefined();
    expect(action.requiresConfirmation).toBeDefined();
  });
});

// ============================================================================
// Results
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Cortex V2 Integration Tests: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
