'use server';

/**
 * Agenda Server Actions
 *
 * Server-side data fetching and mutations for the agenda module.
 */

import { createClient } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import type { CalendarEvent, AppointmentTypeCode, APPOINTMENT_TYPE_COLORS } from './types';

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  intake: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  behandeling: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'follow-up': { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  telefonisch: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  huisbezoek: { bg: '#ffedd5', border: '#f97316', text: '#9a3412' },
  online: { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
  crisis: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  overig: { bg: '#f1f5f9', border: '#64748b', text: '#334155' },
};

interface GetEncountersParams {
  startDate: string;
  endDate: string;
  practitionerId?: string;
}

export async function getEncounters({
  startDate,
  endDate,
  practitionerId,
}: GetEncountersParams): Promise<CalendarEvent[]> {
  const supabase = await createClient();

  let query = supabase
    .from('encounters')
    .select(`
      *,
      patients:patient_id (
        id,
        name_family,
        name_given,
        birth_date
      )
    `)
    .gte('period_start', startDate)
    .lte('period_start', endDate)
    .neq('status', 'cancelled')
    .order('period_start', { ascending: true });

  if (practitionerId) {
    query = query.eq('practitioner_id', practitionerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching encounters:', error);
    return [];
  }

  return (data || []).map((encounter) => {
    const patient = encounter.patients as {
      id: string;
      name_family: string;
      name_given: string[];
      birth_date: string;
    } | null;

    const patientName = patient
      ? `${patient.name_given?.[0] || ''} ${patient.name_family}`.trim()
      : 'Onbekende patiënt';

    const typeCode = encounter.type_code as AppointmentTypeCode;
    const colors = TYPE_COLORS[typeCode] || TYPE_COLORS.overig;

    return {
      id: encounter.id,
      title: patientName,
      start: encounter.period_start,
      end: encounter.period_end || undefined,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
      extendedProps: {
        encounter,
        patient: patient || undefined,
      },
    } as CalendarEvent;
  });
}

interface CreateEncounterParams {
  patientId: string;
  practitionerId: string;
  periodStart: string;
  periodEnd?: string;
  typeCode: string;
  typeDisplay: string;
  classCode: string;
  classDisplay: string;
  notes?: string;
}

export async function createEncounter(params: CreateEncounterParams) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('encounters')
    .insert({
      patient_id: params.patientId,
      practitioner_id: params.practitionerId,
      period_start: params.periodStart,
      period_end: params.periodEnd,
      type_code: params.typeCode,
      type_display: params.typeDisplay,
      class_code: params.classCode,
      class_display: params.classDisplay,
      notes: params.notes,
      status: 'planned',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating encounter:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/epd/agenda');
  return { success: true, data };
}

export async function updateEncounter(
  encounterId: string,
  updates: {
    periodStart?: string;
    periodEnd?: string;
    status?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (updates.periodStart) updateData.period_start = updates.periodStart;
  if (updates.periodEnd) updateData.period_end = updates.periodEnd;
  if (updates.status) updateData.status = updates.status;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('encounters')
    .update(updateData)
    .eq('id', encounterId)
    .select()
    .single();

  if (error) {
    console.error('Error updating encounter:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/epd/agenda');
  return { success: true, data };
}

export async function cancelEncounter(encounterId: string) {
  return updateEncounter(encounterId, { status: 'cancelled' });
}

export async function rescheduleEncounter(
  encounterId: string,
  newStart: string,
  newEnd: string | null
) {
  return updateEncounter(encounterId, {
    periodStart: newStart,
    periodEnd: newEnd || undefined,
  });
}
