'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import type { Database } from '@/lib/supabase/database.types';

export type Encounter = Database['public']['Tables']['encounters']['Row'];
export type RiskAssessment = Database['public']['Tables']['risk_assessments']['Row'];
export type Anamnese = Database['public']['Tables']['anamneses']['Row'];
export type Examination = Database['public']['Tables']['examinations']['Row'];
export type Condition = Database['public']['Tables']['conditions']['Row'];

export type KindcheckData = {
  hasChildren?: boolean;
  childCount?: number;
  ages?: string;
  concerns?: boolean;
  concernsNotes?: string;
  actionTaken?: boolean;
  actionNotes?: string;
  notes?: string;
};

function buildPath(patientId: string, intakeId: string, tab?: string) {
  const base = `/epd/patients/${patientId}/intakes/${intakeId}`;
  return tab ? `${base}/${tab}` : base;
}

async function getSupabase() {
  return createClient();
}

// ---------------- Contacts ----------------
export async function getContactMoments(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('intake_id', intakeId)
    .order('period_start', { ascending: false });

  if (error) {
    console.error('getContactMoments error', error);
    throw new Error('Kon contactmomenten niet ophalen');
  }
  return data || [];
}

export interface ContactPayload {
  patientId: string;
  intakeId: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: string;
  location?: string;
  notes?: string;
}

export async function createContactMoment(input: ContactPayload) {
  const supabase = await getSupabase();
  const startIso = new Date(`${input.date}T${input.startTime}:00`).toISOString();
  const endIso = input.endTime ? new Date(`${input.date}T${input.endTime}:00`).toISOString() : null;

  const { error } = await supabase.from('encounters').insert({
    patient_id: input.patientId,
    intake_id: input.intakeId,
    class_code: input.location || 'AMB',
    class_display: input.location || 'Onbekend',
    status: 'finished',
    type_code: input.type,
    type_display: input.type,
    period_start: startIso,
    period_end: endIso,
    notes: input.notes,
  });

  if (error) {
    console.error('createContactMoment error', error);
    throw new Error(error.message);
  }

  revalidatePath(buildPath(input.patientId, input.intakeId, 'contacts'));
  revalidatePath(buildPath(input.patientId, input.intakeId));
}

