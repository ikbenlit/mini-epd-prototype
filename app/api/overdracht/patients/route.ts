import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import type { PatientOverzicht, PatientOverzichtResponse } from '@/lib/types/overdracht';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Use provided date or today
    const targetDate = dateParam || new Date().toISOString().split('T')[0];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return NextResponse.json(
        { error: 'date moet in YYYY-MM-DD formaat zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get start and end of day for date filtering
    const dayStart = `${targetDate}T00:00:00.000Z`;
    const dayEnd = `${targetDate}T23:59:59.999Z`;

    // 1. Get patients with encounters today
    const { data: encounterData, error: encounterError } = await supabase
      .from('encounters')
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
      .gte('period_start', dayStart)
      .lte('period_start', dayEnd)
      .in('status', ['planned', 'in-progress', 'completed']);

    if (encounterError) {
      console.error('Error fetching encounters:', encounterError);
      return NextResponse.json(
        { error: 'Fout bij ophalen patiënten', details: encounterError.message },
        { status: 500 }
      );
    }

    // Deduplicate patients (one patient may have multiple encounters)
    const patientMap = new Map<string, {
      id: string;
      name_given: string[];
      name_family: string;
      birth_date: string;
      gender: string;
    }>();

    for (const encounter of encounterData || []) {
      const patient = encounter.patients as unknown as {
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
      const response: PatientOverzichtResponse = {
        patients: [],
        total: 0,
        date: targetDate,
      };
      return NextResponse.json(response);
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

      // Marked reports (type=verpleegkundig) for handover
      supabase
        .from('reports')
        .select('id, patient_id')
        .in('patient_id', patientIds)
        .eq('type', 'verpleegkundig')
        .eq('shift_date', targetDate)
        .eq('include_in_handover', true)
        .is('deleted_at', null),
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

    const response: PatientOverzichtResponse = {
      patients,
      total: patients.length,
      date: targetDate,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/overdracht/patients:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
