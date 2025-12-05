/**
 * Overdracht Detail Page
 * E5.S1: Route /epd/overdracht/[patientId], patient header, 2-kolom layout
 */

import { createClient } from '@/lib/auth/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Calendar, Stethoscope, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import type { PatientDetail } from '@/lib/types/overdracht';
import type { NursingLog } from '@/lib/types/nursing-log';
import { VitalsBlock } from './components/vitals-block';
import { ReportsBlock } from './components/reports-block';
import { NursingLogsBlock } from './components/nursing-logs-block';
import { RisksBlock } from './components/risks-block';
import { AISummaryBlock } from './components/ai-summary-block';

interface PageProps {
  params: Promise<{ patientId: string }>;
}

async function getPatientDetail(patientId: string): Promise<PatientDetail | null> {
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
    })),
    nursingLogs: (logsResult.data || []) as NursingLog[],
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

function formatPatientName(
  nameGiven: string[],
  nameFamily: string,
  namePrefix?: string
): string {
  const given = nameGiven.join(' ');
  if (namePrefix) {
    return `${given} ${namePrefix} ${nameFamily}`;
  }
  return `${given} ${nameFamily}`;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'male': return 'Man';
    case 'female': return 'Vrouw';
    default: return 'Onbekend';
  }
}

export default async function OverdrachtDetailPage({ params }: PageProps) {
  const { patientId } = await params;
  const data = await getPatientDetail(patientId);

  if (!data) {
    notFound();
  }

  const { patient, vitals, reports, nursingLogs, risks, conditions } = data;
  const patientName = formatPatientName(
    patient.name_given,
    patient.name_family,
    patient.name_prefix
  );
  const age = calculateAge(patient.birth_date);
  const genderLabel = getGenderLabel(patient.gender);

  // Get primary diagnosis if available
  const primaryDiagnosis = conditions.length > 0 ? conditions[0].code_display : null;

  // Format today's date
  const displayDate = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Count alerts
  const markedLogs = nursingLogs.filter(l => l.include_in_handover);
  const highRisks = risks.filter(r => r.risk_level === 'hoog' || r.risk_level === 'zeer_hoog');
  const abnormalVitals = vitals.filter(v => v.interpretation_code && ['H', 'L', 'HH', 'LL'].includes(v.interpretation_code));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Navigation links */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/epd/overdracht"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar overzicht
            </Link>
            <Link
              href={`/epd/dagregistratie/${patientId}`}
              className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              Dagregistratie
            </Link>
          </div>

          {/* Patient header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="h-7 w-7 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{patientName}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {age} jaar • {genderLabel}
                  </span>
                  {primaryDiagnosis && (
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" />
                      {primaryDiagnosis}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Alert summary badges */}
            <div className="flex items-center gap-2">
              {highRisks.length > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {highRisks.length} hoog risico
                </span>
              )}
              {abnormalVitals.length > 0 && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {abnormalVitals.length} afwijkend
                </span>
              )}
              {markedLogs.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {markedLogs.length} notitie
                </span>
              )}
            </div>
          </div>

          {/* Date indicator */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Overdracht voor {displayDate}
            </p>
          </div>
        </div>
      </div>

      {/* Content - 2 column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Info blocks (scrollable) */}
          <div className="lg:col-span-2 space-y-4">
            {/* E5.S2: VitalsBlock */}
            <VitalsBlock vitals={vitals} />

            {/* E5.S2: ReportsBlock */}
            <ReportsBlock reports={reports} />

            {/* E5.S3: NursingLogsBlock */}
            <NursingLogsBlock logs={nursingLogs} />

            {/* E5.S3: RisksBlock */}
            <RisksBlock risks={risks} />
          </div>

          {/* Right column - AI Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              {/* E5.S4: AISummaryBlock */}
              <AISummaryBlock patientId={patientId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
