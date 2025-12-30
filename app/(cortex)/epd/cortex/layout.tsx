/**
 * Cortex Layout
 *
 * Full-screen layout for Cortex Command Center.
 * No sidebar - the entire screen is the Command Center.
 */

import type { ReactNode } from 'react';
import { getUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

interface CortexLayoutProps {
  children: ReactNode;
}

export default async function CortexLayout({ children }: CortexLayoutProps) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {children}
    </div>
  );
}
