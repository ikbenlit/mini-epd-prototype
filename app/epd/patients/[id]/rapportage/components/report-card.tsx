'use client';

import { Loader2, Trash2, FilePenLine, FileText } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { Report } from '@/lib/types/report';
import { cn } from '@/lib/utils';

const TYPE_META = {
  behandeladvies: {
    label: 'Behandeladvies',
    classes: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: FilePenLine,
  },
  vrije_notitie: {
    label: 'Vrije notitie',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText,
  },
} as const;

interface ReportCardProps {
  report: Report;
  onDelete?: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function ReportCard({ report, onDelete, isDeleting }: ReportCardProps) {
  const meta = TYPE_META[report.type as keyof typeof TYPE_META] ?? TYPE_META.vrije_notitie;
  const Icon = meta.icon;
  const createdAt = report.created_at ? new Date(report.created_at) : null;
  const relativeTime = createdAt
    ? formatDistanceToNow(createdAt, { addSuffix: true, locale: nl })
    : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border bg-white',
              meta.classes
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
              {report.ai_confidence !== null && report.ai_confidence !== undefined && (
                <span className="text-xs font-medium text-slate-500">
                  AI {Math.round(report.ai_confidence * 100)}%
                </span>
              )}
            </div>
            {createdAt && (
              <p className="text-xs text-slate-500">
                {format(createdAt, "d MMM yyyy 'om' HH:mm", { locale: nl })}
                {relativeTime && <span className="ml-2">({relativeTime})</span>}
              </p>
            )}
            {report.created_by && (
              <p className="text-xs text-slate-400">Aangemaakt door {report.created_by}</p>
            )}
          </div>
        </div>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-red-600"
            disabled={isDeleting}
            onClick={() => void onDelete()}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Verwijderen…
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" /> Verwijder
              </>
            )}
          </Button>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        {truncateContent(report.content)}
      </p>

      {report.ai_reasoning && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">AI toelichting</p>
          <p className="mt-1 text-slate-600">{report.ai_reasoning}</p>
        </div>
      )}
    </article>
  );
}

function truncateContent(content: string, maxLength = 320) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}…`;
}
