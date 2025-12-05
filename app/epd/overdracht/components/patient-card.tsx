'use client';

/**
 * PatientCard Component
 * E4.S2: Naam, leeftijd, alert badge (rood=hoog risico), doorklik
 */

import Link from 'next/link';
import { AlertTriangle, User, ChevronRight, Activity, FileText, ShieldAlert } from 'lucide-react';
import type { PatientOverzicht } from '@/lib/types/overdracht';

interface PatientCardProps {
  patient: PatientOverzicht;
}

function formatPatientName(nameGiven: string[], nameFamily: string): string {
  const given = nameGiven.join(' ');
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

function getGenderLabel(gender: string): string {
  switch (gender) {
    case 'male': return 'M';
    case 'female': return 'V';
    default: return 'O';
  }
}

export function PatientCard({ patient }: PatientCardProps) {
  const name = formatPatientName(patient.name_given, patient.name_family);
  const age = calculateAge(patient.birth_date);
  const genderLabel = getGenderLabel(patient.gender);
  const hasAlerts = patient.alerts.total > 0;
  const hasHighRisk = patient.alerts.high_risk_count > 0;

  return (
    <Link
      href={`/epd/overdracht/${patient.id}`}
      className={`
        block bg-white rounded-xl border transition-all
        hover:shadow-md hover:border-slate-300
        ${hasHighRisk ? 'border-red-200' : 'border-slate-200'}
      `}
    >
      <div className="p-4">
        {/* Header with name and alert badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${hasHighRisk ? 'bg-red-100' : 'bg-slate-100'}
            `}>
              <User className={`h-5 w-5 ${hasHighRisk ? 'text-red-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 line-clamp-1">{name}</h3>
              <p className="text-sm text-slate-500">
                {age} jaar • {genderLabel}
              </p>
            </div>
          </div>
          {hasAlerts && (
            <span className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${hasHighRisk ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
            `}>
              <AlertTriangle className="h-3 w-3" />
              {patient.alerts.total}
            </span>
          )}
        </div>

        {/* Alert details */}
        {hasAlerts && (
          <div className="flex flex-wrap gap-2 mb-3">
            {patient.alerts.high_risk_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">
                <ShieldAlert className="h-3 w-3" />
                {patient.alerts.high_risk_count} hoog risico
              </span>
            )}
            {patient.alerts.abnormal_vitals_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs">
                <Activity className="h-3 w-3" />
                {patient.alerts.abnormal_vitals_count} afwijkend
              </span>
            )}
            {patient.alerts.marked_logs_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                <FileText className="h-3 w-3" />
                {patient.alerts.marked_logs_count} notitie
              </span>
            )}
          </div>
        )}

        {/* Footer with link indicator */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
          <span>Bekijk overdracht</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
