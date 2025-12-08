/**
 * RisksBlock Component
 * E5.S3: Actieve risico's
 */

import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import type { RiskAssessment } from '@/lib/types/overdracht';

interface RisksBlockProps {
  risks: RiskAssessment[];
}

function getRiskLevelConfig(level: string): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
} {
  switch (level) {
    case 'zeer_hoog':
      return {
        label: 'Zeer hoog',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-400',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    case 'hoog':
      return {
        label: 'Hoog',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-400',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    case 'gemiddeld':
      return {
        label: 'Gemiddeld',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-400',
        icon: <Info className="h-4 w-4" />,
      };
    case 'laag':
    default:
      return {
        label: 'Laag',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-400',
        icon: <Info className="h-4 w-4" />,
      };
  }
}

function getRiskTypeLabel(type: string): string {
  const types: Record<string, string> = {
    valrisico: 'Valrisico',
    decubitus: 'Decubitus',
    ondervoeding: 'Ondervoeding',
    delier: 'Delier',
    infectie: 'Infectie',
    suiciderisico: 'Suïciderisico',
    agressie: 'Agressie',
    weglopen: 'Weglopen',
  };
  return types[type] || type;
}

export function RisksBlock({ risks }: RisksBlockProps) {
  // Sort risks by level (highest first)
  const sortedRisks = [...risks].sort((a, b) => {
    const order = ['zeer_hoog', 'hoog', 'gemiddeld', 'laag'];
    return order.indexOf(a.risk_level) - order.indexOf(b.risk_level);
  });

  const highRiskCount = risks.filter(
    r => r.risk_level === 'hoog' || r.risk_level === 'zeer_hoog'
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Risico&apos;s</h2>
            <p className="text-sm text-slate-500">
              {risks.length} actieve risico&apos;s
            </p>
          </div>
        </div>
        {highRiskCount > 0 && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            {highRiskCount} hoog risico
          </span>
        )}
      </div>

      {/* Content */}
      {sortedRisks.length === 0 ? (
        <div className="py-8 text-center">
          <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Geen actieve risico&apos;s geregistreerd</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRisks.map((risk) => {
            const config = getRiskLevelConfig(risk.risk_level);

            return (
              <div
                key={risk.id}
                className={`
                  p-3 rounded-lg border-l-4
                  ${config.bgColor} ${config.borderColor}
                `}
              >
                {/* Risk header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`${config.textColor}`}>
                      {config.icon}
                    </span>
                    <span className={`font-medium ${config.textColor}`}>
                      {getRiskTypeLabel(risk.risk_type)}
                    </span>
                  </div>
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${config.bgColor} ${config.textColor}
                  `}>
                    {config.label}
                  </span>
                </div>

                {/* Rationale if available */}
                {risk.rationale && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {risk.rationale}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
