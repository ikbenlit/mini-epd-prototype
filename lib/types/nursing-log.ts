import { z } from 'zod';
import type { Database } from '@/lib/supabase/database.types';

// Database types
export type NursingLog = Database['public']['Tables']['nursing_logs']['Row'];
export type NursingLogInsert = Database['public']['Tables']['nursing_logs']['Insert'];
export type NursingLogUpdate = Database['public']['Tables']['nursing_logs']['Update'];

// Category enum
export const NURSING_LOG_CATEGORIES = [
  'medicatie',
  'adl',
  'gedrag',
  'incident',
  'observatie',
] as const;

export type NursingLogCategory = (typeof NURSING_LOG_CATEGORIES)[number];

// Zod schemas for validation
export const NursingLogCategorySchema = z.enum(NURSING_LOG_CATEGORIES);

export const CreateNursingLogSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  category: NursingLogCategorySchema,
  content: z
    .string()
    .min(1, 'Notitie mag niet leeg zijn')
    .max(500, 'Notitie mag maximaal 500 karakters bevatten'),
  timestamp: z.string().datetime().optional(),
  include_in_handover: z.boolean().default(false),
});

export type CreateNursingLogInput = z.infer<typeof CreateNursingLogSchema>;

export const UpdateNursingLogSchema = z.object({
  category: NursingLogCategorySchema.optional(),
  content: z
    .string()
    .min(1, 'Notitie mag niet leeg zijn')
    .max(500, 'Notitie mag maximaal 500 karakters bevatten')
    .optional(),
  timestamp: z.string().datetime().optional(),
  include_in_handover: z.boolean().optional(),
});

export type UpdateNursingLogInput = z.infer<typeof UpdateNursingLogSchema>;

// Response types
export interface NursingLogListResponse {
  logs: NursingLog[];
  total: number;
}

// Category display configuration
export const CATEGORY_CONFIG: Record<
  NursingLogCategory,
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

// Helper function to calculate shift_date from timestamp
export function calculateShiftDate(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const hours = date.getHours();

  // Night shift (before 7:00) belongs to previous day
  if (hours < 7) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
}
