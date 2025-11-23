import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ClipboardList, Sparkles, Timer } from 'lucide-react';
import { getReports } from './actions';
import { ReportTimeline } from './components/report-timeline';

export default async function RapportagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reports = await getReports(id);
  const totalReports = reports.length;
  const latestReport = reports[0];
  const latestDate = latestReport?.created_at
    ? format(new Date(latestReport.created_at), "d MMM yyyy 'om' HH:mm", { locale: nl })
    : null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Universele rapportage</p>
        <h1 className="text-2xl font-semibold text-slate-900">Tijdlijn en notities</h1>
        <p className="mt-1 text-sm text-slate-600">
          Alle behandeladviezen en vrije notities voor deze cliënt op één plek.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Totaal rapportages"
          value={totalReports.toString()}
          helper={totalReports > 0 ? 'Inclusief soft-deletes' : 'Nog geen rapportages'}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="AI classificaties"
          value={`${reports.filter((r) => r.ai_confidence !== null).length}`}
          helper="AI helpt bij type bepaling"
        />
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label="Laatste activiteit"
          value={latestDate ?? '—'}
          helper={latestDate ? 'Recentste rapportage' : 'Nog geen activiteit'}
        />
      </div>

      <ReportTimeline reports={reports} patientId={id} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}
