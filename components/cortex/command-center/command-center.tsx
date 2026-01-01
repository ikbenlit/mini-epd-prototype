'use client';

/**
 * Command Center (v3.0)
 *
 * Main container for the Cortex interface.
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
import { AnimatePresence } from 'framer-motion';
import { useCortexStore } from '@/stores/cortex-store';
import { ContextBar } from './context-bar';
import { OfflineBanner } from './offline-banner';
import { NudgeToast } from './nudge-toast';
import { ChatPanel } from '../chat/chat-panel';
import { ArtifactArea } from '../artifacts/artifact-area';
import { getArtifactTitle } from '../artifacts/artifact-container';
import { routeIntentToArtifact } from '@/lib/cortex/action-parser';
import { isFeatureEnabled } from '@/lib/config/feature-flags';

export function CommandCenter() {
  const {
    closeAllArtifacts,
    openArtifacts,
    openArtifact,
    pendingAction,
    setPendingAction,
    // Nudge state (E4)
    suggestions,
    acceptSuggestion,
    dismissSuggestion,
  } = useCortexStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape: close all artifacts
      if (e.key === 'Escape' && openArtifacts.length > 0) {
        e.preventDefault();
        closeAllArtifacts();
      }

      // Cmd/Ctrl + K: focus input (chat input in v3.0)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [openArtifacts, closeAllArtifacts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // E3.S6 + E4.S2: Handle pending actions from chat (artifact opening)
  useEffect(() => {
    if (!pendingAction) return;

    console.log('[CommandCenter] Processing pending action:', pendingAction);

    // Check if action has artifact data
    if (pendingAction.artifact) {
      const { type, prefill } = pendingAction.artifact;

      // Generate title for the artifact
      const title = getArtifactTitle(type, prefill);

      console.log('[CommandCenter] Opening artifact:', type, title);

      // Open the artifact (E4.S2 - new artifact system)
      openArtifact({
        type,
        prefill,
        title,
      });

      setPendingAction(null);
      return;
    }

    const routedArtifact = routeIntentToArtifact(
      pendingAction.intent,
      pendingAction.entities,
      pendingAction.confidence
    );

    if (routedArtifact) {
      console.log('[CommandCenter] Routing action to artifact:', routedArtifact.type);
      openArtifact({
        type: routedArtifact.type,
        prefill: routedArtifact.prefill,
        title: routedArtifact.title,
      });
    } else {
      console.log('[CommandCenter] Action has no artifact, skipping');
    }

    setPendingAction(null);
  }, [pendingAction, openArtifact, setPendingAction]);

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

      {/* Nudge Toast - E4 (fixed position, bottom-left above chat, feature flagged) */}
      {isFeatureEnabled('CORTEX_NUDGE') && (
        <AnimatePresence mode="wait">
          {suggestions.length > 0 && (
            <div className="fixed bottom-20 left-4 right-4 lg:left-4 lg:right-auto lg:w-[38%] z-50">
              <NudgeToast
                key={suggestions[0].id}
                suggestion={suggestions[0]}
                onAccept={(id) => {
                  const suggestion = suggestions.find((s) => s.id === id);
                  if (suggestion) {
                    // Route the suggested intent to an artifact
                    const artifact = routeIntentToArtifact(
                      suggestion.suggestion.intent,
                      suggestion.suggestion.entities,
                      1.0 // High confidence since user explicitly accepted
                    );

                    if (artifact) {
                      console.log('[CommandCenter] Opening artifact from nudge:', artifact.type);
                      openArtifact({
                        type: artifact.type,
                        prefill: artifact.prefill,
                        title: artifact.title,
                      });
                    }
                  }
                  acceptSuggestion(id);
                }}
                onDismiss={(id) => {
                  dismissSuggestion(id);
                  console.log('[CommandCenter] Nudge dismissed:', id);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
