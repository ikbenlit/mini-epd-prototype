'use client';

/**
 * Recent Strip
 *
 * Shows last 5 actions as clickable chips for quick repeat.
 */

import { useSwiftStore } from '@/stores/swift-store';

export function RecentStrip() {
  const { recentActions } = useSwiftStore();

  return (
    <div className="h-12 border-t border-slate-700 flex items-center px-4 gap-2 shrink-0">
      <span className="text-xs text-slate-500 shrink-0">Recent:</span>
      {recentActions.length === 0 ? (
        <span className="text-xs text-slate-600 italic">Nog geen acties</span>
      ) : (
        <div className="flex gap-2 overflow-x-auto">
          {recentActions.map((action) => (
            <button
              key={action.id}
              className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 whitespace-nowrap transition-colors"
              title={`${action.intent}: ${action.label}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
