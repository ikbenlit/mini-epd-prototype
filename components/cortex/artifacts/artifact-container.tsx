'use client';

/**
 * Artifact Container Component
 *
 * Container die meerdere artifacts kan beheren met tabs.
 * Max 3 artifacts tegelijk, tabs alleen zichtbaar bij >1 artifact.
 *
 * Epic: E4 (Artifact Area & Tabs)
 * Story: E4.S1 (ArtifactContainer component)
 */

import { ArtifactTab } from './artifact-tab';
import { ChevronLeft } from 'lucide-react';
import { AgendaBlock, type AgendaBlockProps } from './blocks/agenda-block';
import { DagnotatieBlock } from '../blocks/dagnotitie-block';
import { ZoekenBlock } from '../blocks/zoeken-block';
import { OverdrachtBlock } from '../blocks/overdracht-block';
import { PatientDashboardBlock } from '../blocks/patient-dashboard-block';
import { FallbackPicker } from '../blocks/fallback-picker';
import { APPOINTMENT_TYPES, type AppointmentTypeCode, type LocationClassCode } from '@/app/epd/agenda/types';
import type { Artifact, BlockType } from '@/stores/cortex-store';
import { parseRelativeDate, isDateRange } from '@/lib/cortex/date-time-parser';

interface ArtifactContainerProps {
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onCloseArtifact: (id: string) => void;
}

type AgendaIntent = 'agenda_query' | 'create_appointment' | 'cancel_appointment' | 'reschedule_appointment';
type AgendaMode = AgendaBlockProps['mode'];

const AGENDA_MODE_MAP: Record<AgendaIntent, AgendaMode> = {
  agenda_query: 'list',
  create_appointment: 'create',
  cancel_appointment: 'cancel',
  reschedule_appointment: 'reschedule',
};

const LOCATION_CODE_MAP: Record<string, LocationClassCode> = {
  praktijk: 'AMB',
  online: 'VR',
  thuis: 'HH',
};

function coerceDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return undefined;
}

function coerceDateRange(raw: any): AgendaBlockProps['dateRange'] | undefined {
  const label = typeof raw?.label === 'string' ? raw.label : undefined;
  if (!label) return undefined;

  return {
    start: coerceDate(raw?.start),
    end: coerceDate(raw?.end),
    label,
  };
}

function resolveAppointmentType(value: unknown): AppointmentTypeCode | undefined {
  if (typeof value !== 'string') return undefined;
  if (value in APPOINTMENT_TYPES) return value as AppointmentTypeCode;
  return undefined;
}

function resolveLocation(value: unknown): LocationClassCode | undefined {
  if (typeof value !== 'string') return undefined;
  if (value in LOCATION_CODE_MAP) return LOCATION_CODE_MAP[value];
  if (value === 'AMB' || value === 'VR' || value === 'HH') return value;
  return undefined;
}

/**
 * Convert date label to Date using central date-time-parser (DRY)
 */
function resolveDateFromLabel(label?: string): Date | null {
  if (!label) return null;

  const parsed = parseRelativeDate(label);
  if (!parsed) return null;

  // DateRange → return start date
  if (isDateRange(parsed)) return parsed.start;

  return parsed;
}

function buildAgendaPrefill(prefill: Record<string, any> | undefined): AgendaBlockProps['prefillData'] {
  if (!prefill || typeof prefill !== 'object') return undefined;

  const patient =
    prefill.patient ||
    (prefill.patientName || prefill.patientId
      ? {
        id: prefill.patientId || '',
        name: prefill.patientName || '',
      }
      : undefined);

  // Try to resolve date from label first (more reliable than AI-generated dates)
  const dateLabel = prefill?.datetime?.label || prefill?.dateRange?.label;
  const resolvedDate = resolveDateFromLabel(dateLabel);

  const datetimeDate =
    resolvedDate ||  // Prefer calculated date from label
    coerceDate(prefill?.datetime?.date) ||
    (prefill?.datetime?.time ? new Date() : undefined);

  const datetime = datetimeDate
    ? {
      date: datetimeDate,
      time: typeof prefill?.datetime?.time === 'string' ? prefill.datetime.time : '',
    }
    : undefined;

  const appointmentType = resolveAppointmentType(prefill?.appointmentType || prefill?.type);
  const location = resolveLocation(prefill?.location);

  // Also resolve newDatetime from label
  const newDateLabel = prefill?.newDatetime?.label;
  const resolvedNewDate = resolveDateFromLabel(newDateLabel);

  const newDatetimeDate =
    resolvedNewDate ||  // Prefer calculated date from label
    coerceDate(prefill?.newDatetime?.date) ||
    (prefill?.newDatetime?.time ? new Date() : undefined);
  const newDatetime = newDatetimeDate
    ? {
      date: newDatetimeDate,
      time: typeof prefill?.newDatetime?.time === 'string' ? prefill.newDatetime.time : '',
    }
    : undefined;

  return {
    patient,
    datetime,
    type: appointmentType,
    location,
    notes: typeof prefill?.notes === 'string' ? prefill.notes : undefined,
    identifier: prefill?.identifier,
    newDatetime,
  };
}

