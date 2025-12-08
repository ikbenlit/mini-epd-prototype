'use client';

/**
 * PatientSelector Component
 * Dropdown voor het selecteren van een patiënt met notitie count badges
 */

import { User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PatientOverzicht } from '@/lib/types/overdracht';

interface PatientSelectorProps {
  patients: PatientOverzicht[];
  selectedId: string | null;
  onSelect: (patientId: string) => void;
  logCounts?: Record<string, number>;
}

function formatPatientName(patient: PatientOverzicht): string {
  const given = patient.name_given.join(' ');
  return `${given} ${patient.name_family}`;
}

export function PatientSelector({
  patients,
  selectedId,
  onSelect,
  logCounts = {},
}: PatientSelectorProps) {
  if (patients.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <User className="h-4 w-4" />
        <span>Geen patiënten beschikbaar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-slate-700">Patiënt:</label>
      <Select value={selectedId || ''} onValueChange={onSelect}>
        <SelectTrigger className="w-[280px] bg-white">
          <SelectValue placeholder="Selecteer een patiënt" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => {
            const count = logCounts[patient.id] || 0;
            return (
              <SelectItem key={patient.id} value={patient.id}>
                <div className="flex items-center justify-between w-full gap-3">
                  <span>{formatPatientName(patient)}</span>
                  {count > 0 && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {count}
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
