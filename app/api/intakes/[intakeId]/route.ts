/**
 * Intake Detail API Routes
 *
 * GET    /api/intakes/{intakeId}  - Get specific intake
 * PUT    /api/intakes/{intakeId}  - Update intake
 * DELETE /api/intakes/{intakeId}  - Delete intake
 */

import { createClient } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updates
const UpdateIntakeSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.enum(['Volwassenen', 'Jeugd', 'Ouderen']).optional(),
  status: z.enum(['bezig', 'afgerond']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  psychologist_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * GET /api/intakes/{intakeId}
 * Get a specific intake by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;

    // Validate UUID format
    if (!z.string().uuid().safeParse(intakeId).success) {
      return NextResponse.json(
        { error: 'intakeId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('intakes')
      .select('*')
      .eq('id', intakeId)
      .single();

    if (error) {
      // Check if it's a not found error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Intake niet gevonden' },
          { status: 404 }
        );
      }

      console.error('Error fetching intake:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen intake', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in GET /api/intakes/[intakeId]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/intakes/{intakeId}
 * Update an existing intake
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;

    // Validate UUID format
    if (!z.string().uuid().safeParse(intakeId).success) {
      return NextResponse.json(
        { error: 'intakeId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = UpdateIntakeSchema.safeParse(body);

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

    const supabase = await createClient();

    // Update intake
    const { data, error } = await supabase
      .from('intakes')
      .update(result.data)
      .eq('id', intakeId)
      .select()
      .single();

    if (error) {
      // Check if it's a not found error
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Intake niet gevonden' },
          { status: 404 }
        );
      }

      console.error('Error updating intake:', error);
      return NextResponse.json(
        { error: 'Fout bij bijwerken intake', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PUT /api/intakes/[intakeId]:', error);

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

/**
 * DELETE /api/intakes/{intakeId}
 * Delete an intake
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;

    // Validate UUID format
    if (!z.string().uuid().safeParse(intakeId).success) {
      return NextResponse.json(
        { error: 'intakeId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete intake
    const { error } = await supabase
      .from('intakes')
      .delete()
      .eq('id', intakeId);

    if (error) {
      console.error('Error deleting intake:', error);
      return NextResponse.json(
        { error: 'Fout bij verwijderen intake', details: error.message },
        { status: 500 }
      );
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/intakes/[intakeId]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
