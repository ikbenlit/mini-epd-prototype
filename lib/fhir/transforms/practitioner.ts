/**
 * FHIR Practitioner Transforms
 * Convert between Database rows and FHIR Practitioner resources
 */

import type { Tables, TablesInsert } from '../../supabase/database.types';
import type { FHIRPractitioner } from '../types';

type PractitionerRow = Tables<'practitioners'>;
type PractitionerInsert = TablesInsert<'practitioners'>;

/**
 * Transform database Practitioner row to FHIR Practitioner resource
 */
export function dbPractitionerToFHIR(row: PractitionerRow): FHIRPractitioner {
  return {
    resourceType: 'Practitioner',
    id: row.id,

    // Identifiers (BIG, AGB)
    identifier: [
      row.identifier_big
        ? {
            system: 'http://fhir.nl/fhir/NamingSystem/big',
            value: row.identifier_big,
            use: 'official' as const,
          }
        : undefined,
      row.identifier_agb
        ? {
            system: 'http://fhir.nl/fhir/NamingSystem/agb-z',
            value: row.identifier_agb,
            use: 'official' as const,
          }
        : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined),

    // Active status
    active: row.active ?? true,

    // Name
    name: [
      {
        use: 'official',
        family: row.name_family,
        given: row.name_given,
        prefix: row.name_prefix ? [row.name_prefix] : undefined,
        suffix: row.name_suffix ? [row.name_suffix] : undefined,
      },
    ],

    // Telecom (contact)
    telecom: [
      row.telecom_phone
        ? {
            system: 'phone' as const,
            value: row.telecom_phone,
            use: 'work' as const,
          }
        : undefined,
      row.telecom_email
        ? {
            system: 'email' as const,
            value: row.telecom_email,
            use: 'work' as const,
          }
        : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined),

    // Qualifications (professional titles and specializations)
    qualification: row.qualification
      ? row.qualification.map((qual) => ({
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                display: qual,
              },
            ],
            text: qual,
          },
        }))
      : undefined,

    // Meta (timestamps)
    meta: {
      lastUpdated: row.updated_at || undefined,
    },
  };
}

/**
 * Transform FHIR Practitioner resource to database insert
 */
export function fhirPractitionerToDB(
  fhir: FHIRPractitioner
): PractitionerInsert {
  // Extract BIG from identifiers
  const big = fhir.identifier?.find(
    (i) => i.system === 'http://fhir.nl/fhir/NamingSystem/big'
  )?.value;

  // Extract AGB from identifiers
  const agb = fhir.identifier?.find(
    (i) => i.system === 'http://fhir.nl/fhir/NamingSystem/agb-z'
  )?.value;

  // Extract name (use first name)
  const name = fhir.name?.[0];

  // Extract phone and email from telecom
  const phone = fhir.telecom?.find((t) => t.system === 'phone')?.value;
  const email = fhir.telecom?.find((t) => t.system === 'email')?.value;

  // Extract qualifications
  const qualifications = fhir.qualification?.map(
    (q) => q.code.text || q.code.coding?.[0]?.display || ''
  ).filter(Boolean);

  return {
    id: fhir.id,
    identifier_big: big || undefined,
    identifier_agb: agb || undefined,
    name_prefix: name?.prefix?.[0] || undefined,
    name_given: name?.given || [],
    name_family: name?.family || '',
    name_suffix: name?.suffix?.[0] || undefined,
    qualification: qualifications || undefined,
    telecom_phone: phone || undefined,
    telecom_email: email || undefined,
    active: fhir.active ?? true,
  };
}
