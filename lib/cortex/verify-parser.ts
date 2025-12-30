/**
 * Manual verification script for date-time parser
 * Run with: pnpm tsx lib/cortex/verify-parser.ts
 */

import {
  parseRelativeDate,
  parseTime,
  isDateRange,
  combineDatetime,
  isNotInPast,
} from './date-time-parser';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

console.log('🧪 Testing Date/Time Parser\n');

// Test parseRelativeDate
console.log('📅 Testing parseRelativeDate():\n');

const dateTests = [
  'vandaag',
  'morgen',
  'overmorgen',
  'maandag',
  'dinsdag',
  'deze week',
  'volgende week',
  '30 december',
  '2024-12-28',
  '28-12-2024',
];

dateTests.forEach((input) => {
  const result = parseRelativeDate(input);
  if (result === null) {
    console.log(`  ❌ "${input}" → null`);
  } else if (isDateRange(result)) {
    console.log(`  ✅ "${input}" → Range: ${format(result.start, 'dd MMM', { locale: nl })} - ${format(result.end, 'dd MMM', { locale: nl })}`);
  } else {
    console.log(`  ✅ "${input}" → ${format(result, 'EEEE dd MMMM yyyy', { locale: nl })}`);
  }
});

// Test parseTime
console.log('\n⏰ Testing parseTime():\n');

const timeTests = [
  '14:00',
  '14',
  'twee uur',
  'half drie',
  'kwart over twee',
  'kwart voor drie',
  'ochtend',
  'middag',
  'avond',
];

timeTests.forEach((input) => {
  const result = parseTime(input);
  if (result === null) {
    console.log(`  ❌ "${input}" → null`);
  } else {
    console.log(`  ✅ "${input}" → ${result}`);
  }
});

// Test combineDatetime
console.log('\n🔗 Testing combineDatetime():\n');

const morgen = parseRelativeDate('morgen');
if (morgen && !isDateRange(morgen)) {
  const combined = combineDatetime(morgen, '14:00');
  console.log(`  ✅ morgen + 14:00 → ${combined}`);
}

// Test isNotInPast
console.log('\n✔️  Testing isNotInPast():\n');

const today = new Date();
const tomorrow = parseRelativeDate('morgen');
const yesterday = parseRelativeDate('gisteren');

console.log(`  Today: ${isNotInPast(today)} (expected: true)`);
if (tomorrow && !isDateRange(tomorrow)) {
  console.log(`  Tomorrow: ${isNotInPast(tomorrow)} (expected: true)`);
}
if (yesterday && !isDateRange(yesterday)) {
  console.log(`  Yesterday: ${isNotInPast(yesterday)} (expected: false)`);
}

console.log('\n✅ Verification complete!');
