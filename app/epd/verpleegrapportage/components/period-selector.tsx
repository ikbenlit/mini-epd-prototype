'use client';

/**
 * PeriodSelector Component voor Verpleegrapportage
 * Periode selectie die URL params behoudt (patient + periode)
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
import { PERIOD_OPTIONS, type PeriodValue } from '../lib/period-utils';

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get('periode') as PeriodValue) || '1d';

  const handlePeriodChange = (value: PeriodValue) => {
    const params = new URLSearchParams(searchParams.toString());
    // Keep patient param if present
    if (value === '1d') {
      params.delete('periode'); // Default is 24 uur
    } else {
      params.set('periode', value);
    }
    const queryString = params.toString();
    router.push(`/epd/verpleegrapportage/overdracht${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const currentOption = PERIOD_OPTIONS.find((o) => o.value === currentPeriod);

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-500" />
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200">
          <SelectValue placeholder="Selecteer periode">
            {currentOption?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                <span className="text-xs text-slate-500">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
