'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Intervention, SmartGoal } from '@/lib/types/behandelplan';
import { Checkbox } from '@/components/ui/checkbox';

interface InterventionFormProps {
  initialData?: Intervention | null;
  goals?: SmartGoal[];
  onChange: (data: Intervention) => void;
}

const COMMON_INTERVENTIONS = [
  'CGT (Cognitieve Gedragstherapie)',
  'EMDR',
  'ACT (Acceptance and Commitment Therapy)',
  'Schematherapie',
  'Psycho-educatie',
  'Mindfulness',
  'Exposure therapie',
  'Systeemtherapie',
];

export function InterventionForm({ initialData, goals = [], onChange }: InterventionFormProps) {
  const [data, setData] = useState<Intervention>(
    initialData || {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      rationale: '',
      linkedGoalIds: [],
    }
  );

  const handleChange = <K extends keyof Intervention>(field: K, value: Intervention[K]) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onChange(updated);
  };

  const toggleGoalLink = (goalId: string) => {
    const linkedGoalIds = data.linkedGoalIds.includes(goalId)
      ? data.linkedGoalIds.filter((id) => id !== goalId)
      : [...data.linkedGoalIds, goalId];
    handleChange('linkedGoalIds', linkedGoalIds);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Naam interventie</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="bijv. CGT, EMDR, ACT"
          list="interventions"
        />
        <datalist id="interventions">
          {COMMON_INTERVENTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschrijving</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Uitleg van de interventie"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rationale">Rationale</Label>
        <Textarea
          id="rationale"
          value={data.rationale}
          onChange={(e) => handleChange('rationale', e.target.value)}
          placeholder="Waarom past deze interventie bij deze cliënt?"
          rows={2}
        />
      </div>

      {goals.length > 0 && (
        <div className="space-y-2">
          <Label>Gekoppelde doelen</Label>
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal.id}`}
                  checked={data.linkedGoalIds.includes(goal.id)}
                  onCheckedChange={() => toggleGoalLink(goal.id)}
                />
                <label
                  htmlFor={`goal-${goal.id}`}
                  className="text-sm cursor-pointer"
                >
                  {goal.title || 'Doel zonder titel'}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
