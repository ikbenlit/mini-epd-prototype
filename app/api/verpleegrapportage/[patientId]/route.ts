/**
 * API Route: GET /api/verpleegrapportage/[patientId]
 * Haalt patiënt detail data op voor de verpleegrapportage
 * Toont alleen verpleegkundig-relevante rapportages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import type { PatientDetail } from '@/lib/types/overdracht';
import { VERPLEEG_REPORT_TYPES } from '@/lib/types/report';

type PeriodValue = '1d' | '3d' | '7d' | '14d';

function getPeriodDays(period: PeriodValue): number {
  switch (period) {
    case '1d': return 1;
    case '3d': return 3;
    case '7d': return 7;
    case '14d': return 14;
    default: return 7;
  }
}

function getPeriodDateRange(period: PeriodValue): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];

  const days = getPeriodDays(period);
  const startDateTime = new Date(today);
  startDateTime.setDate(startDateTime.getDate() - (days - 1));
  const startDate = startDateTime.toISOString().split('T')[0];

  return { startDate, endDate };
}

async function getPatientDetail(patientId: string, period: PeriodValue): Promise<PatientDetail | null> {
  const supabase = await createClient();

  // Date calculations based on period
  const { startDate, endDate } = getPeriodDateRange(period);
  const startDatetime = `${startDate}T00:00:00.000Z`;
  const endDatetime = `${endDate}T23:59:59.999Z`;

  // Parallel queries for all data
  const [
    patientResult,
    vitalsResult,
    reportsResult,
    risksResult,
    conditionsResult,
  ] = await Promise.all([
    // 1. Patient info
    supabase
      .from('patients')
      .select('id, name_given, name_family, name_prefix, birth_date, gender')
      .eq('id', patientId)
      .single(),

    // 2. Vitals in period
    supabase
      .from('observations')
      .select('id, code_display, value_quantity_value, value_quantity_unit, interpretation_code, effective_datetime')
      .eq('patient_id', patientId)
      .eq('category', 'vital-signs')
      .gte('effective_datetime', startDatetime)
      .lte('effective_datetime', endDatetime)
      .order('effective_datetime', { ascending: false }),

    // 3. Reports in period - filter on VERPLEEG_REPORT_TYPES
    // This now includes 'verpleegkundig' (was nursing_logs) plus observatie, incident, medicatie, crisis
    supabase
      .from('reports')
      .select('id, type, content, created_at, created_by, structured_data, include_in_handover, shift_date')
      .eq('patient_id', patientId)
      .in('type', [...VERPLEEG_REPORT_TYPES])
      .gte('created_at', startDatetime)
      .lte('created_at', endDatetime)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),

    // 4. Risks via intakes
    supabase
      .from('risk_assessments')
      .select('id, risk_type, risk_level, rationale, created_at, intakes!inner(patient_id)')
      .eq('intakes.patient_id', patientId)
      .in('risk_level', ['laag', 'gemiddeld', 'hoog', 'zeer_hoog']),

    // 5. Active conditions
    supabase
      .from('conditions')
      .select('id, code_display, clinical_status, onset_datetime')
      .eq('patient_id', patientId)
      .eq('clinical_status', 'active'),
  ]);

  // Check if patient exists
  if (patientResult.error || !patientResult.data) {
    return null;
  }

  // Build response
  return {
    patient: {
      id: patientResult.data.id,
      name_given: patientResult.data.name_given,
      name_family: patientResult.data.name_family,
      name_prefix: patientResult.data.name_prefix || undefined,
      birth_date: patientResult.data.birth_date,
      gender: patientResult.data.gender,
    },
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
    conditions: (conditionsResult.data || []).map((c) => ({
      id: c.id,
      code_display: c.code_display,
      clinical_status: c.clinical_status,
      onset_datetime: c.onset_datetime || undefined,
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const periode = request.nextUrl.searchParams.get('periode') || '7d';

    // Validate period
    const validPeriods: PeriodValue[] = ['1d', '3d', '7d', '14d'];
    const period: PeriodValue = validPeriods.includes(periode as PeriodValue)
      ? (periode as PeriodValue)
      : '7d';

    const data = await getPatientDetail(patientId, period);

    if (!data) {
      return NextResponse.json(
        { error: 'Patiënt niet gevonden' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /verpleegrapportage/[patientId]] Error:', error);
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}
