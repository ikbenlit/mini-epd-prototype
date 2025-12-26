'use client';

/**
 * Context Bar
 *
 * Top bar showing current context: shift, selected patient, user info.
 * Height: 48px (h-12)
 */

import { useSwiftStore, type ShiftType } from '@/stores/swift-store';
import { Sun, Moon, Sunrise, Sunset, X, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SHIFT_CONFIG: Record<ShiftType, { icon: typeof Sun; label: string; color: string }> = {
  nacht: { icon: Moon, label: 'Nachtdienst', color: 'text-indigo-600' },
  ochtend: { icon: Sunrise, label: 'Ochtenddienst', color: 'text-amber-600' },
  middag: { icon: Sun, label: 'Middagdienst', color: 'text-yellow-600' },
  avond: { icon: Sunset, label: 'Avonddienst', color: 'text-orange-600' },
};

export function ContextBar() {
  const { shift, activePatient, setActivePatient } = useSwiftStore();
  const shiftConfig = SHIFT_CONFIG[shift];
  const ShiftIcon = shiftConfig.icon;

  return (
    <header className="h-12 border-b border-slate-200 flex items-center px-4 justify-between shrink-0 bg-white">
      {/* Left: Logo + Shift */}
      <div className="flex items-center gap-4">
        <Link
          href="/epd"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          title="Terug naar EPD"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-semibold tracking-tight">Swift</span>
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        <div className={`flex items-center gap-1.5 ${shiftConfig.color}`}>
          <ShiftIcon size={14} />
          <span className="text-xs font-medium">{shiftConfig.label}</span>
        </div>
      </div>

      {/* Center: Active Patient */}
      <div className="flex items-center">
        {activePatient ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-medium text-white">
              {activePatient.name_given[0]?.[0]}
              {activePatient.name_family[0]}
            </div>
            <span className="text-sm text-slate-900">
              {activePatient.name_given.join(' ')} {activePatient.name_family}
            </span>
            <button
              onClick={() => setActivePatient(null)}
              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              title="Patiënt deselecteren"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-500">Geen patiënt geselecteerd</span>
        )}
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-600">
          <User size={16} />
          <span className="text-xs hidden sm:block">Verpleegkundige</span>
        </div>
      </div>
    </header>
  );
}
