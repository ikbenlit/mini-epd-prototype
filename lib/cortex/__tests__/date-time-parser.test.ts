/**
 * Date/Time Parser - Smoke Tests
 *
 * Quick verification that parser functions work correctly
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseRelativeDate,
  parseTime,
  isDateRange,
  dateToRange,
  combineDatetime,
  isNotInPast,
  type DateRange,
} from '../date-time-parser';
import { addDays, startOfDay, endOfDay } from 'date-fns';

describe('parseRelativeDate', () => {
  it('should parse "vandaag" to today', () => {
    const result = parseRelativeDate('vandaag');
    expect(result).toBeInstanceOf(Date);
    expect(startOfDay(result as Date).getTime()).toBe(startOfDay(new Date()).getTime());
  });

  it('should parse "morgen" to tomorrow', () => {
    const result = parseRelativeDate('morgen');
    const tomorrow = addDays(new Date(), 1);
    expect(result).toBeInstanceOf(Date);
    expect(startOfDay(result as Date).getTime()).toBe(startOfDay(tomorrow).getTime());
  });

  it('should parse "overmorgen" to day after tomorrow', () => {
    const result = parseRelativeDate('overmorgen');
    const dayAfterTomorrow = addDays(new Date(), 2);
    expect(result).toBeInstanceOf(Date);
    expect(startOfDay(result as Date).getTime()).toBe(
      startOfDay(dayAfterTomorrow).getTime()
    );
  });

  it('should parse "deze week" to a DateRange', () => {
    const result = parseRelativeDate('deze week');
    expect(isDateRange(result)).toBe(true);
    if (isDateRange(result)) {
      expect(result.label).toBe('deze week');
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
      expect(result.end.getTime()).toBeGreaterThan(result.start.getTime());
    }
  });

  it('should parse "volgende week" to a DateRange', () => {
    const result = parseRelativeDate('volgende week');
    expect(isDateRange(result)).toBe(true);
    if (isDateRange(result)) {
      expect(result.label).toBe('volgende week');
    }
  });

  it('should parse weekday names', () => {
    const weekdays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    weekdays.forEach((day) => {
      const result = parseRelativeDate(day);
      expect(result).toBeInstanceOf(Date);
    });
  });

  it('should parse absolute dates like "30 december"', () => {
    const result = parseRelativeDate('30 december');
    expect(result).toBeInstanceOf(Date);
    if (result instanceof Date) {
      expect(result.getDate()).toBe(30);
      expect(result.getMonth()).toBe(11); // December = 11 (0-indexed)
    }
  });

  it('should parse ISO date format "2024-12-28"', () => {
    const result = parseRelativeDate('2024-12-28');
    expect(result).toBeInstanceOf(Date);
    if (result instanceof Date) {
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(28);
    }
  });

  it('should return null for unparseable input', () => {
    const result = parseRelativeDate('gibberish xyz');
    expect(result).toBeNull();
  });
});

describe('parseTime', () => {
  it('should parse "14:00" format', () => {
    expect(parseTime('14:00')).toBe('14:00');
  });

  it('should parse "14.00" format', () => {
    expect(parseTime('14.00')).toBe('14:00');
  });

  it('should parse hour only "14" to "14:00"', () => {
    expect(parseTime('14')).toBe('14:00');
  });

  it('should parse "twee uur" to "14:00"', () => {
    expect(parseTime('twee uur')).toBe('14:00');
  });

  it('should parse "half drie" to "14:30"', () => {
    expect(parseTime('half drie')).toBe('14:30');
  });

  it('should parse "kwart over twee" to "14:15"', () => {
    expect(parseTime('kwart over twee')).toBe('14:15');
  });

  it('should parse "kwart voor drie" to "14:45"', () => {
    expect(parseTime('kwart voor drie')).toBe('14:45');
  });

  it('should parse time of day words', () => {
    expect(parseTime('ochtend')).toBe('09:00');
    expect(parseTime('middag')).toBe('14:00');
    expect(parseTime('avond')).toBe('19:00');
  });

  it('should return null for unparseable input', () => {
    expect(parseTime('xyz')).toBeNull();
  });

  it('should handle invalid hour values', () => {
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('14:70')).toBeNull();
  });
});

describe('isDateRange', () => {
  it('should return true for DateRange objects', () => {
    const range: DateRange = {
      start: new Date(),
      end: new Date(),
      label: 'vandaag',
    };
    expect(isDateRange(range)).toBe(true);
  });

  it('should return false for Date objects', () => {
    expect(isDateRange(new Date())).toBe(false);
  });

  it('should return false for null', () => {
    expect(isDateRange(null)).toBe(false);
  });
});

describe('dateToRange', () => {
  it('should convert Date to DateRange', () => {
    const date = new Date('2024-12-28');
    const range = dateToRange(date, 'vandaag');

    expect(range.label).toBe('vandaag');
    expect(range.start).toBeInstanceOf(Date);
    expect(range.end).toBeInstanceOf(Date);
    expect(range.start.getHours()).toBe(0); // Start of day
    expect(range.end.getHours()).toBe(23); // End of day
  });
});

describe('combineDatetime', () => {
  it('should combine date and time into ISO string', () => {
    const date = new Date('2024-12-28');
    const time = '14:00';
    const result = combineDatetime(date, time);

    expect(result).toContain('2024-12-28');
    expect(result).toContain('14:00');
  });

  it('should handle date strings', () => {
    const result = combineDatetime('2024-12-28', '14:00');
    expect(result).toContain('2024-12-28');
    expect(result).toContain('14:00');
  });
});

describe('isNotInPast', () => {
  it('should return true for future dates', () => {
    const futureDate = addDays(new Date(), 1);
    expect(isNotInPast(futureDate)).toBe(true);
  });

  it('should return true for today by default', () => {
    const today = new Date();
    expect(isNotInPast(today)).toBe(true);
  });

  it('should return false for today when allowToday=false', () => {
    const today = new Date();
    expect(isNotInPast(today, false)).toBe(false);
  });

  it('should return false for past dates', () => {
    const pastDate = addDays(new Date(), -1);
    expect(isNotInPast(pastDate)).toBe(false);
  });
});
