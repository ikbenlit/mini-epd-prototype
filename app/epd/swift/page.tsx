'use client';

/**
 * Swift Command Center Page
 *
 * Main entry point for Swift - the Contextual UI EPD.
 */

import { useSwiftStore } from '@/stores/swift-store';
import { CommandCenter } from '@/components/swift';

export default function SwiftPage() {
  const { activeBlock } = useSwiftStore();

  return (
    <CommandCenter>
      {activeBlock ? (
        <div className="text-slate-400">Block: {activeBlock}</div>
      ) : (
        <div className="text-center text-slate-500 max-w-md">
          <p className="text-lg mb-2">Wat wil je doen?</p>
          <p className="text-sm text-slate-600">
            Typ of spreek je intentie, bijvoorbeeld: &quot;notitie jan medicatie&quot;
          </p>
        </div>
      )}
    </CommandCenter>
  );
}
