'use client';

/**
 * RapportageWorkspace Component
 *
 * Layout:
 * - Links: Patiënten sidebar
 * - Rechts: Geselecteerde patiënt met:
 *   1. Risico alerts (indien aanwezig)
 *   2. Compact invoerformulier
 *   3. Timeline met notities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Pill,
  Utensils,
  User,
  Send,
  Loader2,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { PatientOverzicht, Report } from '@/lib/types/overdracht';
import {
  VERPLEEGKUNDIG_CATEGORIES,
  CATEGORY_CONFIG,
  getVerpleegkundigCategory,
  type VerpleegkundigCategory,
} from '@/lib/types/report';

const CATEGORY_ICONS: Record<VerpleegkundigCategory, React.ComponentType<{ className?: string }>> = {
  medicatie: Pill,
  adl: Utensils,
  gedrag: User,
  incident: AlertTriangle,
  observatie: FileText,
};

type DayPart = 'nacht' | 'ochtend' | 'middag' | 'avond';

const DAY_PART_CONFIG: Record<DayPart, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  nacht: { label: 'Nacht', icon: Moon, color: 'text-indigo-500' },
  ochtend: { label: 'Ochtend', icon: Sunrise, color: 'text-amber-500' },
  middag: { label: 'Middag', icon: Sun, color: 'text-yellow-500' },
  avond: { label: 'Avond', icon: Sunset, color: 'text-orange-500' },
};

function getDayPart(date: Date): DayPart {
  const hour = date.getHours();
  if (hour >= 0 && hour < 7) return 'nacht';
  if (hour >= 7 && hour < 12) return 'ochtend';
  if (hour >= 12 && hour < 17) return 'middag';
  return 'avond';
}

function getTodayDateRange() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return { startDate: todayStr, endDate: todayStr };
}

function groupLogsByDayAndPart(logs: Report[]) {
  const byDay = new Map<string, Report[]>();

  logs.forEach(log => {
    const dayKey = format(new Date(log.created_at), 'yyyy-MM-dd');
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(log);
  });

  return Array.from(byDay.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dayKey, dayLogs]) => {
      const date = new Date(dayKey);
      const dateLabel = isToday(date) ? 'Vandaag' : isYesterday(date) ? 'Gisteren' : format(date, 'EEEE d MMM', { locale: nl });

      const byPart = new Map<DayPart, Report[]>();
      dayLogs.forEach(log => {
        const part = getDayPart(new Date(log.created_at));
        if (!byPart.has(part)) byPart.set(part, []);
        byPart.get(part)!.push(log);
      });

      const dayParts = (['avond', 'middag', 'ochtend', 'nacht'] as DayPart[])
        .filter(part => byPart.has(part))
        .map(part => ({
          part,
          logs: byPart.get(part)!.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
        }));

      return { date: dayKey, dateLabel, dayParts };
    });
}

interface RapportageWorkspaceProps {
  patients: PatientOverzicht[];
}

export function RapportageWorkspace({ patients }: RapportageWorkspaceProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [logs, setLogs] = useState<Report[]>([]);
  const [allLogs, setAllLogs] = useState<Record<string, Report[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const { startDate, endDate } = getTodayDateRange();
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Fetch logs for all patients
  const fetchAllPatientLogs = useCallback(async () => {
    setIsLoading(true);
    const logsMap: Record<string, Report[]> = {};

    await Promise.all(
      patients.map(async (patient) => {
        try {
          const response = await fetch(
            `/api/reports?patientId=${patient.id}&type=verpleegkundig&startDate=${startDate}&endDate=${endDate}`
          );
          if (response.ok) {
            const data = await response.json();
            logsMap[patient.id] = data.reports || [];
          }
        } catch (error) {
          console.error(`Failed to fetch logs for ${patient.id}:`, error);
          logsMap[patient.id] = [];
        }
      })
    );

    setAllLogs(logsMap);
    if (selectedPatientId && logsMap[selectedPatientId]) {
      setLogs(logsMap[selectedPatientId]);
    }
    setIsLoading(false);
  }, [patients, startDate, endDate, selectedPatientId]);

  useEffect(() => {
    fetchAllPatientLogs();
  }, [fetchAllPatientLogs]);

  useEffect(() => {
    if (selectedPatientId && allLogs[selectedPatientId] !== undefined) {
      setLogs(allLogs[selectedPatientId]);
    }
  }, [selectedPatientId, allLogs]);

  const handleRefresh = async () => {
    await fetchAllPatientLogs();
  };

  // Calculate counts
  const logCounts: Record<string, number> = {};
  const handoverCounts: Record<string, number> = {};
  for (const [patientId, patientLogs] of Object.entries(allLogs)) {
    logCounts[patientId] = patientLogs.length;
    handoverCounts[patientId] = patientLogs.filter(l => l.include_in_handover).length;
  }

  const markedForHandover = logs.filter(l => l.include_in_handover).length;
  const groupedLogs = groupLogsByDayAndPart(logs);

  return (
    <div className="h-full flex bg-slate-50">
      {/* Sidebar - Patiënten */}
      <aside className="w-80 border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Ronde overzicht</h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {patients.map(patient => {
            const isSelected = patient.id === selectedPatientId;
            const count = logCounts[patient.id] || 0;
            const handover = handoverCounts[patient.id] || 0;
            const hasRisks = patient.alerts.high_risk_count > 0;
            const name = `${patient.name_given[0]} ${patient.name_family}`;

            return (
              <button
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-teal-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>
                    {name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hasRisks && (
                      <span
                        className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium"
                        title={`${patient.alerts.high_risk_count} hoog risico${patient.alerts.high_risk_count > 1 ? "'s" : ''}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {patient.alerts.high_risk_count}
                      </span>
                    )}
                    {handover > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded"
                        title={`${handover} voor overdracht`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {handover}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Risico alerts */}
          {selectedPatient && selectedPatient.alerts.high_risk_count > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <span className="font-medium text-red-900">
                  {selectedPatient.alerts.high_risk_count} hoog risico
                </span>
                <span className="text-red-700 text-sm ml-2">
                  Let op verhoogde aandachtspunten voor deze cliënt
                </span>
              </div>
            </div>
          )}

          {/* Invoerformulier */}
          {selectedPatientId && (
            <QuickEntryForm
              patientId={selectedPatientId}
              onSuccess={handleRefresh}
            />
          )}

          {/* Stats row - alleen tonen als er data is */}
          {logs.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">
                <span className="font-semibold text-slate-900">{logs.length}</span> notities
              </span>
              {markedForHandover > 0 && (
                <span className="flex items-center gap-1 text-teal-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-semibold">{markedForHandover}</span> overdracht
                </span>
              )}
            </div>
          )}

          {/* Timeline */}
          {isLoading ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-500 mt-2">Laden...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">Nog geen notities</p>
              <p className="text-sm text-slate-500">Voeg een notitie toe via het formulier hierboven</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedLogs.map(dayGroup => (
                <div key={dayGroup.date} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="font-medium text-slate-700 capitalize text-sm">{dayGroup.dateLabel}</span>
                  </div>

                  {dayGroup.dayParts.map(partGroup => {
                    const PartIcon = DAY_PART_CONFIG[partGroup.part].icon;
                    return (
                      <div key={partGroup.part}>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50/50 border-b border-slate-50">
                          <PartIcon className={`h-3.5 w-3.5 ${DAY_PART_CONFIG[partGroup.part].color}`} />
                          <span className="text-xs font-medium text-slate-500">{DAY_PART_CONFIG[partGroup.part].label}</span>
                        </div>

                        <div className="relative pl-8">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />

                          {partGroup.logs.map((log, idx) => (
                            <TimelineItem
                              key={log.id}
                              log={log}
                              onRefresh={handleRefresh}
                              isLast={idx === partGroup.logs.length - 1}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}

// Compact Quick Entry Form
function QuickEntryForm({ patientId, onSuccess }: { patientId: string; onSuccess: () => void }) {
  const [category, setCategory] = useState<VerpleegkundigCategory>('observatie');
  const [content, setContent] = useState('');
  const [includeInHandover, setIncludeInHandover] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(56, Math.min(textarea.scrollHeight, 200))}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          type: 'verpleegkundig',
          content: content.trim(),
          category,
          include_in_handover: includeInHandover,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      setContent('');
      setIncludeInHandover(false);
      setCategory('observatie');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setIsPending(false);
    }
  };

  const selectedConfig = CATEGORY_CONFIG[category];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-3">
      {/* Category pills */}
      <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
        {VERPLEEGKUNDIG_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat];
          const Icon = CATEGORY_ICONS[cat];
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                isSelected
                  ? `${config.bgColor} ${config.textColor}`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3 w-3" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Input row */}
      <div className="flex items-start gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`${selectedConfig.label} notitie...`}
          maxLength={500}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none min-h-[56px]"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="p-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => setIncludeInHandover(!includeInHandover)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            includeInHandover
              ? 'bg-teal-100 text-teal-800'
              : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Overdracht
        </button>
        <span className="text-xs text-slate-400">{500 - content.length}</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </form>
  );
}

// Timeline Item
function TimelineItem({ log, onRefresh, isLast }: { log: Report; onRefresh: () => void; isLast: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editContent, setEditContent] = useState(log.content);
  const category = getVerpleegkundigCategory(log.structured_data) || 'observatie';
  const [editCategory, setEditCategory] = useState<VerpleegkundigCategory>(category);
  const [editHandover, setEditHandover] = useState(log.include_in_handover ?? false);
  const [isPending, setIsPending] = useState(false);

  const config = CATEGORY_CONFIG[category];
  const Icon = CATEGORY_ICONS[category];
  const time = format(new Date(log.created_at), 'HH:mm');

  const toggleHandover = async () => {
    setIsPending(true);
    try {
      await fetch(`/api/reports/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ include_in_handover: !log.include_in_handover }),
      });
      onRefresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;
    setIsPending(true);
    try {
      await fetch(`/api/reports/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
          structured_data: { category: editCategory },
          include_in_handover: editHandover,
        }),
      });
      setIsEditing(false);
      onRefresh();
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await fetch(`/api/reports/${log.id}`, { method: 'DELETE' });
      onRefresh();
    } finally {
      setIsPending(false);
    }
  };

  if (showDelete) {
    return (
      <div className={`py-2 pr-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
        <div className="ml-3 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-900 mb-2">Verwijderen?</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={isPending} className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
              {isPending ? 'Bezig...' : 'Ja, verwijder'}
            </button>
            <button onClick={() => setShowDelete(false)} className="text-xs px-2 py-1 text-red-700 hover:text-red-900">
              Annuleren
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`py-2 pr-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
        <div className="ml-3 p-2 bg-amber-50 rounded border border-amber-200 space-y-2">
          <div className="flex flex-wrap gap-1">
            {VERPLEEGKUNDIG_CATEGORIES.map(cat => {
              const catConfig = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEditCategory(cat)}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    editCategory === cat ? `${catConfig.bgColor} ${catConfig.textColor}` : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {catConfig.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={2}
            className="w-full text-sm border border-amber-200 rounded p-2 focus:border-amber-400 outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={editHandover} onChange={e => setEditHandover(e.target.checked)} className="rounded" />
              Overdracht
            </label>
            <div className="flex gap-1">
              <button onClick={handleSave} disabled={isPending} className="text-xs px-2 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50">
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Opslaan'}
              </button>
              <button onClick={() => { setIsEditing(false); setEditContent(log.content); setEditCategory(category); setEditHandover(log.include_in_handover ?? false); }} className="text-xs px-2 py-1 text-slate-600">
                Annuleren
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative py-2 pr-4 group ${!isLast ? 'border-b border-slate-50' : ''}`}>
      {/* Timeline node */}
      <div className={`absolute -left-2.5 top-3 w-3 h-3 rounded-full ${config.bgColor} border-2 border-white shadow-sm`} />

      <div className="ml-3 flex items-start gap-2">
        {/* Time */}
        <span className="text-xs font-medium text-slate-400 w-10 pt-0.5">{time}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
            <button
              onClick={toggleHandover}
              disabled={isPending}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                log.include_in_handover
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-100 text-slate-400 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              <CheckCircle2 className={`h-3 w-3 inline ${isPending ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-slate-700">{log.content}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowDelete(true)} className="p-1 text-slate-400 hover:text-red-600 rounded">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
