/**
 * Period utilities voor Zorgnotities
 * Gedeelde functies voor server en client components
 */

export type PeriodValue = 'today' | 'yesterday' | '3days' | '7days';

export interface PeriodOption {
  value: PeriodValue;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'today', label: 'Vandaag' },
  { value: 'yesterday', label: 'Gisteren' },
  { value: '3days', label: 'Afgelopen 3 dagen' },
  { value: '7days', label: 'Afgelopen 7 dagen' },
];

/**
 * Helper functie om datumbereik te berekenen op basis van periode
 */
export function getPeriodDateRange(period: PeriodValue): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];

  let startDate: string;
  switch (period) {
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      return { startDate, endDate: startDate }; // Single day
    }
    case '3days': {
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
      startDate = threeDaysAgo.toISOString().split('T')[0];
      break;
    }
    case '7days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
      break;
    }
    case 'today':
    default:
      startDate = endDate;
      break;
  }

  return { startDate, endDate };
}

/**
 * Helper functie voor display tekst
 */
export function getPeriodDisplayText(period: PeriodValue): string {
  const option = PERIOD_OPTIONS.find((o) => o.value === period);
  return option?.label || 'Vandaag';
}
