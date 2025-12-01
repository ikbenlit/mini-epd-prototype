/**
 * CategoryDetector - Analyseert gebruikersvragen en bepaalt relevante knowledge categorieën
 *
 * Onderdeel van de AI Documentatie Assistent (E1.S1)
 */

/**
 * Alle beschikbare knowledge categorieën
 */
export const KNOWLEDGE_CATEGORIES = [
  'clientbeheer',
  'intake',
  'screening',
  'behandelplan',
  'spraak',
  'inloggen',
  'interface',
  'technisch',
] as const;

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

/**
 * Keyword mapping per categorie voor vraagdetectie
 */
const CATEGORY_KEYWORDS: Record<KnowledgeCategory, string[]> = {
  clientbeheer: [
    'cliënt',
    'client',
    'patient',
    'patiënt',
    'aanmaken',
    'zoeken',
    'dossier',
  ],
  intake: ['intake', 'gesprek', 'notitie', 'verslag'],
  screening: ['screening', 'vragenlijst', 'score', 'resultaat'],
  behandelplan: ['behandelplan', 'doel', 'interventie', 'plan'],
  spraak: ['spraak', 'microfoon', 'dicteren', 'stem', 'transcriptie'],
  inloggen: ['inloggen', 'wachtwoord', 'login', 'account'],
  interface: ['menu', 'knop', 'scherm', 'navigatie', 'waar vind'],
  technisch: ['api', 'fhir', 'endpoint', 'database', 'developer'],
};

/**
 * Detecteert relevante knowledge categorieën op basis van een gebruikersvraag
 *
 * @param question - De vraag van de gebruiker
 * @returns Array van gedetecteerde categorieën (kan leeg zijn)
 *
 * @example
 * detectCategories("Hoe maak ik een intake aan?")
 * // Returns: ['intake']
 *
 * @example
 * detectCategories("Waar vind ik de cliënt gegevens?")
 * // Returns: ['clientbeheer', 'interface']
 */
export function detectCategories(question: string): KnowledgeCategory[] {
  const normalized = question.toLowerCase();
  const detected: KnowledgeCategory[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      detected.push(category as KnowledgeCategory);
    }
  }

  return detected;
}
