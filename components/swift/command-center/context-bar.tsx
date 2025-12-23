'use client';

/**
 * Context Bar
 *
 * Top bar showing current context: shift, selected patient, user info.
 */

import { useSwiftStore } from '@/stores/swift-store';

export function ContextBar() {
  const { shift, activePatient } = useSwiftStore();

  return (
    <header className="h-12 border-b border-slate-700 flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-400">Swift</span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 capitalize">
          {shift}dienst
        </span>
      </div>
      <div className="flex items-center gap-4">
        {activePatient ? (
          <span className="text-sm text-white">
            {activePatient.name_given.join(' ')} {activePatient.name_family}
          </span>
        ) : (
          <span className="text-sm text-slate-500">Geen patiënt geselecteerd</span>
        )}
      </div>
    </header>
  );
}
