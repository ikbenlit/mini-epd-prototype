/**
 * Overdracht Server Actions/Functions
 * Gedeelde data fetching functies voor overdracht en dagregistratie
 */

import { createClient } from '@/lib/auth/server';
import type { PatientOverzicht } from '@/lib/types/overdracht';

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

export async function getOverdrachtPatients(period: PeriodValue = '7d'): Promise<{
  patients: PatientOverzicht[];
  total: number;
  date: string;
}> {
  const supabase = await createClient();
  const today = new Date();
  const targetDate = today.toISOString().split('T')[0];

  // Calculate date range based on period
  const days = getPeriodDays(period);
  const periodStart = new Date(today);
  periodStart.setDate(periodStart.getDate() - (days - 1));
  const periodStartISO = periodStart.toISOString();

  // For vitals/logs, use the period range
  const dayStart = periodStart.toISOString().split('T')[0] + 'T00:00:00.000Z';
  const dayEnd = targetDate + 'T23:59:59.999Z';

  // 1. Get patients with activity in the selected period
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
    .gte('created_at', periodStartISO)
    .is('deleted_at', null);

  // Deduplicate patients from reports
  const patientMap = new Map<string, {
    id: string;
    name_given: string[];
    name_family: string;
    birth_date: string;
    gender: string;
  }>();

  if (!reportsError && reportsData) {
    for (const report of reportsData) {
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
  }

  // Also check for patients with verpleegkundig reports in period
  const { data: verpleegkundigPatients } = await supabase
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
    .eq('type', 'verpleegkundig')
    .gte('shift_date', periodStart.toISOString().split('T')[0])
    .lte('shift_date', targetDate)
    .is('deleted_at', null);

  if (verpleegkundigPatients) {
    for (const report of verpleegkundigPatients) {
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
  }

  // If no patients with recent activity, get all patients as fallback (for prototype)
  if (patientMap.size === 0) {
    const { data: allPatients } = await supabase
      .from('patients')
      .select('id, name_given, name_family, birth_date, gender')
      .limit(10);

    if (allPatients) {
      for (const patient of allPatients) {
        patientMap.set(patient.id, patient);
      }
    }
  }

  const patientIds = Array.from(patientMap.keys());

  if (patientIds.length === 0) {
    return { patients: [], total: 0, date: targetDate };
  }

  // 2. Get alert counts in parallel (within the selected period)
  const [
    { data: risksData },
    { data: vitalsData },
    { data: logsData },
    { data: incidentReportsData },
  ] = await Promise.all([
    // High risk assessments (via intakes) - these are not time-bound
    supabase
      .from('risk_assessments')
      .select('id, intakes!inner(patient_id)')
      .in('intakes.patient_id', patientIds)
      .in('risk_level', ['hoog', 'zeer_hoog']),

    // Abnormal vitals in period
    supabase
      .from('observations')
      .select('id, patient_id, interpretation_code')
      .in('patient_id', patientIds)
      .eq('category', 'vital-signs')
      .gte('effective_datetime', dayStart)
      .lte('effective_datetime', dayEnd)
      .in('interpretation_code', ['H', 'L', 'HH', 'LL']),

    // Marked verpleegkundig reports for handover in period
    supabase
      .from('reports')
      .select('id, patient_id')
      .in('patient_id', patientIds)
      .eq('type', 'verpleegkundig')
      .gte('shift_date', periodStart.toISOString().split('T')[0])
      .lte('shift_date', targetDate)
      .eq('include_in_handover', true)
      .is('deleted_at', null),

    // Incident reports in period (type='incident' OR verpleegkundig with category='incident')
    supabase
      .from('reports')
      .select('id, patient_id, type, structured_data')
      .in('patient_id', patientIds)
      .gte('created_at', periodStartISO)
      .is('deleted_at', null),
  ]);

  // Count alerts per patient
  const alertCounts = new Map<string, {
    high_risk_count: number;
    abnormal_vitals_count: number;
    marked_logs_count: number;
    incident_count: number;
  }>();

  // Initialize all patients with zero counts
  for (const patientId of patientIds) {
    alertCounts.set(patientId, {
      high_risk_count: 0,
      abnormal_vitals_count: 0,
      marked_logs_count: 0,
      incident_count: 0,
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

  // Count incidents (type='incident' OR type='crisis' OR verpleegkundig with category='incident')
  for (const report of incidentReportsData || []) {
    if (!report.patient_id) continue;
    const counts = alertCounts.get(report.patient_id);
    if (!counts) continue;

    // Direct incident/crisis type
    if (report.type === 'incident' || report.type === 'crisis') {
      counts.incident_count++;
      continue;
    }

    // Verpleegkundig report with incident category
    if (report.type === 'verpleegkundig' && report.structured_data) {
      const data = report.structured_data as { category?: string };
      if (data.category === 'incident') {
        counts.incident_count++;
      }
    }
  }

  // 3. Build response
  const patients: PatientOverzicht[] = Array.from(patientMap.values()).map(
    (patient) => {
      const alerts = alertCounts.get(patient.id) || {
        high_risk_count: 0,
        abnormal_vitals_count: 0,
        marked_logs_count: 0,
        incident_count: 0,
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
            alerts.marked_logs_count +
            alerts.incident_count,
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
