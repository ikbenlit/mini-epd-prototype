'use client';

/**
 * Command Center
 *
 * Main container for the Swift interface.
 * Orchestrates Context Bar, Canvas, Recent Strip, and Command Input.
 */

import { ReactNode } from 'react';
import { ContextBar } from './context-bar';
import { CommandInput } from './command-input';
import { RecentStrip } from './recent-strip';

interface CommandCenterProps {
  children?: ReactNode;
}

export function CommandCenter({ children }: CommandCenterProps) {
  return (
    <>
      <ContextBar />
      <main className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {children}
      </main>
      <RecentStrip />
      <CommandInput />
    </>
  );
}
