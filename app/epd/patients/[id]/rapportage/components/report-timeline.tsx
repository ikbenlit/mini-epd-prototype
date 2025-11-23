'use client';

import { useEffect, useMemo, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import type { Report } from '@/lib/types/report';
import { deleteReport } from '../actions';
import { ReportCard } from './report-card';
import { toast } from '@/hooks/use-toast';

interface ReportTimelineProps {
  reports: Report[];
  patientId: string;
  selectedReportId?: string | null;
  onSelect?: (report: Report) => void;
  onDeleteSuccess?: (reportId: string) => void;
}

const INITIAL_VISIBLE = 20;

export function ReportTimeline({
  reports,
  patientId,
  selectedReportId,
  onSelect,
  onDeleteSuccess,
}: ReportTimelineProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [reports]);

  const visibleReports = useMemo(() => reports.slice(0, visibleCount), [reports, visibleCount]);

  const handleDelete = async (reportId: string) => {
    setDeletingId(reportId);
    try {
      await deleteReport(patientId, reportId);
      onDeleteSuccess?.(reportId);
      toast({
        title: 'Rapportage verwijderd',
        description: 'De rapportage is verwijderd uit de tijdlijn.',
      });
    } catch (error) {
      console.error('Failed to delete report', error);
      toast({
        variant: 'destructive',
        title: 'Verwijderen mislukt',
        description:
          error instanceof Error ? error.message : 'Probeer het later opnieuw.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400">
          <FilePlus2 className="h-6 w-6" />
        </div>
        <p className="text-base font-semibold text-slate-900">Nog geen rapportages</p>
        <p className="mt-1 text-sm text-slate-500">
          Klik op "Nieuwe rapportage" in de header om de eerste rapportage vast te leggen.
        </p>
      </div>
    );
  }

  const hasMore = reports.length > visibleCount;

  return (
    <div className="space-y-4">
      {visibleReports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDelete={() => handleDelete(report.id)}
          isDeleting={deletingId === report.id}
          onSelect={() => onSelect?.(report)}
          isSelected={selectedReportId === report.id}
        />
      ))}
      {hasMore && (
        <button
          type="button"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:text-teal-700"
          onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE)}
        >
          Meer rapportages laden
        </button>
      )}
    </div>
  );
}
