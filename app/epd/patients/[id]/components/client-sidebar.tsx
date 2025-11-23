'use client';

/**
 * Client Sidebar Navigation Component
 * E2.S3: Context-aware sidebar with tabs for client dossier
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  LayoutDashboard,
  User,
  ClipboardList,
  FileText,
  Stethoscope,
  Calendar,
  FileBarChart,
} from 'lucide-react';

interface ClientSidebarProps {
  patientId: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function ClientSidebar({ patientId }: ClientSidebarProps) {
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: `/epd/patients/${patientId}`,
      icon: LayoutDashboard,
    },
    {
      label: 'Basisgegevens',
      href: `/epd/patients/${patientId}/basisgegevens`,
      icon: User,
    },
    {
      label: 'Screening',
      href: `/epd/patients/${patientId}/screening`,
      icon: ClipboardList,
    },
    {
      label: 'Intake',
      href: `/epd/patients/${patientId}/intakes`,
      icon: FileText,
    },
    {
      label: 'Diagnose',
      href: `/epd/patients/${patientId}/diagnose`,
      icon: Stethoscope,
    },
    {
      label: 'Behandelplan',
      href: `/epd/patients/${patientId}/behandelplan`,
      icon: Calendar,
    },
    {
      label: 'Rapportage',
      href: `/epd/patients/${patientId}/rapportage`,
      icon: FileBarChart,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Back to Patients */}
      <div className="p-4 border-b border-slate-200">
        <Link
          href="/epd/patients"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Cliënten</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Special handling for Intake tab: active when on /intakes or /intakes/[id]
          const isActive = item.href.includes('/intakes')
            ? pathname.startsWith(`/epd/patients/${patientId}/intakes`)
            : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
