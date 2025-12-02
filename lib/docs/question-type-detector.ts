/**
 * Question Type Detector
 *
 * Detects whether a user question is about:
 * - 'client': Questions about the active patient/client
 * - 'documentation': Questions about how to use the EPD system
 * - 'ambiguous': Unclear, defaults to documentation
 */

export type QuestionType = 'client' | 'documentation' | 'ambiguous'

/**
 * Keywords that indicate a client-related question
 */
const CLIENT_KEYWORDS = [
  // Direct client references
  'rapportage',
  'rapportages',
  'rapportage',
  'notitie',
  'notities',
  'risico',
  "risico's",
  'risicoassessment',
  'behandeladvies',
  'behandeladviezen',
  'screening',
  'hulpvraag',
  'samenvatting',
  'dossier',
  'deze cliënt',
  'deze client',
  'deze patiënt',
  'deze patient',
  // Client data questions
  'wat staat er',
  'wat is er genoteerd',
  'laatste',
  'recente',
  'actuele',
  'huidige status',
  'zijn risico',
  'haar risico',
  'zijn behandeling',
  'haar behandeling',
  // Actions on client data
  'geef een overzicht',
  'vat samen',
  'samenvatten',
  'wat weten we',
]

/**
 * Keywords that indicate a documentation/system question
 */
const DOC_KEYWORDS = [
  // How-to questions
  'hoe',
  'hoe maak ik',
  'hoe kan ik',
  'hoe werkt',
  'hoe doe ik',
  // System references
  'waar',
  'waar vind ik',
  'waar kan ik',
  'wat is',
  'wat betekent',
  'wat doet',
  // UI elements
  'knop',
  'menu',
  'scherm',
  'tab',
  'tabblad',
  'pagina',
  'formulier',
  // Feature references
  'functie',
  'functionaliteit',
  'feature',
  'optie',
  'instelling',
  // Documentation terms
  'tutorial',
  'handleiding',
  'uitleg',
  'instructie',
  'help',
  // System references
  'systeem',
  'epd',
  'applicatie',
  'software',
  'spraakherkenning',
  'spraak',
]

/**
 * Count keyword matches in a question
 */
function countKeywordMatches(question: string, keywords: string[]): number {
  const lowerQuestion = question.toLowerCase()
  return keywords.filter((keyword) => lowerQuestion.includes(keyword.toLowerCase())).length
}

/**
 * Detect the type of question based on keywords and context
 *
 * @param question - The user's question
 * @param hasClientContext - Whether a client is currently active
 * @returns The detected question type
 */
export function detectQuestionType(question: string, hasClientContext: boolean): QuestionType {
  // If no client context, always treat as documentation question
  if (!hasClientContext) {
    return 'documentation'
  }

  const clientScore = countKeywordMatches(question, CLIENT_KEYWORDS)
  const docScore = countKeywordMatches(question, DOC_KEYWORDS)

  // Clear winner
  if (clientScore > docScore) {
    return 'client'
  }

  if (docScore > clientScore) {
    return 'documentation'
  }

  // Tie or no matches - check for implicit client references
  const lowerQuestion = question.toLowerCase()

  // Short questions in client context are often about the client
  if (hasClientContext && question.length < 50) {
    // Check for implicit client questions
    const implicitClientPatterns = [
      /^wat zijn/i,
      /^wat is de/i,
      /^geef/i,
      /^toon/i,
      /^overzicht/i,
      /\?$/,
    ]

    if (implicitClientPatterns.some((pattern) => pattern.test(lowerQuestion))) {
      return 'ambiguous' // Let the system handle ambiguity gracefully
    }
  }

  // Default to documentation for safety
  return 'ambiguous'
}
