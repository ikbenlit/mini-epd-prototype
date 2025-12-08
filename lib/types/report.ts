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
  'verpleegkundig', // Korte verpleegkundige notities (was nursing_logs)
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

// Types die getoond worden in het verpleegkundig overzicht
export const VERPLEEG_REPORT_TYPES = [
  'verpleegkundig',
  'observatie',
  'incident',
  'medicatie',
  'crisis',
] as const;
export type VerpleegReportType = (typeof VERPLEEG_REPORT_TYPES)[number];

// Categorieën voor verpleegkundige notities (in structured_data.category)
export const VERPLEEGKUNDIG_CATEGORIES = [
  'medicatie',
  'adl',
  'gedrag',
  'incident',
  'observatie',
] as const;
export type VerpleegkundigCategory = (typeof VERPLEEGKUNDIG_CATEGORIES)[number];

// Category display configuration voor verpleegkundige notities
export const CATEGORY_CONFIG: Record<
  VerpleegkundigCategory,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  medicatie: {
    label: 'Medicatie',
    icon: 'Pill',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  adl: {
    label: 'ADL/verzorging',
    icon: 'Utensils',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  gedrag: {
    label: 'Gedragsobservatie',
    icon: 'User',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  incident: {
    label: 'Incident',
    icon: 'AlertTriangle',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  observatie: {
    label: 'Algemene observatie',
    icon: 'FileText',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
};

// Schema voor standaard rapportages (20-5000 karakters)
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

// Schema voor verpleegkundige notities (1-500 karakters, met category)
export const CreateVerpleegkundigSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  type: z.literal('verpleegkundig'),
  content: z
    .string()
    .min(1, 'Notitie mag niet leeg zijn')
    .max(500, 'Notitie mag maximaal 500 karakters bevatten'),
  category: z.enum(VERPLEEGKUNDIG_CATEGORIES),
  include_in_handover: z.boolean().default(false),
});

export type CreateVerpleegkundigInput = z.infer<typeof CreateVerpleegkundigSchema>;

// Update schema voor verpleegkundige notities
export const UpdateVerpleegkundigSchema = z.object({
  content: z
    .string()
    .min(1, 'Notitie mag niet leeg zijn')
    .max(500, 'Notitie mag maximaal 500 karakters bevatten')
    .optional(),
  category: z.enum(VERPLEEGKUNDIG_CATEGORIES).optional(),
  include_in_handover: z.boolean().optional(),
});

export type UpdateVerpleegkundigInput = z.infer<typeof UpdateVerpleegkundigSchema>;

export interface ClassificationResult {
  type: ReportType;
  confidence: number;
  reasoning?: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}

// Helper function to calculate shift_date from timestamp
// Night shift (before 7:00) belongs to previous day
export function calculateShiftDate(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const hours = date.getHours();

  // Night shift (before 7:00) belongs to previous day
  if (hours < 7) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
}

// Helper to extract category from structured_data
export function getVerpleegkundigCategory(
  structuredData: Report['structured_data'] | undefined | null
): VerpleegkundigCategory | null {
  if (!structuredData || typeof structuredData !== 'object') return null;
  const data = structuredData as { category?: string };
  if (data.category && VERPLEEGKUNDIG_CATEGORIES.includes(data.category as VerpleegkundigCategory)) {
    return data.category as VerpleegkundigCategory;
  }
  return null;
}