/**
 * Render the appropriate block component based on artifact type
 */
function renderArtifactBlock(artifact: Artifact, onCloseArtifact: (id: string) => void) {
  switch (artifact.type) {
    case 'dagnotitie':
      return <DagnotatieBlock key={artifact.id} prefill={artifact.prefill} />;
    case 'zoeken':
      return <ZoekenBlock key={artifact.id} prefill={artifact.prefill} />;
    case 'overdracht':
      return <OverdrachtBlock key={artifact.id} prefill={artifact.prefill} />;
    case 'agenda_query':
    case 'create_appointment':
    case 'cancel_appointment':
    case 'reschedule_appointment': {
      const agendaType = artifact.type as AgendaIntent;
      const rawPrefill = artifact.prefill as Record<string, any>;
      const dateRange = coerceDateRange(rawPrefill?.dateRange);
      const prefillData = buildAgendaPrefill(rawPrefill);
      const appointments = Array.isArray(rawPrefill?.appointments)
        ? rawPrefill.appointments
        : undefined;
      const disambiguationOptions = Array.isArray(rawPrefill?.disambiguationOptions)
        ? rawPrefill.disambiguationOptions
        : undefined;

      return (
        <AgendaBlock
          key={artifact.id}
          mode={AGENDA_MODE_MAP[agendaType]}
          appointments={appointments}
          dateRange={dateRange}
          prefillData={prefillData}
          disambiguationOptions={disambiguationOptions}
          onClose={() => onCloseArtifact(artifact.id)}
        />
      );
    }
    case 'patient-dashboard':
      return <PatientDashboardBlock key={artifact.id} prefill={artifact.prefill} />;
    case 'fallback':
      return <FallbackPicker key={artifact.id} originalInput={artifact.prefill?.content} />;
    default:
      return (
        <div className="p-4 text-slate-500">
          Onbekend artifact type: {artifact.type}
        </div>
      );
  }
}

/**
 * Get user-friendly title for artifact type
 */
export function getArtifactTitle(type: BlockType, prefill?: any): string {
  switch (type) {
    case 'dagnotitie':
      return prefill?.patientName
        ? `Dagnotitie - ${prefill.patientName}`
        : 'Dagnotitie';
    case 'zoeken':
      return 'Patiënt Zoeken';
    case 'overdracht':
      return 'Dienst Overdracht';
    case 'agenda_query':
      return 'Agenda';
    case 'create_appointment':
      return prefill?.patientName
        ? `Nieuwe afspraak - ${prefill.patientName}`
        : 'Nieuwe afspraak';
    case 'cancel_appointment':
      return 'Afspraak annuleren';
    case 'reschedule_appointment':
      return 'Afspraak verzetten';
    case 'fallback':
      return 'Kies een actie';
    case 'patient-dashboard':
      return prefill?.patientName
        ? `Dashboard - ${prefill.patientName}`
        : 'Patiëntoverzicht';
    default:
      return 'Artifact';
  }
}

export function ArtifactContainer({
  artifacts,
  activeArtifactId,
  onSelectArtifact,
  onCloseArtifact,
}: ArtifactContainerProps) {
  // Find active artifact
  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId);

  // Show placeholder if no artifacts
  if (artifacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg text-center text-slate-500">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-slate-700 mb-3">
            Artifacts verschijnen hier
          </h3>
          <p className="text-sm">
            Vraag me iets in de chat om te beginnen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Tabs - alleen tonen bij >1 artifact */
        /* Echter op mobile: ALTIJD een header tonen met back knop als er een artifact open is */
      }

      {/* Mobile Header: Back button + Title */}
      <div className="lg:hidden flex items-center p-3 border-b border-slate-200 bg-white sticky top-0 z-10">
        <button
          onClick={() => activeArtifact && onCloseArtifact(activeArtifact.id)}
          className="flex items-center text-slate-600 hover:text-slate-900 mr-3"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Terug</span>
        </button>
        <span className="font-semibold text-slate-800 truncate flex-1">
          {activeArtifact ? activeArtifact.title : 'Details'}
        </span>
      </div>

      {artifacts.length > 1 && (
        <div className="hidden lg:flex bg-white border-b border-slate-200 justify-center">
          {artifacts.map((artifact) => (
            <ArtifactTab
              key={artifact.id}
              artifact={artifact}
              isActive={artifact.id === activeArtifactId}
              onSelect={onSelectArtifact}
              onClose={onCloseArtifact}
            />
          ))}
        </div>
      )}

      {/* Active artifact content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto bg-slate-50">
        {activeArtifact ? (
          <div key={activeArtifact.id} className="artifact-enter w-full flex justify-center">
            {renderArtifactBlock(activeArtifact, onCloseArtifact)}
          </div>
        ) : (
          <div className="text-slate-500">
            Selecteer een artifact om te bekijken
          </div>
        )}
      </div>
    </div>
  );
}
