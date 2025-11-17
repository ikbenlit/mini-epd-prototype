/**
 * EPD Application Layout
 *
 * Layout for the EPD application with sidebar navigation and header.
 * Requires authentication via middleware.
 */

import type { ReactNode } from 'react';
import { EPDSidebar } from './components/epd-sidebar';
import { EPDHeader } from './components/epd-header';
import { getUser } from '@/lib/auth/server';

interface EPDLayoutProps {
  children: ReactNode;
}

export default async function EPDLayout({ children }: EPDLayoutProps) {
  // Get authenticated user
  const user = await getUser();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <EPDSidebar
        userEmail={user?.email}
        userName={user?.user_metadata?.full_name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
