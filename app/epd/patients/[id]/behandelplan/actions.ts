'use server';

import { createClient } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import type { GeneratedPlan, SmartGoal, Intervention, Behandelstructuur } from '@/lib/types/behandelplan';
import type { LifeDomainScore } from '@/lib/types/leefgebieden';
import type { Json } from '@/lib/supabase/database.types';

/**
 * Get care plans for a patient
 */
export async function getCarePlans(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('care_plans')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching care plans:', error);
    return [];
  }

  return data;
}

/**
 * Get the latest active care plan for a patient
 */
export async function getActiveCarePlan(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('care_plans')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['draft', 'active'])
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active care plan:', error);
  }

  return data;
}

/**
 * Get intakes for a patient (to select for plan generation)
 */
export async function getPatientIntakes(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('intakes')
    .select('id, title, status, start_date, life_domains, notes')
    .eq('patient_id', patientId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching intakes:', error);
    return [];
  }

  return data;
}

/**
 * Get conditions for a patient
 */
export async function getPatientConditions(patientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conditions')
    .select('id, category, code_display, severity_code, severity_display, recorded_date')
    .eq('patient_id', patientId)
    .order('recorded_date', { ascending: false });

  if (error) {
    console.error('Error fetching conditions:', error);
    return [];
  }

  return data;
}

/**
 * Create a new care plan from generated plan
 */
