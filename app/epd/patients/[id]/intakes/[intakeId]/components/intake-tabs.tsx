'use client';

import { useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface IntakeTabsProps {
    patientId: string;
    intakeId: string;
}

interface Tab {
    name: string;
    href: string;
    exact?: boolean;
}

// Memoized tab item component to prevent unnecessary re-renders
interface TabItemProps {
    tab: Tab;
    isActive: boolean;
}

const TabItem = memo(function TabItem({ tab, isActive }: TabItemProps) {
    return (
        <Link
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
}, (prev, next) => {
    // Only re-render if href or active state changes
    return prev.tab.href === next.tab.href && prev.isActive === next.isActive;
});

export function IntakeTabs({ patientId, intakeId }: IntakeTabsProps) {
    const pathname = usePathname();

    // Memoize base URL to prevent recalculation
    const baseUrl = useMemo(
        () => `/epd/patients/${patientId}/intakes/${intakeId}`,
        [patientId, intakeId]
    );

    // Memoize tabs array to prevent recreation on every render
    const tabs = useMemo<Tab[]>(() => [
        { name: 'Algemeen', href: baseUrl, exact: true },
        { name: 'Contactmomenten', href: `${baseUrl}/contacts` },
        { name: 'Kindcheck', href: `${baseUrl}/kindcheck` },
        { name: 'Risicotaxatie', href: `${baseUrl}/risk` },
        { name: 'Anamnese', href: `${baseUrl}/anamnese` },
        { name: 'Onderzoeken', href: `${baseUrl}/examination` },
        { name: 'ROM', href: `${baseUrl}/rom` },
        { name: 'Diagnose', href: `${baseUrl}/diagnosis` },
        { name: 'Behandeladvies', href: `${baseUrl}/behandeladvies` },
    ], [baseUrl]);

    // Memoize isActive check function
    const getIsActive = useCallback((tab: Tab) => {
        if (tab.exact) {
            return pathname === tab.href;
        }
        return pathname?.startsWith(tab.href);
    }, [pathname]);

    return (
        <div className="border-b border-slate-200 bg-white px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <TabItem
                        key={tab.name}
                        tab={tab}
                        isActive={getIsActive(tab)}
                    />
                ))}
            </nav>
        </div>
    );
}
