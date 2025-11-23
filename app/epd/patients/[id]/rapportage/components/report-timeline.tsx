'use client';

import { useEffect, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import type { Report } from '@/lib/types/report';
import { deleteReport } from '../actions';
import { ReportCard } from './report-card';
import { toast } from '@/hooks/use-toast';

interface ReportTimelineProps {
  reports: Report[];
  patientId: string;
}

export function ReportTimeline({ reports, patientId }: ReportTimelineProps) {
  const [items, setItems] = useState(reports);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(reports);
  }, [reports]);

  const handleDelete = async (reportId: string) => {
    setDeletingId(reportId);
    try {
      await deleteReport(patientId, reportId);
      setItems((prev) => prev.filter((report) => report.id !== reportId));
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

  if (items.length === 0) {
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

  return (
    <div className="space-y-4">
      {items.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onDelete={() => handleDelete(report.id)}
          isDeleting={deletingId === report.id}
        />
      ))}
    </div>
  );
}
