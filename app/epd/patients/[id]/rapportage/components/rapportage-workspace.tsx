'use client';

import type { ReactNode } from 'react';
import { useMemo, useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Timer } from 'lucide-react';
import type { Report } from '@/lib/types/report';
import { ReportTimeline } from './report-timeline';
import { ReportComposer } from './report-composer';
import { useMediaQuery } from '@/hooks/use-media-query';

interface RapportageWorkspaceProps {
  patientId: string;
  patientName: string;
  initialReports: Report[];
}

const TYPE_LABELS: Record<string, string> = {
  behandeladvies: 'Behandeladvies',
  vrije_notitie: 'Vrije notitie',
};

export function RapportageWorkspace({ patientId, patientName, initialReports }: RapportageWorkspaceProps) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | keyof typeof TYPE_LABELS>('all');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<'all' | string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [aiFilter, setAiFilter] = useState<'all' | 'ai' | 'manual'>('all');
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [activeTab, setActiveTab] = useState<'timeline' | 'composer'>('timeline');

  useEffect(() => {
    if (!isMobile) {
      setActiveTab('timeline');
    }
  }, [isMobile]);

  const authorOptions = useMemo(() => {
    const unique = Array.from(new Set(reports.map((report) => report.created_by).filter(Boolean)));
    return unique as string[];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      const matchesSearch =
        !search ||
        report.content.toLowerCase().includes(search.toLowerCase()) ||
        report.ai_reasoning?.toLowerCase().includes(search.toLowerCase());
      const matchesAuthor = authorFilter === 'all' || report.created_by === authorFilter;
      const createdAt = report.created_at ? new Date(report.created_at) : null;
      const matchesFrom = !dateFrom || (createdAt && createdAt >= new Date(dateFrom));
      const matchesTo = !dateTo || (createdAt && createdAt <= new Date(`${dateTo}T23:59:59`));
      const matchesAI =
        aiFilter === 'all' ||
        (aiFilter === 'ai' ? report.ai_confidence !== null : report.ai_confidence === null);

      return matchesType && matchesSearch && matchesAuthor && matchesFrom && matchesTo && matchesAI;
    });
  }, [reports, search, typeFilter, authorFilter, dateFrom, dateTo, aiFilter]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId]
  );

  const totalReports = reports.length;
  const aiReports = reports.filter((report) => report.ai_confidence !== null).length;
  const latestReport = reports[0];
  const latestDate = latestReport?.created_at
    ? new Date(latestReport.created_at).toLocaleString('nl-NL')
    : null;

  const handleReportCreated = (report: Report) => {
    setReports((prev) => [report, ...prev]);
    setSelectedReportId(report.id);
  };

  const handleDeleteSuccess = (reportId: string) => {
    setReports((prev) => prev.filter((report) => report.id !== reportId));
    if (selectedReportId === reportId) {
      setSelectedReportId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setAuthorFilter('all');
    setDateFrom('');
    setDateTo('');
    setAiFilter('all');
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">Universele rapportage</p>
        <h1 className="text-2xl font-semibold text-slate-900">Tijdlijn en notities</h1>
        <p className="mt-1 text-sm text-slate-600">
          Alle behandeladviezen en vrije notities voor {patientName} op één plek.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Filter className="h-5 w-5" />}
          label="Totaal rapportages"
          value={totalReports.toString()}
          helper={totalReports > 0 ? 'Inclusief AI-notities' : 'Nog geen rapportages'}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="AI classificaties"
          value={aiReports.toString()}
          helper="Aantal rapportages met AI-bijdrage"
        />
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label="Laatste activiteit"
          value={latestDate ?? '—'}
          helper={latestDate ? 'Recentste rapportage' : 'Nog geen activiteit'}
        />
      </div>

      {isMobile && (
        <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 text-sm font-medium text-slate-500">
          <button
            type="button"
            className={`flex-1 rounded-full py-2 ${
              activeTab === 'timeline' ? 'bg-white text-slate-900 shadow' : ''
            }`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full py-2 ${
              activeTab === 'composer' ? 'bg-white text-slate-900 shadow' : ''
            }`}
            onClick={() => setActiveTab('composer')}
          >
            Nieuwe rapportage
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {(!isMobile || activeTab === 'timeline') && (
          <aside className="space-y-4 lg:w-2/5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Search className="h-3.5 w-3.5" />
                Filters
              </div>
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-600" htmlFor="rapportage-search">
                  Zoeken
                </label>
                <input
                  id="rapportage-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Zoek in rapportages"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-600" htmlFor="rapportage-type">
                  Type
                </label>
                <select
                  id="rapportage-type"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as 'all' | keyof typeof TYPE_LABELS)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900"
                >
                  <option value="all">Alle types</option>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <label className="text-xs font-medium text-slate-600" htmlFor="rapportage-author">
                  Auteur
                </label>
                <select
                  id="rapportage-author"
                  value={authorFilter}
                  onChange={(event) => setAuthorFilter(event.target.value as 'all' | string)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900"
                >
                  <option value="all">Alle auteurs</option>
                  {authorOptions.map((author) => (
                    <option key={author} value={author}>
                      {author || 'Onbekend'}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600" htmlFor="rapportage-date-from">
                      Datum van
                    </label>
                    <input
                      id="rapportage-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600" htmlFor="rapportage-date-to">
                      Datum t/m
                    </label>
                    <input
                      id="rapportage-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">AI</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={aiFilter === 'all'} onClick={() => setAiFilter('all')}>
                      Alles
                    </FilterChip>
                    <FilterChip active={aiFilter === 'ai'} onClick={() => setAiFilter('ai')}>
                      Met AI
                    </FilterChip>
                    <FilterChip active={aiFilter === 'manual'} onClick={() => setAiFilter('manual')}>
                      Handmatig
                    </FilterChip>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:border-teal-200 hover:text-teal-700"
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              </div>
            </div>

            <ReportTimeline
              reports={filteredReports}
              patientId={patientId}
              selectedReportId={selectedReportId}
              onSelect={(report) => setSelectedReportId(report.id)}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </aside>
        )}

        {(!isMobile || activeTab === 'composer') && (
          <div className="lg:w-3/5">
            {isMobile && activeTab === 'composer' && (
              <button
                type="button"
                className="mb-3 inline-flex items-center text-sm font-medium text-teal-600"
                onClick={() => setActiveTab('timeline')}
              >
                ← Terug naar timeline
              </button>
            )}
            <ReportComposer
              patientId={patientId}
              patientName={patientName}
              selectedReport={selectedReport}
              onReportCreated={handleReportCreated}
            />
          </div>
        )}
      </div>
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

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
