'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Behandelstructuur } from '@/lib/types/behandelplan';

interface BehandelstructuurFormProps {
  initialData?: Behandelstructuur | null;
  onChange: (data: Behandelstructuur) => void;
}

const DUUR_OPTIONS = ['4 weken', '6 weken', '8 weken', '10 weken', '12 weken', '16 weken', '24 weken'];
const FREQUENTIE_OPTIONS = ['Wekelijks', 'Tweewekelijks', 'Maandelijks', '2x per week'];
const VORM_OPTIONS = ['Individueel', 'Groep', 'Gezin', 'Paar', 'Online', 'Hybride'];

export function BehandelstructuurForm({ initialData, onChange }: BehandelstructuurFormProps) {
  const [data, setData] = useState<Behandelstructuur>(
    initialData || {
      duur: '8 weken',
      frequentie: 'Wekelijks',
      aantalSessies: 8,
      vorm: 'Individueel',
    }
  );

  const handleChange = (field: keyof Behandelstructuur, value: string | number) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="duur">Duur</Label>
        <Select value={data.duur} onValueChange={(v) => handleChange('duur', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer duur" />
          </SelectTrigger>
          <SelectContent>
            {DUUR_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequentie">Frequentie</Label>
        <Select value={data.frequentie} onValueChange={(v) => handleChange('frequentie', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer frequentie" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENTIE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sessies">Aantal sessies</Label>
        <Input
          id="sessies"
          type="number"
          min={1}
          max={52}
          value={data.aantalSessies}
          onChange={(e) => handleChange('aantalSessies', parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vorm">Vorm</Label>
        <Select value={data.vorm} onValueChange={(v) => handleChange('vorm', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer vorm" />
          </SelectTrigger>
          <SelectContent>
            {VORM_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
