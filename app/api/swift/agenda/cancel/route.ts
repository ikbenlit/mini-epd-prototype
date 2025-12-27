import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { cancelEncounter } from '@/app/epd/agenda/actions';
import { z } from 'zod';

/**
 * Swift Cancel Appointment API
 *
 * POST /api/swift/agenda/cancel
 *
 * Cancels an appointment (soft delete: status → 'cancelled').
 */

// Request body schema
const CancelAppointmentSchema = z.object({
  encounterId: z.string().uuid({ message: 'encounterId moet een geldige UUID zijn' }),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd. Log opnieuw in.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = CancelAppointmentSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { encounterId } = validation.data;

    // Verify the encounter belongs to the current user (security check)
    const { data: encounter, error: fetchError } = await supabase
      .from('encounters')
      .select('id, practitioner_id, patient_id, period_start, status')
      .eq('id', encounterId)
      .single();

    if (fetchError || !encounter) {
      return NextResponse.json(
        { error: 'Afspraak niet gevonden' },
        { status: 404 }
      );
    }

    if (encounter.practitioner_id !== user.id) {
      return NextResponse.json(
        { error: 'Je hebt geen toegang tot deze afspraak' },
        { status: 403 }
      );
    }

    if (encounter.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Deze afspraak is al geannuleerd' },
        { status: 400 }
      );
    }

    // Cancel the encounter
    const result = await cancelEncounter(encounterId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fout bij het annuleren van de afspraak' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        encounterId,
        message: 'Afspraak succesvol geannuleerd',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in cancel appointment API:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het annuleren van de afspraak. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
