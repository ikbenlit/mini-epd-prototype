'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type Behandeldoel, GOAL_STATUS_LABELS } from '@/lib/types/behandelplan';
import { LIFE_DOMAIN_META } from '@/lib/types/leefgebieden';
import { Target, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { BehandeldoelForm } from './behandeldoel-form';

interface BehandeldoelCardProps {
  doel: Behandeldoel;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (doel: Behandeldoel) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  className?: string;
}

/**
 * Behandeldoel Card
 * View mode: Compact card met doel + interventies
 * Edit mode: Inline form met alle velden
 */
export function BehandeldoelCard({
  doel,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  className,
}: BehandeldoelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isEditing) {
    return (
      <BehandeldoelForm
        doel={doel}
        onSave={onSave}
        onCancel={onCancel}
        onDelete={onDelete}
        className={className}
      />
    );
  }

  const meta = LIFE_DOMAIN_META[doel.lifeDomain];
  const statusInfo = GOAL_STATUS_LABELS[doel.status];

  return (
    <Card
      className={cn(
        'transition-all hover:border-indigo-300 hover:shadow-sm',
        className
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="h-4 w-4 text-indigo-600 shrink-0" />
            <h3 className="font-medium text-slate-900 truncate">{doel.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="text-xs border-0"
              style={{ backgroundColor: meta.color, color: 'white' }}
            >
              {meta.shortLabel}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: statusInfo.color, color: statusInfo.color }}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Client version (B1 tekst) - altijd zichtbaar */}
        <div className="bg-blue-50 border border-blue-100 rounded-md p-2.5">
          <p className="text-sm text-blue-800 italic">
            &ldquo;{doel.clientVersion}&rdquo;
          </p>
        </div>

        {/* Interventies */}
        {doel.interventies.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Aanpak
            </span>
            <ul className="space-y-1">
              {doel.interventies.map((int) => (
                <li key={int.id} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-400">•</span>
                  <span>
                    <span className="font-medium text-slate-700">{int.name}</span>
                    {int.description && (
                      <span className="text-slate-500"> - {int.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress & timeline */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Week {doel.startWeek}-{doel.endWeek}</span>
              <span>{doel.progress}%</span>
            </div>
            <Progress value={doel.progress} className="h-2" />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-slate-500 h-8 w-8 p-0 hover:text-indigo-600"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded details (optional) */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>Leefgebied: {meta.label}</p>
            <p>Status: {statusInfo.label}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
