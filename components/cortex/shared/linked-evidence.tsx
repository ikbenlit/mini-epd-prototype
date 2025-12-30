'use client';

/**
 * Linked Evidence Component
 *
 * Shows source data in a hover popover for overdracht aandachtspunten.
 * E5.S2: Provides quick access to original source without leaving context.
 */

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Aandachtspunt } from '@/lib/types/overdracht';
import { ExternalLink, Activity, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkedEvidenceProps {
  bron: Aandachtspunt['bron'];
  sourceData?: Aandachtspunt['sourceData'];
  className?: string;
}

export function LinkedEvidence({ bron, sourceData, className }: LinkedEvidenceProps) {
  // If no source data, just show label without popover
  if (!sourceData) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-slate-500', className)}>
        {bron.label} • {bron.datum}
      </span>
    );
  }

  const getBronIcon = () => {
    switch (bron.type) {
      case 'observatie':
        return <Activity className="h-3.5 w-3.5" />;
      case 'rapportage':
      case 'verpleegkundig':
        return <FileText className="h-3.5 w-3.5" />;
      case 'risico':
        return <AlertTriangle className="h-3.5 w-3.5" />;
    }
  };

  const getInterpretationColor = (code: string | undefined) => {
    if (!code) return 'text-slate-600';
    switch (code) {
      case 'HH':
      case 'LL':
        return 'text-red-700 font-semibold';
      case 'H':
      case 'L':
        return 'text-amber-700 font-medium';
      case 'N':
        return 'text-teal-700';
      default:
        return 'text-slate-600';
    }
  };

  const getRiskLevelColor = (level: string | undefined) => {
    if (!level) return 'text-slate-600';
    switch (level.toLowerCase()) {
      case 'zeer_hoog':
      case 'hoog':
        return 'text-red-700 font-semibold';
      case 'gemiddeld':
        return 'text-amber-700';
      case 'laag':
        return 'text-teal-700';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900',
            'underline decoration-dotted underline-offset-2 cursor-help transition-colors',
            className
          )}
        >
          {getBronIcon()}
          <span>{bron.label}</span>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" side="top" align="start">
        <div className="space-y-3">
          {/* Header */}
          <div className="border-b border-slate-200 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {getBronIcon()}
                <div>
                  <div className="text-sm font-medium text-slate-900">{bron.label}</div>
                  <div className="text-xs text-slate-500">{bron.datum}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on type */}
          {bron.type === 'observatie' && sourceData.value && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-slate-900">
                  {sourceData.value}
                </span>
                {sourceData.unit && (
                  <span className="text-sm text-slate-600">{sourceData.unit}</span>
                )}
              </div>
              {sourceData.interpretation && (
                <div className={cn('text-sm', getInterpretationColor(sourceData.interpretation))}>
                  Interpretatie: {sourceData.interpretation}
                  {sourceData.interpretation === 'HH' && ' (Kritiek hoog)'}
                  {sourceData.interpretation === 'H' && ' (Hoog)'}
                  {sourceData.interpretation === 'LL' && ' (Kritiek laag)'}
                  {sourceData.interpretation === 'L' && ' (Laag)'}
                  {sourceData.interpretation === 'N' && ' (Normaal)'}
                </div>
              )}
            </div>
          )}

          {(bron.type === 'rapportage' || bron.type === 'verpleegkundig') && sourceData.content && (
            <div className="space-y-2">
              <div className="text-sm text-slate-700 bg-slate-50 rounded p-3 border border-slate-200">
                {sourceData.content}
              </div>
              {sourceData.createdBy && (
                <div className="text-xs text-slate-500">
                  Door: {sourceData.createdBy}
                </div>
              )}
            </div>
          )}

          {bron.type === 'risico' && (
            <div className="space-y-2">
              {sourceData.riskLevel && (
                <div className={cn('text-sm font-medium', getRiskLevelColor(sourceData.riskLevel))}>
                  Risiconiveau: {sourceData.riskLevel.replace('_', ' ')}
                </div>
              )}
              {sourceData.rationale && (
                <div className="text-sm text-slate-700 bg-slate-50 rounded p-3 border border-slate-200">
                  {sourceData.rationale}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
