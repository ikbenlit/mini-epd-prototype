'use client';

import { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Search, Filter, FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Report } from '@/lib/types/report';
import { TimelineCard } from './timeline-card';

interface ReportTimelineProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  activeReportId?: string | null;
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  behandeladvies: 'Behandeladvies',
  vrije_notitie: 'Vrije notitie',
  intake_verslag: 'Intake verslag',
  behandelplan: 'Behandelplan',
};

const FILTER_THRESHOLD = 10;
const INITIAL_VISIBLE = 20;

export function ReportTimeline({
  reports,
  onSelectReport,
  activeReportId,
  className,
}: ReportTimelineProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [reports]);

  // Gefilterde rapportages
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        !search ||
        report.content.toLowerCase().includes(search.toLowerCase()) ||
        TYPE_LABELS[report.type]?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === 'all' || report.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [reports, search, typeFilter]);

  const visibleReports = useMemo(
    () => filteredReports.slice(0, visibleCount),
    [filteredReports, visibleCount]
  );

  const showFilterSection = reports.length > FILTER_THRESHOLD;
  const hasMore = filteredReports.length > visibleCount;

  const availableTypes = useMemo(() => {
    const types = new Set(reports.map((r) => r.type));
    return Array.from(types);
  }, [reports]);

  return (
    <div className={cn('h-full flex flex-col bg-slate-50', className)}>
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Tijdlijn</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
              {filteredReports.length}
            </span>
          </div>

          {showFilterSection && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                showFilters
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  showFilters && 'rotate-180'
                )}
              />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek in rapportages..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && showFilterSection && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <span className="block text-xs font-medium text-slate-700 mb-1.5">
                  Type rapportage
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                >
                  <option value="all">Alle types</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </label>

              {(typeFilter !== 'all' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setSearch('');
                  }}
                  className="mt-5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <FilePlus2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {reports.length === 0
                  ? 'Nog geen rapportages'
                  : 'Geen resultaten gevonden'}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {reports.length === 0
                  ? 'Maak je eerste rapportage om hier de tijdlijn te zien.'
                  : 'Probeer een andere zoekopdracht of pas de filters aan.'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Wis zoekopdracht
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-3">
            {/* Group by date */}
            {visibleReports.map((report, index) => {
              const prevReport = index > 0 ? visibleReports[index - 1] : null;
              const currentDate = new Date(
                report.created_at
              ).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const prevDate = prevReport
                ? new Date(prevReport.created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : null;

              const showDateDivider = currentDate !== prevDate;

              return (
                <div key={report.id}>
                  {showDateDivider && (
                    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {currentDate}
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                  )}
                  <TimelineCard
                    report={report}
                    onView={() => onSelectReport(report)}
                    isActive={activeReportId === report.id}
                  />
                </div>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE)}
                className="w-full py-3 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
              >
                Meer rapportages laden ({filteredReports.length - visibleCount} resterend)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredReports.length > 0 && (
        <div className="px-6 py-3 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {visibleReports.length} van {filteredReports.length} rapportages
            </span>
            {(search || typeFilter !== 'all') && (
              <span className="text-emerald-600">Gefilterd</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
