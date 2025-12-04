/**
 * Evidence-Based Intervention Mapping
 *
 * Mapping van DSM-categorieën naar evidence-based interventies
 * met sessie-aantallen per severity level
 */

export interface InterventionSuggestion {
  name: string;
  description: string;
  sessions: {
    laag: number;
    middel: number;
    hoog: number;
  };
}

export type Severity = 'laag' | 'middel' | 'hoog';

/**
 * DSM categorieën naar interventie mapping
 * Gebaseerd op richtlijnen GGZ Standaarden
 */
export const INTERVENTION_MAPPING: Record<string, InterventionSuggestion[]> = {
  angststoornissen: [
    {
      name: 'CGT',
      description: 'Cognitieve Gedragstherapie gericht op angstreductie door blootstelling en cognitieve herstructurering',
      sessions: { laag: 8, middel: 10, hoog: 14 },
    },
    {
      name: 'Exposure therapie',
      description: 'Systematische blootstelling aan angstopwekkende situaties met responspreventie',
      sessions: { laag: 6, middel: 8, hoog: 12 },
    },
    {
      name: 'ACT',
      description: 'Acceptance and Commitment Therapy voor psychologische flexibiliteit',
      sessions: { laag: 8, middel: 10, hoog: 12 },
    },
  ],
  stemmingsklachten: [
    {
      name: 'CGT',
      description: 'Cognitieve Gedragstherapie gericht op negatieve denkpatronen en gedragsactivatie',
      sessions: { laag: 8, middel: 10, hoog: 14 },
    },
    {
      name: 'IPT',
      description: 'Interpersoonlijke Therapie gericht op relationele patronen en sociale steun',
      sessions: { laag: 8, middel: 12, hoog: 16 },
    },
    {
      name: 'Gedragsactivatie',
      description: 'Gestructureerde toename van plezierige en betekenisvolle activiteiten',
      sessions: { laag: 6, middel: 8, hoog: 10 },
    },
  ],
  trauma_ptss: [
    {
      name: 'EMDR',
      description: 'Eye Movement Desensitization and Reprocessing voor traumaverwerking',
      sessions: { laag: 6, middel: 10, hoog: 16 },
    },
    {
      name: 'Narratieve therapie',
      description: 'Verwerking door het opbouwen van een coherent traumaverhaal',
      sessions: { laag: 8, middel: 12, hoog: 16 },
    },
    {
      name: 'CGT trauma-focus',
      description: 'Trauma-gefocuste CGT met exposure en cognitieve verwerking',
      sessions: { laag: 8, middel: 12, hoog: 16 },
    },
  ],
  persoonlijkheid: [
    {
      name: 'Schematherapie',
      description: 'Langdurige therapie gericht op disfunctionele schemas en copingstijlen',
      sessions: { laag: 16, middel: 24, hoog: 40 },
    },
    {
      name: 'MBT',
      description: 'Mentalization-Based Treatment voor emotieregulatie en relaties',
      sessions: { laag: 16, middel: 24, hoog: 40 },
    },
    {
      name: 'DGT',
      description: 'Dialectische Gedragstherapie voor emotieregulatie en crisisvaardigheden',
      sessions: { laag: 16, middel: 24, hoog: 40 },
    },
  ],
  verslaving: [
    {
      name: 'Motiverende gespreksvoering',
      description: 'Versterken van intrinsieke motivatie voor gedragsverandering',
      sessions: { laag: 4, middel: 6, hoog: 8 },
    },
    {
      name: 'CGT verslaving',
      description: 'Cognitieve Gedragstherapie gericht op craving en terugvalpreventie',
      sessions: { laag: 8, middel: 12, hoog: 16 },
    },
    {
      name: 'Terugvalpreventie',
      description: 'Identificeren en managen van risicosituaties en triggers',
      sessions: { laag: 6, middel: 8, hoog: 12 },
    },
  ],
  adhd: [
    {
      name: 'Psycho-educatie',
      description: 'Educatie over ADHD en praktische copingstrategieën',
      sessions: { laag: 4, middel: 6, hoog: 8 },
    },
    {
      name: 'Coaching/planning',
      description: 'Structuur en planningsvaardigheden ontwikkelen',
      sessions: { laag: 6, middel: 8, hoog: 12 },
    },
    {
      name: 'CGT ADHD',
      description: 'Gedragstherapie gericht op impulscontrole en executieve functies',
      sessions: { laag: 8, middel: 10, hoog: 14 },
    },
  ],
  autisme: [
    {
      name: 'Psycho-educatie',
      description: 'Educatie over autisme en zelfacceptatie',
      sessions: { laag: 4, middel: 6, hoog: 8 },
    },
    {
      name: 'Sociale vaardigheden',
      description: 'Training in sociale interactie en communicatie',
      sessions: { laag: 8, middel: 12, hoog: 16 },
    },
    {
      name: 'Stressmanagement',
      description: 'Omgaan met prikkels en sensorische overbelasting',
      sessions: { laag: 6, middel: 8, hoog: 12 },
    },
  ],
  overig: [
    {
      name: 'Ondersteunende gesprekken',
      description: 'Steunende begeleiding en reflectie',
      sessions: { laag: 4, middel: 6, hoog: 8 },
    },
    {
      name: 'Psycho-educatie',
      description: 'Educatie over klachten en copingstrategieën',
      sessions: { laag: 4, middel: 6, hoog: 8 },
    },
  ],
};

/**
 * Haal interventies op voor een DSM categorie
 */
export function getInterventionsForCategory(
  dsmCategory: string,
  severity: Severity
): { name: string; description: string; recommendedSessions: number }[] {
  // Normalize category
  const normalizedCategory = dsmCategory
    .toLowerCase()
    .replace(/[^a-z]/g, '_')
    .replace(/_+/g, '_');

  // Find matching category
  const interventions =
    INTERVENTION_MAPPING[normalizedCategory] ||
    INTERVENTION_MAPPING['overig'];

  return interventions.map((intervention) => ({
    name: intervention.name,
    description: intervention.description,
    recommendedSessions: intervention.sessions[severity],
  }));
}

/**
 * Bereken aanbevolen aantal sessies
 */
export function getRecommendedSessionCount(
  dsmCategory: string,
  severity: Severity
): number {
  const interventions = getInterventionsForCategory(dsmCategory, severity);
  if (interventions.length === 0) return 8;

  // Neem gemiddelde van eerste 2 interventies
  const topInterventions = interventions.slice(0, 2);
  const avg =
    topInterventions.reduce((sum, i) => sum + i.recommendedSessions, 0) /
    topInterventions.length;

  return Math.round(avg);
}

/**
 * Bepaal behandelvorm op basis van severity
 */
export function getRecommendedFormat(severity: Severity): string {
  switch (severity) {
    case 'laag':
      return 'Individueel';
    case 'middel':
      return 'Individueel';
    case 'hoog':
      return 'Individueel + groep (optioneel)';
    default:
      return 'Individueel';
  }
}

/**
 * Bepaal behandelfrequentie op basis van severity
 */
export function getRecommendedFrequency(severity: Severity): string {
  switch (severity) {
    case 'laag':
      return 'Wekelijks tot tweewekelijks';
    case 'middel':
      return 'Wekelijks';
    case 'hoog':
      return 'Wekelijks tot 2x per week';
    default:
      return 'Wekelijks';
  }
}
