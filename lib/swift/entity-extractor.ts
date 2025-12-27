/**
 * Entity Extractor
 *
 * Extracts entities (patient name, category, content, date/time) from user input.
 */

import type { VerpleegkundigCategory } from '@/lib/types/report';
import type { ExtractedEntities, SwiftIntent } from './types';
import {
  parseRelativeDate,
  parseTime,
  isDateRange,
  dateToRange,
  type DateRange,
} from './date-time-parser';

// Category aliases mapping to canonical values
const CATEGORY_ALIASES: Record<string, VerpleegkundigCategory> = {
  // Medicatie
  medicatie: 'medicatie',
  medicijn: 'medicatie',
  medicijnen: 'medicatie',
  med: 'medicatie',
  meds: 'medicatie',

  // ADL
  adl: 'adl',
  verzorging: 'adl',
  zorg: 'adl',
  wassen: 'adl',
  eten: 'adl',
  douchen: 'adl',

  // Gedrag
  gedrag: 'gedrag',
  gedrags: 'gedrag',
  stemming: 'gedrag',
  mood: 'gedrag',
  emotie: 'gedrag',

  // Incident
  incident: 'incident',
  val: 'incident',
  gevallen: 'incident',
  ongeluk: 'incident',
  agressie: 'incident',

  // Observatie
  observatie: 'observatie',
  obs: 'observatie',
  waarneming: 'observatie',
  opmerking: 'observatie',
};

// Command words to strip from input
const COMMAND_WORDS = [
  'notitie',
  'dagnotitie',
  'nieuwe',
  'schrijf',
  'rapporteer',
  'registreer',
  'zoek',
  'zoeken',
  'vind',
  'wie',
  'is',
  'waar',
  'info',
  'gegevens',
  'dossier',
  'overdracht',
  'dienst',
  'klaar',
  'afronden',
  'einde',
  'start',
  'begin',
];

// Common Dutch first names for better name detection
const COMMON_NAMES = new Set([
  'jan', 'piet', 'klaas', 'marie', 'anna', 'lisa', 'eva', 'emma', 'sophie',
  'thomas', 'lucas', 'daan', 'sem', 'liam', 'noah', 'julia', 'sara', 'lotte',
  'willem', 'johannes', 'cornelis', 'hendrik', 'maria', 'johanna', 'elisabeth',
  'peter', 'hans', 'henk', 'johan', 'bert', 'dick', 'kees', 'jaap', 'wim',
  'annie', 'bep', 'corrie', 'dinie', 'els', 'gerda', 'hanneke', 'ineke', 'joke',
]);

/**
 * Extract entities from user input based on the detected intent.
 */
export function extractEntities(input: string, intent: SwiftIntent): ExtractedEntities {
  const trimmedInput = input.trim().toLowerCase();
  const entities: ExtractedEntities = {};

  switch (intent) {
    case 'dagnotitie':
      return extractDagnotatieEntities(trimmedInput, input);
    case 'zoeken':
      return extractZoekenEntities(trimmedInput, input);
    case 'overdracht':
      // Overdracht doesn't need entity extraction
      return entities;
    case 'agenda_query':
      return extractAgendaQueryEntities(trimmedInput, input);
    case 'create_appointment':
      return extractCreateAppointmentEntities(trimmedInput, input);
    case 'cancel_appointment':
      return extractCancelAppointmentEntities(trimmedInput, input);
    case 'reschedule_appointment':
      return extractRescheduleAppointmentEntities(trimmedInput, input);
    default:
      return entities;
  }
}

/**
 * Extract entities for dagnotitie intent.
 * Patterns:
 * - "notitie jan medicatie" → name: jan, category: medicatie
 * - "jan medicatie gegeven" → name: jan, category: medicatie, content: gegeven
 * - "notitie medicatie jan" → name: jan, category: medicatie
 */
function extractDagnotatieEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Remove command words
  const filteredWords = words.filter(w => !COMMAND_WORDS.includes(w));

  // Find category
  let categoryIndex = -1;
  for (let i = 0; i < filteredWords.length; i++) {
    const category = CATEGORY_ALIASES[filteredWords[i]];
    if (category) {
      entities.category = category;
      categoryIndex = i;
      break;
    }
  }

  // Find name (word that's not a category and looks like a name)
  for (let i = 0; i < filteredWords.length; i++) {
    if (i === categoryIndex) continue;

    const word = filteredWords[i];
    // Check if it's a known name or starts with uppercase in original
    if (isLikelyName(word, originalInput)) {
      entities.patientName = capitalizeFirst(word);
      break;
    }
  }

  // Extract remaining content
  const contentWords = filteredWords.filter((w, i) => {
    if (i === categoryIndex) return false;
    if (entities.patientName && w === entities.patientName.toLowerCase()) return false;
    return true;
  });

  if (contentWords.length > 0) {
    entities.content = contentWords.join(' ');
  }

  return entities;
}

/**
 * Extract entities for zoeken intent.
 * Patterns:
 * - "zoek jan" → name: jan
 * - "wie is marie" → name: marie
 * - "dossier piet" → name: piet
 */
function extractZoekenEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Remove command words
  const filteredWords = words.filter(w => !COMMAND_WORDS.includes(w));

  // The remaining word(s) should be the name
  for (const word of filteredWords) {
    if (isLikelyName(word, originalInput)) {
      entities.patientName = capitalizeFirst(word);
      break;
    }
  }

  // If no name found but there are remaining words, use the first one
  if (!entities.patientName && filteredWords.length > 0) {
    entities.patientName = capitalizeFirst(filteredWords[0]);
  }

  return entities;
}

/**
 * Check if a word is likely a patient name.
 */
function isLikelyName(word: string, originalInput: string): boolean {
  // Check if it's a common name
  if (COMMON_NAMES.has(word.toLowerCase())) {
    return true;
  }

  // Check if the word starts with uppercase in the original input
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  const match = originalInput.match(regex);
  if (match && match[0][0] === match[0][0].toUpperCase()) {
    return true;
  }

  // Single word that's not a category or command
  if (
    word.length >= 2 &&
    !CATEGORY_ALIASES[word] &&
    !COMMAND_WORDS.includes(word) &&
    /^[a-z]+$/i.test(word)
  ) {
    return true;
  }

  return false;
}

/**
 * Capitalize the first letter of a string.
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Escape special regex characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse category from a string (with alias support).
 */
export function parseCategory(input: string): VerpleegkundigCategory | undefined {
  const lower = input.toLowerCase().trim();
  return CATEGORY_ALIASES[lower];
}

// ============================================================================
// Agenda Entity Extraction
// ============================================================================

/**
 * Extract entities for agenda_query intent.
 * Patterns:
 * - "afspraken vandaag" → dateRange: today
 * - "agenda morgen" → dateRange: tomorrow
 * - "wat is volgende afspraak" → dateRange: from now (no explicit range)
 * - "afspraken deze week" → dateRange: this week
 */
function extractAgendaQueryEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Try to find date expression
  // Check multi-word patterns first (e.g., "deze week", "volgende week")
  for (let i = 0; i < words.length - 1; i++) {
    const twoWords = `${words[i]} ${words[i + 1]}`;
    const parsed = parseRelativeDate(twoWords);
    if (parsed) {
      if (isDateRange(parsed)) {
        entities.dateRange = parsed;
      } else {
        entities.dateRange = dateToRange(parsed, extractDateLabel(twoWords));
      }
      return entities;
    }
  }

  // Check single word patterns
  for (const word of words) {
    const parsed = parseRelativeDate(word);
    if (parsed) {
      if (isDateRange(parsed)) {
        entities.dateRange = parsed;
      } else {
        entities.dateRange = dateToRange(parsed, extractDateLabel(word));
      }
      return entities;
    }
  }

  // Default to today if no date specified
  const today = new Date();
  entities.dateRange = dateToRange(today, 'vandaag');

  return entities;
}

/**
 * Extract entities for create_appointment intent.
 * Patterns:
 * - "maak afspraak jan morgen 14:00" → patient: Jan, date: tomorrow, time: 14:00
 * - "plan intake marie vrijdag 10:00" → patient: Marie, type: intake, date: friday, time: 10:00
 * - "afspraak met piet 14:00" → patient: Piet, time: 14:00, date: today (implied)
 */
function extractCreateAppointmentEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Remove command words
  const appointmentCommands = ['maak', 'plan', 'afspraak', 'met', 'nieuwe', 'voor'];
  const filteredWords = words.filter(w => !appointmentCommands.includes(w));

  // Extract appointment type
  const typeKeywords: Record<string, ExtractedEntities['appointmentType']> = {
    'intake': 'intake',
    'behandeling': 'behandeling',
    'vervolg': 'follow-up',
    'vervolgafspraak': 'follow-up',
    'telefonisch': 'telefonisch',
    'bellen': 'telefonisch',
    'huisbezoek': 'huisbezoek',
    'thuis': 'huisbezoek',
    'online': 'online',
    'video': 'online',
    'crisis': 'crisis',
    'spoed': 'crisis',
  };

  for (const [keyword, type] of Object.entries(typeKeywords)) {
    if (lowerInput.includes(keyword)) {
      entities.appointmentType = type;
      break;
    }
  }

  // Extract location
  const locationKeywords: Record<string, ExtractedEntities['location']> = {
    'praktijk': 'praktijk',
    'online': 'online',
    'video': 'online',
    'thuis': 'thuis',
    'huisbezoek': 'thuis',
  };

  for (const [keyword, location] of Object.entries(locationKeywords)) {
    if (lowerInput.includes(keyword)) {
      entities.location = location;
      break;
    }
  }

  // Extract patient name
  for (const word of filteredWords) {
    if (isLikelyName(word, originalInput)) {
      entities.patientName = capitalizeFirst(word);
      break;
    }
  }

  // Extract date and time
  let foundDate: Date | null = null;
  let foundTime: string | null = null;

  // Try multi-word date patterns
  for (let i = 0; i < filteredWords.length - 1; i++) {
    const twoWords = `${filteredWords[i]} ${filteredWords[i + 1]}`;
    const parsed = parseRelativeDate(twoWords);
    if (parsed && !isDateRange(parsed)) {
      foundDate = parsed;
      break;
    }
  }

  // Try single word date patterns
  if (!foundDate) {
    for (const word of filteredWords) {
      const parsed = parseRelativeDate(word);
      if (parsed && !isDateRange(parsed)) {
        foundDate = parsed;
        break;
      }
    }
  }

  // Try to find time
  for (const word of filteredWords) {
    const parsed = parseTime(word);
    if (parsed) {
      foundTime = parsed;
      break;
    }
  }

  // Try multi-word time patterns (e.g., "half drie")
  if (!foundTime) {
    for (let i = 0; i < filteredWords.length - 1; i++) {
      const twoWords = `${filteredWords[i]} ${filteredWords[i + 1]}`;
      const parsed = parseTime(twoWords);
      if (parsed) {
        foundTime = parsed;
        break;
      }
    }
  }

  // Combine date and time if both found
  if (foundDate && foundTime) {
    entities.datetime = {
      date: foundDate,
      time: foundTime,
    };
  } else if (foundDate) {
    // Date without time
    entities.datetime = {
      date: foundDate,
      time: '', // Will be filled by UI or AI
    };
  } else if (foundTime) {
    // Time without date (assume today)
    entities.datetime = {
      date: new Date(),
      time: foundTime,
    };
  }

  return entities;
}

/**
 * Extract entities for cancel_appointment intent.
 * Patterns:
 * - "annuleer afspraak jan" → identifier: { type: patient, patientName: Jan }
 * - "cancel de 14:00 afspraak" → identifier: { type: time, time: 14:00 }
 * - "annuleer jan morgen" → identifier: { type: both, patientName: Jan, date: tomorrow }
 */
function extractCancelAppointmentEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Remove command words
  const cancelCommands = ['annuleer', 'cancel', 'verwijder', 'afspraak', 'de', 'van'];
  const filteredWords = words.filter(w => !cancelCommands.includes(w));

  // Extract patient name
  let patientName: string | undefined;
  for (const word of filteredWords) {
    if (isLikelyName(word, originalInput)) {
      patientName = capitalizeFirst(word);
      break;
    }
  }

  // Extract time
  let time: string | null = null;
  for (const word of filteredWords) {
    const parsed = parseTime(word);
    if (parsed) {
      time = parsed;
      break;
    }
  }

  // Extract date
  let date: Date | null = null;
  for (const word of filteredWords) {
    const parsed = parseRelativeDate(word);
    if (parsed && !isDateRange(parsed)) {
      date = parsed;
      break;
    }
  }

  // Build identifier
  if (patientName && time) {
    entities.identifier = {
      type: 'both',
      patientName,
      time,
      date: date || undefined,
    };
  } else if (patientName) {
    entities.identifier = {
      type: 'patient',
      patientName,
      date: date || undefined,
    };
  } else if (time) {
    entities.identifier = {
      type: 'time',
      time,
      date: date || undefined,
    };
  }

  return entities;
}

