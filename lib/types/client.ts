/**
 * Client Types
 *
 * Type definitions for client-related data structures
 */

import { Database } from '@/lib/database.types';

// Base client type from database
export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

// Extended client type with computed fields
export interface ClientWithAge extends Client {
  age: number;
  full_name: string;
}

// Client form data (for create/edit forms)
export interface ClientFormData {
  first_name: string;
  last_name: string;
  birth_date: string; // ISO date string (YYYY-MM-DD)
}

// Client list filters
export interface ClientFilters {
  search?: string;
  sortBy?: 'name' | 'age' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Transform client to extended client with computed fields
 */
export function transformClient(client: Client): ClientWithAge {
  return {
    ...client,
    age: calculateAge(client.birth_date),
    full_name: `${client.first_name} ${client.last_name}`,
  };
}
