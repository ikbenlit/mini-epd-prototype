'use client';

/**
 * PatientListItem Component
 *
 * Reusable patient list item for search results, recent patients, etc.
 * Extracted from ZoekenBlock for DRY compliance.
 *
 * Epic: E0.S2 (Patient Selectie - Refactor)
 */

import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientSearchResult } from '@/lib/cortex/hooks/use-patient-search';
import { getPatientInitials } from '@/lib/fhir/patient-mapper';

interface PatientListItemProps {
  /** Patient data */
  patient: PatientSearchResult;
  /** Whether this item is currently selected/loading */
  isLoading?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show identifiers (BSN, client number) */
  showIdentifiers?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Calculate age from birth date string
 */
function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function PatientListItem({
  patient,
  isLoading = false,
  onClick,
  size = 'md',
  showIdentifiers = true,
  className,
}: PatientListItemProps) {
  const age = calculateAge(patient.birthDate);
  const initials = getPatientInitials(patient.name);

  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full rounded-lg border text-left transition-colors',
        isSm ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
        isLoading
          ? 'bg-slate-100 border-slate-300 cursor-wait'
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shrink-0',
            isSm ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs'
          )}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'font-medium text-slate-900 truncate',
              isSm ? 'text-xs' : 'text-sm'
            )}
          >
            {patient.name}
            {age !== null && (
              <span className="text-slate-500 font-normal"> ({age} jaar)</span>
            )}
          </div>

          {/* Identifiers - only show on md size */}
          {!isSm &&
            showIdentifiers &&
            (patient.identifier_bsn || patient.identifier_client_number) && (
              <div className="flex items-center gap-3 mt-0.5">
                {patient.identifier_bsn && (
                  <span className="text-xs text-slate-500">
                    BSN: {patient.identifier_bsn}
                  </span>
                )}
                {patient.identifier_client_number && (
                  <span className="text-xs text-slate-500">
                    Client: {patient.identifier_client_number}
                  </span>
                )}
              </div>
            )}
        </div>

        {/* Status icon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
        ) : (
          <Check className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </div>
    </button>
  );
}

/**
 * Empty state component for patient search
 */
export function PatientListEmpty({
  message = 'Geen patienten gevonden',
  submessage,
}: {
  message?: string;
  submessage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
      <p className="text-sm">{message}</p>
      {submessage && <p className="text-xs mt-1">{submessage}</p>}
    </div>
  );
}

/**
 * Loading state component for patient search
 */
export function PatientListLoading({ message = 'Zoeken...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
