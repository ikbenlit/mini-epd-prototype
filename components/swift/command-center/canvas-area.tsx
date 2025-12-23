'use client';

/**
 * Canvas Area
 *
 * Central area where blocks appear. Shows empty state when no block is active.
 */

import { useSwiftStore } from '@/stores/swift-store';

export function CanvasArea() {
  const { activeBlock } = useSwiftStore();

  return (
    <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
      {activeBlock ? (
        // Block will be rendered here by the page component
        <div className="text-slate-400">Block: {activeBlock}</div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="text-center max-w-md">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-slate-300 mb-2">Wat wil je doen?</h2>
        <p className="text-sm text-slate-500">
          Typ of spreek je intentie
        </p>
      </div>

      <div className="space-y-2 text-left">
        <ExampleCommand icon="📝" text="notitie jan medicatie gegeven" />
        <ExampleCommand icon="🔍" text="zoek marie" />
        <ExampleCommand icon="📋" text="overdracht" />
      </div>

      <p className="mt-6 text-xs text-slate-600">
        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">⌘K</kbd> om te focussen
      </p>
    </div>
  );
}

function ExampleCommand({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 text-sm">
      <span>{icon}</span>
      <span className="text-slate-400">&quot;{text}&quot;</span>
    </div>
  );
}
