/**
 * ICD-10 GGZ Code Types
 * Voor gebruik met lib/data/icd10-ggz-codes.json
 */

export interface ICD10Code {
  /** ICD-10 code (bijv. "F32.1") */
  code: string;
  /** Nederlandse beschrijving */
  display: string;
  /** Zoekwoorden voor filtering */
  keywords: string[];
}

export interface ICD10Category {
  /** Categorie naam (bijv. "Depressieve stoornissen") */
  name: string;
  /** Codes binnen deze categorie */
  codes: ICD10Code[];
}

export interface ICD10CodeList {
  /** Versie van de codelijst */
  version: string;
  /** Bron (WHO publiek domein) */
  source: string;
  /** Beschrijving */
  description: string;
  /** Categorieën met codes */
  categories: ICD10Category[];
  /** Veelgebruikte codes (top 5) */
  frequentCodes: string[];
}

/** Ernst classificatie voor diagnoses */
export type DiagnosisSeverity = 'licht' | 'matig' | 'ernstig';

/** Klinische status (FHIR compatible) */
export type DiagnosisClinicalStatus =
  | 'active'
  | 'recurrence'
  | 'relapse'
  | 'inactive'
  | 'remission'
  | 'resolved';

/** Verificatie status (FHIR compatible) */
export type DiagnosisVerificationStatus =
  | 'unconfirmed'
  | 'provisional'
  | 'differential'
  | 'confirmed'
  | 'refuted'
  | 'entered-in-error';

/** Diagnose type (hoofd/neven) */
export type DiagnosisType = 'primary' | 'secondary';

/** Helper type voor platte lijst van alle codes */
export type FlatICD10Code = ICD10Code & {
  category: string;
};

/**
 * Flatten ICD-10 categories naar platte lijst
 */
export function flattenICD10Codes(codeList: ICD10CodeList): FlatICD10Code[] {
  return codeList.categories.flatMap((category) =>
    category.codes.map((code) => ({
      ...code,
      category: category.name,
    }))
  );
}

/**
 * Zoek ICD-10 codes op query (code, display of keywords)
 */
export function searchICD10Codes(
  codes: FlatICD10Code[],
  query: string,
  maxResults = 8
): FlatICD10Code[] {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();

  return codes
    .filter((code) => {
      const matchesCode = code.code.toLowerCase().includes(normalizedQuery);
      const matchesDisplay = code.display.toLowerCase().includes(normalizedQuery);
      const matchesKeyword = code.keywords.some((kw) =>
        kw.toLowerCase().includes(normalizedQuery)
      );
      return matchesCode || matchesDisplay || matchesKeyword;
    })
    .slice(0, maxResults);
}

/**
 * Haal veelgebruikte codes op
 */
export function getFrequentCodes(
  codes: FlatICD10Code[],
  frequentCodeIds: string[]
): FlatICD10Code[] {
  return frequentCodeIds
    .map((id) => codes.find((c) => c.code === id))
    .filter((c): c is FlatICD10Code => c !== undefined);
}
