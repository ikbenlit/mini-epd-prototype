'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type LifeDomain, LIFE_DOMAIN_META } from '@/lib/types/leefgebieden';

interface LeefgebiedenBadgeProps {
  domain: LifeDomain;
  showEmoji?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Colored badge for a life domain
 * Uses the domain's specific color from the meta definition
 */
export function LeefgebiedenBadge({
  domain,
  showEmoji = true,
  size = 'md',
  className,
}: LeefgebiedenBadgeProps) {
  const meta = LIFE_DOMAIN_META[domain];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      className={cn(
        'font-medium border-0 text-white',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: meta.color }}
    >
      {showEmoji && <span className="mr-1">{meta.emoji}</span>}
      {meta.shortLabel}
    </Badge>
  );
}

interface LeefgebiedenBadgeGroupProps {
  domains: LifeDomain[];
  showEmoji?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Group of life domain badges
 */
export function LeefgebiedenBadgeGroup({
  domains,
  showEmoji = true,
  size = 'sm',
  className,
}: LeefgebiedenBadgeGroupProps) {
  if (domains.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {domains.map((domain) => (
        <LeefgebiedenBadge
          key={domain}
          domain={domain}
          showEmoji={showEmoji}
          size={size}
        />
      ))}
    </div>
  );
}
