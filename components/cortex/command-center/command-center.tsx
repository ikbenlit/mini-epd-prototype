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
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useMediaQuery } from '@/hooks/use-media-query';
import { ContextBar } from './context-bar';
import { OfflineBanner } from './offline-banner';
import { NudgeToast } from './nudge-toast';
import { PatientSidebar } from '../patient-sidebar';
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
    // Patient sidebar (E1)
    togglePatientSidebar,
    patientSidebarOpen,
    setPatientSidebarOpen,
  } = useCortexStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape: close sidebar first, then artifacts
      if (e.key === 'Escape') {
        if (patientSidebarOpen) {
          e.preventDefault();
          setPatientSidebarOpen(false);
          return;
        }
        if (openArtifacts.length > 0) {
          e.preventDefault();
          closeAllArtifacts();
        }
      }

      // Cmd/Ctrl + K: focus input (chat input in v3.0)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Cmd/Ctrl + P: toggle patient sidebar (E1.S3)
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        togglePatientSidebar();
      }
    },
    [openArtifacts, closeAllArtifacts, patientSidebarOpen, setPatientSidebarOpen, togglePatientSidebar]
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
      {/* Patient Sidebar (E1.S2) */}
      <PatientSidebar />

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Context Bar - 48px (unchanged) */}
      <ContextBar />

      {/* Split-screen container - flex-1 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile View / Desktop Resizable View Toggle */}
        <PanelGroup direction="horizontal" className="flex-1 hidden lg:flex">
          {/* Chat Panel Panel */}
          <Panel defaultSize={40} minSize={20} className="flex flex-col h-full border-r border-slate-200">
            <ChatPanel />
          </Panel>

          {/* Resize Handle - Premium feel */}
          <PanelResizeHandle className="w-1.5 hover:w-2 group relative transition-all duration-300 ease-in-out bg-slate-50 hover:bg-slate-100 flex items-center justify-center">
            {/* Visual indicator (line) */}
            <div className="h-12 w-1 rounded-full bg-slate-200 group-hover:bg-amber-400 group-active:bg-amber-500 transition-colors" />

            {/* Interaction Area (Invisible width boost) */}
            <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
          </PanelResizeHandle>

          {/* Artifact Area Panel */}
          <Panel defaultSize={60} minSize={30} className="flex flex-col bg-white">
            <ArtifactArea />
          </Panel>
        </PanelGroup>

        {/* Mobile-only Layout (Legacy overlay behavior) */}
        <div className="lg:hidden flex flex-1 overflow-hidden relative">
          <div className="w-full flex flex-col h-full">
            <ChatPanel />
          </div>

          <div
            className={cn(
              "flex flex-col bg-white transition-transform duration-300 ease-in-out absolute inset-0 z-20",
              openArtifacts.length > 0 ? "translate-x-0" : "translate-x-full"
            )}
          >
            <ArtifactArea />
          </div>
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
