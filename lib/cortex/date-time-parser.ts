/**
 * Date/Time Parser Utilities
 *
 * Parses natural language date and time expressions (Dutch)
 * for Cortex agenda functionality.
 */

import {
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  nextMonday,
  nextTuesday,
  nextWednesday,
  nextThursday,
  nextFriday,
  nextSaturday,
  nextSunday,
  parse,
  isValid,
} from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Date range type for queries like "deze week"
 */
export interface DateRange {
  start: Date;
  end: Date;
  label: 'vandaag' | 'morgen' | 'deze week' | 'volgende week' | 'custom';
}

/**
 * Parse relative date expressions (Dutch)
 *
 * Supports:
 * - "vandaag", "morgen", "overmorgen"
 * - "maandag", "dinsdag", etc. (next occurrence of weekday)
 * - "deze week", "volgende week" (returns DateRange)
 * - Absolute dates: "30 december", "28-12-2024"
 *
 * @param input - Natural language date expression
 * @returns Date object, DateRange, or null if unparseable
 *
 * @example
 * parseRelativeDate("morgen") // tomorrow's date
 * parseRelativeDate("deze week") // { start: Mon, end: Sun, label: "deze week" }
 * parseRelativeDate("dinsdag") // next Tuesday
 */
export function parseRelativeDate(input: string): Date | DateRange | null {
  const today = new Date();
  const normalized = input.toLowerCase().trim();

  // Single day patterns (check longer patterns first to avoid "morgen" matching in "overmorgen")
  const singleDayPatterns: Record<string, () => Date> = {
    overmorgen: () => addDays(today, 2),
    eergisteren: () => addDays(today, -2), // Voor queries
    vandaag: () => today,
    morgen: () => addDays(today, 1),
    gisteren: () => addDays(today, -1), // Voor queries
  };

  // Check single day patterns (exact match or word boundary)
  for (const [pattern, fn] of Object.entries(singleDayPatterns)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${pattern}\\b`, 'i');
    if (regex.test(normalized)) {
      return fn();
    }
  }

  // Weekday patterns (next occurrence)
  const weekdayPatterns: Record<string, () => Date> = {
    maandag: () => nextMonday(today),
    dinsdag: () => nextTuesday(today),
    woensdag: () => nextWednesday(today),
    donderdag: () => nextThursday(today),
    vrijdag: () => nextFriday(today),
    zaterdag: () => nextSaturday(today),
    zondag: () => nextSunday(today),
  };

  // Check weekday patterns
  for (const [pattern, fn] of Object.entries(weekdayPatterns)) {
    if (normalized === pattern || normalized.includes(pattern)) {
      return fn();
    }
  }

  // Week range patterns (returns DateRange)
  const weekRangePatterns: Record<
    string,
    () => DateRange
  > = {
    'deze week': () => ({
      start: startOfWeek(today, { locale: nl, weekStartsOn: 1 }), // Monday
      end: endOfWeek(today, { locale: nl, weekStartsOn: 1 }), // Sunday
      label: 'deze week',
    }),
    'volgende week': () => {
      const nextWeek = addWeeks(today, 1);
      return {
        start: startOfWeek(nextWeek, { locale: nl, weekStartsOn: 1 }),
        end: endOfWeek(nextWeek, { locale: nl, weekStartsOn: 1 }),
        label: 'volgende week',
      };
    },
  };

  // Check week range patterns
  for (const [pattern, fn] of Object.entries(weekRangePatterns)) {
    if (normalized.includes(pattern)) {
      return fn();
    }
  }

  // Try parsing absolute dates
  // Format: "30 december", "30 dec", "28-12-2024", "28/12/2024"
  const absoluteDatePatterns = [
    'd MMMM', // "30 december"
    'd MMM', // "30 dec"
    'd-M-yyyy', // "28-12-2024"
    'dd-MM-yyyy', // "28-12-2024"
    'd/M/yyyy', // "28/12/2024"
    'dd/MM/yyyy', // "28/12/2024"
    'yyyy-MM-dd', // ISO format "2024-12-28"
  ];

  for (const pattern of absoluteDatePatterns) {
    try {
      const parsed = parse(normalized, pattern, today, { locale: nl });
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      // Continue to next pattern
    }
  }

  // Could not parse
  return null;
}

/**
 * Check if a parsed result is a DateRange
 */
export function isDateRange(result: Date | DateRange | null): result is DateRange {
  return result !== null && typeof result === 'object' && 'start' in result && 'end' in result;
}

/**
 * Convert single date to DateRange (start of day to end of day)
 */
export function dateToRange(date: Date, label: DateRange['label'] = 'custom'): DateRange {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
    label,
  };
}

/**
 * Parse time expressions (Dutch)
 *
 * Supports:
 * - "14:00" → "14:00"
 * - "14" → "14:00"
 * - "twee uur" → "14:00"
 * - "half drie" → "14:30"
 * - "kwart voor drie" → "14:45"
 * - "kwart over twee" → "14:15"
 *
 * @param input - Natural language time expression
 * @returns Time string in HH:mm format, or null if unparseable
 *
 * @example
 * parseTime("14:00") // "14:00"
 * parseTime("half drie") // "14:30"
 * parseTime("twee uur") // "14:00"
 */
export function parseTime(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  // Direct time format: "14:00" or "14.00"
  const timePattern = /^(\d{1,2})[:\.](\d{2})$/;
  const match = normalized.match(timePattern);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }

  // Just hour: "14" → "14:00"
  const hourPattern = /^(\d{1,2})$/;
  const hourMatch = normalized.match(hourPattern);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1], 10);
    if (hours >= 0 && hours <= 23) {
      return `${hours.toString().padStart(2, '0')}:00`;
    }
  }

  // Dutch time words
  const timeWords: Record<string, string> = {
    // Full hours
    'een uur': '13:00',
    'twee uur': '14:00',
    'drie uur': '15:00',
    'vier uur': '16:00',
    'vijf uur': '17:00',
    'zes uur': '18:00',
    'zeven uur': '19:00',
    'acht uur': '20:00',
    'negen uur': '21:00',
    'tien uur': '22:00',
    'elf uur': '23:00',
    'twaalf uur': '12:00',

    // Morning variants
    'ochtend': '09:00', // Default morning time
    's ochtends': '09:00',
    'ochtendje': '09:00',

    // Afternoon/evening
    'middag': '14:00',
    's middags': '14:00',
    'namiddag': '14:00',
    'avond': '19:00',
    's avonds': '19:00',
    'vanavond': '19:00',

    // Half hours (common expressions)
    'half een': '12:30',
    'half twee': '13:30',
    'half drie': '14:30',
    'half vier': '15:30',
    'half vijf': '16:30',
    'half zes': '17:30',
    'half zeven': '18:30',
    'half acht': '19:30',
    'half negen': '20:30',
    'half tien': '21:30',
    'half elf': '22:30',
    'half twaalf': '23:30',

    // Quarter hours
    'kwart over een': '13:15',
    'kwart over twee': '14:15',
    'kwart over drie': '15:15',
    'kwart voor twee': '13:45',
    'kwart voor drie': '14:45',
    'kwart voor vier': '15:45',
  };

  // Check if input matches any time word pattern
  for (const [pattern, time] of Object.entries(timeWords)) {
    if (normalized === pattern || normalized.includes(pattern)) {
      return time;
    }
  }

  // Could not parse
  return null;
}

/**
 * Combine date and time into ISO datetime string
 *
 * @param date - Date object or date string
 * @param time - Time string in HH:mm format
 * @returns ISO datetime string
 *
 * @example
 * combineDatetime(new Date('2024-12-28'), '14:00')
 * // "2024-12-28T14:00:00"
 */
export function combineDatetime(date: Date | string, time: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const [hours, minutes] = time.split(':').map(Number);

  const combined = new Date(dateObj);
  combined.setHours(hours, minutes, 0, 0);

  return combined.toISOString();
}

/**
 * Validate that a date is not in the past
 *
 * @param date - Date to validate
 * @param allowToday - Whether today is considered valid (default: true)
 * @returns true if date is valid (not in past)
 */
export function isNotInPast(date: Date, allowToday = true): boolean {
  const today = startOfDay(new Date());
  const checkDate = startOfDay(date);

  if (allowToday) {
    return checkDate >= today;
  }

  return checkDate > today;
}
