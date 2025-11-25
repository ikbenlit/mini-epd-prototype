"use client";
import React, { useMemo, useCallback, memo } from 'react';
import { Search, MoreVertical, Mic } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { usePatientContext } from './patient-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface EPDHeaderProps {
  className?: string;
}

// Status badge component (compact version)
function StatusBadge({ status }: { status?: string }) {
  const badges = {
    planned: { label: 'Screening', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    active: { label: 'Actief', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    finished: { label: 'Afgerond', className: 'bg-slate-100 text-slate-800 border-slate-200' },
    cancelled: { label: 'Afgemeld', className: 'bg-red-100 text-red-800 border-red-200' },
  };

  const badge = status && status in badges ? badges[status as keyof typeof badges] : null;

  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export const EPDHeader = memo(function EPDHeader({ className = "" }: EPDHeaderProps) {
  const { patient } = usePatientContext();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize patient display data to prevent recalculation on every render
  const patientDisplay = useMemo(() => {
    if (!patient) return null;

    // Extract patient data
    const name = patient.name?.[0];
    const fullName = name
      ? [
          ...(name.prefix || []),
          ...(name.given || []),
          name.family,
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    // Extract status from extension
    const statusExtension = (patient as any)?.extension?.find(
      (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/episode-status'
    );
    const status = statusExtension?.valueCode;

    // Extract birth date
    const birthDate = patient.birthDate
      ? new Date(patient.birthDate).toLocaleDateString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : null;

    // Extract BSN from identifiers
    const bsnIdentifier = patient.identifier?.find(
      (id: any) => id.system === 'http://fhir.nl/fhir/NamingSystem/bsn' ||
                   id.system?.includes('bsn') ||
                   id.type?.coding?.[0]?.code === 'BSN'
    );
    const bsn = bsnIdentifier?.value;

    // Extract last modified
    const lastModified = patient.meta?.lastUpdated
      ? new Date(patient.meta.lastUpdated).toLocaleString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    // Check if John Doe
    const isJohnDoe = (patient as any)?.extension?.find(
      (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/john-doe'
    )?.valueBoolean;

    return { fullName, status, birthDate, bsn, lastModified, isJohnDoe };
  }, [patient]);

  // Stabilize event handler with useCallback
  const handleNewReportClick = useCallback(() => {
    if (!patient?.id) return;
    const rapportagePath = `/epd/patients/${patient.id}/rapportage`;
    const onRapportagePage = pathname?.startsWith(rapportagePath);

    if (onRapportagePage) {
      // Scroll to composer if already on rapportage page
      const element = document.getElementById('rapportage-composer');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        (element as HTMLElement).focus?.();
      }
      return;
    }

    router.push(`${rapportagePath}#rapportage-composer`);
  }, [patient?.id, pathname, router]);

  // Destructure memoized values for cleaner JSX
  const { fullName, status, birthDate, bsn, lastModified, isJohnDoe } = patientDisplay || {};

  return (
    <header className={`h-[60px] bg-white border-b border-slate-200 flex items-center px-6 ${className}`}>
      {/* Left: Patient Info (only when patient exists) */}
      {patient ? (
        <div className="flex items-center gap-4 flex-1">
          {/* Patient Name and Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-900">{fullName}</span>
              {isJohnDoe && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  John Doe
                </span>
              )}
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Patient Details */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {birthDate && <span>Geb: {birthDate}</span>}
            {bsn && <span>BSN: {bsn}</span>}
            <span>ID: {patient.id}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right: Timestamp + Actions + Search */}
      <div className="flex items-center gap-4">
        {/* Last modified timestamp */}
        {patient && lastModified && (
          <div className="text-xs text-slate-500">
            Gewijzigd: {lastModified}
          </div>
        )}

        {/* Actions dropdown (only when patient exists) */}
        {patient && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Acties</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNewReportClick}>
                <Mic className="mr-2 h-4 w-4" />
                Nieuwe rapportage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Zoek patiënt..."
            className="w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </header>
  );
});
