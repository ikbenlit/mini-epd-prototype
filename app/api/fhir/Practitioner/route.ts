/**
 * FHIR Practitioner API - Collection Endpoints
 * GET /api/fhir/Practitioner - List practitioners
 * POST /api/fhir/Practitioner - Create practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  dbPractitionerToFHIR,
  fhirPractitionerToDB,
  createOperationOutcome,
  validateFHIRResource,
} from '@/lib/fhir';
import type { FHIRBundle, FHIRPractitioner } from '@/lib/fhir';

/**
 * GET /api/fhir/Practitioner
 * Returns a FHIR Bundle with searchset of practitioners
 * Supports query parameters: name, identifier
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabaseAdmin.from('practitioners').select('*');

    // Search by name (family or given)
    const name = searchParams.get('name');
    if (name) {
      query = query.or(
        `name_family.ilike.%${name}%,name_given.cs.{${name}}`
      );
    }

    // Search by identifier (BIG or AGB)
    const identifier = searchParams.get('identifier');
    if (identifier) {
      query = query.or(
        `identifier_big.eq.${identifier},identifier_agb.eq.${identifier}`
      );
    }

    // Execute query
    const { data: practitioners, error } = await query;

    if (error) {
      return NextResponse.json(
        createOperationOutcome('error', 'processing', error.message),
        { status: 500 }
      );
    }

    // Transform to FHIR Bundle
    const bundle: FHIRBundle<FHIRPractitioner> = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: practitioners?.length || 0,
      entry: practitioners?.map((practitioner) => ({
        resource: dbPractitionerToFHIR(practitioner),
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
 * POST /api/fhir/Practitioner
 * Creates a new practitioner from FHIR Practitioner resource
 */
export async function POST(request: NextRequest) {
  try {
    const fhirPractitioner: FHIRPractitioner = await request.json();

    // Validate required fields
    const validation = validateFHIRResource(fhirPractitioner, [
      'resourceType',
      'name',
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        createOperationOutcome('error', 'invalid', validation.errors.join(', ')),
        { status: 400 }
      );
    }

    // Verify resourceType
    if (fhirPractitioner.resourceType !== 'Practitioner') {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'invalid',
          `Expected resourceType "Practitioner", got "${fhirPractitioner.resourceType}"`
        ),
        { status: 400 }
      );
    }

    // Transform to database format
    const practitionerInsert = fhirPractitionerToDB(fhirPractitioner);

    // Insert into database
    const { data: newPractitioner, error } = await supabaseAdmin
      .from('practitioners')
      .insert(practitionerInsert)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createOperationOutcome('error', 'processing', error.message),
        { status: 500 }
      );
    }

    // Return created practitioner as FHIR resource
    const fhirResponse = dbPractitionerToFHIR(newPractitioner);

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
