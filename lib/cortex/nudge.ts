/**
 * Cortex Layer 3: Nudge System
 *
 * Proactive suggestions after successful actions based on protocol rules.
 * MVP implementation with hardcoded rules for demonstration.
 */

import type {
  CortexIntent,
  ExtractedEntities,
  NudgePriority,
  NudgeSuggestion,
  ProtocolMetadata,
} from './types';

// -----------------------------------------------------------------------------
// Protocol Rule Types
// -----------------------------------------------------------------------------

/** Condition operator for matching */
export type ConditionOperator = 'equals' | 'contains' | 'matches' | 'exists';

/** Single condition to check against entities or content */
export interface ProtocolCondition {
  /** Field to check - 'content' for the original input text, or entity field */
  field: keyof ExtractedEntities | 'content';
  /** Comparison operator */
  operator: ConditionOperator;
  /** Value to compare against (not used for 'exists' operator) */
  value: string;
}

/** Protocol rule that triggers a nudge suggestion */
export interface ProtocolRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name for the rule */
  name: string;
  /** Trigger conditions */
  trigger: {
    /** Intent that must match */
    intent: CortexIntent;
    /** Additional conditions that must all be met */
    conditions: ProtocolCondition[];
  };
  /** Suggestion to show when rule matches */
  suggestion: {
    /** Suggested follow-up intent */
    intent: CortexIntent;
    /** User-facing message */
    message: string;
    /** Function to prefill entities from source action */
    prefillEntities: (source: ExtractedEntities) => Partial<ExtractedEntities>;
  };
  /** Protocol metadata for clinical context (optional) */
  protocol?: ProtocolMetadata;
  /** Priority for sorting multiple suggestions */
  priority: NudgePriority;
  /** Whether this rule is active */
  enabled: boolean;
  /** Time in ms before suggestion expires (default 5 minutes) */
  expiresAfterMs: number;
}

// -----------------------------------------------------------------------------
// Condition Checker (Internal)
// -----------------------------------------------------------------------------

/**
 * Check if a single condition is met
 */
function checkCondition(
  condition: ProtocolCondition,
  entities: ExtractedEntities,
  content?: string
): boolean {
  // Get the value to check
  const value = condition.field === 'content'
    ? content
    : entities[condition.field as keyof ExtractedEntities];

  // Handle null/undefined values
  if (value === undefined || value === null || value === '') {
    return condition.operator === 'exists' ? false : false;
  }

  const stringValue = String(value);

  switch (condition.operator) {
    case 'equals':
      return stringValue.toLowerCase() === condition.value.toLowerCase();
    case 'contains':
      return stringValue.toLowerCase().includes(condition.value.toLowerCase());
    case 'matches':
      try {
        return new RegExp(condition.value, 'i').test(stringValue);
      } catch {
        // Invalid regex, return false
        return false;
      }
    case 'exists':
      return true;
    default:
      return false;
  }
}

// -----------------------------------------------------------------------------
// Nudge Evaluation
// -----------------------------------------------------------------------------

/** Input for nudge evaluation */
export interface NudgeEvaluationInput {
  /** The completed action's intent */
  intent: CortexIntent;
  /** The action's ID */
  actionId: string;
  /** Extracted entities from the action */
  entities: ExtractedEntities;
  /** Original user input text (for content matching) */
  content?: string;
}

/**
 * Evaluate completed action against protocol rules and generate suggestions
 *
 * @param input - The completed action details
 * @returns Array of NudgeSuggestions sorted by priority (high first)
 */
export function evaluateNudge(input: NudgeEvaluationInput): NudgeSuggestion[] {
  const suggestions: NudgeSuggestion[] = [];
  const now = new Date();

  for (const rule of PROTOCOL_RULES) {
    // Skip disabled rules
    if (!rule.enabled) continue;

    // Check intent match
    if (rule.trigger.intent !== input.intent) continue;

    // Check all conditions (AND logic)
    const allConditionsMet = rule.trigger.conditions.every(
      (cond) => checkCondition(cond, input.entities, input.content)
    );

    if (allConditionsMet) {
      suggestions.push({
        id: `nudge-${rule.id}-${Date.now()}`,
        trigger: {
          actionId: input.actionId,
          intent: input.intent,
          entities: input.entities,
        },
        suggestion: {
          intent: rule.suggestion.intent,
          entities: rule.suggestion.prefillEntities(input.entities),
          message: rule.suggestion.message,
          rationale: rule.name,
          protocol: rule.protocol,
        },
        status: 'pending',
        priority: rule.priority,
        expiresAt: new Date(now.getTime() + rule.expiresAfterMs),
        createdAt: now,
      });
    }
  }

  // Sort by priority (high first)
  const priorityOrder: Record<NudgePriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// -----------------------------------------------------------------------------
// MVP Protocol Rules (Hardcoded)
// -----------------------------------------------------------------------------

/** Default expiry time: 5 minutes */
const DEFAULT_EXPIRY_MS = 5 * 60 * 1000;

/**
 * MVP Protocol Rules
 *
 * For the prototype, we hardcode a few demonstration rules.
 * In production, these would come from a database or configuration.
 */
export const PROTOCOL_RULES: ProtocolRule[] = [
  {
    id: 'wondzorg-controle',
    name: 'Wondcontrole na verzorging',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'content', operator: 'contains', value: 'wond' },
      ],
    },
    suggestion: {
      intent: 'create_appointment',
      message: 'Wondcontrole inplannen over 3 dagen?',
      prefillEntities: (source) => ({
        patientName: source.patientName,
        appointmentType: 'follow-up',
      }),
    },
    protocol: {
      name: 'V&VN Richtlijn Wondzorg',
      reference: '§4.2 Controlefrequentie',
      rationale: 'Vroege hercontrole na wondverzorging verkleint het risico op infectie en bevordert optimale wondgenezing.',
    },
    priority: 'medium',
    enabled: true,
    expiresAfterMs: DEFAULT_EXPIRY_MS,
  },
  {
    id: 'medicatie-controle',
    name: 'Medicatie controle na wijziging',
    trigger: {
      intent: 'dagnotitie',
      conditions: [
        { field: 'content', operator: 'contains', value: 'medicatie' },
        { field: 'content', operator: 'contains', value: 'gewijzigd' },
      ],
    },
    suggestion: {
      intent: 'create_appointment',
      message: 'Medicatie evaluatie inplannen over 1 week?',
      prefillEntities: (source) => ({
        patientName: source.patientName,
        appointmentType: 'follow-up',
      }),
    },
    priority: 'medium',
    enabled: true,
    expiresAfterMs: DEFAULT_EXPIRY_MS,
  },
];
