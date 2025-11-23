'use client';

/**
 * Client Header Component
 * E2.S3: Context-aware header showing client name, status, last modified en acties
 */

import { Mic } from 'lucide-react';
import type { FHIRPatient } from '@/lib/fhir';
import { Button } from '@/components/ui/button';

interface ClientHeaderProps {
  patient: FHIRPatient;
  onNewReport?: () => void;
}

// Status badge component
function StatusBadge({ status }: { status?: string }) {
  const badges = {
    planned: { label: 'Screening', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    active: { label: 'Actief', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    finished: { label: 'Afgerond', className: 'bg-slate-100 text-slate-800 border-slate-200' },
    cancelled: { label: 'Afgemeld', className: 'bg-red-100 text-red-800 border-red-200' },
  };

  const badge = status && status in badges ? badges[status as keyof typeof badges] : null;

  if (!badge) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function ClientHeader({ patient, onNewReport }: ClientHeaderProps) {
  // Extract name
  const name = patient.name?.[0];
  const fullName = [
    ...(name?.prefix || []),
    ...(name?.given || []),
    name?.family,
  ]
    .filter(Boolean)
    .join(' ');

  // Extract status from extension
  const statusExtension = (patient as any).extension?.find(
    (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/episode-status'
  );
  const status = statusExtension?.valueCode;

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
  const isJohnDoe = (patient as any).extension?.find(
    (ext: any) => ext.url === 'http://mini-epd.local/fhir/StructureDefinition/john-doe'
  )?.valueBoolean;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Name and John Doe indicator */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            {isJohnDoe && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                John Doe
              </span>
            )}
          </div>

          {/* Status and Last Modified */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status={status} />
            </div>
            {lastModified && (
              <div className="flex items-center gap-2 text-slate-500">
                <span>Laatst gewijzigd:</span>
                <span className="font-medium text-slate-700">{lastModified}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            ID: {patient.id}
          </div>
          {onNewReport && (
            <Button type="button" size="sm" onClick={onNewReport}>
              <Mic className="mr-2 h-4 w-4" /> Nieuwe rapportage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