export async function deleteContactMoment(patientId: string, intakeId: string, encounterId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('encounters').delete().eq('id', encounterId);
  if (error) {
    console.error('deleteContactMoment error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'contacts'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Kindcheck ----------------
export async function getKindcheck(intakeId: string): Promise<KindcheckData> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('intakes')
    .select('kindcheck_data')
    .eq('id', intakeId)
    .maybeSingle();
  if (error) {
    console.error('getKindcheck error', error);
    throw new Error('Kon kindcheck niet ophalen');
  }
  return (data?.kindcheck_data as KindcheckData) || {};
}

export async function saveKindcheck(
  patientId: string,
  intakeId: string,
  payload: KindcheckData
) {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('intakes')
    .update({ kindcheck_data: payload })
    .eq('id', intakeId);
  if (error) {
    console.error('saveKindcheck error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'kindcheck'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Risks ----------------
export async function getRiskAssessments(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('intake_id', intakeId)
    .order('assessment_date', { ascending: false });
  if (error) {
    console.error('getRiskAssessments error', error);
    throw new Error('Kon risicotaxaties niet ophalen');
  }
  return data || [];
}

export interface RiskPayload {
  patientId: string;
  intakeId: string;
  date: string;
  type: string;
  level: string;
  rationale: string;
  measures?: string;
  evaluationDate?: string;
  notes?: string;
}

export async function createRiskAssessment(payload: RiskPayload) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('risk_assessments').insert({
    intake_id: payload.intakeId,
    assessment_date: payload.date,
    risk_type: payload.type,
    risk_level: payload.level,
    rationale: payload.rationale,
    measures: payload.measures,
    evaluation_date: payload.evaluationDate || null,
    notes: payload.notes,
  });
  if (error) {
    console.error('createRiskAssessment error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(payload.patientId, payload.intakeId, 'risk'));
  revalidatePath(buildPath(payload.patientId, payload.intakeId));
}

export async function deleteRiskAssessment(patientId: string, intakeId: string, riskId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('risk_assessments').delete().eq('id', riskId);
  if (error) {
    console.error('deleteRiskAssessment error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'risk'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Anamneses ----------------
export async function getAnamneses(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('anamneses')
    .select('*')
    .eq('intake_id', intakeId)
    .order('anamnese_date', { ascending: false });
  if (error) {
    console.error('getAnamneses error', error);
    throw new Error('Kon anamneses niet ophalen');
  }
  return data || [];
}

export interface AnamnesePayload {
  patientId: string;
  intakeId: string;
  date: string;
  type: string;
  content: string;
  notes?: string;
}

export async function createAnamnese(payload: AnamnesePayload) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('anamneses').insert({
    intake_id: payload.intakeId,
    anamnese_date: payload.date,
    anamnese_type: payload.type,
    content: payload.content,
    notes: payload.notes,
  });
  if (error) {
    console.error('createAnamnese error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(payload.patientId, payload.intakeId, 'anamnese'));
  revalidatePath(buildPath(payload.patientId, payload.intakeId));
}

export async function deleteAnamnese(patientId: string, intakeId: string, anamneseId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('anamneses').delete().eq('id', anamneseId);
  if (error) {
    console.error('deleteAnamnese error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'anamnese'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Examinations (including ROM) ----------------
export async function getExaminations(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('examinations')
    .select('*')
    .eq('intake_id', intakeId)
    .order('examination_date', { ascending: false });
  if (error) {
    console.error('getExaminations error', error);
    throw new Error('Kon onderzoeken niet ophalen');
  }
  return data || [];
}

export interface ExaminationPayload {
  patientId: string;
  intakeId: string;
  date: string;
  type: string;
  findings: string;
  performer?: string;
  reason?: string;
  notes?: string;
  isRom?: boolean;
}

export async function createExamination(payload: ExaminationPayload) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('examinations').insert({
    intake_id: payload.intakeId,
    examination_date: payload.date,
    examination_type: payload.isRom ? 'ROM' : payload.type,
    findings: payload.findings,
    performed_by: payload.performer,
    reason: payload.reason,
    notes: payload.notes,
  });
  if (error) {
    console.error('createExamination error', error);
    throw new Error(error.message);
  }
  const tab = payload.isRom ? 'rom' : 'examination';
  revalidatePath(buildPath(payload.patientId, payload.intakeId, tab));
  revalidatePath(buildPath(payload.patientId, payload.intakeId));
}

export async function deleteExamination(patientId: string, intakeId: string, examinationId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('examinations').delete().eq('id', examinationId);
  if (error) {
    console.error('deleteExamination error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'examination'));
  revalidatePath(buildPath(patientId, intakeId, 'rom'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Diagnoses ----------------
export async function getDiagnoses(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('encounter_id', intakeId)
    .order('recorded_date', { ascending: false });
  if (error) {
    console.error('getDiagnoses error', error);
    throw new Error('Kon diagnoses niet ophalen');
  }
  return data || [];
}

export interface DiagnosisPayload {
  patientId: string;
  intakeId: string;
  code: string;
  description: string;
  severity?: string;
  status?: string;
  notes?: string;
}

export async function createDiagnosis(payload: DiagnosisPayload) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('conditions').insert({
    patient_id: payload.patientId,
    encounter_id: payload.intakeId,
    code_code: payload.code,
    code_display: payload.description,
    code_system: 'DSM-5',
    clinical_status: payload.status || 'active',
    severity_display: payload.severity || null,
    note: payload.notes,
    recorded_date: new Date().toISOString(),
  });
  if (error) {
    console.error('createDiagnosis error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(payload.patientId, payload.intakeId, 'diagnosis'));
  revalidatePath(buildPath(payload.patientId, payload.intakeId));
}

export async function deleteDiagnosis(patientId: string, intakeId: string, diagnosisId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('conditions').delete().eq('id', diagnosisId);
  if (error) {
    console.error('deleteDiagnosis error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(patientId, intakeId, 'diagnosis'));
  revalidatePath(buildPath(patientId, intakeId));
}

// ---------------- Treatment Advice ----------------
export async function getTreatmentAdvice(intakeId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('intakes')
    .select('treatment_advice')
    .eq('id', intakeId)
    .maybeSingle();
  if (error) {
    console.error('getTreatmentAdvice error', error);
    throw new Error('Kon behandeladvies niet ophalen');
  }
  return data?.treatment_advice || {};
}

export interface TreatmentAdvicePayload {
  patientId: string;
  intakeId: string;
  advice: string;
  department?: string;
  program?: string;
  notes?: string;
  psychologist?: string;
  finalize?: boolean;
  outcome?: 'in_zorg' | 'doorverwijzing' | 'extra_diagnostiek';
  outcomeNotes?: string;
}

export async function saveTreatmentAdvice(payload: TreatmentAdvicePayload) {
  const supabase = await getSupabase();
  const updates: Record<string, unknown> = {
    treatment_advice: {
      advice: payload.advice,
      department: payload.department,
      program: payload.program,
      notes: payload.notes,
      psychologist: payload.psychologist,
      outcome: payload.outcome,
      outcomeNotes: payload.outcomeNotes,
      updatedAt: new Date().toISOString(),
    },
  };

  if (payload.finalize) {
    updates.status = 'afgerond';
    updates.end_date = new Date().toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('intakes')
    .update(updates)
    .eq('id', payload.intakeId);
  if (error) {
    console.error('saveTreatmentAdvice error', error);
    throw new Error(error.message);
  }
  revalidatePath(buildPath(payload.patientId, payload.intakeId, 'behandeladvies'));
  revalidatePath(buildPath(payload.patientId, payload.intakeId));
}
