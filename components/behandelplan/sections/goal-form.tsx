'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SmartGoal, GoalStatus } from '@/lib/types/behandelplan';
import { LIFE_DOMAINS, LIFE_DOMAIN_META, type LifeDomain } from '@/lib/types/leefgebieden';

interface GoalFormProps {
  initialData?: SmartGoal | null;
  onChange: (data: SmartGoal) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'hoog', label: 'Hoog' },
  { value: 'middel', label: 'Middel' },
  { value: 'laag', label: 'Laag' },
];

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: 'niet_gestart', label: 'Niet gestart' },
  { value: 'bezig', label: 'Bezig' },
  { value: 'gehaald', label: 'Gehaald' },
  { value: 'bijgesteld', label: 'Bijgesteld' },
];

export function GoalForm({ initialData, onChange }: GoalFormProps) {
  const [data, setData] = useState<SmartGoal>(
    initialData || {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      clientVersion: '',
      lifeDomain: 'dlv',
      priority: 'middel',
      measurability: '',
      timelineWeeks: 8,
      status: 'niet_gestart',
      progress: 0,
    }
  );

  const handleChange = <K extends keyof SmartGoal>(field: K, value: SmartGoal[K]) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Korte beschrijving van het doel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lifeDomain">Leefgebied</Label>
          <Select
            value={data.lifeDomain}
            onValueChange={(v) => handleChange('lifeDomain', v as LifeDomain)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecteer leefgebied" />
            </SelectTrigger>
            <SelectContent>
              {LIFE_DOMAINS.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {LIFE_DOMAIN_META[domain].emoji} {LIFE_DOMAIN_META[domain].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">SMART Beschrijving</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientVersion">Cliënt versie (B1-taal)</Label>
        <Textarea
          id="clientVersion"
          value={data.clientVersion}
          onChange={(e) => handleChange('clientVersion', e.target.value)}
          placeholder="Eenvoudige uitleg voor de cliënt"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioriteit</Label>
          <Select
            value={data.priority}
            onValueChange={(v) => handleChange('priority', v as 'hoog' | 'middel' | 'laag')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={data.status}
            onValueChange={(v) => handleChange('status', v as GoalStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timelineWeeks">Tijdlijn (weken)</Label>
          <Input
            id="timelineWeeks"
            type="number"
            min={1}
            max={52}
            value={data.timelineWeeks}
            onChange={(e) => handleChange('timelineWeeks', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="measurability">Meetbaarheid</Label>
        <Input
          id="measurability"
          value={data.measurability}
          onChange={(e) => handleChange('measurability', e.target.value)}
          placeholder="Hoe meten we vooruitgang?"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Voortgang</Label>
          <span className="text-sm text-slate-500">{data.progress}%</span>
        </div>
        <Slider
          value={[data.progress]}
          onValueChange={(v) => handleChange('progress', v[0])}
          max={100}
          step={5}
        />
      </div>
    </div>
  );
}
