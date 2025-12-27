import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { rescheduleEncounter } from '@/app/epd/agenda/actions';
import { z } from 'zod';
import { addHours } from 'date-fns';

/**
 * Swift Reschedule Appointment API
 *
 * POST /api/swift/agenda/reschedule
 *
 * Reschedules an appointment to a new date/time.
 */

// Request body schema
const RescheduleAppointmentSchema = z.object({
  encounterId: z.string().uuid({ message: 'encounterId moet een geldige UUID zijn' }),
  newDatetime: z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'newDatetime.date moet een geldige datum zijn',
    }),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'newDatetime.time moet HH:mm formaat zijn' }),
  }),
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
    const validation = RescheduleAppointmentSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { encounterId, newDatetime } = validation.data;

    // Verify the encounter belongs to the current user (security check)
    const { data: encounter, error: fetchError } = await supabase
      .from('encounters')
      .select('id, practitioner_id, patient_id, period_start, period_end, status')
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
        { error: 'Kan een geannuleerde afspraak niet verzetten' },
        { status: 400 }
      );
    }

    // Combine new date and time into ISO datetime
    const [hours, minutes] = newDatetime.time.split(':').map(Number);
    const newStartDate = new Date(newDatetime.date);
    newStartDate.setHours(hours, minutes, 0, 0);

    // Validate new date is not in the past
    const now = new Date();
    if (newStartDate < now) {
      return NextResponse.json(
        { error: 'Kan geen afspraken in het verleden verzetten' },
        { status: 400 }
      );
    }

    // Calculate duration from original appointment
    let newEndDate: Date;
    if (encounter.period_end) {
      const originalStart = new Date(encounter.period_start);
      const originalEnd = new Date(encounter.period_end);
      const durationMs = originalEnd.getTime() - originalStart.getTime();
      newEndDate = new Date(newStartDate.getTime() + durationMs);
    } else {
      // Default: 1 hour
      newEndDate = addHours(newStartDate, 1);
    }

    // Reschedule the encounter
    const result = await rescheduleEncounter(
      encounterId,
      newStartDate.toISOString(),
      newEndDate.toISOString()
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fout bij het verzetten van de afspraak' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        encounterId,
        appointment: {
          id: encounterId,
          periodStart: newStartDate.toISOString(),
          periodEnd: newEndDate.toISOString(),
        },
        message: 'Afspraak succesvol verzet',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reschedule appointment API:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het verzetten van de afspraak. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
