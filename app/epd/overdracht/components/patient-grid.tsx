'use client';

/**
 * PatientGrid Component
 * E4.S1: Grid van PatientCards met filter tabs
 */

import { useState } from 'react';
import { PatientCard } from './patient-card';
import type { PatientOverzicht } from '@/lib/types/overdracht';
import { Users, AlertTriangle } from 'lucide-react';

interface PatientGridProps {
  patients: PatientOverzicht[];
}

type FilterType = 'all' | 'alerts';

export function PatientGrid({ patients }: PatientGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredPatients = filter === 'alerts'
    ? patients.filter(p => p.alerts.total > 0)
    : patients;

  const alertCount = patients.filter(p => p.alerts.total > 0).length;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all
            ${filter === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }
          `}
        >
          <Users className="h-4 w-4" />
          Alle patiënten
          <span className={`
            px-2 py-0.5 rounded-full text-xs
            ${filter === 'all' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}
          `}>
            {patients.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('alerts')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all
            ${filter === 'alerts'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }
          `}
        >
          <AlertTriangle className="h-4 w-4" />
          Met alerts
          <span className={`
            px-2 py-0.5 rounded-full text-xs
            ${filter === 'alerts' ? 'bg-teal-500 text-white' : 'bg-red-100 text-red-600'}
          `}>
            {alertCount}
          </span>
        </button>
      </div>

      {/* Patient Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {filter === 'alerts' ? 'Geen patiënten met alerts' : 'Geen patiënten vandaag'}
          </h3>
          <p className="text-sm text-slate-600">
            {filter === 'alerts'
              ? 'Er zijn geen patiënten met hoog risico, afwijkende vitals of gemarkeerde notities.'
              : 'Er zijn geen patiënten met een encounter gepland voor vandaag.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
