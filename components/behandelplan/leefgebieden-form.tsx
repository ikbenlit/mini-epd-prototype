'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type LifeDomainScore,
  type LifeDomain,
  type Priority,
  LIFE_DOMAIN_META,
  LIFE_DOMAINS,
  createDefaultLifeDomainScores,
  getScoreColor,
} from '@/lib/types/leefgebieden';

interface DomainFormRowProps {
  score: LifeDomainScore;
  onChange: (score: LifeDomainScore) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Zeer laag',
  2: 'Laag',
  3: 'Gemiddeld',
  4: 'Goed',
  5: 'Uitstekend',
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'laag', label: 'Laag', color: 'bg-gray-200 text-gray-700' },
  { value: 'middel', label: 'Middel', color: 'bg-blue-100 text-blue-700' },
  { value: 'hoog', label: 'Hoog', color: 'bg-orange-100 text-orange-700' },
];

/**
 * Single domain row in the form
 */
function DomainFormRow({
  score,
  onChange,
  expanded = false,
  onToggleExpand,
}: DomainFormRowProps) {
  const meta = LIFE_DOMAIN_META[score.domain];

  const handleBaselineChange = (values: number[]) => {
    onChange({ ...score, baseline: values[0], current: values[0] });
  };

  const handleTargetChange = (values: number[]) => {
    onChange({ ...score, target: values[0] });
  };

  const handlePriorityChange = (priority: Priority) => {
    onChange({ ...score, priority });
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...score, notes });
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        expanded ? 'bg-muted/50' : 'hover:bg-muted/30',
        score.priority === 'hoog' && 'border-orange-300'
      )}
    >
      {/* Header Row */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${meta.color}20` }}
          >
            {meta.emoji}
          </div>
          <div>
            <h4 className="font-medium">{meta.label}</h4>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold"
                style={{ color: getScoreColor(score.baseline) }}
              >
                {score.baseline}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="text-lg font-bold text-foreground">
                {score.target}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {SCORE_LABELS[score.baseline]}
            </span>
          </div>
          <svg
            className={cn(
              'w-5 h-5 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4 pt-4 border-t">
          {/* Baseline Score Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Huidige score (baseline)</Label>
              <span className="text-sm font-medium">{score.baseline}</span>
            </div>
            <Slider
              value={[score.baseline]}
              onValueChange={handleBaselineChange}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zeer laag</span>
              <span>Uitstekend</span>
            </div>
          </div>

          {/* Target Score Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Doelscore</Label>
              <span className="text-sm font-medium">{score.target}</span>
            </div>
            <Slider
              value={[score.target]}
              onValueChange={handleTargetChange}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Zeer laag</span>
              <span>Uitstekend</span>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label>Prioriteit voor behandeling</Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    score.priority === option.value
                      ? option.color
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                  onClick={() => handlePriorityChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Toelichting (optioneel)</Label>
            <Textarea
              value={score.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={`Opmerkingen over ${meta.shortLabel.toLowerCase()}...`}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface LeefgebiedenFormProps {
  initialScores?: LifeDomainScore[];
  onSave: (scores: LifeDomainScore[]) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

/**
 * Complete form for entering life domain scores during intake
 */
export function LeefgebiedenForm({
  initialScores,
  onSave,
  onCancel,
  isSaving = false,
}: LeefgebiedenFormProps) {
  const [scores, setScores] = useState<LifeDomainScore[]>(
    initialScores || createDefaultLifeDomainScores()
  );
  const [expandedDomain, setExpandedDomain] = useState<LifeDomain | null>(null);

  const handleScoreChange = useCallback((updatedScore: LifeDomainScore) => {
    setScores((prev) =>
      prev.map((s) => (s.domain === updatedScore.domain ? updatedScore : s))
    );
  }, []);

  const handleToggleExpand = useCallback((domain: LifeDomain) => {
    setExpandedDomain((prev) => (prev === domain ? null : domain));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(scores);
  };

  const highPriorityCount = scores.filter((s) => s.priority === 'hoog').length;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Leefgebieden Assessment
          </CardTitle>
          <CardDescription>
            Beoordeel de 7 leefgebieden van de cliënt. Klik op een gebied om scores
            en prioriteiten aan te passen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <span>
              Klik op een leefgebied om de scores aan te passen
            </span>
            {highPriorityCount > 0 && (
              <span className="text-orange-600 font-medium">
                {highPriorityCount} hoge prioriteit{highPriorityCount > 1 ? 'en' : ''}
              </span>
            )}
          </div>

          {/* Domain Rows */}
          <div className="space-y-2">
            {LIFE_DOMAINS.map((domain) => {
              const score = scores.find((s) => s.domain === domain)!;
              return (
                <DomainFormRow
                  key={domain}
                  score={score}
                  onChange={handleScoreChange}
                  expanded={expandedDomain === domain}
                  onToggleExpand={() => handleToggleExpand(domain)}
                />
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuleren
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Opslaan...' : 'Leefgebieden opslaan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

interface LeefgebiedenQuickFormProps {
  initialScores?: LifeDomainScore[];
  onChange: (scores: LifeDomainScore[]) => void;
}

/**
 * Compact version of the form for inline editing
 */
export function LeefgebiedenQuickForm({
  initialScores,
  onChange,
}: LeefgebiedenQuickFormProps) {
  const [scores, setScores] = useState<LifeDomainScore[]>(
    initialScores || createDefaultLifeDomainScores()
  );

  const handleScoreChange = useCallback(
    (domain: LifeDomain, value: number) => {
      const updated = scores.map((s) =>
        s.domain === domain ? { ...s, baseline: value, current: value } : s
      );
      setScores(updated);
      onChange(updated);
    },
    [scores, onChange]
  );

  return (
    <div className="space-y-3">
      {LIFE_DOMAINS.map((domain) => {
        const score = scores.find((s) => s.domain === domain)!;
        const meta = LIFE_DOMAIN_META[domain];
        return (
          <div key={domain} className="flex items-center gap-3">
            <div className="w-8 text-center text-lg">{meta.emoji}</div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{meta.shortLabel}</span>
                <span
                  className="font-medium"
                  style={{ color: getScoreColor(score.baseline) }}
                >
                  {score.baseline}
                </span>
              </div>
              <Slider
                value={[score.baseline]}
                onValueChange={(v) => handleScoreChange(domain, v[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
