'use client';

/**
 * Command Center (v3.0)
 *
 * Main container for the Swift interface.
 * Split-screen layout: Chat Panel (40%) | Artifact Area (60%)
 *
 * Layout specs:
 * - Context Bar: 48px (h-12) - UNCHANGED
 * - Split container: flex-1 (fills remaining space)
 *   - Chat Panel: 40% width (desktop), 100% (mobile)
 *   - Artifact Area: 60% width (desktop), 100% (mobile)
 *
 * Epic: E1 (Foundation)
 * Stories: E1.S2 (Split-screen layout), E1.S3 (Placeholders), E1.S4 (Responsive)
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSwiftStore } from '@/stores/swift-store';
import { ContextBar } from './context-bar';
import { OfflineBanner } from './offline-banner';
import { ChatPanel } from '../chat/chat-panel';
import { ArtifactArea } from '../artifacts/artifact-area';

export function CommandCenter() {
  const { closeBlock, activeBlock, openBlock, pendingAction, setPendingAction } = useSwiftStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape: close active block
      if (e.key === 'Escape' && activeBlock) {
        e.preventDefault();
        closeBlock();
      }

      // Cmd/Ctrl + K: focus input (chat input in v3.0)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [activeBlock, closeBlock]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // E3.S6: Handle pending actions from chat (artifact opening)
  useEffect(() => {
    if (!pendingAction) return;

    console.log('[CommandCenter] Processing pending action:', pendingAction);

    // Check if action has artifact data
    if (pendingAction.artifact) {
      const { type, prefill } = pendingAction.artifact;

      console.log('[CommandCenter] Opening artifact:', type, 'with prefill:', prefill);

      // Open the block with prefill data
      openBlock(type, prefill);

      // Clear pending action after processing
      setPendingAction(null);
    } else {
      console.log('[CommandCenter] Action has no artifact, skipping');
      setPendingAction(null);
    }
  }, [pendingAction, openBlock, setPendingAction]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Context Bar - 48px (unchanged) */}
      <ContextBar />

      {/* Split-screen container - flex-1 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - 40% (desktop), 100% (mobile) */}
        <div className="w-full lg:w-[40%] border-r border-slate-200 flex flex-col">
          <ChatPanel />
        </div>

        {/* Artifact Area - 60% (desktop), hidden on mobile */}
        <div className="hidden lg:flex lg:w-[60%] flex-col">
          <ArtifactArea />
        </div>
      </div>
    </div>
  );
}
