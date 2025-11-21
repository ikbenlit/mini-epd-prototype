/**
 * FHIR Utilities
 * Helper functions for working with FHIR resources
 */

import type { FHIRReference, FHIROperationOutcome } from './types';

/**
 * Extract resource ID from FHIR reference string
 * Example: "Patient/123" -> "123"
 */
export function extractIdFromReference(reference?: string): string | null {
  if (!reference) return null;
  const parts = reference.split('/');
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Create FHIR reference from resource type and ID
 * Example: ("Patient", "123") -> "Patient/123"
 */
export function createReference(
  resourceType: string,
  id: string,
  display?: string
): FHIRReference {
  return {
    reference: `${resourceType}/${id}`,
    type: resourceType,
    display,
  };
}

/**
 * Create FHIR OperationOutcome for errors
 */
export function createOperationOutcome(
  severity: 'fatal' | 'error' | 'warning' | 'information',
  code: string,
  diagnostics: string
): FHIROperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity,
        code,
        diagnostics,
      },
    ],
  };
}

/**
 * Validate FHIR resource has required fields
 */
export function validateFHIRResource(
  resource: any,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (!resource[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format date to FHIR date format (YYYY-MM-DD)
 */
export function toFHIRDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Format datetime to FHIR datetime format (ISO 8601)
 */
export function toFHIRDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}
