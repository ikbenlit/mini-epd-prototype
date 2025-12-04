'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  type LifeDomainScore,
  type LifeDomain,
  LIFE_DOMAIN_META,
  LIFE_DOMAINS,
  getScoreColor,
  getAverageScore,
} from '@/lib/types/leefgebieden';
import { LeefgebiedenBadge } from './leefgebieden-badge';

interface LeefgebiedenScoreBarProps {
  score: LifeDomainScore;
  showTarget?: boolean;
  compact?: boolean;
}

/**
 * Single life domain score as a progress bar
 */
export function LeefgebiedenScoreBar({
  score,
  showTarget = true,
  compact = false,
}: LeefgebiedenScoreBarProps) {
  const meta = LIFE_DOMAIN_META[score.domain];
  const percentage = (score.current / 5) * 100;
  const targetPercentage = (score.target / 5) * 100;

  return (
    <div className={cn('space-y-1', compact ? 'py-1' : 'py-2')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.emoji}</span>
          <span className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
            {meta.shortLabel}
          </span>
          {score.priority === 'hoog' && (
            <span className="text-xs text-orange-500 font-medium">
              Prioriteit
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium" style={{ color: getScoreColor(score.current) }}>
            {score.current}
          </span>
          {showTarget && (
            <>
              <span>→</span>
              <span className="font-medium text-foreground">{score.target}</span>
            </>
          )}
        </div>
      </div>
      <div className="relative">
        {/* Custom progress bar with domain-specific color */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percentage}%`,
              backgroundColor: meta.color,
            }}
          />
        </div>
        {showTarget && (
          <div
            className="absolute top-0 h-2 w-0.5 bg-foreground/50"
            style={{ left: `${targetPercentage}%` }}
            title={`Doel: ${score.target}`}
          />
        )}
      </div>
    </div>
  );
}

interface LeefgebiedenScoresProps {
  scores: LifeDomainScore[];
  showTarget?: boolean;
  compact?: boolean;
  showSummary?: boolean;
  className?: string;
}

/**
 * Display all 7 life domain scores
 */
export function LeefgebiedenScores({
  scores,
  showTarget = true,
  compact = false,
  showSummary = true,
  className,
}: LeefgebiedenScoresProps) {
  // Ensure we have all 7 domains in the correct order
  const orderedScores = LIFE_DOMAINS.map((domain) => {
    const found = scores.find((s) => s.domain === domain);
    return (
      found || {
        domain,
        baseline: 3,
        current: 3,
        target: 4,
        notes: '',
        priority: 'middel' as const,
      }
    );
  });

  const avgCurrent = getAverageScore(orderedScores, 'current');
  const avgTarget = getAverageScore(orderedScores, 'target');
  const highPriority = orderedScores.filter((s) => s.priority === 'hoog');

  return (
    <div className={cn('space-y-4', className)}>
      {showSummary && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Gemiddelde score:{' '}
              <span className="font-medium text-foreground">{avgCurrent}</span>
              {showTarget && (
                <span className="text-muted-foreground"> → {avgTarget}</span>
              )}
            </span>
          </div>
          {highPriority.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Prioriteiten:</span>
              {highPriority.map((s) => (
                <LeefgebiedenBadge key={s.domain} domain={s.domain} size="sm" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        {orderedScores.map((score) => (
          <LeefgebiedenScoreBar
            key={score.domain}
            score={score}
            showTarget={showTarget}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

interface LeefgebiedenScoresCardProps {
  scores: LifeDomainScore[];
  title?: string;
  showTarget?: boolean;
  className?: string;
}

/**
 * Life domain scores in a Card wrapper
 */
export function LeefgebiedenScoresCard({
  scores,
  title = 'Leefgebieden',
  showTarget = true,
  className,
}: LeefgebiedenScoresCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📊</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LeefgebiedenScores scores={scores} showTarget={showTarget} />
      </CardContent>
    </Card>
  );
}
