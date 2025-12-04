/**
 * Leefgebieden (Life Domains) Types
 *
 * 7 levensdomeinen volgens herstelgerichte GGZ-methodiek
 * Gebruikt voor intake-assessment en behandelplan doelen
 */

import { z } from 'zod';

/**
 * De 7 leefgebieden (levensdomeinen)
 */
export const LIFE_DOMAINS = [
  'dlv',        // Dagelijkse Levensverrichtingen
  'wonen',      // Wonen
  'werk',       // Werk/Dagbesteding
  'sociaal',    // Sociaal netwerk
  'vrijetijd',  // Vrijetijd/Zingeving
  'financien',  // Financiën
  'gezondheid', // Lichamelijke gezondheid
] as const;

export type LifeDomain = typeof LIFE_DOMAINS[number];

/**
 * Prioriteit niveau
 */
export const PRIORITIES = ['laag', 'middel', 'hoog'] as const;
export type Priority = typeof PRIORITIES[number];

/**
 * Leefgebied metadata (labels, kleuren, emoji's)
 */
export const LIFE_DOMAIN_META: Record<LifeDomain, {
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  dlv: {
    label: 'Dagelijkse Levensverrichtingen',
    shortLabel: 'DLV',
    emoji: '🏠',
    color: '#8b5cf6', // paars
    description: 'Zelfzorg, structuur, dagritme',
  },
  wonen: {
    label: 'Wonen',
    shortLabel: 'Wonen',
    emoji: '🏡',
    color: '#ec4899', // roze
    description: 'Woonsituatie, veiligheid thuis',
  },
  werk: {
    label: 'Werk/Dagbesteding',
    shortLabel: 'Werk',
    emoji: '💼',
    color: '#f59e0b', // oranje
    description: 'Baan, opleiding, vrijwilligerswerk',
  },
  sociaal: {
    label: 'Sociaal netwerk',
    shortLabel: 'Sociaal',
    emoji: '👥',
    color: '#3b82f6', // blauw
    description: 'Familie, vrienden, relaties',
  },
  vrijetijd: {
    label: 'Vrijetijd/Zingeving',
    shortLabel: 'Vrijetijd',
    emoji: '🎯',
    color: '#10b981', // groen
    description: "Hobby's, levensdoel, spiritualiteit",
  },
  financien: {
    label: 'Financiën',
    shortLabel: 'Financiën',
    emoji: '💰',
    color: '#eab308', // geel
    description: 'Schulden, inkomen, budgettering',
  },
  gezondheid: {
    label: 'Lichamelijke gezondheid',
    shortLabel: 'Gezondheid',
    emoji: '🏃',
    color: '#ef4444', // rood
    description: 'Slaap, beweging, voeding',
  },
};

/**
 * Score per leefgebied (1-5 schaal)
 */
export interface LifeDomainScore {
  domain: LifeDomain;
  baseline: number;      // 1-5, score bij intake
  current: number;       // 1-5, huidige score (voor evaluatie)
  target: number;        // 1-5, doelscore
  notes: string;         // Toelichting
  priority: Priority;    // Prioriteit voor behandeling
}

/**
 * Zod schema voor validatie
 */
export const LifeDomainScoreSchema = z.object({
  domain: z.enum(LIFE_DOMAINS),
  baseline: z.number().min(1).max(5),
  current: z.number().min(1).max(5),
  target: z.number().min(1).max(5),
  notes: z.string().default(''),
  priority: z.enum(PRIORITIES),
});

export const LifeDomainScoresSchema = z.array(LifeDomainScoreSchema).length(7);

/**
 * Type voor het volledige leefgebieden formulier
 */
export type LifeDomainScores = LifeDomainScore[];

/**
 * Default waarden voor nieuw formulier
 */
export function createDefaultLifeDomainScores(): LifeDomainScores {
  return LIFE_DOMAINS.map((domain) => ({
    domain,
    baseline: 3,
    current: 3,
    target: 4,
    notes: '',
    priority: 'middel' as Priority,
  }));
}

/**
 * Helper: krijg leefgebieden met hoge prioriteit
 */
export function getHighPriorityDomains(scores: LifeDomainScores): LifeDomainScore[] {
  return scores.filter((s) => s.priority === 'hoog');
}

/**
 * Helper: krijg leefgebieden met lage scores (problematisch)
 */
export function getLowScoreDomains(scores: LifeDomainScores, threshold = 2): LifeDomainScore[] {
  return scores.filter((s) => s.baseline <= threshold);
}

/**
 * Helper: bereken gemiddelde score
 */
export function getAverageScore(scores: LifeDomainScores, type: 'baseline' | 'current' | 'target' = 'baseline'): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s[type], 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

/**
 * Helper: krijg kleur voor score (groen/oranje/rood)
 */
export function getScoreColor(score: number): string {
  if (score >= 4) return '#10b981'; // groen
  if (score >= 3) return '#f59e0b'; // oranje
  return '#ef4444'; // rood
}
