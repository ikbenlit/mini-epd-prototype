import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { classifyWithReflex } from '@/lib/cortex/reflex-classifier';
import {
  classifyWithOrchestrator,
  buildFallbackChain,
  buildChainFromReflex,
} from '@/lib/cortex/orchestrator';
import { isFeatureEnabled } from '@/lib/config/feature-flags';
import type {
  CortexContext,
  CortexIntent,
  IntentChain,
  LocalClassificationResult,
} from '@/lib/cortex/types';

/**
 * Cortex Classify API (E2.S5)
 *
 * POST /api/cortex/classify
 *
 * Hybrid classification endpoint:
 * 1. Tries Reflex Arc (Layer 1) first - fast, local pattern matching
 * 2. Escalates to Orchestrator (Layer 2) if needed - AI-powered classification
 * 3. Falls back to Reflex result if AI fails
 */

// =============================================================================
// Request/Response Schemas
// =============================================================================

/** Schema for request validation */
const ClassifyRequestSchema = z.object({
  input: z
    .string()
    .min(1, 'Input mag niet leeg zijn')
    .max(500, 'Input mag maximaal 500 karakters zijn'),
  context: z.object({
    activePatient: z
      .object({
        id: z.string(),
        name: z.string(),
        recentNotes: z.array(z.string()).optional(),
        upcomingAppointments: z
          .array(
            z.object({
              date: z.string().transform((s) => new Date(s)),
              type: z.string(),
            })
          )
          .optional(),
      })
      .nullable(),
    currentView: z.enum([
      'dashboard',
      'patient-detail',
      'agenda',
      'reports',
      'chat',
    ]),
    shift: z.enum(['nacht', 'ochtend', 'middag', 'avond']),
    currentTime: z.string().transform((s) => new Date(s)),
    agendaToday: z.array(
      z.object({
        time: z.string(),
        patientName: z.string(),
        patientId: z.string(),
        type: z.string(),
      })
    ),
    recentIntents: z.array(
      z.object({
        intent: z.string(),
        patientName: z.string().optional(),
        timestamp: z.string().transform((s) => new Date(s)),
      })
    ),
  }),
  options: z
    .object({
      forceAI: z.boolean().optional(),
      skipLogging: z.boolean().optional(),
    })
    .optional(),
});

/** Response type for classify endpoint */
export interface ClassifyResponse {
  chain: IntentChain;
  handledBy: 'reflex' | 'orchestrator';
  needsClarification?: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  debug?: {
    reflexResult?: LocalClassificationResult;
    processingTimeMs: number;
    tokensUsed?: number;
  };
}

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(request: NextRequest) {
  const totalStartTime = performance.now();

  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd. Log opnieuw in.' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Ongeldige JSON in request body' },
        { status: 400 }
      );
    }

    const parsed = ClassifyRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Ongeldige request',
          details: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { input, context, options } = parsed.data;
    const trimmedInput = input.trim();

    // 3. Check feature flag
    if (!isFeatureEnabled('CORTEX_V2_ENABLED')) {
      return NextResponse.json(
        { error: 'Cortex V2 is niet ingeschakeld' },
        { status: 503 }
      );
    }

    // 4. Step 1: Try Reflex Arc (Layer 1)
    const reflexResult = classifyWithReflex(trimmedInput);

    // Log reflex result (if logging enabled)
    if (!options?.skipLogging && isFeatureEnabled('CORTEX_LOGGING')) {
      console.log('[Cortex Classify] Reflex result:', {
        input: trimmedInput.slice(0, 50),
        intent: reflexResult.intent,
        confidence: reflexResult.confidence,
        shouldEscalate: reflexResult.shouldEscalateToAI,
        reason: reflexResult.escalationReason,
        timeMs: reflexResult.processingTimeMs.toFixed(2),
      });
    }

    // 5. Check if we should escalate to Orchestrator
    const shouldEscalate = reflexResult.shouldEscalateToAI || options?.forceAI;

    if (!shouldEscalate) {
      // Reflex handled it - build simple chain
      const chain = buildChainFromReflex(trimmedInput, reflexResult);

      const response: ClassifyResponse = {
        chain,
        handledBy: 'reflex',
        debug: {
          reflexResult,
          processingTimeMs: performance.now() - totalStartTime,
        },
      };

      return NextResponse.json(response);
    }

    // 6. Log escalation
    if (!options?.skipLogging && isFeatureEnabled('CORTEX_LOGGING')) {
      console.log('[Cortex Classify] Escalating to Orchestrator:', {
        reason: reflexResult.escalationReason,
        reflexIntent: reflexResult.intent,
        reflexConfidence: reflexResult.confidence,
      });
    }

    // 7. Step 2: Escalate to Orchestrator (Layer 2)
    try {
      // Transform context to proper CortexContext type
      const cortexContext: CortexContext = {
        ...context,
        recentIntents: context.recentIntents.map((ri) => ({
          intent: ri.intent as CortexIntent,
          patientName: ri.patientName,
          timestamp: ri.timestamp,
        })),
      };

      const aiResult = await classifyWithOrchestrator(
        trimmedInput,
        cortexContext
      );

      // Log AI result
      if (!options?.skipLogging && isFeatureEnabled('CORTEX_LOGGING')) {
        console.log('[Cortex Classify] Orchestrator result:', {
          actionsCount: aiResult.chain.actions.length,
          intents: aiResult.chain.actions.map((a) => a.intent),
          tokensUsed: aiResult.tokensUsed,
          timeMs: aiResult.processingTimeMs.toFixed(2),
        });
      }

      const response: ClassifyResponse = {
        chain: aiResult.chain,
        handledBy: 'orchestrator',
        needsClarification: aiResult.needsClarification,
        clarificationQuestion: aiResult.clarificationQuestion,
        clarificationOptions: aiResult.clarificationOptions,
        debug: {
          reflexResult,
          processingTimeMs: performance.now() - totalStartTime,
          tokensUsed: aiResult.tokensUsed,
        },
      };

      return NextResponse.json(response);
    } catch (aiError) {
      // 8. Graceful fallback on AI failure
      console.error(
        '[Cortex Classify] AI failed, falling back to Reflex:',
        aiError instanceof Error ? aiError.message : aiError
      );

      const fallbackChain = buildFallbackChain(trimmedInput, reflexResult);

      const response: ClassifyResponse = {
        chain: fallbackChain,
        handledBy: 'reflex', // Mark as reflex since AI failed
        debug: {
          reflexResult,
          processingTimeMs: performance.now() - totalStartTime,
        },
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('[Cortex Classify] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij classificatie. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
