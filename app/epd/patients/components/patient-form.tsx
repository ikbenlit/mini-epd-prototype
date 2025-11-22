'use client';

/**
 * Patient Form Component
 * E2.S2: Nieuwe Cliënt Flow met John Doe logica
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { createPatient, updatePatient } from '../actions';
import type { FHIRPatient } from '@/lib/fhir';

interface PatientFormProps {
  patient?: FHIRPatient;
}

// BSN validation (Modulo-11 check)
function validateBSN(bsn: string): boolean {
  if (!bsn || bsn.length !== 9) return false;

  const digits = bsn.split('').map(Number);
  if (digits.some(isNaN)) return false;

  // Modulo-11 check
  const sum = digits.reduce((acc, digit, index) => {
    if (index < 8) {
      return acc + digit * (9 - index);
    }
    return acc - digit;
  }, 0);

  return sum % 11 === 0;
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJohnDoe, setIsJohnDoe] = useState(
    patient?.extension?.find(
      (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/john-doe'
    )?.valueBoolean || false
  );

  const existingName = patient?.name?.[0];
  const existingBsn = patient?.identifier?.find(
    (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
  )?.value;
  const existingPhone = patient?.telecom?.find((t) => t.system === 'phone')?.value;
  const existingEmail = patient?.telecom?.find((t) => t.system === 'email')?.value;
  const existingAddress = patient?.address?.[0];

  // Extract insurance data from extension
  const insuranceExtension = patient?.extension?.find(
    (ext) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/insurance'
  );
  let existingInsurance: { company?: string; number?: string } = {};
  if (insuranceExtension?.valueString) {
    try {
      existingInsurance = JSON.parse(insuranceExtension.valueString);
    } catch (e) {
      console.error('Failed to parse insurance extension:', e);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const bsnValue = formData.get('bsn') as string;

      // Validate BSN if not John Doe
      if (!isJohnDoe && bsnValue) {
        if (!validateBSN(bsnValue)) {
          throw new Error('Ongeldig BSN nummer. Controleer het nummer en probeer opnieuw.');
        }
      }

      // Build FHIR Patient resource
      const fhirPatient: FHIRPatient = {
        resourceType: 'Patient',
        identifier: bsnValue
          ? [
              {
                system: 'http://fhir.nl/fhir/NamingSystem/bsn',
                value: bsnValue,
                use: 'official' as const,
              },
            ]
          : [],
        name: [
          {
            use: 'official' as const,
            family: formData.get('family') as string,
            given: [formData.get('given') as string].filter(Boolean),
            prefix: formData.get('prefix')
              ? [(formData.get('prefix') as string)]
              : undefined,
          },
        ],
        gender: formData.get('gender') as 'male' | 'female' | 'other' | 'unknown',
        birthDate: formData.get('birthDate') as string,

        // Address
        address: formData.get('addressLine') || formData.get('city') || formData.get('postalCode')
          ? [
              {
                use: 'home',
                line: formData.get('addressLine') ? [formData.get('addressLine') as string] : undefined,
                city: formData.get('city') as string || undefined,
                postalCode: formData.get('postalCode') as string || undefined,
                country: 'NL',
              },
            ]
          : undefined,

        // Contact
        telecom: [
          formData.get('phone')
            ? {
                system: 'phone' as const,
                value: formData.get('phone') as string,
                use: 'mobile' as const,
              }
            : undefined,
          formData.get('email')
            ? {
                system: 'email' as const,
                value: formData.get('email') as string,
              }
            : undefined,
        ].filter((t): t is NonNullable<typeof t> => t !== undefined),

        active: true,

        // Extensions for status and john_doe
        extension: [
          {
            url: 'http://mini-epd.local/fhir/StructureDefinition/episode-status',
            valueCode: 'planned', // Always set to planned for new patients
          },
          isJohnDoe
            ? {
                url: 'http://mini-epd.local/fhir/StructureDefinition/john-doe',
                valueBoolean: true,
              }
            : undefined,
          // Insurance extension (custom)
          formData.get('insuranceCompany')
            ? {
                url: 'http://mini-epd.local/fhir/StructureDefinition/insurance',
                valueString: JSON.stringify({
                  company: formData.get('insuranceCompany'),
                  number: formData.get('insuranceNumber'),
                }),
              }
            : undefined,
        ].filter((ext): ext is NonNullable<typeof ext> => ext !== undefined),
      };

      let createdPatient: FHIRPatient;

      if (patient?.id) {
        // Update existing patient
        createdPatient = await updatePatient(patient.id, fhirPatient);
      } else {
        // Create new patient
        createdPatient = await createPatient(fhirPatient);
      }

      // Redirect to patient detail page
      if (createdPatient.id) {
        router.push(`/epd/patients/${createdPatient.id}`);
      } else {
        router.push('/epd/patients');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* John Doe Checkbox */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isJohnDoe}
            onChange={(e) => setIsJohnDoe(e.target.checked)}
            className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-slate-900">
              Dit is een John Doe (crisis opname)
            </span>
            <p className="text-xs text-slate-600 mt-1">
              Voor crisis situaties kunnen gegevens later worden aangevuld. BSN is dan optioneel.
            </p>
          </div>
        </label>
      </div>

      {/* John Doe Warning */}
      {isJohnDoe && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">John Doe registratie</p>
            <p className="text-xs text-blue-700 mt-1">
              Gegevens kunnen later worden aangevuld. Vul BSN aan zodra deze beschikbaar is.
            </p>
          </div>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="prefix" className="block text-sm font-medium text-slate-700 mb-1">
            Voorvoegsel
          </label>
          <input
            type="text"
            id="prefix"
            name="prefix"
            defaultValue={existingName?.prefix?.[0] || ''}
            placeholder="Dhr./Mevr."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="given" className="block text-sm font-medium text-slate-700 mb-1">
            Voornaam *
          </label>
          <input
            type="text"
            id="given"
            name="given"
            defaultValue={existingName?.given?.[0] || ''}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="family" className="block text-sm font-medium text-slate-700 mb-1">
            Achternaam *
          </label>
          <input
            type="text"
            id="family"
            name="family"
            defaultValue={existingName?.family || ''}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* BSN and Birth Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bsn" className="block text-sm font-medium text-slate-700 mb-1">
            BSN {!isJohnDoe && '*'}
          </label>
          <input
            type="text"
            id="bsn"
            name="bsn"
            defaultValue={existingBsn || ''}
            required={!isJohnDoe}
            placeholder="123456789"
            maxLength={9}
            pattern="[0-9]{9}"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-500 mt-1">9 cijfers, inclusief modulo-11 check</p>
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700 mb-1">
            Geboortedatum *
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            defaultValue={patient?.birthDate || ''}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
          Geslacht *
        </label>
        <select
          id="gender"
          name="gender"
          defaultValue={patient?.gender || 'unknown'}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="male">Man</option>
          <option value="female">Vrouw</option>
          <option value="other">Anders</option>
          <option value="unknown">Onbekend</option>
        </select>
      </div>

      {/* Address Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Adresgegevens</h3>
        <div>
          <label htmlFor="addressLine" className="block text-sm font-medium text-slate-700 mb-1">
            Adres
          </label>
          <input
            type="text"
            id="addressLine"
            name="addressLine"
            defaultValue={existingAddress?.line?.[0] || ''}
            placeholder="Straatnaam 123"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              defaultValue={existingAddress?.postalCode || ''}
              placeholder="1234 AB"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
              Woonplaats
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={existingAddress?.city || ''}
              placeholder="Amsterdam"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Contactgegevens</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Telefoonnummer
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={existingPhone || ''}
              placeholder="+31612345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={existingEmail || ''}
              placeholder="patient@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Verzekering</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="insuranceCompany" className="block text-sm font-medium text-slate-700 mb-1">
              Verzekeraar
            </label>
            <input
              type="text"
              id="insuranceCompany"
              name="insuranceCompany"
              defaultValue={existingInsurance.company || ''}
              placeholder="Zilveren Kruis"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="insuranceNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Polisnummer
            </label>
            <input
              type="text"
              id="insuranceNumber"
              name="insuranceNumber"
              defaultValue={existingInsurance.number || ''}
              placeholder="123456789"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opslaan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{patient ? 'Bijwerken' : 'Aanmaken'}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}
