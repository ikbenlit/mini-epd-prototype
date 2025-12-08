/**
 * Period utilities voor Overdracht
 * Gedeelde functies voor server en client components
 */

export type PeriodValue = '1d' | '3d' | '7d' | '14d';

export interface PeriodOption {
  value: PeriodValue;
  label: string;
  description: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: '1d', label: 'Vandaag', description: 'Laatste 24 uur' },
  { value: '3d', label: '3 dagen', description: 'Afgelopen 3 dagen' },
  { value: '7d', label: '1 week', description: 'Afgelopen 7 dagen' },
  { value: '14d', label: '2 weken', description: 'Afgelopen 14 dagen' },
];

/**
 * Helper functie om datumbereik te berekenen op basis van periode
 */
export function getPeriodDays(period: PeriodValue): number {
  switch (period) {
    case '1d': return 1;
    case '3d': return 3;
    case '7d': return 7;
    case '14d': return 14;
    default: return 7;
  }
}

export function getPeriodDateRange(period: PeriodValue): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];

  const days = getPeriodDays(period);
  const startDateTime = new Date(today);
  startDateTime.setDate(startDateTime.getDate() - (days - 1));
  const startDate = startDateTime.toISOString().split('T')[0];

  return { startDate, endDate };
}

export function getPeriodLabel(period: PeriodValue): string {
  const option = PERIOD_OPTIONS.find((o) => o.value === period);
  return option?.description || 'Afgelopen 7 dagen';
}
