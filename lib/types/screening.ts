/**
 * Screening Types
 *
 * Shared type definitions for screening entities and related helper types.
 */

import { Database } from '@/lib/supabase/database.types';
import { z } from 'zod';

export type Screening = Database['public']['Tables']['screenings']['Row'];
export type ScreeningActivity = Database['public']['Tables']['screening_activities']['Row'];
export type ScreeningDocument = Database['public']['Tables']['screening_documents']['Row'];

export interface ScreeningWithRelations extends Screening {
  screening_activities?: ScreeningActivity[];
  screening_documents?: ScreeningDocument[];
}

export const UpdateScreeningSchema = z.object({
  screening_id: z.string().uuid('Screening ID moet een geldige UUID zijn'),
  patient_id: z.string().uuid('Patiënt ID moet een geldige UUID zijn'),
  request_for_help: z.string().optional(),
  decision: z.enum(['geschikt', 'niet_geschikt']).optional(),
  decision_notes: z.string().optional(),
  decision_department: z.string().optional(),
});

export type UpdateScreeningInput = z.infer<typeof UpdateScreeningSchema>;

export const CreateActivitySchema = z.object({
  screening_id: z.string().uuid('Screening ID moet een geldige UUID zijn'),
  patient_id: z.string().uuid('Patiënt ID moet een geldige UUID zijn'),
  activity_text: z
    .string()
    .min(3, 'Beschrijf minimaal 3 tekens')
    .max(2000, 'Maximaal 2000 tekens'),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

export interface ScreeningSummary {
  screening: ScreeningWithRelations;
  activities: ScreeningActivity[];
  documents: ScreeningDocument[];
}
