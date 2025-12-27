'use client';

/**
 * Artifact Area (v3.0)
 *
 * Displays active blocks based on activeBlock state.
 * Shows placeholder when no block is active.
 *
 * Epic: E1 (Foundation), E3 (Chat API & Medical Scribe)
 * Stories: E1.S3 (Placeholder componenten), E3.S6 (Artifact opening from chat)
 */

import { useSwiftStore } from '@/stores/swift-store';
import { DagnotatieBlock } from '../blocks/dagnotitie-block';
import { ZoekenBlock } from '../blocks/zoeken-block';
import { OverdrachtBlock } from '../blocks/overdracht-block';
import { FallbackPicker } from '../blocks/fallback-picker';

export function ArtifactArea() {
  const activeBlock = useSwiftStore((s) => s.activeBlock);
  const prefillData = useSwiftStore((s) => s.prefillData);

  // Render active block
  if (activeBlock) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-6 overflow-y-auto">
        {activeBlock === 'dagnotitie' && <DagnotatieBlock />}
        {activeBlock === 'zoeken' && <ZoekenBlock />}
        {activeBlock === 'overdracht' && <OverdrachtBlock />}
        {activeBlock === 'fallback' && <FallbackPicker />}
      </div>
    );
  }

  // Placeholder when no block is active
  return (
    <div className="h-full flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg text-center text-slate-500">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-xl font-medium text-slate-700 mb-3">
          Artifacts verschijnen hier
        </h3>
        <p className="text-sm mb-6">
          Wanneer je een actie vraagt in de chat, verschijnt het bijbehorende formulier of overzicht hier.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-4 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-sm">
              📝
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-700 text-sm">Dagnotitie</p>
              <p className="text-xs text-slate-500">Voor snelle notities tijdens de dienst</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-sm">
              🔍
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-700 text-sm">Patiënt Zoeken</p>
              <p className="text-xs text-slate-500">Zoek en selecteer patiënten</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-sm">
              🔄
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-700 text-sm">Overdracht</p>
              <p className="text-xs text-slate-500">Dienst overdracht met AI-samenvatting</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Vraag me iets in de chat om te beginnen!
        </p>
      </div>
    </div>
  );
}
