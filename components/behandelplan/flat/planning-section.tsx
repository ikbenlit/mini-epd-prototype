'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type Behandelstructuur,
  type Evaluatiemoment,
  type Veiligheidsplan,
  EVALUATION_STATUSES,
} from '@/lib/types/behandelplan';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface PlanningSectionProps {
  behandelstructuur: Behandelstructuur | null;
  evaluatiemomenten: Evaluatiemoment[] | null;
  veiligheidsplan: Veiligheidsplan | null;
  className?: string;
}

/**
 * Blok 3: Planning & Evaluatie
 * Collapsed by default, bevat:
 * - Evaluatiemomenten
 * - Behandelstructuur
 * - Veiligheidsplan (indien aanwezig)
 */
export function PlanningSection({
  behandelstructuur,
  evaluatiemomenten,
  veiligheidsplan,
  className,
}: PlanningSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const evaluatiesCount = evaluatiemomenten?.length || 0;
  const hasVeiligheidsplan = !!veiligheidsplan;

  // Count pending evaluations
  const pendingEvaluaties =
    evaluatiemomenten?.filter((e) => e.status === 'gepland').length || 0;

  return (
    <Card className={cn('', className)}>
      {/* Collapsed header */}
      <CardHeader
        className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-700">
              Planning & Evaluatie
            </span>
          </div>
          <div className="flex items-center gap-2">
            {pendingEvaluaties > 0 && (
              <Badge variant="secondary" className="text-xs">
                {pendingEvaluaties} gepland
              </Badge>
            )}
            {hasVeiligheidsplan && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                <Shield className="h-3 w-3 mr-1" />
                Veiligheidsplan
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expanded content */}
      {isExpanded && (
        <CardContent className="p-4 pt-0 space-y-4 border-t">
          {/* Behandelstructuur */}
          {behandelstructuur && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Behandelstructuur
              </h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{behandelstructuur.duur}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">{behandelstructuur.frequentie}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">
                  {behandelstructuur.aantalSessies} sessies
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700">{behandelstructuur.vorm}</span>
              </div>
            </div>
          )}

          {/* Evaluatiemomenten */}
          {evaluatiemomenten && evaluatiemomenten.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Evaluatiemomenten
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {evaluatiemomenten.map((eval_) => (
                  <EvaluatieItem key={eval_.id} evaluatie={eval_} />
                ))}
              </div>
            </div>
          )}

          {/* Veiligheidsplan */}
          {veiligheidsplan && (
            <VeiligheidsplanSection veiligheidsplan={veiligheidsplan} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface EvaluatieItemProps {
  evaluatie: Evaluatiemoment;
}

function EvaluatieItem({ evaluatie }: EvaluatieItemProps) {
  const isCompleted = evaluatie.status === 'afgerond';
  const typeLabel =
    evaluatie.type === 'tussentijds'
      ? 'Tussentijds'
      : evaluatie.type === 'eind'
        ? 'Eind'
        : 'Crisis';

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-md text-sm',
        isCompleted ? 'bg-green-50' : 'bg-slate-50'
      )}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="font-medium text-slate-700 truncate">
          Week {evaluatie.weekNumber}: {typeLabel}
        </p>
        {evaluatie.plannedDate && (
          <p className="text-xs text-slate-500">
            {new Date(evaluatie.plannedDate).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

interface VeiligheidsplanSectionProps {
  veiligheidsplan: Veiligheidsplan;
}

function VeiligheidsplanSection({ veiligheidsplan }: VeiligheidsplanSectionProps) {
  return (
    <div className="space-y-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
      <div className="flex items-center gap-2 text-orange-700">
        <Shield className="h-4 w-4" />
        <h4 className="font-medium text-sm">Veiligheidsplan</h4>
      </div>

      {/* Waarschuwingssignalen */}
      {veiligheidsplan.waarschuwingssignalen.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-700 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Waarschuwingssignalen
          </p>
          <ul className="text-sm text-orange-900 space-y-0.5">
            {veiligheidsplan.waarschuwingssignalen.map((signal, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-orange-400">•</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coping strategieën */}
      {veiligheidsplan.copingStrategieen.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-700">
            Coping strategieën
          </p>
          <ul className="text-sm text-orange-900 space-y-0.5">
            {veiligheidsplan.copingStrategieen.map((strategy, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-orange-400">•</span>
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contacten */}
      {veiligheidsplan.contacten.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-700 flex items-center gap-1">
            <Phone className="h-3 w-3" />
            Noodcontacten
          </p>
          <div className="grid grid-cols-2 gap-2">
            {veiligheidsplan.contacten.map((contact, i) => (
              <div
                key={i}
                className="text-sm bg-white/50 rounded p-1.5 text-orange-900"
              >
                <p className="font-medium">{contact.naam}</p>
                <p className="text-xs text-orange-700">{contact.rol}</p>
                <p className="text-xs">{contact.telefoon}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
