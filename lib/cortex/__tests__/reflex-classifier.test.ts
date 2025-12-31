/**
 * Reflex Classifier Unit Tests
 *
 * Tests for the Reflex Arc (Layer 1) classifier.
 * Covers: pattern matching, escalation triggers, ambiguity detection.
 *
 * Run with: pnpm tsx lib/cortex/__tests__/reflex-classifier.test.ts
 */

import { classifyWithReflex } from '../reflex-classifier';
import { CONFIDENCE_THRESHOLD, AMBIGUITY_THRESHOLD } from '../types';

// Simple test runner for direct execution
let passed = 0;
let failed = 0;
let currentDescribe = '';

function describe(name: string, fn: () => void) {
  currentDescribe = name;
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
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
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
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected defined, got undefined`);
      }
    },
  };
}

// ============================================================================
// Tests
// ============================================================================

console.log('='.repeat(60));
console.log('Reflex Classifier Tests');
console.log('='.repeat(60));

describe('Simple intents - should NOT escalate', () => {
  it('"agenda vandaag" → agenda_query', () => {
    const result = classifyWithReflex('agenda vandaag');
    expect(result.intent).toBe('agenda_query');
    expect(result.shouldEscalateToAI).toBe(false);
    expect(result.processingTimeMs).toBeLessThan(20);
  });

  it('"zoek marie" → zoeken', () => {
    const result = classifyWithReflex('zoek marie');
    expect(result.intent).toBe('zoeken');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"notitie jan medicatie" → dagnotitie', () => {
    const result = classifyWithReflex('notitie jan medicatie');
    expect(result.intent).toBe('dagnotitie');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"overdracht" → overdracht', () => {
    const result = classifyWithReflex('overdracht');
    expect(result.intent).toBe('overdracht');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"maak afspraak" → create_appointment', () => {
    const result = classifyWithReflex('maak afspraak');
    expect(result.intent).toBe('create_appointment');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"annuleer afspraak" → cancel_appointment', () => {
    const result = classifyWithReflex('annuleer afspraak');
    expect(result.intent).toBe('cancel_appointment');
    expect(result.shouldEscalateToAI).toBe(false);
  });

  it('"verzet afspraak" → reschedule_appointment', () => {
    const result = classifyWithReflex('verzet afspraak');
    expect(result.intent).toBe('reschedule_appointment');
    expect(result.shouldEscalateToAI).toBe(false);
  });
});

describe('Multi-intent - SHOULD escalate', () => {
  it('"zeg jan af en maak notitie" → multi_intent_detected', () => {
    const result = classifyWithReflex('zeg jan af en maak notitie');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('multi_intent_detected');
  });

  it('"eerst zoeken dan notitie" → multi_intent_detected', () => {
    const result = classifyWithReflex('eerst zoeken dan notitie');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('multi_intent_detected');
  });

  it('"agenda bekijken en daarna overdracht" → multi_intent_detected', () => {
    const result = classifyWithReflex('agenda bekijken en daarna overdracht');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('multi_intent_detected');
  });
});

describe('Context-dependent - SHOULD escalate', () => {
  it('"maak notitie voor hem" → needs_context', () => {
    const result = classifyWithReflex('maak notitie voor hem');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('needs_context');
  });

  it('"verzet zijn afspraak" → needs_context', () => {
    const result = classifyWithReflex('verzet zijn afspraak');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('needs_context');
  });

  it('"zoek die patiënt" → needs_context', () => {
    const result = classifyWithReflex('zoek die patiënt');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('needs_context');
  });
});

describe('Relative time - SHOULD escalate', () => {
  it('"plan afspraak morgen" → relative_time', () => {
    const result = classifyWithReflex('plan afspraak morgen');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('relative_time');
  });

  it('"agenda volgende week" → relative_time', () => {
    const result = classifyWithReflex('agenda volgende week');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('relative_time');
  });

  it('"afspraak overmorgen" → relative_time', () => {
    const result = classifyWithReflex('afspraak overmorgen');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('relative_time');
  });
});

describe('Low confidence - SHOULD escalate', () => {
  it('"xyz123" → low_confidence', () => {
    const result = classifyWithReflex('xyz123');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('low_confidence');
    expect(result.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
  });

  it('empty input → low_confidence', () => {
    const result = classifyWithReflex('');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('low_confidence');
  });

  it('"Jan" (single name) → low_confidence', () => {
    const result = classifyWithReflex('Jan');
    expect(result.shouldEscalateToAI).toBe(true);
    expect(result.escalationReason).toBe('low_confidence');
    expect(result.intent).toBe('zoeken'); // Still detected as search
    expect(result.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
  });
});

describe('Second best tracking', () => {
  it('high confidence match has optional secondBest', () => {
    const result = classifyWithReflex('agenda vandaag');
    expect(result.intent).toBe('agenda_query');
    expect(result.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
    // secondBest may or may not be present
  });

  it('low confidence match includes secondBest info', () => {
    const result = classifyWithReflex('xyz unknown input');
    expect(result.secondBestIntent).toBeDefined();
    expect(result.secondBestConfidence).toBeDefined();
  });
});

describe('Performance', () => {
  it('all classifications complete in <20ms', () => {
    const inputs = [
      'agenda',
      'zoek jan',
      'notitie medicatie',
      'overdracht',
      'maak afspraak met jan',
      'annuleer de afspraak',
      'verzet afspraak naar morgen',
    ];

    for (const input of inputs) {
      const result = classifyWithReflex(input);
      expect(result.processingTimeMs).toBeLessThan(20);
    }
  });

  it('batch of 100 classifications in <200ms total', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      classifyWithReflex('agenda vandaag');
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
    console.log(`    (100 iterations in ${elapsed.toFixed(2)}ms)`);
  });
});

describe('Thresholds', () => {
  it('CONFIDENCE_THRESHOLD is 0.7', () => {
    expect(CONFIDENCE_THRESHOLD).toBe(0.7);
  });

  it('AMBIGUITY_THRESHOLD is 0.1', () => {
    expect(AMBIGUITY_THRESHOLD).toBe(0.1);
  });
});

// ============================================================================
// Results
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
