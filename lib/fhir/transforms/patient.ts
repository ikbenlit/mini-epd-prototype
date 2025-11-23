/**
 * FHIR Patient Transforms
 * Convert between Database rows and FHIR Patient resources
 */

import type { Tables, TablesInsert } from '../../supabase/database.types';
import type { FHIRPatient } from '../types';

type PatientRow = Tables<'patients'>;
type PatientInsert = TablesInsert<'patients'>;

/**
 * Transform database Patient row to FHIR Patient resource
 */
export function dbPatientToFHIR(row: PatientRow): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: row.id,

    // Identifiers (BSN, client number)
    identifier: [
      {
        system: 'http://fhir.nl/fhir/NamingSystem/bsn',
        value: row.identifier_bsn || undefined,
        use: 'official' as const,
      },
      row.identifier_client_number
        ? {
            system: 'urn:oid:2.16.840.1.113883.2.4.3.11.999.7.6',
            value: row.identifier_client_number,
            use: 'usual' as const,
          }
        : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined),

    // Active status
    active: row.active ?? true,

    // Name
    name: [
      {
        use: (row.name_use as any) || 'official',
        family: row.name_family,
        given: row.name_given,
        prefix: row.name_prefix ? [row.name_prefix] : undefined,
      },
    ],

    // Telecom (contact)
    telecom: [
      row.telecom_phone
        ? {
            system: 'phone' as const,
            value: row.telecom_phone,
            use: 'mobile' as const,
          }
        : undefined,
      row.telecom_email
        ? {
            system: 'email' as const,
            value: row.telecom_email,
          }
        : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined),

    // Gender
    gender: row.gender,

    // Birth date
    birthDate: row.birth_date,

    // Address
    address: row.address_line
      ? [
          {
            use: 'home',
            line: row.address_line,
            city: row.address_city || undefined,
            postalCode: row.address_postal_code || undefined,
            country: row.address_country || 'NL',
          },
        ]
      : undefined,

    // Contact person (emergency contact)
    contact: row.emergency_contact_name
      ? [
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'C',
                    display: row.emergency_contact_relationship || 'Emergency Contact',
                  },
                ],
              },
            ],
            name: {
              text: row.emergency_contact_name,
            },
            telecom: row.emergency_contact_phone
              ? [
                  {
                    system: 'phone',
                    value: row.emergency_contact_phone,
                  },
                ]
              : undefined,
          },
        ]
      : undefined,

    // General Practitioner
    generalPractitioner: row.general_practitioner_name
      ? [
          {
            display: row.general_practitioner_name,
            identifier: row.general_practitioner_agb
              ? {
                  system: 'http://fhir.nl/fhir/NamingSystem/agb-z',
                  value: row.general_practitioner_agb,
                }
              : undefined,
          },
        ]
      : undefined,

    // Meta (timestamps)
    meta: {
      lastUpdated: row.updated_at || undefined,
    },

    // Extension for episode status (non-standard FHIR, but needed for our workflow)
    extension: [
      row.status
        ? {
            url: 'http://mini-epd.local/fhir/StructureDefinition/episode-status',
            valueCode: row.status,
          }
        : undefined,
      row.is_john_doe
        ? {
            url: 'http://mini-epd.local/fhir/StructureDefinition/john-doe',
            valueBoolean: true,
          }
        : undefined,
      row.insurance_company
        ? {
            url: 'http://mini-epd.local/fhir/StructureDefinition/insurance',
            valueString: JSON.stringify({
              company: row.insurance_company,
              number: row.insurance_number,
            }),
          }
        : undefined,
    ].filter((x): x is NonNullable<typeof x> => x !== undefined),
  };
}

/**
 * Transform FHIR Patient resource to database insert
 */
export function fhirPatientToDB(fhir: FHIRPatient): PatientInsert {
  // Extract BSN from identifiers
  const bsn = fhir.identifier?.find(
    (i) => i.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
  )?.value;

  // Extract client number from identifiers
  const clientNumber = fhir.identifier?.find(
    (i) => i.system === 'urn:oid:2.16.840.1.113883.2.4.3.11.999.7.6'
  )?.value;

  // Extract name (use first name)
  const name = fhir.name?.[0];

  // Extract address (use first address)
  const address = fhir.address?.[0];

  // Extract phone and email from telecom
  const phone = fhir.telecom?.find((t) => t.system === 'phone')?.value;
  const email = fhir.telecom?.find((t) => t.system === 'email')?.value;

  // Extract emergency contact
  const emergencyContact = fhir.contact?.[0];
  const emergencyContactName = emergencyContact?.name?.text;
  const emergencyContactPhone = emergencyContact?.telecom?.find(
    (t) => t.system === 'phone'
  )?.value;
  const emergencyContactRelationship =
    emergencyContact?.relationship?.[0]?.coding?.[0]?.display;

  // Extract general practitioner
  const gp = fhir.generalPractitioner?.[0];
  const gpName = gp?.display;
  const gpAgb = gp?.identifier?.value;

  // Extract status and john_doe from extensions
  const statusExtension = fhir.extension?.find(
    (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/episode-status'
  );
  const johnDoeExtension = fhir.extension?.find(
    (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/john-doe'
  );
  const insuranceExtension = fhir.extension?.find(
    (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/insurance'
  );

  // Parse insurance data from extension
  let insuranceCompany: string | undefined;
  let insuranceNumber: string | undefined;
  if (insuranceExtension?.valueString) {
    try {
      const insuranceData = JSON.parse(insuranceExtension.valueString);
      insuranceCompany = insuranceData.company;
      insuranceNumber = insuranceData.number;
    } catch (e) {
      console.error('Failed to parse insurance extension:', e);
    }
  }

  return {
    id: fhir.id,
    identifier_bsn: bsn || '999999990', // Default placeholder
    identifier_client_number: clientNumber || undefined,
    name_family: name?.family || '',
    name_given: name?.given || [],
    name_prefix: name?.prefix?.[0] || undefined,
    name_use: name?.use || 'official',
    birth_date: fhir.birthDate || '',
    gender: fhir.gender || 'unknown',
    telecom_phone: phone || undefined,
    telecom_email: email || undefined,
    address_line: address?.line || undefined,
    address_city: address?.city || undefined,
    address_postal_code: address?.postalCode || undefined,
    address_country: address?.country || 'NL',
    emergency_contact_name: emergencyContactName || undefined,
    emergency_contact_phone: emergencyContactPhone || undefined,
    emergency_contact_relationship: emergencyContactRelationship || undefined,
    general_practitioner_name: gpName || undefined,
    general_practitioner_agb: gpAgb || undefined,
    active: fhir.active ?? true,
    status: (statusExtension?.valueCode as any) || 'planned',
    is_john_doe: johnDoeExtension?.valueBoolean || false,
    insurance_company: insuranceCompany || undefined,
    insurance_number: insuranceNumber || undefined,
  };
}
