'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, User, Target } from 'lucide-react';
import { IntakeTab } from './intake-tab';
import { ProfileTab } from './profile-tab';
import { PlanTab } from './plan-tab';

interface ClientTabsProps {
  clientId: string;
  activeTab?: string;
}

type TabId = 'intake' | 'profile' | 'plan';

const tabs = [
  {
    id: 'intake' as TabId,
    label: 'Intake',
    icon: FileText,
    description: 'Intake gesprekken en notities',
  },
  {
    id: 'profile' as TabId,
    label: 'Profiel',
    icon: User,
    description: 'Probleemprofielen en DSM categorieën',
  },
  {
    id: 'plan' as TabId,
    label: 'Behandelplan',
    icon: Target,
    description: 'Behandeldoelen en interventies',
  },
];

export function ClientTabs({ clientId, activeTab }: ClientTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState<TabId>(
    (activeTab as TabId) || 'intake'
  );

  const handleTabChange = (tabId: TabId) => {
    setCurrentTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/epd/clients/${clientId}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 p-1">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-slate-200">
        {currentTab === 'intake' && <IntakeTab clientId={clientId} />}
        {currentTab === 'profile' && <ProfileTab clientId={clientId} />}
        {currentTab === 'plan' && <PlanTab clientId={clientId} />}
      </div>
    </div>
  );
}
