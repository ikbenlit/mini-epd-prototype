'use client';

/**
 * Diagnosis Overview Card Component
 *
 * Read-only weergave van een diagnose voor het patiënt-breed overzicht.
 * Toont ook de gekoppelde intake informatie.
 */

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DiagnosisWithIntake } from '../actions';

interface DiagnosisOverviewCardProps {
  diagnosis: DiagnosisWithIntake;
  patientId: string;
}

// Status badge configuratie
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: {
    label: 'Actief',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
  },
  remission: {
    label: 'In remissie',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300',
  },
  resolved: {
    label: 'Opgelost',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300',
  },
  inactive: {
    label: 'Inactief',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 border-amber-300',
  },
};

// Severity labels
const SEVERITY_LABELS: Record<string, string> = {
  licht: 'Licht',
  matig: 'Matig',
  ernstig: 'Ernstig',
};

export function DiagnosisOverviewCard({ diagnosis, patientId }: DiagnosisOverviewCardProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  const code = diagnosis.code_code || '';
  const description = diagnosis.code_display || '';
  const severity = diagnosis.severity_display || '';
  const status = diagnosis.clinical_status || 'active';
  const notes = diagnosis.note || '';
  const recordedDate = diagnosis.recorded_date ? new Date(diagnosis.recorded_date) : null;
  const isPrimary = diagnosis.category === 'primary-diagnosis';

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const hasNotes = notes.trim().length > 0;

  // Intake informatie
  const intake = diagnosis.intake;
  const intakeUrl = intake
    ? `/epd/patients/${patientId}/intakes/${intake.id}/diagnosis`
    : null;

  return (
    <Card className="transition-all hover:border-teal-300 hover:shadow-sm">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Code + beschrijving */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900">
              {code && description ? (
                <>
                  <span className="font-mono">{code}</span>
                  {' — '}
                  <span>{description}</span>
                </>
              ) : (
                code || description || 'Geen diagnose code'
              )}
            </h3>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {/* HOOFD badge */}
            {isPrimary && (
              <Badge className="bg-green-600 text-white border-green-700 hover:bg-green-600">
                HOOFD
              </Badge>
            )}

            {/* Status badge */}
            <Badge
              variant="outline"
              className={`text-xs ${statusConfig.color} ${statusConfig.bgColor}`}
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Meta informatie */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {severity && (
            <div>
              <span className="font-medium">Ernst:</span>{' '}
              <span>{SEVERITY_LABELS[severity] || severity}</span>
            </div>
          )}
          {recordedDate && (
            <div>
              <span className="font-medium">Datum:</span>{' '}
              <span>{format(recordedDate, 'd MMM yyyy', { locale: nl })}</span>
            </div>
          )}
        </div>

        {/* Intake link */}
        {intake && intakeUrl && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Intake:</span>
            <Link
              href={intakeUrl}
              className="text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1"
            >
              {intake.title || intake.department || 'Intake'}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Onderbouwing (expand/collapse) */}
        {hasNotes && (
          <div className="border-t border-slate-100 pt-3">
            <button
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className="flex items-center gap-2 w-full text-left text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              {isNotesExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
              <span>Onderbouwing</span>
            </button>
            {isNotesExpanded && (
              <div className="mt-2 pl-6 text-sm text-slate-600 whitespace-pre-line">
                {notes}
              </div>
            )}
          </div>
        )}

        {/* Bewerk link naar intake */}
        {intakeUrl && (
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={intakeUrl}>
                Bewerken in intake
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
