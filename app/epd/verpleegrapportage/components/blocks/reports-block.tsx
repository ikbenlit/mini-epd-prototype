/**
 * ReportsBlock Component - Timeline UI
 * Visuele timeline voor rapportages
 * Gegroepeerd per dag met dagdeel headers
 */

import { FileText, Clock, User, Pill, Utensils, AlertTriangle, CheckCircle2, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { Report } from '@/lib/types/overdracht';
import { getVerpleegkundigCategory, CATEGORY_CONFIG, type VerpleegkundigCategory } from '@/lib/types/report';

interface ReportsBlockProps {
  reports: Report[];
}

function getReportTypeLabel(type: string): string {
  const types: Record<string, string> = {
    voortgang: 'Voortgang',
    observatie: 'Observatie',
    incident: 'Incident',
    medicatie: 'Medicatie',
    contact: 'Contact',
    crisis: 'Crisis',
    intake: 'Intake',
    behandeladvies: 'Behandeladvies',
    vrije_notitie: 'Vrije notitie',
    verpleegkundig: 'Verpleegkundig',
  };
  return types[type] || type;
}

function getReportTypeStyle(type: string): { bg: string; text: string } {
  switch (type) {
    case 'incident':
    case 'crisis':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'observatie':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'voortgang':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'medicatie':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'contact':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'intake':
      return { bg: 'bg-teal-100', text: 'text-teal-700' };
    case 'behandeladvies':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'verpleegkundig':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'vrije_notitie':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

function getCategoryIcon(category: VerpleegkundigCategory | null) {
  if (!category) return null;
  switch (category) {
    case 'medicatie':
      return <Pill className="h-3 w-3" />;
    case 'adl':
      return <Utensils className="h-3 w-3" />;
    case 'gedrag':
      return <User className="h-3 w-3" />;
    case 'incident':
      return <AlertTriangle className="h-3 w-3" />;
    case 'observatie':
      return <FileText className="h-3 w-3" />;
    default:
      return null;
  }
}

function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

// Dagdeel helpers
type DayPart = 'nacht' | 'ochtend' | 'middag' | 'avond';

function getDayPart(date: Date): DayPart {
  const hour = date.getHours();
  if (hour >= 0 && hour < 7) return 'nacht';
  if (hour >= 7 && hour < 12) return 'ochtend';
  if (hour >= 12 && hour < 17) return 'middag';
  return 'avond';
}

const DAY_PART_CONFIG: Record<DayPart, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  nacht: { label: 'Nacht', icon: Moon, color: 'text-indigo-600' },
  ochtend: { label: 'Ochtend', icon: Sunrise, color: 'text-amber-600' },
  middag: { label: 'Middag', icon: Sun, color: 'text-yellow-600' },
  avond: { label: 'Avond', icon: Sunset, color: 'text-orange-600' },
};

// Group reports by day and day part
interface GroupedReports {
  date: string;
  dateLabel: string;
  dayParts: {
    part: DayPart;
    reports: Report[];
  }[];
}

function groupReportsByDayAndPart(reports: Report[]): GroupedReports[] {
  const byDay = new Map<string, Report[]>();

  reports.forEach(report => {
    const date = new Date(report.created_at);
    const dayKey = format(date, 'yyyy-MM-dd');
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, []);
    }
    byDay.get(dayKey)!.push(report);
  });

  const sortedDays = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return sortedDays.map(([dayKey, dayReports]) => {
    const date = new Date(dayKey);

    let dateLabel: string;
    if (isToday(date)) {
      dateLabel = 'Vandaag';
    } else if (isYesterday(date)) {
      dateLabel = 'Gisteren';
    } else {
      dateLabel = format(date, 'EEEE d MMMM', { locale: nl });
    }

    const byPart = new Map<DayPart, Report[]>();
    dayReports.forEach(report => {
      const reportDate = new Date(report.created_at);
      const part = getDayPart(reportDate);
      if (!byPart.has(part)) {
        byPart.set(part, []);
      }
      byPart.get(part)!.push(report);
    });

    const partOrder: DayPart[] = ['avond', 'middag', 'ochtend', 'nacht'];
    const dayParts = partOrder
      .filter(part => byPart.has(part))
      .map(part => ({
        part,
        reports: byPart.get(part)!.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }));

    return { date: dayKey, dateLabel, dayParts };
  });
}

