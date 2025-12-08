'use client';

/**
 * PeriodSelector Component
 * Eenvoudige dropdown voor het selecteren van een periode voor de dagregistratie
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERIOD_OPTIONS, type PeriodValue } from '../../lib/period-utils';

interface PeriodSelectorProps {
  patientId: string;
}

export function PeriodSelector({ patientId }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get('periode') as PeriodValue) || 'today';

  const handlePeriodChange = (value: PeriodValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'today') {
      params.delete('periode');
    } else {
      params.set('periode', value);
    }
    const queryString = params.toString();
    router.push(
      `/epd/verpleegrapportage/rapportage/${patientId}${queryString ? `?${queryString}` : ''}`
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-500" />
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
          <SelectValue placeholder="Selecteer periode" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
