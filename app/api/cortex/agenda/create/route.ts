import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { createEncounter } from '@/app/epd/agenda/actions';
import { z } from 'zod';
import { addHours } from 'date-fns';

/**
 * Swift Create Appointment API
 *
 * POST /api/swift/agenda/create
 *
 * Creates a new appointment (encounter).
 */

// Type mappings (appointment type → FHIR encounter type)
const TYPE_MAPPINGS: Record<
  string,
  { code: string; display: string }
> = {
  intake: { code: 'intake', display: 'Intake' },
  behandeling: { code: 'behandeling', display: 'Behandeling' },
  'follow-up': { code: 'follow-up', display: 'Follow-up' },
  telefonisch: { code: 'telefonisch', display: 'Telefonisch' },
  huisbezoek: { code: 'huisbezoek', display: 'Huisbezoek' },
  online: { code: 'online', display: 'Online' },
  crisis: { code: 'crisis', display: 'Crisis' },
  overig: { code: 'overig', display: 'Overig' },
};

// Location mappings (location → FHIR class code)
const LOCATION_MAPPINGS: Record<
  string,
  { code: string; display: string }
> = {
  praktijk: { code: 'AMB', display: 'Ambulant (praktijk)' },
  online: { code: 'VR', display: 'Virtual (online)' },
  thuis: { code: 'HH', display: 'Home (thuis)' },
};

// Request body schema
const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid({ message: 'patientId moet een geldige UUID zijn' }),
  datetime: z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'datetime.date moet een geldige datum zijn',
    }),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'datetime.time moet HH:mm formaat zijn' }),
  }),
  type: z.enum(
    [
      'intake',
      'behandeling',
      'follow-up',
      'telefonisch',
      'huisbezoek',
      'online',
      'crisis',
      'overig',
    ],
    { message: 'type moet een geldig afspraaktype zijn' }
  ),
  location: z.enum(['praktijk', 'online', 'thuis'], {
    message: 'location moet praktijk, online of thuis zijn',
  }),
  notes: z.string().max(500, { message: 'Notities mogen maximaal 500 tekens bevatten' }).optional(),
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
    const validation = CreateAppointmentSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { patientId, datetime, type, location, notes } = validation.data;

    // Combine date and time into ISO datetime
    const [hours, minutes] = datetime.time.split(':').map(Number);
    const startDate = new Date(datetime.date);
    startDate.setHours(hours, minutes, 0, 0);

    // Default duration: 1 hour
    const endDate = addHours(startDate, 1);

    // Validate date is not in the past
    const now = new Date();
    if (startDate < now) {
      return NextResponse.json(
        { error: 'Kan geen afspraken in het verleden maken' },
        { status: 400 }
      );
    }

    // Map type and location
    const typeMapping = TYPE_MAPPINGS[type];
    const locationMapping = LOCATION_MAPPINGS[location];

    // Create encounter
    const result = await createEncounter({
      patientId,
      practitionerId: user.id,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
      typeCode: typeMapping.code,
      typeDisplay: typeMapping.display,
      classCode: locationMapping.code,
      classDisplay: locationMapping.display,
      notes: notes || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Fout bij het aanmaken van de afspraak' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        encounterId: result.data?.id,
        appointment: {
          id: result.data?.id,
          patientId,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          type: typeMapping.display,
          location: locationMapping.display,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in create appointment API:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het aanmaken van de afspraak. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
