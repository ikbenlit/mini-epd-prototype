/**
 * FHIR Patient API - Collection Endpoints
 * GET /api/fhir/Patient - List patients
 * POST /api/fhir/Patient - Create patient
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  dbPatientToFHIR,
  fhirPatientToDB,
  createOperationOutcome,
  validateFHIRResource,
} from '@/lib/fhir';
import type { FHIRBundle, FHIRPatient } from '@/lib/fhir';

/**
 * GET /api/fhir/Patient
 * Returns a FHIR Bundle with searchset of patients
 * Supports query parameters: name, identifier, birthdate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabaseAdmin.from('patients').select('*');

    // Search by name (family or given)
    const name = searchParams.get('name');
    if (name) {
      query = query.or(
        `name_family.ilike.%${name}%,name_given.cs.{${name}}`
      );
    }

    // Search by identifier (BSN)
    const identifier = searchParams.get('identifier');
    if (identifier) {
      query = query.eq('identifier_bsn', identifier);
    }

    // Search by birth date
    const birthdate = searchParams.get('birthdate');
    if (birthdate) {
      query = query.eq('birth_date', birthdate);
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Order by updated_at descending (newest first)
    query = query.order('updated_at', { ascending: false });

    // Execute query
    const { data: patients, error } = await query;

    if (error) {
      return NextResponse.json(
        createOperationOutcome('error', 'processing', error.message),
        { status: 500 }
      );
    }

    // Transform to FHIR Bundle
    const bundle: FHIRBundle<FHIRPatient> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: patients?.length || 0,
      entry: patients?.map((patient) => ({
        resource: dbPatientToFHIR(patient),
      })) || [],
    };

    return NextResponse.json(bundle);
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
 * POST /api/fhir/Patient
 * Creates a new patient from FHIR Patient resource
 */
export async function POST(request: NextRequest) {
  try {
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

    // Transform to database format
    const patientInsert = fhirPatientToDB(fhirPatient);

    // Insert into database
    const { data: newPatient, error } = await supabaseAdmin
      .from('patients')
      .insert(patientInsert)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createOperationOutcome('error', 'processing', error.message),
        { status: 500 }
      );
    }

    // Return created patient as FHIR resource
    const fhirResponse = dbPatientToFHIR(newPatient);

    return NextResponse.json(fhirResponse, { status: 201 });
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
