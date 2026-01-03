/**
 * FHIR Patient Mapper
 *
 * Maps FHIR Patient resources to database Patient format.
 * Extracted from ZoekenBlock for DRY compliance.
 *
 * Epic: E0.S3 (Patient Selectie - Refactor)
 */

import type { Database } from '@/lib/supabase/database.types';

export type Patient = Database['public']['Tables']['patients']['Row'];

/**
 * FHIR Patient resource structure (subset used in this app)
 */
export interface FhirPatient {
  id: string;
  resourceType?: 'Patient';
  name?: Array<{
    family?: string;
    given?: string[];
    prefix?: string[];
    use?: string;
  }>;
  birthDate?: string;
  gender?: string;
  active?: boolean;
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    postalCode?: string;
    country?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
  }>;
}

const GENDER_MAP: Record<string, Patient['gender']> = {
  male: 'male',
  female: 'female',
  other: 'other',
  unknown: 'unknown',
};

/**
 * Maps a FHIR Patient resource to database Patient format
 *
 * @param fhir - FHIR Patient resource
 * @returns Database Patient object
 */
export function mapFhirToDbPatient(fhir: FhirPatient): Patient {
  const gender = GENDER_MAP[fhir.gender?.toLowerCase() || 'unknown'] || 'unknown';
  const primaryName = fhir.name?.[0];
  const primaryAddress = fhir.address?.[0];

  // Extract identifiers
  const bsn = fhir.identifier?.find(
    (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
  )?.value;

  const clientNumber = fhir.identifier?.find(
    (id) => id.system?.includes('client') || id.system?.includes('999.7.6')
  )?.value;

  // Extract telecom
  const email = fhir.telecom?.find((t) => t.system === 'email')?.value;
  const phone = fhir.telecom?.find((t) => t.system === 'phone')?.value;

  return {
    id: fhir.id,
    name_family: primaryName?.family || '',
    name_given: primaryName?.given || [],
    name_prefix: primaryName?.prefix?.join(' ') || null,
    name_use: primaryName?.use || null,
    birth_date: fhir.birthDate || '',
    gender,
    active: fhir.active !== false,
    identifier_bsn: bsn || null,
    identifier_client_number: clientNumber || null,
    // Address
    address_line: primaryAddress?.line || null,
    address_city: primaryAddress?.city || null,
    address_postal_code: primaryAddress?.postalCode || null,
    address_country: primaryAddress?.country || null,
    // Telecom
    telecom_email: email || null,
    telecom_phone: phone || null,
    // Null defaults for fields not in FHIR
    status: null,
    created_at: null,
    updated_at: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
    general_practitioner_name: null,
    general_practitioner_agb: null,
    insurance_company: null,
    insurance_number: null,
    is_john_doe: null,
  };
}

/**
 * Formats a patient's full name from database format
 *
 * @param patient - Database Patient object
 * @returns Formatted full name
 */
export function formatPatientName(patient: Patient): string {
  const given = patient.name_given?.[0] || '';
  const family = patient.name_family || '';
  return `${given} ${family}`.trim();
}

/**
 * Calculates patient age from birth date
 *
 * @param birthDate - Birth date string (ISO format)
 * @returns Age in years, or null if invalid
 */
export function calculatePatientAge(birthDate: string | null): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Generates initials from patient name
 *
 * @param name - Full name string
 * @returns 2-character initials
 */
export function getPatientInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * PatientSearchResult interface (duplicated to avoid circular import)
 * Matches the interface in use-patient-search.ts
 */
export interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  identifier_bsn?: string;
  identifier_client_number?: string;
  matchScore: number;
}

/**
 * Converts a database Patient to PatientSearchResult format
 *
 * Used for displaying recent patients in sidebar/dropdown
 * where we have full Patient data but need search result format.
 *
 * @param patient - Database Patient object
 * @returns PatientSearchResult for UI components
 */
export function dbPatientToSearchResult(patient: Patient): PatientSearchResult {
  return {
    id: patient.id,
    name: formatPatientName(patient) || 'Onbekend',
    birthDate: patient.birth_date || '',
    identifier_bsn: patient.identifier_bsn || undefined,
    identifier_client_number: patient.identifier_client_number || undefined,
    matchScore: 1,
  };
}
