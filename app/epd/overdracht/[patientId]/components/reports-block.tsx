/**
 * ReportsBlock Component
 * E5.S2: Rapportages laatste 24 uur
 */

import { FileText, Clock, User } from 'lucide-react';
import type { Report } from '@/lib/types/overdracht';

interface ReportsBlockProps {
  reports: Report[];
}

function getReportTypeLabel(type: string): string {
  const types: Record<string, string> = {
    voortgang: 'Voortgang',
    observatie: 'Observatie',
    incident: 'Incident',
    overdracht: 'Overdracht',
    contact: 'Contact',
    algemeen: 'Algemeen',
  };
  return types[type] || type;
}

function getReportTypeStyle(type: string): { bg: string; text: string } {
  switch (type) {
    case 'incident':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'observatie':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'voortgang':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'overdracht':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'contact':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

export function ReportsBlock({ reports }: ReportsBlockProps) {
  const incidentCount = reports.filter(r => r.type === 'incident').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Rapportages</h2>
            <p className="text-sm text-slate-500">
              {reports.length} rapportages (24u)
            </p>
          </div>
        </div>
        {incidentCount > 0 && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            {incidentCount} incident{incidentCount > 1 ? 'en' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      {reports.length === 0 ? (
        <div className="py-8 text-center">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Geen rapportages in de laatste 24 uur</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const typeStyle = getReportTypeStyle(report.type);

            return (
              <div
                key={report.id}
                className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {/* Report header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${typeStyle.bg} ${typeStyle.text}
                  `}>
                    {getReportTypeLabel(report.type)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(report.created_at)}
                  </div>
                </div>

                {/* Report content */}
                <p className="text-sm text-slate-700 leading-relaxed">
                  {truncateContent(report.content)}
                </p>

                {/* Author if available */}
                {report.created_by && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                    <User className="h-3 w-3" />
                    {report.created_by}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
