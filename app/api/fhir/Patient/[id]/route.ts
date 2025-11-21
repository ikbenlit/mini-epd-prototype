/**
 * FHIR Patient API - Instance Endpoints
 * GET /api/fhir/Patient/[id] - Read patient
 * PUT /api/fhir/Patient/[id] - Update patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  dbPatientToFHIR,
  fhirPatientToDB,
  createOperationOutcome,
  validateFHIRResource,
} from '@/lib/fhir';
import type { FHIRPatient } from '@/lib/fhir';

/**
 * GET /api/fhir/Patient/[id]
 * Returns a single FHIR Patient resource
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Query patient by ID
    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !patient) {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'not-found',
          `Patient with id ${id} not found`
        ),
        { status: 404 }
      );
    }

    // Transform to FHIR resource
    const fhirPatient = dbPatientToFHIR(patient);

    return NextResponse.json(fhirPatient);
  } catch (error) {
    return NextResponse.json(
      createOperationOutcome(
        'error',
        'exception',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fhir/Patient/[id]
 * Updates a patient from FHIR Patient resource
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const fhirPatient: FHIRPatient = await request.json();

    // Validate required fields
    const validation = validateFHIRResource(fhirPatient, [
      'resourceType',
      'name',
      'gender',
      'birthDate',
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        createOperationOutcome('error', 'invalid', validation.errors.join(', ')),
        { status: 400 }
      );
    }

    // Verify resourceType
    if (fhirPatient.resourceType !== 'Patient') {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'invalid',
          `Expected resourceType "Patient", got "${fhirPatient.resourceType}"`
        ),
        { status: 400 }
      );
    }

    // Verify ID matches
    if (fhirPatient.id && fhirPatient.id !== id) {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'invalid',
          `ID in URL (${id}) does not match ID in resource (${fhirPatient.id})`
        ),
        { status: 400 }
      );
    }

    // Check if patient exists
    const { data: existingPatient, error: fetchError } = await supabaseAdmin
      .from('patients')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPatient) {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'not-found',
          `Patient with id ${id} not found`
        ),
        { status: 404 }
      );
    }

    // Transform to database format
    const patientUpdate = fhirPatientToDB(fhirPatient);

    // Update in database
    const { data: updatedPatient, error: updateError } = await supabaseAdmin
      .from('patients')
      .update(patientUpdate)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        createOperationOutcome('error', 'processing', updateError.message),
        { status: 500 }
      );
    }

    // Return updated patient as FHIR resource
    const fhirResponse = dbPatientToFHIR(updatedPatient);

    return NextResponse.json(fhirResponse);
  } catch (error) {
    return NextResponse.json(
      createOperationOutcome(
        'error',
        'exception',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
