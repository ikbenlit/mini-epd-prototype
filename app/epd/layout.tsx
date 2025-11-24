/**
 * EPD Application Layout
 *
 * Layout for the EPD application with sidebar navigation and header.
 * Requires authentication via middleware.
 */

import type { ReactNode } from 'react';
import { EPDSidebar } from './components/epd-sidebar';
import { EPDLayoutClient } from './components/epd-layout-client';
import { getUser } from '@/lib/auth/server';

interface EPDLayoutProps {
  children: ReactNode;
}

export default async function EPDLayout({ children }: EPDLayoutProps) {
  // Get authenticated user
  const user = await getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Context-aware (switches between Level 1 and Level 2) */}
      <EPDSidebar
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name}
      />

      {/* Main Content Area with PatientProvider */}
      <EPDLayoutClient>
        {children}
      </EPDLayoutClient>
    </div>
  );
}