export function ReportsBlock({ reports }: ReportsBlockProps) {
  const incidentCount = reports.filter(r => r.type === 'incident' || r.type === 'crisis').length;
  const handoverCount = reports.filter(r => r.include_in_handover).length;
  const groupedReports = groupReportsByDayAndPart(reports);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Rapportages</h2>
              <p className="text-sm text-slate-500">
                {reports.length} rapportages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {handoverCount > 0 && (
              <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                {handoverCount} overdracht
              </span>
            )}
            {incidentCount > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {incidentCount} incident{incidentCount > 1 ? 'en' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {reports.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Geen rapportages gevonden</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {groupedReports.map((dayGroup) => (
            <div key={dayGroup.date}>
              {/* Day Header */}
              <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {dayGroup.dateLabel}
                </span>
              </div>

              {/* Day Parts with Timeline */}
              {dayGroup.dayParts.map((partGroup) => {
                const PartIcon = DAY_PART_CONFIG[partGroup.part].icon;

                return (
                  <div key={partGroup.part}>
                    {/* Day Part Header */}
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50/30">
                      <PartIcon className={`h-3.5 w-3.5 ${DAY_PART_CONFIG[partGroup.part].color}`} />
                      <span className="text-xs font-medium text-slate-500">
                        {DAY_PART_CONFIG[partGroup.part].label}
                      </span>
                    </div>

                    {/* Timeline with reports */}
                    <div className="relative pl-8">
                      {/* Vertical timeline line */}
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

                      {partGroup.reports.map((report, idx) => {
                        const typeStyle = getReportTypeStyle(report.type);
                        const category = report.type === 'verpleegkundig'
                          ? getVerpleegkundigCategory(report.structured_data)
                          : null;
                        const categoryConfig = category ? CATEGORY_CONFIG[category] : null;
                        const isIncident = report.type === 'incident' || report.type === 'crisis' || category === 'incident';
                        const time = format(new Date(report.created_at), 'HH:mm', { locale: nl });
                        const isLast = idx === partGroup.reports.length - 1;

                        return (
                          <div
                            key={report.id}
                            id={`report-${report.id}`}
                            className={`relative py-3 pr-4 transition-all ${!isLast ? 'border-b border-slate-50' : ''}`}
                          >
                            {/* Timeline node */}
                            <div className={`absolute -left-3 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                              isIncident ? 'bg-red-500' : 'bg-indigo-400'
                            }`} />

                            {/* Report content */}
                            <div className="ml-2">
                              {/* Header row */}
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {/* Time */}
                                <span className="text-xs font-medium text-slate-500 w-10">{time}</span>

                                {/* Type badge - verberg voor verpleegkundig (redundant in dit scherm) */}
                                {report.type !== 'verpleegkundig' && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                                    {getReportTypeLabel(report.type)}
                                  </span>
                                )}

                                {/* Category badge for verpleegkundig - altijd tonen */}
                                {category && categoryConfig && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.textColor}`}>
                                    {getCategoryIcon(category)}
                                    {categoryConfig.label}
                                  </span>
                                )}

                                {/* Overdracht badge */}
                                {report.include_in_handover && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">
                                    <CheckCircle2 className="h-3 w-3" />
                                  </span>
                                )}
                              </div>

                              {/* Report content */}
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {truncateContent(report.content)}
                              </p>

                              {/* Author if available */}
                              {report.created_by && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                  <User className="h-3 w-3" />
                                  {report.created_by}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
