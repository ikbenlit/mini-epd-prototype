'use server';

import { createClient } from '@/lib/auth/server';
import type { Database } from '@/lib/supabase/database.types';

export type Condition = Database['public']['Tables']['conditions']['Row'];

export type IntakeInfo = {
  id: string;
  title: string | null;
  department: string | null;
  start_date: string | null;
};

export type DiagnosisWithIntake = Condition & {
  intake?: IntakeInfo | null;
};

/**
 * Haal alle diagnoses op voor een patiënt (uit alle intakes)
 */
export async function getPatientDiagnoses(patientId: string): Promise<DiagnosisWithIntake[]> {
  const supabase = await createClient();

  // Haal eerst alle diagnoses op
  const { data: conditions, error: conditionsError } = await supabase
    .from('conditions')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_date', { ascending: false });

  if (conditionsError) {
    console.error('getPatientDiagnoses error', conditionsError);
    throw new Error('Kon diagnoses niet ophalen');
  }

  if (!conditions || conditions.length === 0) {
    return [];
  }

  // Haal de intake IDs op
  const intakeIds = [...new Set(conditions.map((c) => c.encounter_id).filter((id): id is string => id !== null))];

  if (intakeIds.length === 0) {
    return conditions.map((c) => ({ ...c, intake: null }));
  }

  // Haal intake informatie op
  const { data: intakes, error: intakesError } = await supabase
    .from('intakes')
    .select('id, title, department, start_date')
    .in('id', intakeIds);

  if (intakesError) {
    console.error('getPatientDiagnoses intakes error', intakesError);
    // Return conditions zonder intake info als de query faalt
    return conditions.map((c) => ({ ...c, intake: null }));
  }

  // Maak lookup map
  const intakeMap = new Map<string, IntakeInfo>();
  intakes?.forEach((intake) => {
    intakeMap.set(intake.id, intake);
  });

  // Combineer data
  return conditions.map((condition) => ({
    ...condition,
    intake: condition.encounter_id ? intakeMap.get(condition.encounter_id) || null : null,
  }));
}
