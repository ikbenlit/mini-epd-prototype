'use client';

/**
 * PatientListRow Component
 * Compacte rij voor een patiënt in de lijst
 */

import { cn } from '@/lib/utils';
import { AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import type { PatientOverzicht } from '@/lib/types/overdracht';

interface PatientListRowProps {
  patient: PatientOverzicht;
  isSelected: boolean;
  onClick: () => void;
}

function formatPatientName(
  nameGiven: string[],
  nameFamily: string
): string {
  const given = nameGiven[0] || '';
  return `${given} ${nameFamily}`;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function PatientListRow({ patient, isSelected, onClick }: PatientListRowProps) {
  const name = formatPatientName(patient.name_given, patient.name_family);
  const age = calculateAge(patient.birth_date);
  const hasHighRisk = patient.alerts.high_risk_count > 0;
  const hasAbnormalVitals = patient.alerts.abnormal_vitals_count > 0;
  const hasMarkedLogs = patient.alerts.marked_logs_count > 0;
  const hasIncidents = patient.alerts.incident_count > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-150 border-l-4",
        isSelected
          ? "bg-teal-50 border-teal-500"
          : "bg-white border-transparent hover:bg-slate-50",
        hasHighRisk && !isSelected && "border-l-red-400"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
        hasHighRisk
          ? "bg-red-100 text-red-700"
          : isSelected
            ? "bg-teal-100 text-teal-700"
            : "bg-slate-100 text-slate-600"
      )}>
        {patient.name_given[0]?.[0]}{patient.name_family[0]}
      </div>

      {/* Name and age */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isSelected ? "text-teal-900" : "text-slate-900"
        )}>
          {name}
        </p>
        <p className="text-xs text-slate-500">
          {age} jaar • {patient.gender === 'male' ? 'M' : 'V'}
        </p>
      </div>

      {/* Alert badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {hasHighRisk && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium"
            title={`${patient.alerts.high_risk_count} hoog risico${patient.alerts.high_risk_count > 1 ? "'s" : ''}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {patient.alerts.high_risk_count}
          </span>
        )}
        {hasIncidents && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium"
            title={`${patient.alerts.incident_count} incident${patient.alerts.incident_count > 1 ? 'en' : ''}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {patient.alerts.incident_count}
          </span>
        )}
        {hasAbnormalVitals && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium"
            title={`${patient.alerts.abnormal_vitals_count} afwijkende vitale waarde${patient.alerts.abnormal_vitals_count > 1 ? 'n' : ''}`}
          >
            <Activity className="h-3 w-3" />
            {patient.alerts.abnormal_vitals_count}
          </span>
        )}
        {hasMarkedLogs && (
          <span
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs font-medium"
            title={`${patient.alerts.marked_logs_count} voor overdracht`}
          >
            <CheckCircle2 className="h-3 w-3" />
            {patient.alerts.marked_logs_count}
          </span>
        )}
      </div>
    </button>
  );
}
