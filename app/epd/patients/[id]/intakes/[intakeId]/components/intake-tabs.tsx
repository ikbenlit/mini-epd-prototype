'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface IntakeTabsProps {
    patientId: string;
    intakeId: string;
}

export function IntakeTabs({ patientId, intakeId }: IntakeTabsProps) {
    const pathname = usePathname();
    const baseUrl = `/epd/patients/${patientId}/intakes/${intakeId}`;

    const tabs = [
        { name: 'Algemeen', href: baseUrl, exact: true },
        { name: 'Contactmomenten', href: `${baseUrl}/contacts` },
        { name: 'Kindcheck', href: `${baseUrl}/kindcheck` },
        { name: 'Risicotaxatie', href: `${baseUrl}/risk` },
        { name: 'Anamnese', href: `${baseUrl}/anamnese` },
        { name: 'Onderzoeken', href: `${baseUrl}/examination` },
        { name: 'ROM', href: `${baseUrl}/rom` },
        { name: 'Diagnose', href: `${baseUrl}/diagnosis` },
        { name: 'Behandeladvies', href: `${baseUrl}/behandeladvies` },
    ];

    return (
        <div className="border-b border-slate-200 bg-white px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = tab.exact
                        ? pathname === tab.href
                        : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                                isActive
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
