import { z } from 'zod';
import type { Database } from '@/lib/supabase/database.types';

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export const REPORT_TYPES = [
  'voortgang',
  'observatie',
  'incident',
  'medicatie',
  'contact',
  'crisis',
  'intake',
  'behandeladvies',
  'vrije_notitie',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const CreateReportSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  type: z.enum(REPORT_TYPES),
  content: z
    .string()
    .min(20, 'Rapportage moet minimaal 20 karakters bevatten')
    .max(5000, 'Rapportage mag maximaal 5000 karakters bevatten'),
  ai_confidence: z.number().min(0).max(1).optional(),
  ai_reasoning: z.string().optional(),
  encounter_id: z.string().uuid().optional(),
  intake_id: z.string().uuid().optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export interface ClassificationResult {
  type: ReportType;
  confidence: number;
  reasoning?: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}
