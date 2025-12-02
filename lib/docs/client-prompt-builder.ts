/**
 * Client Prompt Builder
 *
 * Builds the system prompt for client-specific questions.
 * Includes patient context, reports, intakes, screenings, and risk assessments.
 */

import type { ClientContext } from './client-context-loader'

/**
 * Base system prompt for client questions
 */
const CLIENT_BASE_PROMPT = `Je bent een EPD-assistent die vragen beantwoordt over een specifieke cliënt in het Mini-ECD systeem.

## Belangrijke regels
1. Beantwoord ALLEEN op basis van de gegeven cliëntgegevens hieronder
2. Als informatie ontbreekt, zeg dit eerlijk (bijv. "Er zijn nog geen rapportages voor deze cliënt")
3. Geef NOOIT medisch advies, diagnoses of behandelsuggesties
4. Verzin NOOIT informatie die niet in de context staat
5. Antwoord beknopt en professioneel

## Jouw publiek
Zorgprofessionals (behandelaars, verpleegkundigen) die het EPD gebruiken.

## Stijl
- Schrijf in het Nederlands
- Wees beknopt maar volledig
- Gebruik bullet points voor overzichten
- Vermeld datums waar relevant`

/**
 * Format reports for prompt context
 */
function formatReports(reports: ClientContext['reports']): string {
  if (reports.length === 0) {
    return 'Geen rapportages beschikbaar.'
  }

  return reports
    .map((report, index) => {
      const truncatedContent =
        report.content.length > 500 ? report.content.substring(0, 500) + '...' : report.content
      return `${index + 1}. [${report.date}] ${report.type}\n${truncatedContent}`
    })
    .join('\n\n')
}

/**
 * Format intakes for prompt context
 */
function formatIntakes(intakes: ClientContext['intakes']): string {
  if (intakes.length === 0) {
    return 'Geen intakes beschikbaar.'
  }

  return intakes
    .map((intake, index) => {
      let text = `${index + 1}. ${intake.title}\n`
      text += `   - Afdeling: ${intake.department}\n`
      text += `   - Status: ${intake.status}`

      if (intake.treatmentAdvice) {
        const ta = intake.treatmentAdvice
        if (ta.advice) text += `\n   - Advies: ${ta.advice.replace(/<[^>]*>/g, '')}`
        if (ta.program) text += `\n   - Programma: ${ta.program}`
        if (ta.outcome) text += `\n   - Uitkomst: ${ta.outcome}`
      }

      if (intake.notes) {
        const truncatedNotes =
          intake.notes.length > 200 ? intake.notes.substring(0, 200) + '...' : intake.notes
        text += `\n   - Notities: ${truncatedNotes}`
      }

      return text
    })
    .join('\n\n')
}

/**
 * Format screening for prompt context
 */
function formatScreening(screening: ClientContext['screening']): string {
  if (!screening) {
    return 'Geen screening beschikbaar.'
  }

  let text = ''

  if (screening.requestForHelp) {
    text += `Hulpvraag: ${screening.requestForHelp}\n`
  } else {
    text += 'Hulpvraag: Niet ingevuld\n'
  }

  if (screening.decision) {
    text += `Beslissing: ${screening.decision}`
    if (screening.decisionNotes) {
      text += ` - ${screening.decisionNotes}`
    }
  } else {
    text += 'Beslissing: Nog niet genomen'
  }

  return text
}

/**
 * Format risk assessments for prompt context
 */
function formatRiskAssessments(riskAssessments: ClientContext['riskAssessments']): string {
  if (riskAssessments.length === 0) {
    return 'Geen risico-assessments beschikbaar.'
  }

  return riskAssessments
    .map((ra, index) => {
      return `${index + 1}. ${ra.type} - Niveau: ${ra.level} (${ra.date})\n   Onderbouwing: ${ra.rationale}`
    })
    .join('\n\n')
}

/**
 * Build the complete system prompt with client context
 *
 * @param context - The loaded client context
 * @returns The complete system prompt string
 */
export function buildClientPrompt(context: ClientContext): string {
  const sections = [
    CLIENT_BASE_PROMPT,
    '---',
    `## Cliënt: ${context.patient.name}`,
    `Geboortedatum: ${context.patient.birthDate}`,
    context.patient.status ? `Status: ${context.patient.status}` : '',
    '',
    '---',
    '## Rapportages (laatste 5)',
    formatReports(context.reports),
    '',
    '---',
    '## Intakes & Behandeladvies',
    formatIntakes(context.intakes),
    '',
    '---',
    '## Screening / Hulpvraag',
    formatScreening(context.screening),
    '',
    '---',
    "## Risico-assessments",
    formatRiskAssessments(context.riskAssessments),
    '---',
  ]

  return sections.filter(Boolean).join('\n')
}

/**
 * Build a fallback prompt when client context fails to load
 */
export function buildClientErrorPrompt(): string {
  return `${CLIENT_BASE_PROMPT}

---

Er is een fout opgetreden bij het laden van de cliëntgegevens.
Vraag de gebruiker om de pagina te verversen of later opnieuw te proberen.

---`
}
