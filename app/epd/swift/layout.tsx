/**
 * Swift Layout
 *
 * Full-screen layout for Swift Command Center.
 * No sidebar - the entire screen is the Command Center.
 */

import type { ReactNode } from 'react';
import { getUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

interface SwiftLayoutProps {
  children: ReactNode;
}

export default async function SwiftLayout({ children }: SwiftLayoutProps) {
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
