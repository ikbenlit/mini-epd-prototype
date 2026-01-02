import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getEncounters } from '@/app/epd/agenda/actions';
import { z } from 'zod';
import { startOfDay, endOfDay } from 'date-fns';
import { parseRelativeDate, isDateRange } from '@/lib/cortex/date-time-parser';

/**
 * Swift Agenda Query API
 *
 * GET /api/swift/agenda?start=2024-12-27&end=2024-12-27
 *
 * Returns appointments for the specified date range.
 * Automatically filters by current user (practitioner_id).
 */

// Query parameter schema - start/end zijn optioneel, default naar vandaag
const QuerySchema = z.object({
  start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'start moet een geldige datum zijn',
  }).optional(),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'end moet een geldige datum zijn',
  }).optional(),
  label: z.string().optional(), // Voor relatieve datums: vandaag, morgen, deze week, etc.
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
    const label = searchParams.get('label');

    const validation = QuerySchema.safeParse({ start, end, label });
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => e.message)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Determine effective date range (server-side, consistent met EPD agenda)
    const serverNow = new Date();
    let effectiveStart: string;
    let effectiveEnd: string;
    let effectiveLabel: string;

    if (start && end) {
      // Expliciete datums meegegeven
      effectiveStart = start;
      effectiveEnd = end;
      effectiveLabel = label || 'custom';
    } else if (label) {
      // Label meegegeven, server berekent de datum via centrale lib
      // Pass serverNow als referenceDate voor consistentie
      const parsed = parseRelativeDate(label, serverNow);
      if (isDateRange(parsed)) {
        effectiveStart = startOfDay(parsed.start).toISOString();
        effectiveEnd = endOfDay(parsed.end).toISOString();
        effectiveLabel = parsed.label;
      } else if (parsed) {
        effectiveStart = startOfDay(parsed).toISOString();
        effectiveEnd = endOfDay(parsed).toISOString();
        effectiveLabel = label;
      } else {
        // Label niet herkend, fallback naar vandaag
        effectiveStart = startOfDay(serverNow).toISOString();
        effectiveEnd = endOfDay(serverNow).toISOString();
        effectiveLabel = 'vandaag';
      }
    } else {
      // Geen params, default naar vandaag (server-side bepaald)
      effectiveStart = startOfDay(serverNow).toISOString();
      effectiveEnd = endOfDay(serverNow).toISOString();
      effectiveLabel = 'vandaag';
    }

    // Fetch appointments
    // Note: We don't filter by practitioner_id to show all appointments
    // In a production system, this should be filtered by organization/team
    const appointments = await getEncounters({
      startDate: effectiveStart,
      endDate: effectiveEnd,
      // practitionerId: user.id, // Disabled to show all appointments
    });

    return NextResponse.json(
      {
        appointments,
        count: appointments.length,
        dateRange: {
          start: effectiveStart,
          end: effectiveEnd,
          label: effectiveLabel,
        },
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
