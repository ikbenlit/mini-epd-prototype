/**
 * Overdracht Overzicht Page
 * E4.S1: Route /epd/overdracht/, grid van PatientCards, filter tabs
 */

import { createClient } from '@/lib/auth/server';
import { ClipboardList } from 'lucide-react';
import { PatientGrid } from './components/patient-grid';
import type { PatientOverzicht } from '@/lib/types/overdracht';

async function getOverdrachtPatients(date?: string): Promise<{
  patients: PatientOverzicht[];
  total: number;
  date: string;
}> {
  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get start and end of day for date filtering (last 24 hours for reports)
  const dayStart = `${targetDate}T00:00:00.000Z`;
  const dayEnd = `${targetDate}T23:59:59.999Z`;
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Get patients with reports in the last 24 hours
  const { data: reportsData, error: reportsError } = await supabase
    .from('reports')
    .select(`
      patient_id,
      patients!inner (
        id,
        name_given,
        name_family,
        birth_date,
        gender
      )
    `)
    .gte('created_at', last24h);

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
    return { patients: [], total: 0, date: targetDate };
  }

  // Deduplicate patients
  const patientMap = new Map<string, {
    id: string;
    name_given: string[];
    name_family: string;
    birth_date: string;
    gender: string;
  }>();

  for (const report of reportsData || []) {
    const patient = report.patients as unknown as {
      id: string;
      name_given: string[];
      name_family: string;
      birth_date: string;
      gender: string;
    };
    if (patient && !patientMap.has(patient.id)) {
      patientMap.set(patient.id, patient);
    }
  }

  const patientIds = Array.from(patientMap.keys());

  if (patientIds.length === 0) {
    return { patients: [], total: 0, date: targetDate };
  }

  // 2. Get alert counts in parallel
  const [
    { data: risksData },
    { data: vitalsData },
    { data: logsData },
  ] = await Promise.all([
    // High risk assessments (via intakes)
    supabase
      .from('risk_assessments')
      .select('id, intakes!inner(patient_id)')
      .in('intakes.patient_id', patientIds)
      .in('risk_level', ['hoog', 'zeer_hoog']),

    // Abnormal vitals today
    supabase
      .from('observations')
      .select('id, patient_id, interpretation_code')
      .in('patient_id', patientIds)
      .eq('category', 'vital-signs')
      .gte('effective_datetime', dayStart)
      .lte('effective_datetime', dayEnd)
      .in('interpretation_code', ['H', 'L', 'HH', 'LL']),

    // Marked nursing logs for handover
    supabase
      .from('nursing_logs')
      .select('id, patient_id')
      .in('patient_id', patientIds)
      .eq('shift_date', targetDate)
      .eq('include_in_handover', true),
  ]);

  // Count alerts per patient
  const alertCounts = new Map<string, {
    high_risk_count: number;
    abnormal_vitals_count: number;
    marked_logs_count: number;
  }>();

  // Initialize all patients with zero counts
  for (const patientId of patientIds) {
    alertCounts.set(patientId, {
      high_risk_count: 0,
      abnormal_vitals_count: 0,
      marked_logs_count: 0,
    });
  }

  // Count high risks
  for (const risk of risksData || []) {
    const intake = risk.intakes as unknown as { patient_id: string };
    if (intake?.patient_id) {
      const counts = alertCounts.get(intake.patient_id);
      if (counts) counts.high_risk_count++;
    }
  }

  // Count abnormal vitals
  for (const vital of vitalsData || []) {
    if (vital.patient_id) {
      const counts = alertCounts.get(vital.patient_id);
      if (counts) counts.abnormal_vitals_count++;
    }
  }

  // Count marked logs
  for (const log of logsData || []) {
    if (log.patient_id) {
      const counts = alertCounts.get(log.patient_id);
      if (counts) counts.marked_logs_count++;
    }
  }

  // 3. Build response
  const patients: PatientOverzicht[] = Array.from(patientMap.values()).map(
    (patient) => {
      const alerts = alertCounts.get(patient.id) || {
        high_risk_count: 0,
        abnormal_vitals_count: 0,
        marked_logs_count: 0,
      };

      return {
        id: patient.id,
        name_given: patient.name_given,
        name_family: patient.name_family,
        birth_date: patient.birth_date,
        gender: patient.gender,
        alerts: {
          ...alerts,
          total:
            alerts.high_risk_count +
            alerts.abnormal_vitals_count +
            alerts.marked_logs_count,
        },
      };
    }
  );

  // Sort by total alerts (descending), then by name
  patients.sort((a, b) => {
    if (b.alerts.total !== a.alerts.total) {
      return b.alerts.total - a.alerts.total;
    }
    return a.name_family.localeCompare(b.name_family);
  });

  return {
    patients,
    total: patients.length,
    date: targetDate,
  };
}

export default async function OverdrachtPage() {
  const data = await getOverdrachtPatients();

  // Format date for display
  const displayDate = new Date(data.date).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Overdracht
              </h1>
              <p className="text-sm text-slate-600">
                {displayDate} • {data.total} {data.total === 1 ? 'patiënt' : 'patiënten'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PatientGrid patients={data.patients} />
      </div>
    </div>
  );
}
