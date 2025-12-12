'use client';

/**
 * Diagnose Card Component
 *
 * Visuele weergave van een diagnose met badges, expand/collapse en acties.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Condition } from '../../actions';

interface DiagnosisCardProps {
  diagnosis: Condition;
  isPrimary?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
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
  'entered-in-error': {
    label: 'Foutief',
    color: 'text-red-700',
    bgColor: 'bg-red-100 border-red-300',
  },
};

// Severity labels
const SEVERITY_LABELS: Record<string, string> = {
  licht: 'Licht',
  matig: 'Matig',
  ernstig: 'Ernstig',
};

export function DiagnosisCard({
  diagnosis,
  isPrimary = false,
  onEdit,
  onDelete,
  isDeleting = false,
}: DiagnosisCardProps) {
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  const code = diagnosis.code_code || '';
  const description = diagnosis.code_display || '';
  const severity = diagnosis.severity_display || '';
  const status = diagnosis.clinical_status || 'active';
  const notes = diagnosis.note || '';
  const recordedDate = diagnosis.recorded_date
    ? new Date(diagnosis.recorded_date)
    : null;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const hasNotes = notes.trim().length > 0;

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

          {/* Badges en menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* HOOFD badge */}
            {isPrimary && (
              <Badge
                className="bg-green-600 text-white border-green-700 hover:bg-green-600"
              >
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

            {/* Context menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  disabled={isDeleting}
                  aria-label="Meer opties"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} disabled={isDeleting}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bewerken
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      </CardContent>
    </Card>
  );
}

