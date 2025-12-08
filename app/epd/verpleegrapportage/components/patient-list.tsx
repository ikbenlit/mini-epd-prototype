'use client';

/**
 * PatientList Component
 * Linker kolom met patiëntenlijst en filter tabs
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Users, AlertTriangle } from 'lucide-react';
import type { PatientOverzicht } from '@/lib/types/overdracht';
import { PatientListRow } from './patient-list-row';
import { PeriodSelector } from './period-selector';

interface PatientListProps {
  patients: PatientOverzicht[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

type FilterType = 'all' | 'alerts';

export function PatientList({ patients, selectedPatientId, onSelectPatient }: PatientListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter patients based on selected filter
  // "Met alerts" = alleen echte alerts (hoge risico's, incidenten, afwijkende vitals), niet overdracht notities
  const hasRealAlerts = (p: PatientOverzicht) =>
    p.alerts.high_risk_count > 0 || p.alerts.incident_count > 0 || p.alerts.abnormal_vitals_count > 0;

  const filteredPatients = filter === 'alerts'
    ? patients.filter(hasRealAlerts)
    : patients;

  const alertsCount = patients.filter(hasRealAlerts).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header with filter tabs */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Patiënten</h2>
          <span className="text-sm text-slate-500">({patients.length})</span>
        </div>

        {/* Periode selector */}
        <div className="mb-3">
          <PeriodSelector />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === 'all'
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Alle ({patients.length})
          </button>
          <button
            onClick={() => setFilter('alerts')}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
              filter === 'alerts'
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Met alerts ({alertsCount})
          </button>
        </div>
      </div>

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientListRow
              key={patient.id}
              patient={patient}
              isSelected={selectedPatientId === patient.id}
              onClick={() => onSelectPatient(patient.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {filter === 'alerts'
                ? 'Geen patiënten met alerts'
                : 'Geen patiënten gevonden'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
