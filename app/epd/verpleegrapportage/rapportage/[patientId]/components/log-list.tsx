'use client';

/**
 * LogList Component - Timeline UI
 * Visuele timeline met notities gegroepeerd per dagdeel
 * Quick toggle voor overdracht direct op kaart
 */

import { useState, useCallback, useTransition, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Pill,
  Utensils,
  User,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Sun,
  Sunrise,
  Sunset,
  Moon,
} from 'lucide-react';
import type { Report } from '@/lib/types/overdracht';
import {
  CATEGORY_CONFIG,
  VERPLEEGKUNDIG_CATEGORIES,
  getVerpleegkundigCategory,
  type VerpleegkundigCategory,
} from '@/lib/types/report';
import { LogForm } from './log-form';

interface LogListProps {
  patientId: string;
  initialLogs: Report[];
  startDate: string;
  endDate: string;
  /** If true, hides the LogForm (for when parent already shows it) */
  hideForm?: boolean;
  /** Callback when logs should be refreshed */
  onRefresh?: () => void;
}

// Icon mapping
const CATEGORY_ICONS: Record<VerpleegkundigCategory, React.ComponentType<{ className?: string }>> = {
  medicatie: Pill,
  adl: Utensils,
  gedrag: User,
  incident: AlertTriangle,
  observatie: FileText,
};

// Dagdeel bepalen op basis van uur
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

// Groepeer logs per dag en dagdeel
interface GroupedLogs {
  date: string;
  dateLabel: string;
  dayParts: {
    part: DayPart;
    logs: Report[];
  }[];
}

