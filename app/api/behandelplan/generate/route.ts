/**
 * Behandelplan Generate API
 *
 * POST /api/behandelplan/generate
 * Genereert een behandelplan met Claude AI
 */

import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  BEHANDELPLAN_SYSTEM_PROMPT,
  buildUserPrompt,
  validatePlanContext,
  type PlanContext,
} from '@/lib/ai/behandelplan-prompt';
import { type Severity } from '@/lib/ai/intervention-mapping';
import {
  GeneratedPlanSchema,
  type GeneratedPlan,
} from '@/lib/types/behandelplan';
import { createDefaultLifeDomainScores, type LifeDomainScore } from '@/lib/types/leefgebieden';

// Input validation schema
const GenerateInputSchema = z.object({
  patientId: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  intakeId: z.string().uuid('Intake ID moet een geldige UUID zijn'),
  conditionId: z.string().uuid().optional(),
  extraInstructions: z.string().max(500).optional(),
});

/**
 * Map severity_code to Severity type
 */
function mapSeverity(severityCode: string | null | undefined): Severity {
  if (!severityCode) return 'middel';

  const code = severityCode.toLowerCase();
  if (code.includes('mild') || code.includes('laag') || code.includes('light')) {
    return 'laag';
  }
  if (code.includes('severe') || code.includes('hoog') || code.includes('ernstig')) {
    return 'hoog';
  }
  return 'middel';
}

/**
 * Load context from database
 */
async function loadPlanContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string,
  intakeId: string,
  conditionId?: string
): Promise<PlanContext> {
  // 1. Load intake
  const { data: intake, error: intakeError } = await supabase
    .from('intakes')
    .select('*')
    .eq('id', intakeId)
    .eq('patient_id', patientId)
    .single();

  if (intakeError || !intake) {
    throw new Error(`Intake niet gevonden: ${intakeError?.message || 'niet gevonden'}`);
  }

  // 2. Load condition (latest for patient, or specific one)
  let conditionQuery = supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId);

  if (conditionId) {
    conditionQuery = conditionQuery.eq('id', conditionId);
  } else {
    conditionQuery = conditionQuery.order('recorded_date', { ascending: false }).limit(1);
  }

  const { data: conditions } = await conditionQuery;
  const condition = conditions?.[0];

  // 3. Build intake notes from available data
  const intakeNotes = buildIntakeNotes(intake);

  // 4. Get life domains (from intake or default)
  const lifeDomains: LifeDomainScore[] =
    (intake.life_domains as LifeDomainScore[] | null) ||
    createDefaultLifeDomainScores();

  // 5. Build context
  return {
    patientId,
    intakeNotes,
    dsmCategory: condition?.category || condition?.code_display || 'overig',
    severity: mapSeverity(condition?.severity_code),
    lifeDomains,
    extraInstructions: undefined,
  };
}

/**
 * Build intake notes from intake data
 */
function buildIntakeNotes(intake: Record<string, unknown>): string {
  const parts: string[] = [];

  if (intake.notes) {
    parts.push(String(intake.notes));
  }

  if (intake.treatment_advice) {
    const advice = intake.treatment_advice as Record<string, unknown>;
    if (advice.content) {
      parts.push(`Behandeladvies: ${String(advice.content)}`);
    }
  }

  if (intake.kindcheck_data) {
    const kindcheck = intake.kindcheck_data as Record<string, unknown>;
    if (kindcheck.observations) {
      parts.push(`Observaties: ${String(kindcheck.observations)}`);
    }
  }

  return parts.join('\n\n') || 'Geen intake notities beschikbaar.';
}

/**
 * Call Claude API
 */
async function callClaudeAPI(context: PlanContext): Promise<GeneratedPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ontbreekt in environment');
  }

  const userPrompt = buildUserPrompt(context);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: BEHANDELPLAN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Claude API error:', errorBody);
    throw new Error(`Claude API fout: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.content?.[0]?.text;

  if (!rawText) {
    throw new Error('Geen response van Claude API');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonText = rawText.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }

  const parsed = JSON.parse(jsonText.trim());

  // Validate with Zod schema
  const validated = GeneratedPlanSchema.parse(parsed);

  return validated;
}

/**
 * Log AI event to database
 */
async function logAIEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  kind: string,
  patientId: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  durationMs: number
) {
  try {
    await supabase.from('ai_events').insert({
      kind,
      patient_id: patientId,
      input_data: input,
      output_data: output,
      duration_ms: durationMs,
    });
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to log AI event:', error);
  }
}

/**
 * POST /api/behandelplan/generate
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate input
    const result = GenerateInputSchema.safeParse(body);
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

    const { patientId, intakeId, conditionId, extraInstructions } = result.data;
    const supabase = await createClient();

    // Load context from database
    const context = await loadPlanContext(supabase, patientId, intakeId, conditionId);

    // Add extra instructions if provided
    if (extraInstructions) {
      context.extraInstructions = extraInstructions;
    }

    // Validate context
    const validation = validatePlanContext(context);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Onvoldoende context voor behandelplan generatie',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Call Claude API
    const plan = await callClaudeAPI(context);

    const durationMs = Date.now() - startTime;

    // Log AI event
    await logAIEvent(
      supabase,
      'behandelplan_generate',
      patientId,
      { intakeId, conditionId, extraInstructions },
      { goalCount: plan.doelen.length, interventionCount: plan.interventies.length },
      durationMs
    );

    return NextResponse.json({
      success: true,
      plan,
      meta: {
        generatedAt: new Date().toISOString(),
        durationMs,
        context: {
          dsmCategory: context.dsmCategory,
          severity: context.severity,
          highPriorityDomains: context.lifeDomains
            .filter((d) => d.priority === 'hoog')
            .map((d) => d.domain),
        },
      },
    });
  } catch (error) {
    console.error('Error generating behandelplan:', error);

    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

    // Check for specific error types
    if (errorMessage.includes('Intake niet gevonden')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

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
        error: 'Fout bij genereren behandelplan',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
