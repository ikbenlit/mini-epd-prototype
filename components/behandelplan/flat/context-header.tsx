'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LifeDomain, type LifeDomainScore, LIFE_DOMAIN_META } from '@/lib/types/leefgebieden';
import { Stethoscope, MessageSquareQuote } from 'lucide-react';

interface Condition {
  id: string;
  category: string;
  code_display: string;
  severity_code: string | null;
  severity_display: string | null;
}

interface ContextHeaderProps {
  condition: Condition | null;
  hulpvraag: string | null;
  lifeDomainScores: LifeDomainScore[] | null;
  className?: string;
}

/**
 * Blok 1: Context Header
 * Read-only samenvatting van diagnose, hulpvraag en leefgebieden
 */
export function ContextHeader({
  condition,
  hulpvraag,
  lifeDomainScores,
  className,
}: ContextHeaderProps) {
  // Filter op leefgebieden met hoge prioriteit of lage scores
  const priorityDomains = lifeDomainScores?.filter(
    (s) => s.priority === 'hoog' || s.baseline <= 2
  ) || [];

  return (
    <Card className={cn('bg-slate-50 border-slate-200', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Diagnose */}
        <div className="flex items-start gap-2">
          <Stethoscope className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Diagnose
            </span>
            {condition ? (
              <p className="text-sm font-medium text-slate-900">
                {condition.code_display}
                {condition.severity_display && (
                  <span className="text-slate-500 font-normal ml-1">
                    ({condition.severity_display})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">Geen diagnose vastgesteld</p>
            )}
          </div>
        </div>

        {/* Hulpvraag */}
        {hulpvraag && (
          <div className="flex items-start gap-2">
            <MessageSquareQuote className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Hulpvraag
              </span>
              <p className="text-sm text-slate-700 italic">&ldquo;{hulpvraag}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Leefgebieden bars */}
        {priorityDomains.length > 0 && (
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">
              Prioritaire leefgebieden
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {priorityDomains.map((score) => (
                <LifeDomainBar key={score.domain} score={score} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LifeDomainBarProps {
  score: LifeDomainScore;
}

function LifeDomainBar({ score }: LifeDomainBarProps) {
  const meta = LIFE_DOMAIN_META[score.domain];
  const progressPercent = (score.baseline / 5) * 100;
  const targetPercent = (score.target / 5) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">
          {meta.emoji} {meta.shortLabel}
        </span>
        <span className="text-slate-500">
          {score.baseline} → {score.target}
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full relative overflow-hidden">
        {/* Target indicator */}
        <div
          className="absolute h-full w-0.5 bg-slate-400 z-10"
          style={{ left: `${targetPercent}%` }}
        />
        {/* Current progress */}
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
}
