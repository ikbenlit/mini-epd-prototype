/**
 * Behandelplan (Treatment Plan) Types
 *
 * Types voor AI-gegenereerde behandelplannen
 * Gebaseerd op FHIR CarePlan met GGZ-specifieke uitbreidingen
 */

import { z } from 'zod';
import { type LifeDomain, type LifeDomainScore, LIFE_DOMAINS, PRIORITIES } from './leefgebieden';

// =============================================================================
// STATUS TYPES
// =============================================================================

/**
 * Status van een behandelplan
 */
export const PLAN_STATUSES = ['concept', 'actief', 'in_evaluatie', 'afgerond', 'gearchiveerd'] as const;
export type PlanStatus = typeof PLAN_STATUSES[number];

/**
 * Status van een doel
 */
export const GOAL_STATUSES = ['niet_gestart', 'bezig', 'gehaald', 'bijgesteld'] as const;
export type GoalStatus = typeof GOAL_STATUSES[number];

/**
 * Type evaluatiemoment
 */
export const EVALUATION_TYPES = ['tussentijds', 'eind', 'crisis'] as const;
export type EvaluationType = typeof EVALUATION_TYPES[number];

/**
 * Status evaluatiemoment
 */
export const EVALUATION_STATUSES = ['gepland', 'afgerond', 'overgeslagen'] as const;
export type EvaluationStatus = typeof EVALUATION_STATUSES[number];

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * Behandelstructuur - algemene parameters van het plan
 */
export interface Behandelstructuur {
  duur: string;              // bijv. "8 weken"
  frequentie: string;        // bijv. "Wekelijks"
  aantalSessies: number;     // bijv. 8
  vorm: string;              // bijv. "Individueel"
}

/**
 * SMART Doel
 */
export interface SmartGoal {
  id: string;
  title: string;              // Korte beschrijving (1 zin)
  description: string;        // SMART-uitwerking (2-3 zinnen)
  clientVersion: string;      // B1-taal versie voor cliënt
  lifeDomain: LifeDomain;     // Gekoppeld leefgebied
  priority: 'hoog' | 'middel' | 'laag';
  measurability: string;      // Hoe meten we vooruitgang?
  timelineWeeks: number;      // Binnen X weken
  status: GoalStatus;
  progress: number;           // 0-100
}

/**
 * Evidence-based Interventie
 */
export interface Intervention {
  id: string;
  name: string;               // bijv. "CGT", "EMDR", "ACT"
  description: string;        // Uitleg van de interventie
  rationale: string;          // Waarom past dit bij deze cliënt?
  linkedGoalIds: string[];    // Welke doelen worden hiermee benaderd?
}

/**
 * Evaluatiemoment
 */
export interface Evaluatiemoment {
  id: string;
  type: EvaluationType;
  weekNumber: number;
  plannedDate: string;        // ISO date string
  actualDate?: string;        // Ingevuld na uitvoering
  status: EvaluationStatus;
  outcome?: string;           // Vrije tekst resultaat
  lifeDomainUpdates?: LifeDomainScore[]; // Nieuwe scores
}

/**
 * Veiligheidsplan (alleen bij severity "Hoog")
 */
export interface Veiligheidsplan {
  waarschuwingssignalen: string[];  // 3-5 items
  copingStrategieen: string[];      // 3-5 items
  contacten: {
    naam: string;
    rol: string;
    telefoon: string;
  }[];
  restricties?: string[];           // bijv. "Geen alcohol tijdens behandeling"
}

/**
 * Sessie in de planning
 */
export interface Sessie {
  id: string;
  nummer: number;
  focus: string;
  datum?: string;             // ISO date string
  status: 'gepland' | 'afgerond' | 'no_show' | 'verzet' | 'geannuleerd';
  gekoppeldeDoelIds: string[];
  notities?: string;
}

// =============================================================================
// GENERATED PLAN (AI OUTPUT)
// =============================================================================

/**
 * Volledig door AI gegenereerd behandelplan
 */
export interface GeneratedPlan {
  behandelstructuur: Behandelstructuur;
  doelen: SmartGoal[];
  interventies: Intervention[];
  sessiePlanning: Sessie[];
  evaluatiemomenten: Evaluatiemoment[];
  veiligheidsplan?: Veiligheidsplan;  // Alleen bij severity "Hoog"
}

// =============================================================================
// API INPUT/OUTPUT TYPES
// =============================================================================

/**
 * Input voor behandelplan generatie
 */
export interface GenerateBehandelplanInput {
  patientId: string;
  intakeId: string;
  conditionId?: string;        // Optioneel, haalt anders laatste op
  extraInstructions?: string;  // Optionele aanvullende instructies
}

/**
 * Input voor micro-regeneratie
 */
export interface RegenerateSectionInput {
  patientId: string;
  carePlanId: string;
  sectionType: 'goal' | 'intervention';
  sectionId: string;
  instruction?: string;        // Extra instructie voor AI
  currentPlan: GeneratedPlan;  // Context van huidige plan
}

/**
 * Output van micro-regeneratie
 */
export interface RegeneratedSection {
  type: 'goal' | 'intervention';
  original: SmartGoal | Intervention;
  regenerated: SmartGoal | Intervention;
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const BehandelstructuurSchema = z.object({
  duur: z.string(),
  frequentie: z.string(),
  aantalSessies: z.number().min(1).max(52),
  vorm: z.string(),
});

export const SmartGoalSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(500),
  clientVersion: z.string().min(5).max(300),
  lifeDomain: z.enum(LIFE_DOMAINS),
  priority: z.enum(PRIORITIES),
  measurability: z.string().min(5).max(200),
  timelineWeeks: z.number().min(1).max(52),
  status: z.enum(GOAL_STATUSES),
  progress: z.number().min(0).max(100),
});

