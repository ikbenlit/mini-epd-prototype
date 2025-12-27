/**
 * Manual verification script for entity extraction with date/time parser
 * Run with: pnpm tsx lib/swift/verify-entity-extraction.ts
 */

import { extractEntities } from './entity-extractor';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

console.log('🧪 Testing Entity Extraction with Date/Time Parser\n');

// Test cases for each agenda intent
const testCases = [
  {
    intent: 'agenda_query' as const,
    inputs: [
      'afspraken vandaag',
      'agenda morgen',
      'wat is volgende afspraak',
      'afspraken deze week',
    ],
  },
  {
    intent: 'create_appointment' as const,
    inputs: [
      'maak afspraak jan morgen 14:00',
      'plan intake marie vrijdag 10:00',
      'afspraak met piet twee uur',
      'maak behandeling lisa dinsdag half drie',
    ],
  },
  {
    intent: 'cancel_appointment' as const,
    inputs: [
      'annuleer afspraak jan',
      'cancel de 14:00 afspraak',
      'annuleer jan morgen',
    ],
  },
  {
    intent: 'reschedule_appointment' as const,
    inputs: [
      'verzet 14:00 naar 15:00',
      'verzet jan naar dinsdag',
      'verplaats de afspraak naar morgen 10:00',
    ],
  },
];

testCases.forEach(({ intent, inputs }) => {
  console.log(`\n📋 Testing ${intent}:\n`);

  inputs.forEach((input) => {
    const entities = extractEntities(input, intent);
    console.log(`  Input: "${input}"`);

    // Display extracted entities
    if (entities.patientName) {
      console.log(`    👤 Patient: ${entities.patientName}`);
    }

    if (entities.dateRange) {
      const { start, end, label } = entities.dateRange;
      console.log(
        `    📅 Date Range: ${format(start, 'dd MMM', { locale: nl })} - ${format(end, 'dd MMM', { locale: nl })} (${label})`
      );
    }

    if (entities.datetime) {
      const { date, time } = entities.datetime;
      const dateStr = format(date, 'dd MMMM yyyy', { locale: nl });
      console.log(`    🕐 Datetime: ${dateStr} om ${time || '(tijd niet gespecificeerd)'}`);
    }

    if (entities.appointmentType) {
      console.log(`    📝 Type: ${entities.appointmentType}`);
    }

    if (entities.location) {
      console.log(`    📍 Location: ${entities.location}`);
    }

    if (entities.identifier) {
      const { type, patientName, time, date } = entities.identifier;
      let identifierStr = `    🔍 Identifier: type=${type}`;
      if (patientName) identifierStr += `, patient=${patientName}`;
      if (time) identifierStr += `, time=${time}`;
      if (date) identifierStr += `, date=${format(date, 'dd MMM', { locale: nl })}`;
      console.log(identifierStr);
    }

    if (entities.newDatetime) {
      const { date, time } = entities.newDatetime;
      const dateStr = format(date, 'dd MMMM yyyy', { locale: nl });
      console.log(`    🔄 New Datetime: ${dateStr} om ${time || '(tijd niet gespecificeerd)'}`);
    }

    console.log('');
  });
});

console.log('✅ Verification complete!');
