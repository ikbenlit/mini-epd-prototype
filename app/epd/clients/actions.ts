'use server';

/**
 * Client CRUD Server Actions
 *
 * Server-side actions for client management
 */

import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@/lib/auth/server';
import type { ClientFormData, ClientFilters } from '@/lib/types/client';

/**
 * Get all clients with optional filtering
 */
export async function getClients(filters?: ClientFilters) {
  const supabase = await createSupabaseClient();

  let query = supabase
    .from('clients')
    .select('*');

  // Apply search filter
  if (filters?.search) {
    const search = `%${filters.search}%`;
    query = query.or(`first_name.ilike.${search},last_name.ilike.${search}`);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';

  if (sortBy === 'name') {
    query = query.order('last_name', { ascending: sortOrder === 'asc' });
    query = query.order('first_name', { ascending: sortOrder === 'asc' });
  } else if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending: sortOrder === 'asc' });
  } else if (sortBy === 'age') {
    // Sort by birth_date (newest birth = youngest age)
    query = query.order('birth_date', { ascending: sortOrder === 'desc' });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching clients:', error);
    throw new Error('Failed to fetch clients');
  }

  return data || [];
}

/**
 * Get single client by ID
 */
export async function getClient(id: string) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw new Error('Failed to fetch client');
  }

  return data;
}

/**
 * Create new client
 */
export async function createClient(formData: ClientFormData) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .insert({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      birth_date: formData.birth_date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw new Error('Failed to create client');
  }

  revalidatePath('/epd/clients');
  return data;
}

/**
 * Update existing client
 */
export async function updateClient(id: string, formData: ClientFormData) {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .update({
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      birth_date: formData.birth_date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw new Error('Failed to update client');
  }

  revalidatePath('/epd/clients');
  revalidatePath(`/epd/clients/${id}`);
  return data;
}

/**
 * Delete client
 */
export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }

  revalidatePath('/epd/clients');
  return { success: true };
}