export const InterventionSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  rationale: z.string().min(10).max(500),
  linkedGoalIds: z.array(z.string()),
});

export const EvaluatiemomentSchema = z.object({
  id: z.string(),
  type: z.enum(EVALUATION_TYPES),
  weekNumber: z.number().min(1).max(52),
  plannedDate: z.string(),
  actualDate: z.string().optional(),
  status: z.enum(EVALUATION_STATUSES),
  outcome: z.string().optional(),
  lifeDomainUpdates: z.array(z.any()).optional(), // Simplified for now
});

export const VeiligheidsplanSchema = z.object({
  waarschuwingssignalen: z.array(z.string()).min(1).max(10),
  copingStrategieen: z.array(z.string()).min(1).max(10),
  contacten: z.array(z.object({
    naam: z.string(),
    rol: z.string(),
    telefoon: z.string(),
  })),
  restricties: z.array(z.string()).optional(),
});

export const SessieSchema = z.object({
  id: z.string(),
  nummer: z.number().min(1),
  focus: z.string(),
  datum: z.string().optional(),
  status: z.enum(['gepland', 'afgerond', 'no_show', 'verzet', 'geannuleerd']),
  gekoppeldeDoelIds: z.array(z.string()),
  notities: z.string().optional(),
});

export const GeneratedPlanSchema = z.object({
  behandelstructuur: BehandelstructuurSchema,
  doelen: z.array(SmartGoalSchema).min(1).max(6),
  interventies: z.array(InterventionSchema).min(1).max(5),
  sessiePlanning: z.array(SessieSchema),
  evaluatiemomenten: z.array(EvaluatiemomentSchema).min(1),
  veiligheidsplan: VeiligheidsplanSchema.optional(),
});

export const GenerateBehandelplanInputSchema = z.object({
  patientId: z.string().uuid(),
  intakeId: z.string().uuid(),
  conditionId: z.string().uuid().optional(),
  extraInstructions: z.string().max(500).optional(),
});

export const RegenerateSectionInputSchema = z.object({
  patientId: z.string().uuid(),
  carePlanId: z.string().uuid(),
  sectionType: z.enum(['goal', 'intervention']),
  sectionId: z.string(),
  instruction: z.string().max(200).optional(),
  currentPlan: GeneratedPlanSchema,
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Genereer een nieuw UUID-achtig ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Maak een nieuw leeg SMART doel
 */
export function createEmptyGoal(lifeDomain: LifeDomain = 'dlv'): SmartGoal {
  return {
    id: generateId(),
    title: '',
    description: '',
    clientVersion: '',
    lifeDomain,
    priority: 'middel',
    measurability: '',
    timelineWeeks: 8,
    status: 'niet_gestart',
    progress: 0,
  };
}

/**
 * Maak een nieuwe lege interventie
 */
export function createEmptyIntervention(): Intervention {
  return {
    id: generateId(),
    name: '',
    description: '',
    rationale: '',
    linkedGoalIds: [],
  };
}

/**
 * Bereken totale voortgang van alle doelen
 */
export function calculateTotalProgress(goals: SmartGoal[]): number {
  if (goals.length === 0) return 0;
  const sum = goals.reduce((acc, goal) => acc + goal.progress, 0);
  return Math.round(sum / goals.length);
}

/**
 * Krijg doelen per leefgebied
 */
export function getGoalsByDomain(goals: SmartGoal[]): Record<LifeDomain, SmartGoal[]> {
  const result = {} as Record<LifeDomain, SmartGoal[]>;
  for (const domain of LIFE_DOMAINS) {
    result[domain] = goals.filter((g) => g.lifeDomain === domain);
  }
  return result;
}

/**
 * Check of plan klaar is voor publicatie
 */
export function canPublish(plan: GeneratedPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (plan.doelen.length === 0) {
    errors.push('Minimaal 1 doel is vereist');
  }

  if (plan.interventies.length === 0) {
    errors.push('Minimaal 1 interventie is vereist');
  }

  if (!plan.behandelstructuur.duur || !plan.behandelstructuur.frequentie) {
    errors.push('Behandelstructuur moet compleet zijn');
  }

  if (plan.evaluatiemomenten.length < 2) {
    errors.push('Minimaal 2 evaluatiemomenten zijn vereist');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Status label voor UI
 */
export const PLAN_STATUS_LABELS: Record<PlanStatus, { label: string; color: string }> = {
  concept: { label: 'Concept', color: '#60a5fa' },      // blauw
  actief: { label: 'Actief', color: '#10b981' },        // groen
  in_evaluatie: { label: 'In evaluatie', color: '#f59e0b' }, // oranje
  afgerond: { label: 'Afgerond', color: '#6b7280' },    // grijs
  gearchiveerd: { label: 'Gearchiveerd', color: '#9ca3af' }, // lichtgrijs
};

/**
 * Goal status label voor UI
 */
export const GOAL_STATUS_LABELS: Record<GoalStatus, { label: string; color: string }> = {
  niet_gestart: { label: 'Niet gestart', color: '#9ca3af' },
  bezig: { label: 'Bezig', color: '#3b82f6' },
  gehaald: { label: 'Gehaald', color: '#10b981' },
  bijgesteld: { label: 'Bijgesteld', color: '#f59e0b' },
};
