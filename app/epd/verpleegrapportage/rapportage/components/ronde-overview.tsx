'use client';

/**
 * RondeOverview Component
 * Overzicht van alle patiënten in de ronde met notitie counts
 */

import { User, CheckCircle2 } from 'lucide-react';
import type { PatientOverzicht } from '@/lib/types/overdracht';

interface RondeOverviewProps {
  patients: PatientOverzicht[];
  selectedId: string | null;
  onSelect: (patientId: string) => void;
  logCounts: Record<string, number>;
  handoverCounts: Record<string, number>;
}

function formatPatientName(patient: PatientOverzicht): string {
  const given = patient.name_given.join(' ');
  return `${given} ${patient.name_family}`;
}

export function RondeOverview({
  patients,
  selectedId,
  onSelect,
  logCounts,
  handoverCounts,
}: RondeOverviewProps) {
  if (patients.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 text-sm">Ronde overzicht</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {patients.map((patient) => {
          const isSelected = patient.id === selectedId;
          const logs = logCounts[patient.id] || 0;
          const handovers = handoverCounts[patient.id] || 0;

          return (
            <button
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                isSelected
                  ? 'bg-teal-50 border-l-4 border-l-teal-500'
                  : 'hover:bg-slate-50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-teal-100' : 'bg-slate-100'
                  }`}
                >
                  <User
                    className={`h-4 w-4 ${
                      isSelected ? 'text-teal-600' : 'text-slate-500'
                    }`}
                  />
                </div>
                <span
                  className={`text-sm ${
                    isSelected ? 'font-medium text-teal-900' : 'text-slate-700'
                  }`}
                >
                  {formatPatientName(patient)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {logs > 0 ? (
                  <span className="text-xs text-slate-500">
                    {logs} {logs === 1 ? 'notitie' : 'notities'}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
                {handovers > 0 && (
                  <span className="flex items-center gap-1 text-xs text-teal-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {handovers}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
