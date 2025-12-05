/**
 * NursingLogsBlock Component
 * E5.S3: Dagnotities gemarkeerd voor overdracht
 */

import { ClipboardList, Clock, Pill, Utensils, User, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import type { NursingLog } from '@/lib/types/nursing-log';
import type { NursingLogCategory } from '@/lib/types/nursing-log';

interface NursingLogsBlockProps {
  logs: NursingLog[];
}

const CATEGORY_CONFIG: Record<NursingLogCategory, {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}> = {
  medicatie: {
    label: 'Medicatie',
    icon: <Pill className="h-3.5 w-3.5" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  adl: {
    label: 'ADL',
    icon: <Utensils className="h-3.5 w-3.5" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  gedrag: {
    label: 'Gedrag',
    icon: <User className="h-3.5 w-3.5" />,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  incident: {
    label: 'Incident',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  observatie: {
    label: 'Observatie',
    icon: <FileText className="h-3.5 w-3.5" />,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  },
};

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NursingLogsBlock({ logs }: NursingLogsBlockProps) {
  // Filter logs marked for handover
  const markedLogs = logs.filter(log => log.include_in_handover);
  const incidentCount = markedLogs.filter(log => log.category === 'incident').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dagnotities</h2>
            <p className="text-sm text-slate-500">
              {markedLogs.length} gemarkeerd voor overdracht
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
      {markedLogs.length === 0 ? (
        <div className="py-8 text-center">
          <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Geen dagnotities gemarkeerd voor overdracht</p>
          {logs.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {logs.length} notitie{logs.length > 1 ? 's' : ''} niet gemarkeerd
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {markedLogs.map((log) => {
            const config = CATEGORY_CONFIG[log.category as NursingLogCategory] || CATEGORY_CONFIG.observatie;

            return (
              <div
                key={log.id}
                className={`
                  p-3 rounded-lg border-l-4
                  ${log.category === 'incident' ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-300'}
                `}
              >
                {/* Log header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
                      ${config.bgColor} ${config.textColor}
                    `}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Overdracht
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {formatTime(log.timestamp)}
                  </div>
                </div>

                {/* Log content */}
                <p className="text-sm text-slate-700 leading-relaxed">
                  {log.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer with total count */}
      {logs.length > markedLogs.length && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            + {logs.length - markedLogs.length} andere notitie{logs.length - markedLogs.length > 1 ? 's' : ''} vandaag (niet gemarkeerd)
          </p>
        </div>
      )}
    </div>
  );
}
