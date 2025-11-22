'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type Intake = Database['public']['Tables']['intakes']['Row'];

const CreateIntakeSchema = z.object({
  title: z.string().min(1, 'Titel is verplicht'),
  department: z.enum(['Volwassenen', 'Jeugd', 'Ouderen']),
  start_date: z.string().min(1, 'Startdatum is verplicht'),
  patient_id: z.string().uuid(),
});

export type CreateIntakeInput = z.infer<typeof CreateIntakeSchema>;

export async function getIntakesByClientId(clientId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('intakes')
    .select('*')
    .eq('patient_id', clientId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching intakes:', error);
    throw new Error('Failed to fetch intakes');
  }

  return data as Intake[];
}

export async function createIntake(input: CreateIntakeInput) {
  const result = CreateIntakeSchema.safeParse(input);

  if (!result.success) {
    throw new Error('Invalid input data');
  }

  const { title, department, start_date, patient_id } = result.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('intakes')
    .insert({
      title,
      department,
      start_date,
      patient_id,
      status: 'Open', // Default status
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating intake:', error);
    throw new Error('Failed to create intake');
  }

  revalidatePath(`/epd/clients/${patient_id}`);
  redirect(`/epd/clients/${patient_id}?tab=intake`);
}

export async function getIntakeById(intakeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('intakes')
    .select('*')
    .eq('id', intakeId)
    .single();

  if (error) {
    console.error('Error fetching intake:', error);
    return null;
  }

  return data as Intake;
}
