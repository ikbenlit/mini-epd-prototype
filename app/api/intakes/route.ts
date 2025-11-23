/**
 * Intakes API Routes
 *
 * GET  /api/intakes?patientId={id}  - List all intakes for a patient
 * POST /api/intakes                 - Create new intake
 */

import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const CreateIntakeSchema = z.object({
  patient_id: z.string().uuid('Patient ID moet een geldige UUID zijn'),
  title: z.string().min(1, 'Titel is verplicht'),
  department: z.enum(['Volwassenen', 'Jeugd', 'Ouderen']),
  start_date: z.string().min(1, 'Startdatum is verplicht'),
  psychologist_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/intakes?patientId={id}
 * List all intakes for a specific patient
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId query parameter is verplicht' },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!z.string().uuid().safeParse(patientId).success) {
      return NextResponse.json(
        { error: 'patientId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching intakes:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen intakes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      intakes: data,
      total: data.length,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/intakes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: 'Onverwachte serverfout',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/intakes
 * Create a new intake
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = CreateIntakeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: result.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { patient_id, title, department, start_date, psychologist_id, notes } = result.data;
    const supabase = await createClient();

    // Create intake
    const { data, error } = await supabase
      .from('intakes')
      .insert({
        patient_id,
        title,
        department,
        start_date,
        psychologist_id,
        notes,
        status: 'bezig', // Default status in database enum
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating intake:', error);
      return NextResponse.json(
        { error: 'Fout bij aanmaken intake', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/intakes:', error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Ongeldige JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
