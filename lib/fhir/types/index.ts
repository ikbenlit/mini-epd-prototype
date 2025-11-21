/**
 * FHIR R4 Type Definitions
 * Simplified types for pragmatic implementation
 * Based on: http://hl7.org/fhir/R4/
 */

// ============================================================================
// Common FHIR Types
// ============================================================================

export interface FHIRIdentifier {
  system?: string;
  value?: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary';
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRCodeableConcept {
  coding?: Array<{
    system?: string;
    version?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FHIRCodeableConcept[];
  tag?: FHIRCodeableConcept[];
}

// ============================================================================
// FHIR Patient Resource
// ============================================================================

export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;

  // Patient fields
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: Array<{
    contentType?: string;
    data?: string;
    url?: string;
  }>;
  contact?: Array<{
    relationship?: FHIRCodeableConcept[];
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
    address?: FHIRAddress;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    organization?: FHIRReference;
  }>;
  communication?: Array<{
    language: FHIRCodeableConcept;
    preferred?: boolean;
  }>;
  generalPractitioner?: FHIRReference[];
  managingOrganization?: FHIRReference;
  link?: Array<{
    other: FHIRReference;
    type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
  }>;
}

// ============================================================================
// FHIR Practitioner Resource
// ============================================================================

export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: FHIRMeta;
  implicitRules?: string;
  language?: string;

  // Practitioner fields
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  photo?: Array<{
    contentType?: string;
    data?: string;
    url?: string;
  }>;
  qualification?: Array<{
    identifier?: FHIRIdentifier[];
    code: FHIRCodeableConcept;
    period?: {
      start?: string;
      end?: string;
    };
    issuer?: FHIRReference;
  }>;
  communication?: FHIRCodeableConcept[];
}

// ============================================================================
// FHIR Organization Resource
// ============================================================================

export interface FHIROrganization {
  resourceType: 'Organization';
  id?: string;
  meta?: FHIRMeta;

  identifier?: FHIRIdentifier[];
  active?: boolean;
  type?: FHIRCodeableConcept[];
  name?: string;
  alias?: string[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  partOf?: FHIRReference;
  contact?: Array<{
    purpose?: FHIRCodeableConcept;
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
    address?: FHIRAddress;
  }>;
  endpoint?: FHIRReference[];
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * FHIR Bundle for search results
 */
export interface FHIRBundle<T = any> {
  resourceType: 'Bundle';
  type: 'searchset' | 'collection' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'document' | 'message';
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource?: T;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
      score?: number;
    };
  }>;
}

/**
 * FHIR OperationOutcome for errors
 */
export interface FHIROperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    details?: FHIRCodeableConcept;
    diagnostics?: string;
    location?: string[];
    expression?: string[];
  }>;
}
