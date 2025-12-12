import { z } from 'zod';

/** Severity options */
export const DIAGNOSIS_SEVERITIES = ['licht', 'matig', 'ernstig'] as const;

/** Diagnosis type options */
export const DIAGNOSIS_TYPES = ['primary', 'secondary'] as const;

/** Clinical status options (moet matchen met database enum condition_clinical_status) */
export const DIAGNOSIS_STATUSES = ['active', 'remission', 'resolved', 'inactive'] as const;

/**
 * Zod schema voor diagnose formulier validatie
 */
export const diagnosisSchema = z.object({
  /** ICD-10 code (verplicht, format F##.#) */
  code: z
    .string()
    .min(1, 'ICD-10 code is verplicht')
    .regex(/^F\d{2}(\.\d{1,2})?$/, 'Ongeldige ICD-10 code (verwacht format: F##.#)'),

  /** Beschrijving van de diagnose (verplicht) */
  description: z
    .string()
    .min(1, 'Beschrijving is verplicht')
    .max(200, 'Beschrijving mag maximaal 200 tekens zijn'),

  /** Ernst classificatie (verplicht) */
  severity: z.enum(DIAGNOSIS_SEVERITIES, {
    message: 'Selecteer een geldige ernst',
  }),

  /** Diagnose type: hoofd of nevendiagnose (verplicht) */
  diagnosisType: z.enum(DIAGNOSIS_TYPES, {
    message: 'Selecteer hoofd- of nevendiagnose',
  }),

  /** Klinische status (verplicht) */
  status: z.enum(DIAGNOSIS_STATUSES, {
    message: 'Selecteer een geldige status',
  }),

  /** DSM-5 referentie (optioneel, vrije tekst) */
  dsm5Reference: z
    .string()
    .max(100, 'DSM-5 referentie mag maximaal 100 tekens zijn')
    .optional()
    .or(z.literal('')),

  /** Onderbouwing / notities (optioneel) */
  notes: z
    .string()
    .max(500, 'Onderbouwing mag maximaal 500 tekens zijn')
    .optional()
    .or(z.literal('')),
});

/** TypeScript type afgeleid van het schema */
export type DiagnosisFormData = z.infer<typeof diagnosisSchema>;

/** Default waarden voor nieuw diagnose formulier */
export const diagnosisDefaults: DiagnosisFormData = {
  code: '',
  description: '',
  severity: 'matig',
  diagnosisType: 'secondary',
  status: 'active',
  dsm5Reference: '',
  notes: '',
};

/**
 * Schema voor server-side payload (inclusief patient/intake IDs)
 */
export const diagnosisPayloadSchema = diagnosisSchema.extend({
  patientId: z.string().uuid('Ongeldige patient ID'),
  intakeId: z.string().uuid('Ongeldige intake ID'),
});

export type DiagnosisPayload = z.infer<typeof diagnosisPayloadSchema>;

/**
 * Schema voor update operatie (alle velden optioneel behalve ID)
 */
export const diagnosisUpdateSchema = diagnosisSchema.partial().extend({
  id: z.string().uuid('Ongeldige diagnose ID'),
});

export type DiagnosisUpdatePayload = z.infer<typeof diagnosisUpdateSchema>;