/**
 * Extract entities for reschedule_appointment intent.
 * Patterns:
 * - "verzet 14:00 naar 15:00" → identifier: { time: 14:00 }, newDatetime: { time: 15:00 }
 * - "verzet jan naar dinsdag" → identifier: { patientName: Jan }, newDatetime: { date: tuesday }
 * - "verzet de afspraak naar morgen 10:00" → newDatetime: { date: tomorrow, time: 10:00 }
 */
function extractRescheduleAppointmentEntities(lowerInput: string, originalInput: string): ExtractedEntities {
  const entities: ExtractedEntities = {};
  const words = lowerInput.split(/\s+/);

  // Split input on "naar" to separate old and new parts
  const naarIndex = words.indexOf('naar');
  const oldPart = naarIndex > 0 ? words.slice(0, naarIndex).join(' ') : lowerInput;
  const newPart = naarIndex > 0 ? words.slice(naarIndex + 1).join(' ') : '';

  // Remove command words
  const rescheduleCommands = ['verzet', 'verplaats', 'verschuif', 'afspraak', 'de', 'van'];
  const oldWords = oldPart.split(/\s+/).filter(w => !rescheduleCommands.includes(w));
  const newWords = newPart.split(/\s+/);

  // Extract old appointment identifier
  let patientName: string | undefined;
  for (const word of oldWords) {
    if (isLikelyName(word, originalInput)) {
      patientName = capitalizeFirst(word);
      break;
    }
  }

  let oldTime: string | null = null;
  for (const word of oldWords) {
    const parsed = parseTime(word);
    if (parsed) {
      oldTime = parsed;
      break;
    }
  }

  let oldDate: Date | null = null;
  for (const word of oldWords) {
    const parsed = parseRelativeDate(word);
    if (parsed && !isDateRange(parsed)) {
      oldDate = parsed;
      break;
    }
  }

  // Build identifier
  if (patientName && oldTime) {
    entities.identifier = {
      type: 'both',
      patientName,
      time: oldTime,
      date: oldDate || undefined,
    };
  } else if (patientName) {
    entities.identifier = {
      type: 'patient',
      patientName,
      date: oldDate || undefined,
    };
  } else if (oldTime) {
    entities.identifier = {
      type: 'time',
      time: oldTime,
      date: oldDate || undefined,
    };
  }

  // Extract new datetime
  if (newWords.length > 0) {
    let newDate: Date | null = null;
    let newTime: string | null = null;

    // Try multi-word date patterns
    for (let i = 0; i < newWords.length - 1; i++) {
      const twoWords = `${newWords[i]} ${newWords[i + 1]}`;
      const parsed = parseRelativeDate(twoWords);
      if (parsed && !isDateRange(parsed)) {
        newDate = parsed;
        break;
      }
    }

    // Try single word date patterns
    if (!newDate) {
      for (const word of newWords) {
        const parsed = parseRelativeDate(word);
        if (parsed && !isDateRange(parsed)) {
          newDate = parsed;
          break;
        }
      }
    }

    // Try to find new time
    for (const word of newWords) {
      const parsed = parseTime(word);
      if (parsed) {
        newTime = parsed;
        break;
      }
    }

    // Try multi-word time patterns
    if (!newTime) {
      for (let i = 0; i < newWords.length - 1; i++) {
        const twoWords = `${newWords[i]} ${newWords[i + 1]}`;
        const parsed = parseTime(twoWords);
        if (parsed) {
          newTime = parsed;
          break;
        }
      }
    }

    if (newDate || newTime) {
      entities.newDatetime = {
        date: newDate || new Date(), // Default to today if only time specified
        time: newTime || '',
      };
    }
  }

  return entities;
}

/**
 * Extract date label from input string
 */
function extractDateLabel(input: string): DateRange['label'] {
  const normalized = input.toLowerCase();
  if (normalized.includes('vandaag')) return 'vandaag';
  if (normalized.includes('morgen')) return 'morgen';
  if (normalized.includes('deze week')) return 'deze week';
  if (normalized.includes('volgende week')) return 'volgende week';
  return 'custom';
}
