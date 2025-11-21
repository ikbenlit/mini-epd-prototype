'use client';

/**
 * Patient List Component (FHIR-based)
 * Displays patients from FHIR API
 */

import { useState } from 'react';
import Link from 'next/link';
import { User, Calendar, Phone, Mail } from 'lucide-react';
import type { FHIRPatient } from '@/lib/fhir';

interface PatientListProps {
  initialPatients: FHIRPatient[];
}

export function PatientList({ initialPatients }: PatientListProps) {
  const [patients] = useState<FHIRPatient[]>(initialPatients);

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <User className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900">Geen patiënten gevonden</h3>
        <p className="mt-2 text-sm text-slate-600">
          Begin met het toevoegen van een nieuwe patiënt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Patiënt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                BSN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Geboortedatum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Geslacht
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {patients.map((patient) => {
              const name = patient.name?.[0];
              const fullName = [
                ...(name?.prefix || []),
                ...(name?.given || []),
                name?.family,
              ]
                .filter(Boolean)
                .join(' ');

              const bsn = patient.identifier?.find(
                (id) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn'
              )?.value;

              const phone = patient.telecom?.find((t) => t.system === 'phone')?.value;
              const email = patient.telecom?.find((t) => t.system === 'email')?.value;

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/epd/patients/${patient.id}`}
                      className="flex items-center group"
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {name?.given?.[0]?.[0]}
                          {name?.family?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 group-hover:text-teal-600 transition-colors">
                          {fullName}
                        </div>
                        <div className="text-sm text-slate-500">ID: {patient.id}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{bsn || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      {patient.birthDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {phone && (
                        <div className="flex items-center text-sm text-slate-900">
                          <Phone className="h-4 w-4 text-slate-400 mr-2" />
                          {phone}
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center text-sm text-slate-900">
                          <Mail className="h-4 w-4 text-slate-400 mr-2" />
                          {email}
                        </div>
                      )}
                      {!phone && !email && (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900 capitalize">
                      {patient.gender === 'male' && 'Man'}
                      {patient.gender === 'female' && 'Vrouw'}
                      {patient.gender === 'other' && 'Anders'}
                      {patient.gender === 'unknown' && 'Onbekend'}
                      {!patient.gender && '-'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
