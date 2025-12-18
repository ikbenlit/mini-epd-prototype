'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DiagnosisWithIntake } from '../actions';

interface DiagnosisListItemProps {
  diagnosis: DiagnosisWithIntake;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Actief', className: 'bg-green-100 text-green-700 border-green-300' },
  remission: { label: 'Remissie', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  resolved: { label: 'Opgelost', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  inactive: { label: 'Inactief', className: 'bg-amber-100 text-amber-700 border-amber-300' },
};

export function DiagnosisListItem({ diagnosis, isSelected, onClick }: DiagnosisListItemProps) {
  const code = diagnosis.code_code || '';
  const description = diagnosis.code_display || '';
  const status = diagnosis.clinical_status || 'active';
  const isPrimary = diagnosis.category === 'primary-diagnosis';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:border-teal-300 hover:bg-teal-50/50',
        isSelected
          ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
          : 'border-slate-200 bg-white'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900 truncate">
            <span className="font-mono text-sm">{code}</span>
            {description && (
              <span className="ml-1.5 text-slate-700 font-normal">{description}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn('text-xs', statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
            {isPrimary && (
              <Badge className="bg-green-600 text-white text-xs hover:bg-green-600">
                HOOFD
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
