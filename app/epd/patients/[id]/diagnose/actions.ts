'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import type { Database } from '@/lib/supabase/database.types';

export type Condition = Database['public']['Tables']['conditions']['Row'];
type ClinicalStatus = 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';

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

/**
 * Haal alle intakes op voor een patiënt (voor intake selectie dropdown)
 */
export async function getPatientIntakes(patientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('intakes')
    .select('id, title, department, start_date')
    .eq('patient_id', patientId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('getPatientIntakes error', error);
    throw new Error('Kon intakes niet ophalen');
  }
  return data || [];
}

// ---------------- CRUD Actions ----------------

export interface CreateDiagnosisPayload {
  patientId: string;
  intakeId: string;
  code: string;
  description: string;
  severity?: string;
  status?: ClinicalStatus;
  notes?: string;
  diagnosisType?: 'primary' | 'secondary';
}

export async function createPatientDiagnosis(payload: CreateDiagnosisPayload) {
  const supabase = await createClient();

  const insertData = {
    patient_id: payload.patientId,
    encounter_id: payload.intakeId,
    code_code: payload.code,
    code_display: payload.description,
    code_system: 'ICD-10',
    clinical_status: payload.status || 'active',
    severity_display: payload.severity || null,
    category: payload.diagnosisType === 'primary' ? 'primary-diagnosis' : 'encounter-diagnosis',
    note: payload.notes || null,
    recorded_date: new Date().toISOString(),
  };

  console.log('createPatientDiagnosis payload:', JSON.stringify(insertData, null, 2));

  const { error } = await supabase.from('conditions').insert(insertData);

  if (error) {
    console.error('createPatientDiagnosis error:', error.message, error.details, error.hint);
    throw new Error(`Diagnose opslaan mislukt: ${error.message}`);
  }

  revalidatePath(`/epd/patients/${payload.patientId}/diagnose`);
}

export interface UpdateDiagnosisPayload {
  code?: string;
  description?: string;
  severity?: string;
  status?: string;
  notes?: string;
  diagnosisType?: 'primary' | 'secondary';
}

export async function updatePatientDiagnosis(
  patientId: string,
  diagnosisId: string,
  payload: UpdateDiagnosisPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.code !== undefined) {
    updateData.code_code = payload.code;
  }
  if (payload.description !== undefined) {
    updateData.code_display = payload.description;
  }
  if (payload.status !== undefined) {
    updateData.clinical_status = payload.status;
  }
  if (payload.severity !== undefined) {
    updateData.severity_display = payload.severity;
  }
  if (payload.notes !== undefined) {
    updateData.note = payload.notes;
  }
  if (payload.diagnosisType !== undefined) {
    updateData.category = payload.diagnosisType === 'primary' ? 'primary-diagnosis' : 'encounter-diagnosis';
  }

  const { error } = await supabase
    .from('conditions')
    .update(updateData)
    .eq('id', diagnosisId);

  if (error) {
    console.error('updatePatientDiagnosis error', error);
    return { success: false, error: 'Diagnose bijwerken mislukt' };
  }

  revalidatePath(`/epd/patients/${patientId}/diagnose`);
  return { success: true };
}

export async function deletePatientDiagnosis(
  patientId: string,
  diagnosisId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('conditions').delete().eq('id', diagnosisId);

  if (error) {
    console.error('deletePatientDiagnosis error', error);
    return { success: false, error: 'Diagnose verwijderen mislukt' };
  }

  revalidatePath(`/epd/patients/${patientId}/diagnose`);
  return { success: true };
}
