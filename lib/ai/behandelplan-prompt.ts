/**
 * Behandelplan AI Prompts
 *
 * System prompt en user prompt templates voor AI-generatie van behandelplannen
 */

import { type LifeDomainScore, LIFE_DOMAIN_META } from '@/lib/types/leefgebieden';
import { type Severity, getInterventionsForCategory, getRecommendedSessionCount, getRecommendedFrequency, getRecommendedFormat } from './intervention-mapping';

/**
 * Context voor behandelplan generatie
 */
export interface PlanContext {
  patientId: string;
  intakeNotes: string;
  dsmCategory: string;
  severity: Severity;
  lifeDomains: LifeDomainScore[];
  extraInstructions?: string;
}

/**
 * System prompt voor Claude
 * Instructies voor het genereren van een behandelplan
 */
export const BEHANDELPLAN_SYSTEM_PROMPT = `Je bent een ervaren GGZ-behandelaar die behandelplannen opstelt voor cliënten in de ambulante GGZ.
Je maakt SMART doelen die recovery-gericht en evidence-based zijn.

INSTRUCTIES:
1. Genereer 2-4 SMART doelen gebaseerd op de intake en diagnose
2. Focus op leefgebieden met prioriteit "hoog"
3. Verdeel doelen over minimaal 2 verschillende leefgebieden
4. Maak concrete, meetbare doelen (geen vage termen zoals "beter voelen")
5. Genereer voor elk doel een B1-taal versie (cliënt-vriendelijk, simpele woorden)
6. Kies evidence-based interventies passend bij de DSM-categorie
7. Plan sessies gebaseerd op severity niveau
8. Voeg een veiligheidsplan toe ALLEEN bij severity "hoog"

SMART CRITERIA:
- Specifiek: Wat precies wil de cliënt bereiken?
- Meetbaar: Hoe meten we vooruitgang? (bijv. "3x per week", "score van 3 naar 4")
- Acceptabel: Past bij wensen en mogelijkheden cliënt
- Realistisch: Haalbaar binnen de behandelperiode
- Tijdgebonden: Binnen hoeveel weken?

B1-TAAL RICHTLIJNEN (cliënt-versie):
- Korte zinnen (max 15 woorden)
- Alledaagse woorden (geen jargon)
- Actieve zinnen ("Ik ga..." niet "Er zal worden...")
- Directe aanspreking ("jij" of "je")

OUTPUT FORMAT:
Retourneer ALLEEN valide JSON volgens dit exacte schema (geen extra tekst):
{
  "behandelstructuur": {
    "duur": "string (bijv. '8 weken')",
    "frequentie": "string (bijv. 'Wekelijks')",
    "aantalSessies": number,
    "vorm": "string (bijv. 'Individueel')"
  },
  "doelen": [
    {
      "id": "string (uuid)",
      "title": "string (max 200 tekens, korte beschrijving)",
      "description": "string (SMART uitwerking, 2-3 zinnen)",
      "clientVersion": "string (B1-taal versie voor cliënt)",
      "lifeDomain": "dlv|wonen|werk|sociaal|vrijetijd|financien|gezondheid",
      "priority": "hoog|middel|laag",
      "measurability": "string (hoe meten we vooruitgang?)",
      "timelineWeeks": number,
      "status": "niet_gestart",
      "progress": 0
    }
  ],
  "interventies": [
    {
      "id": "string (uuid)",
      "name": "string (bijv. 'CGT', 'EMDR')",
      "description": "string (uitleg interventie)",
      "rationale": "string (waarom past dit bij deze cliënt?)",
      "linkedGoalIds": ["string (id van gekoppeld doel)"]
    }
  ],
  "sessiePlanning": [
    {
      "id": "string (uuid)",
      "nummer": number,
      "focus": "string (waar gaat de sessie over?)",
      "status": "gepland",
      "gekoppeldeDoelIds": ["string"]
    }
  ],
  "evaluatiemomenten": [
    {
      "id": "string (uuid)",
      "type": "tussentijds|eind",
      "weekNumber": number,
      "plannedDate": "string (ISO date, mag leeg)",
      "status": "gepland"
    }
  ],
  "veiligheidsplan": null of {
    "waarschuwingssignalen": ["string (3-5 items)"],
    "copingStrategieen": ["string (3-5 items)"],
    "contacten": [
      {
        "naam": "string",
        "rol": "string",
        "telefoon": "string"
      }
    ],
    "restricties": ["string (optioneel)"]
  }
}`;

