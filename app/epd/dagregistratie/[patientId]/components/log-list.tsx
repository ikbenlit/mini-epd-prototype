'use client';

/**
 * LogList Component
 * E3.S1: Lijst van dagnotities met real-time updates
 * E3.S2: Inclusief quick entry form
 * E3.S3: Edit/Delete functionality
 */

import { useState, useCallback, useTransition } from 'react';
import { format } from 'date-fns';
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
} from 'lucide-react';
import type { NursingLog, NursingLogCategory } from '@/lib/types/nursing-log';
import { CATEGORY_CONFIG, NURSING_LOG_CATEGORIES } from '@/lib/types/nursing-log';
import { LogForm } from './log-form';

interface LogListProps {
  patientId: string;
  initialLogs: NursingLog[];
  date: string;
}

// Icon mapping
const CATEGORY_ICONS: Record<NursingLogCategory, React.ComponentType<{ className?: string }>> = {
  medicatie: Pill,
  adl: Utensils,
  gedrag: User,
  incident: AlertTriangle,
  observatie: FileText,
};

export function LogList({ patientId, initialLogs, date }: LogListProps) {
  const [logs, setLogs] = useState<NursingLog[]>(initialLogs);

  // Refresh logs from API
  const refreshLogs = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/nursing-logs?patientId=${patientId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    }
  }, [patientId, date]);

  // Group logs by category for summary
  const logsByCategory = logs.reduce(
    (acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const markedForHandover = logs.filter((l) => l.include_in_handover).length;

  return (
    <div className="space-y-6">
      {/* Quick Entry Form */}
      <LogForm patientId={patientId} onSuccess={refreshLogs} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{logs.length}</div>
          <div className="text-sm text-slate-600">Notities vandaag</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <span className="text-2xl font-bold text-slate-900">
              {markedForHandover}
            </span>
          </div>
          <div className="text-sm text-slate-600">Voor overdracht</div>
        </div>
        {logsByCategory['incident'] > 0 && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-700">
                {logsByCategory['incident']}
              </span>
            </div>
            <div className="text-sm text-red-600">Incidenten</div>
          </div>
        )}
      </div>

      {/* Log List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            Notities ({logs.length})
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-1">Nog geen notities vandaag</p>
            <p className="text-sm text-slate-500">
              Voeg een notitie toe via het formulier hieronder
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <LogCard key={log.id} log={log} onUpdate={refreshLogs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LogCardProps {
  log: NursingLog;
  onUpdate: () => void;
}

function LogCard({ log, onUpdate }: LogCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editContent, setEditContent] = useState(log.content);
  const [editCategory, setEditCategory] = useState<NursingLogCategory>(
    log.category as NursingLogCategory
  );
  const [editHandover, setEditHandover] = useState(log.include_in_handover);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = CATEGORY_CONFIG[log.category as NursingLogCategory];
  const Icon = CATEGORY_ICONS[log.category as NursingLogCategory] || FileText;

  const handleSave = () => {
    if (!editContent.trim()) {
      setError('Notitie mag niet leeg zijn');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/nursing-logs/${log.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: editContent.trim(),
            category: editCategory,
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
        const response = await fetch(`/api/nursing-logs/${log.id}`, {
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
    setEditCategory(log.category as NursingLogCategory);
    setEditHandover(log.include_in_handover);
    setError(null);
  };

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <div className="p-4 bg-red-50 border-b border-red-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">
              Notitie verwijderen?
            </p>
            <p className="text-xs text-red-700 mb-3">
              Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-60"
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
                className="px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="p-4 bg-amber-50 border-b border-amber-100">
        <div className="space-y-3">
          {/* Category selector */}
          <div className="flex flex-wrap gap-1">
            {NURSING_LOG_CATEGORIES.map((cat) => {
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
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:opacity-60"
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
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <X className="h-3 w-3" />
              Annuleren
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal view
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config?.bgColor || 'bg-gray-100'}`}
        >
          <Icon className={`h-5 w-5 ${config?.textColor || 'text-gray-600'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${config?.bgColor || 'bg-gray-100'} ${config?.textColor || 'text-gray-700'}`}
            >
              {config?.label || log.category}
            </span>
            {log.include_in_handover && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                Overdracht
              </span>
            )}
          </div>

          <p className="text-sm text-slate-900 whitespace-pre-wrap">
            {log.content}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(log.timestamp), 'HH:mm', { locale: nl })}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Bewerken"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Verwijderen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
