'use client';

import type { ReactNode } from 'react';
import { EPDHeader } from './epd-header';
import { PatientProvider } from './patient-context';

interface EPDLayoutClientProps {
  children: ReactNode;
}

export function EPDLayoutClient({ children }: EPDLayoutClientProps) {
  return (
    <PatientProvider>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed 60px height */}
        <EPDHeader />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </PatientProvider>
  );
}
