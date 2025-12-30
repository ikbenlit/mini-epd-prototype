import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getEncounters } from '@/app/epd/agenda/actions';
import { z } from 'zod';

/**
 * Swift Agenda Query API
 *
 * GET /api/swift/agenda?start=2024-12-27&end=2024-12-27
 *
 * Returns appointments for the specified date range.
 * Automatically filters by current user (practitioner_id).
 */

// Query parameter schema
const QuerySchema = z.object({
  start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'start moet een geldige datum zijn',
  }),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'end moet een geldige datum zijn',
  }),
});

export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: 'start en end parameters zijn verplicht' },
        { status: 400 }
      );
    }

    const validation = QuerySchema.safeParse({ start, end });
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Fetch appointments
    const appointments = await getEncounters({
      startDate: start,
      endDate: end,
      practitionerId: user.id,
    });

    return NextResponse.json(
      {
        appointments,
        count: appointments.length,
        dateRange: { start, end },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in agenda query API:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het ophalen van afspraken. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
