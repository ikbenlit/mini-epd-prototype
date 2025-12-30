'use client';

/**
 * Recent Strip
 *
 * Shows last 5 actions as clickable chips for quick repeat.
 * Height: 48px (h-12)
 */

import { useCortexStore, type CortexIntent } from '@/stores/cortex-store';
import { FileText, Search, ArrowRightLeft, HelpCircle, Clock, Calendar, Plus, X } from 'lucide-react';

const INTENT_CONFIG: Record<CortexIntent, { icon: typeof FileText; color: string; label: string }> = {
  dagnotitie: { icon: FileText, color: 'text-blue-600 bg-blue-50 border border-blue-200', label: 'Notitie' },
  zoeken: { icon: Search, color: 'text-emerald-600 bg-emerald-50 border border-emerald-200', label: 'Zoeken' },
  overdracht: { icon: ArrowRightLeft, color: 'text-purple-600 bg-purple-50 border border-purple-200', label: 'Overdracht' },
  agenda_query: { icon: Calendar, color: 'text-teal-600 bg-teal-50 border border-teal-200', label: 'Agenda' },
  create_appointment: { icon: Plus, color: 'text-green-600 bg-green-50 border border-green-200', label: 'Afspraak' },
  cancel_appointment: { icon: X, color: 'text-red-600 bg-red-50 border border-red-200', label: 'Annuleren' },
  reschedule_appointment: { icon: Clock, color: 'text-amber-600 bg-amber-50 border border-amber-200', label: 'Verzetten' },
  unknown: { icon: HelpCircle, color: 'text-slate-600 bg-slate-50 border border-slate-200', label: 'Actie' },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'zojuist';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}u`;
  return `${Math.floor(diffHours / 24)}d`;
}

export function RecentStrip() {
  const { recentActions, setInputValue, openBlock } = useCortexStore();

  const handleActionClick = (action: typeof recentActions[0]) => {
    // Set the input to repeat the action
    setInputValue(action.label);

    // If it's a known intent, open the block directly
    if (action.intent !== 'unknown') {
      openBlock(action.intent, {
        patientName: action.patientName,
      });
    }
  };

  return (
    <div className="h-12 border-t border-slate-200 flex items-center px-4 gap-3 shrink-0 bg-white">
      {/* Label */}
      <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
        <Clock size={12} />
        <span className="text-xs font-medium">Recent</span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-slate-200" />

      {/* Actions */}
      {recentActions.length === 0 ? (
        <span className="text-xs text-slate-400 italic">Nog geen acties</span>
      ) : (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {recentActions.map((action) => {
            const config = INTENT_CONFIG[action.intent];
            const Icon = config.icon;

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                           whitespace-nowrap transition-all duration-200
                           hover:scale-105 active:scale-95
                           ${config.color} hover:brightness-110`}
                title={`Herhaal: ${action.label}${action.patientName ? ` (${action.patientName})` : ''}`}
              >
                <Icon size={12} />
                <span className="max-w-[120px] truncate">{action.label}</span>
                {action.patientName && (
                  <span className="text-[10px] opacity-60">• {action.patientName}</span>
                )}
                <span className="text-[10px] opacity-40 ml-1">
                  {formatRelativeTime(action.timestamp)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick actions hint (when empty) */}
      {recentActions.length === 0 && (
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span>Probeer:</span>
          <button
            onClick={() => setInputValue('notitie ')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            notitie
          </button>
          <button
            onClick={() => setInputValue('zoek ')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            zoek
          </button>
        </div>
      )}
    </div>
  );
}
