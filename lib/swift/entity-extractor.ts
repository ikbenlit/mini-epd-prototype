/**
 * Entity Extractor
 *
 * Extracts entities (patient name, category, content) from user input.
 */

import type { VerpleegkundigCategory } from '@/lib/types/report';
import type { ExtractedEntities, SwiftIntent } from './types';

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