/**
 * Bouw user prompt met context
 */
export function buildUserPrompt(context: PlanContext): string {
  // Get high priority domains
  const highPriorityDomains = context.lifeDomains.filter(d => d.priority === 'hoog');
  const lowScoreDomains = context.lifeDomains.filter(d => d.baseline <= 2);

  // Get intervention suggestions
  const suggestedInterventions = getInterventionsForCategory(context.dsmCategory, context.severity);
  const recommendedSessions = getRecommendedSessionCount(context.dsmCategory, context.severity);
  const recommendedFrequency = getRecommendedFrequency(context.severity);
  const recommendedFormat = getRecommendedFormat(context.severity);

  // Build life domains section
  const lifeDomainLines = context.lifeDomains.map(d => {
    const meta = LIFE_DOMAIN_META[d.domain];
    const priorityMarker = d.priority === 'hoog' ? ' [PRIORITEIT]' : '';
    const lowScoreMarker = d.baseline <= 2 ? ' [LAAG]' : '';
    return `- ${meta.label} (${d.domain}): ${d.baseline}/5 → doel ${d.target}/5${priorityMarker}${lowScoreMarker}${d.notes ? ` (${d.notes})` : ''}`;
  }).join('\n');

  // Build intervention suggestions
  const interventionLines = suggestedInterventions.slice(0, 3).map(i =>
    `- ${i.name}: ${i.description} (~${i.recommendedSessions} sessies)`
  ).join('\n');

  return `CLIËNT CONTEXT:
=================
Intake notities:
${context.intakeNotes}

DSM-categorie: ${context.dsmCategory}
Severity: ${context.severity}

LEEFGEBIEDEN ASSESSMENT:
========================
${lifeDomainLines}

${highPriorityDomains.length > 0 ? `
FOCUS GEBIEDEN (hoge prioriteit):
${highPriorityDomains.map(d => `- ${LIFE_DOMAIN_META[d.domain].label}`).join('\n')}
` : ''}
${lowScoreDomains.length > 0 ? `
AANDACHTSPUNTEN (lage scores):
${lowScoreDomains.map(d => `- ${LIFE_DOMAIN_META[d.domain].label} (score: ${d.baseline}/5)`).join('\n')}
` : ''}

AANBEVOLEN INTERVENTIES (evidence-based):
=========================================
${interventionLines}

AANBEVOLEN BEHANDELSTRUCTUUR:
=============================
- Aantal sessies: ~${recommendedSessions}
- Frequentie: ${recommendedFrequency}
- Vorm: ${recommendedFormat}

${context.extraInstructions ? `
EXTRA INSTRUCTIES VAN BEHANDELAAR:
==================================
${context.extraInstructions}
` : ''}

Genereer nu een compleet behandelplan in JSON formaat.
Zorg dat elk doel:
1. Gekoppeld is aan een leefgebied met hoge prioriteit of lage score
2. Een meetbare indicator heeft
3. Een B1-taal versie heeft voor de cliënt
4. Realistisch is voor de behandelperiode

${context.severity === 'hoog' ? 'BELANGRIJK: Voeg ook een veiligheidsplan toe met waarschuwingssignalen, copingstrategieën en contactpersonen.' : ''}`;
}

/**
 * Valideer of de context voldoende informatie bevat
 */
export function validatePlanContext(context: PlanContext): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!context.intakeNotes || context.intakeNotes.length < 50) {
    errors.push('Intake notities zijn te kort (minimaal 50 tekens)');
  }

  if (!context.dsmCategory) {
    errors.push('DSM-categorie ontbreekt');
  }

  if (!context.severity) {
    errors.push('Severity niveau ontbreekt');
  }

  if (!context.lifeDomains || context.lifeDomains.length !== 7) {
    errors.push('Leefgebieden assessment is incompleet (7 domeinen vereist)');
  }

  const hasHighPriority = context.lifeDomains?.some(d => d.priority === 'hoog');
  if (!hasHighPriority) {
    errors.push('Minimaal 1 leefgebied moet prioriteit "hoog" hebben');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
