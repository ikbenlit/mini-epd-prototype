import { z } from 'zod';
import type { NursingLog } from './nursing-log';

// Patient overview for list view
export interface PatientOverzicht {
  id: string;
  name_given: string[];
  name_family: string;
  birth_date: string;
  gender: string;
  alerts: {
    high_risk_count: number;
    abnormal_vitals_count: number;
    marked_logs_count: number;
    total: number;
  };
}

export interface PatientOverzichtResponse {
  patients: PatientOverzicht[];
  total: number;
  date: string;
}

// Patient detail for detail view
export interface PatientDetail {
  patient: {
    id: string;
    name_given: string[];
    name_family: string;
    name_prefix?: string;
    birth_date: string;
    gender: string;
  };
  vitals: VitalSign[];
  reports: Report[];
  nursingLogs: NursingLog[];
  risks: RiskAssessment[];
  conditions: Condition[];
}

// Vital sign with interpretation
export interface VitalSign {
  id: string;
  code_display: string;
  value_quantity_value: number | null;
  value_quantity_unit: string | null;
  interpretation_code?: string | null; // 'H' | 'L' | 'N'
  effective_datetime: string;
}

// Report (rapportage)
export interface Report {
  id: string;
  type: string;
  content: string;
  created_at: string;
  created_by: string | null;
}

// Risk assessment
export interface RiskAssessment {
  id: string;
  risk_type: string;
  risk_level: string;
  rationale?: string | null;
  created_at: string | null;
}

// Condition (diagnose)
export interface Condition {
  id: string;
  code_display: string;
  clinical_status: string;
  onset_datetime?: string;
}

// AI Summary types
export interface AISamenvatting {
  samenvatting: string;
  aandachtspunten: Aandachtspunt[];
  actiepunten: string[];
  generatedAt: string;
  durationMs: number;
}

export interface Aandachtspunt {
  tekst: string;
  urgent: boolean;
  bron: {
    type: 'observatie' | 'rapportage' | 'dagnotitie' | 'risico';
    id: string;
    datum: string;
    label: string;
  };
}

// Zod schema for generate request
export const GenerateOverdrachtSchema = z.object({
  patientId: z.string().uuid('Patient ID moet een geldige UUID zijn'),
});

export type GenerateOverdrachtInput = z.infer<typeof GenerateOverdrachtSchema>;