export async function createCarePlan(
  patientId: string,
  intakeId: string,
  generatedPlan: GeneratedPlan,
  title: string = 'Behandelplan'
) {
  const supabase = await createClient();

  // Get current version
  const { data: existing } = await supabase
    .from('care_plans')
    .select('version')
    .eq('patient_id', patientId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (existing?.version || 0) + 1;

  const { data, error } = await supabase
    .from('care_plans')
    .insert({
      patient_id: patientId,
      based_on_intake_id: intakeId,
      title: `${title} v${nextVersion}`,
      status: 'draft',
      intent: 'plan',
      version: nextVersion,
      goals: generatedPlan.doelen as unknown as Json,
      activities: generatedPlan.interventies as unknown as Json,
      behandelstructuur: generatedPlan.behandelstructuur as unknown as Json,
      evaluatiemomenten: generatedPlan.evaluatiemomenten as unknown as Json,
      sessie_planning: generatedPlan.sessiePlanning as unknown as Json,
      veiligheidsplan: (generatedPlan.veiligheidsplan || null) as unknown as Json,
      period_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating care plan:', error);
    throw new Error('Kon behandelplan niet opslaan');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
  return data;
}

/**
 * Update care plan status
 */
export async function updateCarePlanStatus(
  carePlanId: string,
  patientId: string,
  status: 'draft' | 'active' | 'on-hold' | 'completed' | 'revoked'
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };

  // Set published_at when activating
  if (status === 'active') {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('care_plans')
    .update(updateData)
    .eq('id', carePlanId);

  if (error) {
    console.error('Error updating care plan status:', error);
    throw new Error('Kon status niet bijwerken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Update care plan goals
 */
export async function updateCarePlanGoals(
  carePlanId: string,
  patientId: string,
  goals: GeneratedPlan['doelen']
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('care_plans')
    .update({ goals: goals as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error updating goals:', error);
    throw new Error('Kon doelen niet bijwerken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Save life domains to intake
 */
export async function saveLifeDomains(
  intakeId: string,
  patientId: string,
  lifeDomains: LifeDomainScore[]
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('intakes')
    .update({ life_domains: lifeDomains as unknown as Json })
    .eq('id', intakeId);

  if (error) {
    console.error('Error saving life domains:', error);
    throw new Error('Kon leefgebieden niet opslaan');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Delete a care plan
 */
export async function deleteCarePlan(carePlanId: string, patientId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('care_plans')
    .delete()
    .eq('id', carePlanId);

  if (error) {
    console.error('Error deleting care plan:', error);
    throw new Error('Kon behandelplan niet verwijderen');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Create a new empty/manual care plan
 */
export async function createEmptyCarePlan(
  patientId: string,
  intakeId?: string,
  title: string = 'Behandelplan'
) {
  const supabase = await createClient();

  // Get current version
  const { data: existing } = await supabase
    .from('care_plans')
    .select('version')
    .eq('patient_id', patientId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (existing?.version || 0) + 1;

  const { data, error } = await supabase
    .from('care_plans')
    .insert({
      patient_id: patientId,
      based_on_intake_id: intakeId || null,
      title: `${title} v${nextVersion}`,
      status: 'draft',
      intent: 'plan',
      version: nextVersion,
      goals: [],
      activities: [],
      period_start: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating empty care plan:', error);
    throw new Error('Kon behandelplan niet aanmaken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
  return data;
}

// =============================================================================
// BEHANDELSTRUCTUUR
// =============================================================================

/**
 * Update behandelstructuur
 */
export async function updateBehandelstructuur(
  carePlanId: string,
  patientId: string,
  behandelstructuur: Behandelstructuur
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('care_plans')
    .update({ behandelstructuur: behandelstructuur as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error updating behandelstructuur:', error);
    throw new Error('Kon behandelstructuur niet bijwerken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

// =============================================================================
// GOALS (DOELEN)
// =============================================================================

/**
 * Add a goal to a care plan
 */
export async function addGoal(
  carePlanId: string,
  patientId: string,
  goal: SmartGoal
) {
  const supabase = await createClient();

  // Get current goals
  const { data: plan } = await supabase
    .from('care_plans')
    .select('goals')
    .eq('id', carePlanId)
    .single();

  const currentGoals = (plan?.goals as unknown as SmartGoal[]) || [];
  const updatedGoals = [...currentGoals, goal];

  const { error } = await supabase
    .from('care_plans')
    .update({ goals: updatedGoals as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error adding goal:', error);
    throw new Error('Kon doel niet toevoegen');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Update a single goal in a care plan
 */
export async function updateGoal(
  carePlanId: string,
  patientId: string,
  goalId: string,
  updatedGoal: SmartGoal
) {
  const supabase = await createClient();

  // Get current goals
  const { data: plan } = await supabase
    .from('care_plans')
    .select('goals')
    .eq('id', carePlanId)
    .single();

  const currentGoals = (plan?.goals as unknown as SmartGoal[]) || [];
  const updatedGoals = currentGoals.map((g) =>
    g.id === goalId ? updatedGoal : g
  );

  const { error } = await supabase
    .from('care_plans')
    .update({ goals: updatedGoals as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error updating goal:', error);
    throw new Error('Kon doel niet bijwerken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Delete a goal from a care plan
 */
export async function deleteGoal(
  carePlanId: string,
  patientId: string,
  goalId: string
) {
  const supabase = await createClient();

  // Get current goals
  const { data: plan } = await supabase
    .from('care_plans')
    .select('goals')
    .eq('id', carePlanId)
    .single();

  const currentGoals = (plan?.goals as unknown as SmartGoal[]) || [];
  const updatedGoals = currentGoals.filter((g) => g.id !== goalId);

  const { error } = await supabase
    .from('care_plans')
    .update({ goals: updatedGoals as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error deleting goal:', error);
    throw new Error('Kon doel niet verwijderen');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

// =============================================================================
// INTERVENTIONS (INTERVENTIES)
// =============================================================================

/**
 * Add an intervention to a care plan
 */
export async function addIntervention(
  carePlanId: string,
  patientId: string,
  intervention: Intervention
) {
  const supabase = await createClient();

  // Get current interventions
  const { data: plan } = await supabase
    .from('care_plans')
    .select('activities')
    .eq('id', carePlanId)
    .single();

  const currentInterventions = (plan?.activities as unknown as Intervention[]) || [];
  const updatedInterventions = [...currentInterventions, intervention];

  const { error } = await supabase
    .from('care_plans')
    .update({ activities: updatedInterventions as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error adding intervention:', error);
    throw new Error('Kon interventie niet toevoegen');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Update a single intervention in a care plan
 */
export async function updateIntervention(
  carePlanId: string,
  patientId: string,
  interventionId: string,
  updatedIntervention: Intervention
) {
  const supabase = await createClient();

  // Get current interventions
  const { data: plan } = await supabase
    .from('care_plans')
    .select('activities')
    .eq('id', carePlanId)
    .single();

  const currentInterventions = (plan?.activities as unknown as Intervention[]) || [];
  const updatedInterventions = currentInterventions.map((i) =>
    i.id === interventionId ? updatedIntervention : i
  );

  const { error } = await supabase
    .from('care_plans')
    .update({ activities: updatedInterventions as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error updating intervention:', error);
    throw new Error('Kon interventie niet bijwerken');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}

/**
 * Delete an intervention from a care plan
 */
export async function deleteIntervention(
  carePlanId: string,
  patientId: string,
  interventionId: string
) {
  const supabase = await createClient();

  // Get current interventions
  const { data: plan } = await supabase
    .from('care_plans')
    .select('activities')
    .eq('id', carePlanId)
    .single();

  const currentInterventions = (plan?.activities as unknown as Intervention[]) || [];
  const updatedInterventions = currentInterventions.filter((i) => i.id !== interventionId);

  const { error } = await supabase
    .from('care_plans')
    .update({ activities: updatedInterventions as unknown as Json })
    .eq('id', carePlanId);

  if (error) {
    console.error('Error deleting intervention:', error);
    throw new Error('Kon interventie niet verwijderen');
  }

  revalidatePath(`/epd/patients/${patientId}/behandelplan`);
}
