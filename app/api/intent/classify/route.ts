/**
 * Intent Classify API
 *
 * POST /api/intent/classify
 * Two-tier intent classification: local first, AI fallback if confidence < 0.8
 */

import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyIntent, isHighConfidence } from '@/lib/swift/intent-classifier';
import { classifyIntentWithAI } from '@/lib/swift/intent-classifier-ai';
import { extractEntities } from '@/lib/swift/entity-extractor';
import type { IntentClassificationResult } from '@/lib/swift/types';

// Request schema
const ClassifyRequestSchema = z.object({
  input: z.string().min(1, 'Input is verplicht').max(500, 'Input te lang (max 500 tekens)'),
  forceAI: z.boolean().optional(), // For testing: force AI classification
});

// Response type
interface ClassifyResponse {
  intent: IntentClassificationResult['intent'];
  confidence: number;
  entities: IntentClassificationResult['entities'];
  source: 'local' | 'ai';
  processingTimeMs: number;
  localResult?: {
    intent: string;
    confidence: number;
    matchedPattern?: string;
  };
}

/**
 * POST /api/intent/classify
 *
 * Classifies user input into an intent with entity extraction.
 * Uses local regex patterns first, falls back to AI if confidence < 0.8.
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();

    // Validate input
    const result = ClassifyRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: result.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { input, forceAI } = result.data;
    const supabase = await createClient();

    // Check auth
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Step 1: Local classification (fast, <50ms)
    const localResult = classifyIntent(input);

    // Step 2: Decide if we need AI fallback
    const useAI = forceAI || !isHighConfidence(localResult);

    let finalResult: ClassifyResponse;

    if (useAI) {
      // AI fallback for low confidence or forced
      const aiResult = await classifyIntentWithAI(input);

      finalResult = {
        intent: aiResult.intent,
        confidence: aiResult.confidence,
        entities: aiResult.entities,
        source: 'ai',
        processingTimeMs: performance.now() - startTime,
        localResult: {
          intent: localResult.intent,
          confidence: localResult.confidence,
          matchedPattern: localResult.matchedPattern,
        },
      };
    } else {
      // High confidence local result - extract entities locally
      const entities = extractEntities(input, localResult.intent);

      finalResult = {
        intent: localResult.intent,
        confidence: localResult.confidence,
        entities,
        source: 'local',
        processingTimeMs: performance.now() - startTime,
      };
    }

    // Log classification event (non-blocking)
    logClassificationEvent(supabase, input, finalResult).catch((err) => {
      console.error('Failed to log classification event:', err);
    });

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error('Error classifying intent:', error);

    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service niet geconfigureerd' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('Claude API')) {
      return NextResponse.json(
        { error: 'AI service tijdelijk niet beschikbaar', details: errorMessage },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Fout bij classificeren',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Log classification event to ai_events table
 */
async function logClassificationEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: string,
  result: ClassifyResponse
) {
  try {
    await supabase.from('ai_events').insert({
      kind: 'intent_classify',
      input_data: {
        input: input.slice(0, 200), // Truncate for storage
        inputLength: input.length,
      },
      output_data: {
        intent: result.intent,
        confidence: result.confidence,
        source: result.source,
        hasEntities: Object.keys(result.entities).length > 0,
        localConfidence: result.localResult?.confidence,
      },
      duration_ms: Math.round(result.processingTimeMs),
    });
  } catch (error) {
    // Don't throw, just log
    console.error('Failed to log AI event:', error);
  }
}
