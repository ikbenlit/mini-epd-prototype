/**
 * VitalsBlock Component
 * E5.S2: Vitale functies metingen vandaag
 */

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { VitalSign } from '@/lib/types/overdracht';

interface VitalsBlockProps {
  vitals: VitalSign[];
}

function getInterpretationStyle(code: string | null | undefined): {
  bg: string;
  text: string;
  icon: React.ReactNode;
  label: string;
} {
  switch (code) {
    case 'HH':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'Kritisch hoog',
      };
    case 'H':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'Hoog',
      };
    case 'LL':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <TrendingDown className="h-3 w-3" />,
        label: 'Kritisch laag',
      };
    case 'L':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        icon: <TrendingDown className="h-3 w-3" />,
        label: 'Laag',
      };
    case 'N':
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <Minus className="h-3 w-3" />,
        label: 'Normaal',
      };
  }
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return '-';
  if (unit) return `${value} ${unit}`;
  return String(value);
}

export function VitalsBlock({ vitals }: VitalsBlockProps) {
  // Group vitals by type (code_display)
  const groupedVitals = vitals.reduce((acc, vital) => {
    const key = vital.code_display;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(vital);
    return acc;
  }, {} as Record<string, VitalSign[]>);

  // Get most recent vital per type
  const latestVitals = Object.entries(groupedVitals).map(([type, measurements]) => ({
    type,
    latest: measurements[0], // Already sorted by time desc
    count: measurements.length,
  }));

  const abnormalCount = vitals.filter(
    v => v.interpretation_code && ['H', 'L', 'HH', 'LL'].includes(v.interpretation_code)
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Vitale functies</h2>
            <p className="text-sm text-slate-500">
              {vitals.length} metingen vandaag
            </p>
          </div>
        </div>
        {abnormalCount > 0 && (
          <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            {abnormalCount} afwijkend
          </span>
        )}
      </div>

      {/* Content */}
      {latestVitals.length === 0 ? (
        <div className="py-8 text-center">
          <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Geen vitale functies gemeten vandaag</p>
        </div>
      ) : (
        <div className="space-y-3">
          {latestVitals.map(({ type, latest, count }) => {
            const style = getInterpretationStyle(latest.interpretation_code);
            const isAbnormal = latest.interpretation_code && ['H', 'L', 'HH', 'LL'].includes(latest.interpretation_code);

            return (
              <div
                key={latest.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${isAbnormal ? style.bg : 'bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isAbnormal ? style.bg : 'bg-white'}
                  `}>
                    {style.icon}
                  </div>
                  <div>
                    <p className={`font-medium ${isAbnormal ? style.text : 'text-slate-900'}`}>
                      {type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTime(latest.effective_datetime)}
                      {count > 1 && ` • ${count} metingen`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${isAbnormal ? style.text : 'text-slate-900'}`}>
                    {formatValue(latest.value_quantity_value, latest.value_quantity_unit)}
                  </p>
                  {isAbnormal && (
                    <p className={`text-xs ${style.text}`}>{style.label}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
