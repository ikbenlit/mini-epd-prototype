/**
 * Overdracht Generate API
 *
 * POST /api/overdracht/generate
 * Genereert een overdracht samenvatting met Claude AI
 */

import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  OVERDRACHT_SYSTEM_PROMPT,
  buildOverdrachtUserPrompt,
  calculateAge,
  formatPatientName,
  type OverdrachtContext,
} from '@/lib/ai/overdracht-prompt';
import {
  GenerateOverdrachtSchema,
  type AISamenvatting,
  type Aandachtspunt,
} from '@/lib/types/overdracht';
import { VERPLEEG_REPORT_TYPES } from '@/lib/types/report';

// Zod schema for AI response validation
const AandachtspuntSchema = z.object({
  tekst: z.string(),
  urgent: z.boolean(),
  bron: z.object({
    type: z.enum(['observatie', 'rapportage', 'verpleegkundig', 'risico']),
    id: z.string(),
    datum: z.string(),
    label: z.string(),
  }),
});

const AIResponseSchema = z.object({
  samenvatting: z.string(),
  aandachtspunten: z.array(AandachtspuntSchema).max(5),
  actiepunten: z.array(z.string()).max(3),
});

type PeriodValue = '1d' | '3d' | '7d' | '14d';

/**
 * Calculate start date based on period
 */
function getPeriodStartDate(period: PeriodValue): string {
  const days = { '1d': 1, '3d': 3, '7d': 7, '14d': 14 }[period] || 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  return startDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

/**
 * Load context from database
 */
async function loadOverdrachtContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string,
  period: PeriodValue
): Promise<OverdrachtContext> {
  const periodStart = getPeriodStartDate(period);

  // Parallel queries - reports now includes verpleegkundig type
  const [
    patientResult,
    vitalsResult,
    reportsResult,
    risksResult,
    conditionsResult,
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('id, name_given, name_family, name_prefix, birth_date, gender')
      .eq('id', patientId)
      .single(),
    supabase
      .from('observations')
      .select('id, code_display, value_quantity_value, value_quantity_unit, interpretation_code, effective_datetime')
      .eq('patient_id', patientId)
      .eq('category', 'vital-signs')
      .gte('effective_datetime', periodStart)
      .order('effective_datetime', { ascending: false }),
    // Reports now includes verpleegkundig type (was nursing_logs)
    supabase
      .from('reports')
      .select('id, type, content, created_at, created_by, structured_data, include_in_handover, shift_date')
      .eq('patient_id', patientId)
      .in('type', [...VERPLEEG_REPORT_TYPES])
      .gte('created_at', periodStart)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('risk_assessments')
      .select('id, risk_type, risk_level, rationale, created_at, intakes!inner(patient_id)')
      .eq('intakes.patient_id', patientId),
    supabase
      .from('conditions')
      .select('id, code_display, clinical_status, onset_datetime')
      .eq('patient_id', patientId)
      .eq('clinical_status', 'active'),
  ]);

  if (patientResult.error || !patientResult.data) {
    throw new Error('Patiënt niet gevonden');
  }

  const patient = patientResult.data;

  return {
    patientId,
    patientName: formatPatientName(
      patient.name_given,
      patient.name_family,
      patient.name_prefix || undefined
    ),
    age: calculateAge(patient.birth_date),
    gender: patient.gender,
    conditions: (conditionsResult.data || []).map((c) => ({
      id: c.id,
      code_display: c.code_display,
      clinical_status: c.clinical_status,
      onset_datetime: c.onset_datetime || undefined,
    })),
    vitals: (vitalsResult.data || []).map((v) => ({
      id: v.id,
      code_display: v.code_display,
      value_quantity_value: v.value_quantity_value,
      value_quantity_unit: v.value_quantity_unit,
      interpretation_code: v.interpretation_code,
      effective_datetime: v.effective_datetime,
    })),
    reports: (reportsResult.data || []).map((r) => ({
      id: r.id,
      type: r.type,
      content: r.content,
      created_at: r.created_at,
      created_by: r.created_by,
      structured_data: r.structured_data,
      include_in_handover: r.include_in_handover,
      shift_date: r.shift_date,
    })),
    risks: (risksResult.data || []).map((r) => ({
      id: r.id,
      risk_type: r.risk_type,
      risk_level: r.risk_level,
      rationale: r.rationale,
      created_at: r.created_at,
    })),
  };
}

/**
 * Call Claude API
 */
async function callClaudeAPI(context: OverdrachtContext): Promise<{
  samenvatting: string;
  aandachtspunten: Aandachtspunt[];
  actiepunten: string[];
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ontbreekt in environment');
  }

  const userPrompt = buildOverdrachtUserPrompt(context);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.3,
      system: OVERDRACHT_SYSTEM_PROMPT,
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
  const validated = AIResponseSchema.parse(parsed);

  return validated;
}

/**
 * Log AI event to database
 */
async function logAIEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  patientId: string,
  context: OverdrachtContext,
  result: { samenvatting: string; aandachtspunten: Aandachtspunt[]; actiepunten: string[] },
  durationMs: number
) {
  try {
    // Count verpleegkundige reports separately
    const verpleegkundigCount = context.reports.filter(r => r.type === 'verpleegkundig').length;
    const otherReportsCount = context.reports.filter(r => r.type !== 'verpleegkundig').length;

    await supabase.from('ai_events').insert({
      kind: 'overdracht_generate',
      patient_id: patientId,
      input_data: {
        vitalCount: context.vitals.length,
        reportCount: otherReportsCount,
        verpleegkundigCount,
        riskCount: context.risks.length,
        conditionCount: context.conditions.length,
      },
      output_data: {
        aandachtspuntenCount: result.aandachtspunten.length,
        actiepuntenCount: result.actiepunten.length,
        urgentCount: result.aandachtspunten.filter((a) => a.urgent).length,
      },
      duration_ms: durationMs,
    });
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to log AI event:', error);
  }
}

/**
 * POST /api/overdracht/generate
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate input
    const result = GenerateOverdrachtSchema.safeParse(body);
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

    const { patientId, period } = result.data;
    const supabase = await createClient();

    // Check auth
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Load context with period filter
    const context = await loadOverdrachtContext(supabase, patientId, period);

    // Call Claude API
    const aiResult = await callClaudeAPI(context);

    const durationMs = Date.now() - startTime;

    // Log AI event
    await logAIEvent(supabase, patientId, context, aiResult, durationMs);

    // Build response
    const response: AISamenvatting = {
      samenvatting: aiResult.samenvatting,
      aandachtspunten: aiResult.aandachtspunten,
      actiepunten: aiResult.actiepunten,
      generatedAt: new Date().toISOString(),
      durationMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating overdracht:', error);

    const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

    if (errorMessage.includes('Patiënt niet gevonden')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
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
        error: 'Fout bij genereren overdracht',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
