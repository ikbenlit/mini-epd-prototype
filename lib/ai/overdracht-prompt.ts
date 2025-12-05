/**
 * Overdracht AI Prompt Templates
 *
 * System and user prompts for generating nursing handover summaries
 */

import type {
  VitalSign,
  Report,
  RiskAssessment,
  Condition,
} from '@/lib/types/overdracht';
import type { NursingLog } from '@/lib/types/nursing-log';

export interface OverdrachtContext {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  conditions: Condition[];
  vitals: VitalSign[];
  reports: Report[];
  nursingLogs: NursingLog[];
  risks: RiskAssessment[];
}

export const OVERDRACHT_SYSTEM_PROMPT = `Je bent een ervaren verpleegkundige die overdrachten maakt in een GGZ-instelling.

Je taak: Maak een beknopte, relevante overdracht voor de opvolgende dienst.

## Outputformaat (JSON)
{
  "samenvatting": "1-2 zinnen over de patiënt en wat er speelt",
  "aandachtspunten": [
    {
      "tekst": "Beschrijving van het aandachtspunt",
      "urgent": true/false,
      "bron": {
        "type": "observatie|rapportage|dagnotitie|risico",
        "id": "source-id",
        "datum": "DD-MM-YYYY HH:mm",
        "label": "Korte beschrijving bron"
      }
    }
  ],
  "actiepunten": [
    "Concrete actie voor opvolgende dienst"
  ]
}

## Regels
1. Taal: Nederlands, zakelijk, beknopt
2. Focus op: veranderingen, afwijkingen, aandachtspunten
3. Elke aandachtspunt MOET een bronverwijzing hebben
4. Maximum 5 aandachtspunten, 3 actiepunten
5. Markeer urgent=true voor:
   - Medicatie-weigering
   - Incidenten
   - Sterk afwijkende vitals (HH, LL, H, L interpretatie)
   - Hoog-risico situaties (risico_level: hoog of zeer_hoog)
6. Als er weinig data is, geef een korte samenvatting en meld dat er weinig bijzonderheden zijn
7. Gebruik ALLEEN informatie uit de aangeleverde bronnen, verzin NIETS

## Bronverwijzing formaat
- type "observatie" voor vitale functies (observations tabel)
- type "rapportage" voor rapporten (reports tabel)
- type "dagnotitie" voor nursing logs (nursing_logs tabel)
- type "risico" voor risico assessments (risk_assessments tabel)

Geef je antwoord als PURE JSON, zonder markdown code blocks.`;

/**
 * Format timestamp to Dutch date format
 */
function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get interpretation label for vital signs
 */
function getInterpretationLabel(code: string | null | undefined): string {
  if (!code) return 'normaal';
  switch (code) {
    case 'HH':
      return 'kritiek hoog';
    case 'H':
      return 'hoog';
    case 'LL':
      return 'kritiek laag';
    case 'L':
      return 'laag';
    case 'N':
      return 'normaal';
    default:
      return code;
  }
}

/**
 * Truncate text to max length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Build the user prompt with patient context
 */
export function buildOverdrachtUserPrompt(context: OverdrachtContext): string {
  const lines: string[] = [
    `PATIENT: ${context.patientName}, ${context.age} jaar, ${context.gender}`,
    '',
  ];

  // Diagnoses
  lines.push('DIAGNOSES:');
  if (context.conditions.length > 0) {
    for (const c of context.conditions) {
      lines.push(`- ${c.code_display} (source: conditions/${c.id})`);
    }
  } else {
    lines.push('- Geen actieve diagnoses geregistreerd');
  }
  lines.push('');

  // Vitals
  lines.push('VITALE FUNCTIES (vandaag):');
  if (context.vitals.length > 0) {
    for (const v of context.vitals) {
      const value = v.value_quantity_value ?? 'onbekend';
      const unit = v.value_quantity_unit ?? '';
      const interpretation = getInterpretationLabel(v.interpretation_code);
      lines.push(
        `- ${v.code_display}: ${value} ${unit} [${interpretation}] ` +
          `(source: observations/${v.id}, ${formatDateTime(v.effective_datetime)})`
      );
    }
  } else {
    lines.push('- Geen metingen vandaag');
  }
  lines.push('');

  // Reports
  lines.push('RAPPORTAGES (laatste 24u):');
  if (context.reports.length > 0) {
    for (const r of context.reports) {
      lines.push(
        `- [${formatDateTime(r.created_at)}] ${r.type}: "${truncate(r.content, 200)}" ` +
          `(source: reports/${r.id})`
      );
    }
  } else {
    lines.push('- Geen rapportages in de laatste 24 uur');
  }
  lines.push('');

  // Nursing logs
  lines.push('DAGREGISTRATIES (vandaag):');
  if (context.nursingLogs.length > 0) {
    for (const l of context.nursingLogs) {
      const handoverMark = l.include_in_handover ? '[OVERDRACHT]' : '';
      lines.push(
        `- [${formatDateTime(l.timestamp)}] [${l.category.toUpperCase()}] ${handoverMark} ${l.content} ` +
          `(source: nursing_logs/${l.id})`
      );
    }
  } else {
    lines.push('- Geen dagregistraties vandaag');
  }
  lines.push('');

  // Risks
  lines.push('RISICOS:');
  if (context.risks.length > 0) {
    for (const r of context.risks) {
      const rationale = r.rationale ? `: "${truncate(r.rationale, 150)}"` : '';
      lines.push(
        `- [${r.risk_level.toUpperCase()}] ${r.risk_type}${rationale} ` +
          `(source: risk_assessments/${r.id})`
      );
    }
  } else {
    lines.push('- Geen risico assessments geregistreerd');
  }

  return lines.join('\n');
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format patient name
 */
export function formatPatientName(
  nameGiven: string[],
  nameFamily: string,
  namePrefix?: string
): string {
  const given = nameGiven.join(' ');
  if (namePrefix) {
    return `${given} ${namePrefix} ${nameFamily}`;
  }
  return `${given} ${nameFamily}`;
}
