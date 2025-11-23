/**
 * Intake Types
 *
 * Type definitions for intake-related data structures
 * Used across API routes, server actions, and components
 */

import { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

// Base intake type from database
export type Intake = Database['public']['Tables']['intakes']['Row'];
export type IntakeInsert = Database['public']['Tables']['intakes']['Insert'];
export type IntakeUpdate = Database['public']['Tables']['intakes']['Update'];

// Department enum values
export const INTAKE_DEPARTMENTS = ['Volwassenen', 'Jeugd', 'Ouderen'] as const;
export type IntakeDepartment = (typeof INTAKE_DEPARTMENTS)[number];

// Status enum values (mapped from database 'bezig'/'afgerond' to UI 'Open'/'Afgerond')
export const INTAKE_STATUSES = ['bezig', 'afgerond'] as const;
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

/**
 * Zod validation schema for creating a new intake
 */
export const CreateIntakeSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  title: z.string().min(1, 'Titel is verplicht'),
  department: z.enum(INTAKE_DEPARTMENTS, {
    message: 'Afdeling moet Volwassenen, Jeugd of Ouderen zijn',
  }),
  start_date: z.string().min(1, 'Startdatum is verplicht'),
  psychologist_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

/**
 * Type inferred from CreateIntakeSchema
 */
export type CreateIntakeInput = z.infer<typeof CreateIntakeSchema>;

/**
 * Zod validation schema for updating an existing intake
 */
export const UpdateIntakeSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.enum(INTAKE_DEPARTMENTS).optional(),
  status: z.enum(INTAKE_STATUSES).optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  psychologist_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * Type inferred from UpdateIntakeSchema
 */
export type UpdateIntakeInput = z.infer<typeof UpdateIntakeSchema>;

/**
 * Response type for listing intakes
 */
export interface IntakeListResponse {
  intakes: Intake[];
  total: number;
}

/**
 * Extended intake type with computed fields (if needed in the future)
 */
export interface IntakeWithMetadata extends Intake {
  // Future: computed fields like duration, isActive, etc.
}