function groupLogsByDayAndPart(logs: Report[]): GroupedLogs[] {
  // Groepeer eerst per dag
  const byDay = new Map<string, Report[]>();

  logs.forEach(log => {
    const date = new Date(log.created_at);
    const dayKey = format(date, 'yyyy-MM-dd');
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, []);
    }
    byDay.get(dayKey)!.push(log);
  });

  // Sorteer dagen (nieuwste eerst)
  const sortedDays = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return sortedDays.map(([dayKey, dayLogs]) => {
    const date = new Date(dayKey);

    // Bepaal daglabel
    let dateLabel: string;
    if (isToday(date)) {
      dateLabel = 'Vandaag';
    } else if (isYesterday(date)) {
      dateLabel = 'Gisteren';
    } else {
      dateLabel = format(date, 'EEEE d MMMM', { locale: nl });
    }

    // Groepeer per dagdeel
    const byPart = new Map<DayPart, Report[]>();
    dayLogs.forEach(log => {
      const logDate = new Date(log.created_at);
      const part = getDayPart(logDate);
      if (!byPart.has(part)) {
        byPart.set(part, []);
      }
      byPart.get(part)!.push(log);
    });

    // Sorteer dagdelen in logische volgorde (nieuwste eerst = avond, middag, ochtend, nacht)
    const partOrder: DayPart[] = ['avond', 'middag', 'ochtend', 'nacht'];
    const dayParts = partOrder
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

export function LogList({ patientId, initialLogs, startDate, endDate, hideForm = false, onRefresh }: LogListProps) {
  const [logs, setLogs] = useState<Report[]>(initialLogs);

  // Sync with initialLogs when they change (e.g., from parent component)
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // Refresh logs from API
  const refreshLogs = useCallback(async () => {
    // If parent handles refresh, call that instead
    if (onRefresh) {
      onRefresh();
      return;
    }

    try {
      const response = await fetch(
        `/api/reports?patientId=${patientId}&type=verpleegkundig&startDate=${startDate}&endDate=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data.reports);
      }
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    }
  }, [patientId, startDate, endDate, onRefresh]);

  // Group logs by category for summary
  const logsByCategory = logs.reduce(
    (acc, log) => {
      const category = getVerpleegkundigCategory(log.structured_data) || 'observatie';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const markedForHandover = logs.filter((l) => l.include_in_handover).length;
  const groupedLogs = groupLogsByDayAndPart(logs);

  return (
    <div className="space-y-6">
      {/* Quick Entry Form - only show if not hidden */}
      {!hideForm && <LogForm patientId={patientId} onSuccess={refreshLogs} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-2xl font-bold text-slate-900">{logs.length}</div>
          <div className="text-xs text-slate-500">
            {startDate === endDate ? 'Notities vandaag' : 'Totaal notities'}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">
              {markedForHandover}
            </span>
          </div>
          <div className="text-xs text-slate-500">Voor overdracht</div>
        </div>
        {logsByCategory['incident'] > 0 && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-700">
                {logsByCategory['incident']}
              </span>
            </div>
            <div className="text-xs text-red-600">Incidenten</div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-1">
            {startDate === endDate
              ? 'Nog geen notities op deze dag'
              : 'Geen notities in deze periode'}
          </p>
          <p className="text-sm text-slate-500">
            Voeg een notitie toe via het formulier hierboven
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLogs.map((dayGroup) => (
            <div key={dayGroup.date} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Day Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 capitalize">
                  {dayGroup.dateLabel}
                </h3>
              </div>

              {/* Day Parts with Timeline */}
              <div className="relative">
                {dayGroup.dayParts.map((partGroup, partIndex) => {
                  const PartIcon = DAY_PART_CONFIG[partGroup.part].icon;

                  return (
                    <div key={partGroup.part} className="relative">
                      {/* Day Part Header */}
                      <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                        <PartIcon className={`h-4 w-4 ${DAY_PART_CONFIG[partGroup.part].color}`} />
                        <span className="text-sm font-medium text-slate-600">
                          {DAY_PART_CONFIG[partGroup.part].label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {partGroup.logs.length} {partGroup.logs.length === 1 ? 'notitie' : 'notities'}
                        </span>
                      </div>

                      {/* Timeline with logs */}
                      <div className="relative pl-8">
                        {/* Vertical timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                        {partGroup.logs.map((log, logIndex) => (
                          <TimelineCard
                            key={log.id}
                            log={log}
                            onUpdate={refreshLogs}
                            isLast={logIndex === partGroup.logs.length - 1 && partIndex === dayGroup.dayParts.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface TimelineCardProps {
  log: Report;
  onUpdate: () => void;
  isLast?: boolean;
}

function TimelineCard({ log, onUpdate, isLast = false }: TimelineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editContent, setEditContent] = useState(log.content);
  const category = getVerpleegkundigCategory(log.structured_data) || 'observatie';
  const [editCategory, setEditCategory] = useState<VerpleegkundigCategory>(category);
  const [editHandover, setEditHandover] = useState(log.include_in_handover ?? false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = CATEGORY_CONFIG[category];
  const Icon = CATEGORY_ICONS[category] || FileText;
  const time = format(new Date(log.created_at), 'HH:mm', { locale: nl });

  // Toggle handover without entering edit mode
  const toggleHandover = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/reports/${log.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            include_in_handover: !log.include_in_handover,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Wijzigen mislukt');
        }

        onUpdate();
      } catch (err) {
        console.error('Toggle handover failed:', err);
      }
    });
  };

  const handleSave = () => {
    if (!editContent.trim()) {
      setError('Notitie mag niet leeg zijn');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/reports/${log.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editContent.trim(),
            structured_data: { category: editCategory },
            include_in_handover: editHandover,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Opslaan mislukt');
        }

        setIsEditing(false);
        onUpdate();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Opslaan mislukt');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/reports/${log.id}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
          const data = await response.json();
          throw new Error(data.error || 'Verwijderen mislukt');
        }

        setShowDeleteConfirm(false);
        onUpdate();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verwijderen mislukt');
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(log.content);
    setEditCategory(category);
    setEditHandover(log.include_in_handover ?? false);
    setError(null);
  };

  // Delete confirmation
  if (showDeleteConfirm) {
    return (
      <div className={`relative py-3 pr-4 ${!isLast ? 'border-b border-slate-100' : ''}`}>
        {/* Timeline node */}
        <div className="absolute -left-2 top-5 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
          <Trash2 className="h-2 w-2 text-white" />
        </div>

        <div className="ml-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-900 mb-2">
            Notitie verwijderen?
          </p>
          <p className="text-xs text-red-700 mb-3">
            Deze actie kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              Verwijderen
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium text-red-700 hover:text-red-900"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className={`relative py-3 pr-4 ${!isLast ? 'border-b border-slate-100' : ''}`}>
        {/* Timeline node */}
        <div className={`absolute -left-2 top-5 w-4 h-4 rounded-full ${config.bgColor} border-2 border-white shadow-sm flex items-center justify-center`}>
          <Icon className={`h-2.5 w-2.5 ${config.textColor}`} />
        </div>

        <div className="ml-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="space-y-3">
            {/* Category selector */}
            <div className="flex flex-wrap gap-1">
              {VERPLEEGKUNDIG_CATEGORIES.map((cat) => {
                const catConfig = CATEGORY_CONFIG[cat];
                const isSelected = editCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEditCategory(cat)}
                    className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      isSelected
                        ? `${catConfig.bgColor} ${catConfig.textColor}`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {catConfig.label}
                  </button>
                );
              })}
            </div>

            {/* Content textarea */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none resize-none"
            />

            {/* Handover checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editHandover}
                onChange={(e) => setEditHandover(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700">
                Opnemen in overdracht
              </span>
            </label>

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Opslaan
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                <X className="h-3 w-3" />
                Annuleren
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className={`relative py-3 pr-4 group ${!isLast ? 'border-b border-slate-100' : ''}`}>
      {/* Timeline node with category icon */}
      <div className={`absolute -left-2 top-5 w-4 h-4 rounded-full ${config.bgColor} border-2 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110`}>
        <Icon className={`h-2.5 w-2.5 ${config.textColor}`} />
      </div>

      {/* Card content */}
      <div className="ml-4 hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors">
        <div className="flex items-start gap-3">
          {/* Time */}
          <div className="flex-shrink-0 w-12 text-right">
            <span className="text-sm font-medium text-slate-500">{time}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with badges */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}
              >
                {config.label}
              </span>

              {/* Overdracht toggle button */}
              <button
                onClick={toggleHandover}
                disabled={isPending}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
                  log.include_in_handover
                    ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-teal-50 hover:text-teal-600'
                }`}
                title={log.include_in_handover ? 'Verwijder uit overdracht' : 'Voeg toe aan overdracht'}
              >
                <CheckCircle2 className={`h-3 w-3 ${isPending ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Overdracht</span>
              </button>
            </div>

            {/* Note content */}
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {log.content}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Bewerken"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Verwijderen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
