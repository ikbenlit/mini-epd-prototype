/**
 * FHIR Practitioner API - Instance Endpoints
 * GET /api/fhir/Practitioner/[id] - Read practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  dbPractitionerToFHIR,
  createOperationOutcome,
} from '@/lib/fhir';

/**
 * GET /api/fhir/Practitioner/[id]
 * Returns a single FHIR Practitioner resource
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Query practitioner by ID
    const { data: practitioner, error } = await supabaseAdmin
      .from('practitioners')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !practitioner) {
      return NextResponse.json(
        createOperationOutcome(
          'error',
          'not-found',
          `Practitioner with id ${id} not found`
        ),
        { status: 404 }
      );
    }

    // Transform to FHIR resource
    const fhirPractitioner = dbPractitionerToFHIR(practitioner);

    return NextResponse.json(fhirPractitioner);
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
