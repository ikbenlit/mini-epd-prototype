import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import type {
  PatientDetail,
  VitalSign,
  Report,
  RiskAssessment,
  Condition,
} from '@/lib/types/overdracht';
import type { NursingLog } from '@/lib/types/nursing-log';

interface RouteParams {
  params: Promise<{ patientId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { patientId } = await params;

    if (!z.string().uuid().safeParse(patientId).success) {
      return NextResponse.json(
        { error: 'patientId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Date calculations
    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00.000Z`;
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Parallel queries for all data
    const [
      patientResult,
      vitalsResult,
      reportsResult,
      logsResult,
      risksResult,
      conditionsResult,
    ] = await Promise.all([
      // 1. Patient info
      supabase
        .from('patients')
        .select('id, name_given, name_family, name_prefix, birth_date, gender')
        .eq('id', patientId)
        .single(),

      // 2. Vitals today
      supabase
        .from('observations')
        .select('id, code_display, value_quantity_value, value_quantity_unit, interpretation_code, effective_datetime')
        .eq('patient_id', patientId)
        .eq('category', 'vital-signs')
        .gte('effective_datetime', todayStart)
        .order('effective_datetime', { ascending: false }),

      // 3. Reports last 24h
      supabase
        .from('reports')
        .select('id, type, content, created_at, created_by')
        .eq('patient_id', patientId)
        .gte('created_at', last24h)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),

      // 4. Nursing logs today (all, not just marked)
      supabase
        .from('nursing_logs')
        .select('*')
        .eq('patient_id', patientId)
        .eq('shift_date', today)
        .order('timestamp', { ascending: false }),

      // 5. Risks via intakes
      supabase
        .from('risk_assessments')
        .select('id, risk_type, risk_level, rationale, created_at, intakes!inner(patient_id)')
        .eq('intakes.patient_id', patientId)
        .in('risk_level', ['laag', 'gemiddeld', 'hoog', 'zeer_hoog']),

      // 6. Active conditions
      supabase
        .from('conditions')
        .select('id, code_display, clinical_status, onset_datetime')
        .eq('patient_id', patientId)
        .eq('clinical_status', 'active'),
    ]);

    // Check if patient exists
    if (patientResult.error || !patientResult.data) {
      return NextResponse.json(
        { error: 'Patiënt niet gevonden' },
        { status: 404 }
      );
    }

    // Handle errors for other queries gracefully (return empty arrays)
    if (vitalsResult.error) {
      console.error('Error fetching vitals:', vitalsResult.error);
    }
    if (reportsResult.error) {
      console.error('Error fetching reports:', reportsResult.error);
    }
    if (logsResult.error) {
      console.error('Error fetching nursing logs:', logsResult.error);
    }
    if (risksResult.error) {
      console.error('Error fetching risks:', risksResult.error);
    }
    if (conditionsResult.error) {
      console.error('Error fetching conditions:', conditionsResult.error);
    }

    // Map vitals
    const vitals: VitalSign[] = (vitalsResult.data || []).map((v) => ({
      id: v.id,
      code_display: v.code_display,
      value_quantity_value: v.value_quantity_value,
      value_quantity_unit: v.value_quantity_unit,
      interpretation_code: v.interpretation_code,
      effective_datetime: v.effective_datetime,
    }));

    // Map reports
    const reports: Report[] = (reportsResult.data || []).map((r) => ({
      id: r.id,
      type: r.type,
      content: r.content,
      created_at: r.created_at,
      created_by: r.created_by,
    }));

    // Nursing logs (already typed correctly from database)
    const nursingLogs: NursingLog[] = logsResult.data || [];

    // Map risks (remove the intakes join data)
    const risks: RiskAssessment[] = (risksResult.data || []).map((r) => ({
      id: r.id,
      risk_type: r.risk_type,
      risk_level: r.risk_level,
      rationale: r.rationale,
      created_at: r.created_at,
    }));

    // Map conditions
    const conditions: Condition[] = (conditionsResult.data || []).map((c) => ({
      id: c.id,
      code_display: c.code_display,
      clinical_status: c.clinical_status,
      onset_datetime: c.onset_datetime || undefined,
    }));

    // Build response
    const response: PatientDetail = {
      patient: {
        id: patientResult.data.id,
        name_given: patientResult.data.name_given,
        name_family: patientResult.data.name_family,
        name_prefix: patientResult.data.name_prefix || undefined,
        birth_date: patientResult.data.birth_date,
        gender: patientResult.data.gender,
      },
      vitals,
      reports,
      nursingLogs,
      risks,
      conditions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/overdracht/[patientId]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
