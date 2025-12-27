'use client';

/**
 * Command Center
 *
 * Main container for the Swift interface.
 * 4-zone layout: Context Bar | Canvas Area | Recent Strip | Command Input
 *
 * Layout specs:
 * - Context Bar: 48px (h-12)
 * - Canvas Area: flex-1 (fills remaining space)
 * - Recent Strip: 48px (h-12)
 * - Command Input: 64px (h-16)
 */

import { useEffect, useCallback, useRef } from 'react';
import { useSwiftStore } from '@/stores/swift-store';
import { ContextBar } from './context-bar';
import { CommandInput } from './command-input';
import { RecentStrip } from './recent-strip';
import { CanvasArea } from './canvas-area';
import { OfflineBanner } from './offline-banner';

export function CommandCenter() {
  const { closeBlock, activeBlock } = useSwiftStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Escape: close active block
      if (e.key === 'Escape' && activeBlock) {
        e.preventDefault();
        closeBlock();
      }

      // Cmd/Ctrl + K: focus input
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

  return (
    <>
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Context Bar - 48px */}
      <ContextBar />

      {/* Canvas Area - flex */}
      <CanvasArea />

      {/* Recent Strip - 48px */}
      <RecentStrip />

      {/* Command Input - 64px */}
      <CommandInput ref={inputRef} />
    </>
  );
}
