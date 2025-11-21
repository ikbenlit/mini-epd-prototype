'use client';

/**
 * Patient Form Component (FHIR-based)
 * Form for creating/editing patients using FHIR format
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';
import { createPatient, updatePatient } from '../actions';
import type { FHIRPatient } from '@/lib/fhir';

interface PatientFormProps {
  patient?: FHIRPatient;
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingName = patient?.name?.[0];
  const existingBsn = patient?.identifier?.find(
    (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
  )?.value;
  const existingPhone = patient?.telecom?.find((t) => t.system === 'phone')?.value;
  const existingEmail = patient?.telecom?.find((t) => t.system === 'email')?.value;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Build FHIR Patient resource
      const fhirPatient: FHIRPatient = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://fhir.nl/fhir/NamingSystem/bsn',
            value: formData.get('bsn') as string,
            use: 'official' as const,
          },
        ],
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
      };

      if (patient?.id) {
        // Update existing patient
        await updatePatient(patient.id, fhirPatient);
      } else {
        // Create new patient
        await createPatient(fhirPatient);
      }

      router.push('/epd/patients');
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
            BSN *
          </label>
          <input
            type="text"
            id="bsn"
            name="bsn"
            defaultValue={existingBsn || ''}
            required
            placeholder="123456789"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
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

      {/* Contact Information */}
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
