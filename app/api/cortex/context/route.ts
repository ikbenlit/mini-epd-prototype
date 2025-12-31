import { NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getCurrentShift } from '@/lib/cortex/types';
import type { CortexContext } from '@/lib/cortex/types';

/**
 * Cortex Context API
 *
 * GET /api/cortex/context
 *
 * Returns the current context for AI classification.
 * Includes: shift, agenda today, recent intents.
 * Note: activePatient is set client-side via store.
 */

export async function GET() {
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

    // Get practitioner info
    const { data: practitioner } = await supabase
      .from('practitioners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments
    const { data: appointments } = await supabase
      .from('encounters')
      .select(
        `
        id,
        period_start,
        type_display,
        patient:patients(id, name_given, name_prefix, name_family)
      `
      )
      .eq('practitioner_id', practitioner?.id ?? '')
      .gte('period_start', today.toISOString())
      .lt('period_start', tomorrow.toISOString())
      .order('period_start');

    // Build context object
    const context: CortexContext = {
      activePatient: null, // Set by client via store
      currentView: 'dashboard', // Default, overridden by client
      shift: getCurrentShift(),
      currentTime: new Date(),
      agendaToday: (appointments || []).map((apt) => {
        // Handle the nested patient relation
        const patient = apt.patient as {
          id: string;
          name_given: string[];
          name_prefix: string | null;
          name_family: string;
        } | null;

        // Construct full name: "Voornaam [tussenvoegsel] Achternaam"
        const fullName = patient
          ? [
              patient.name_given?.[0],
              patient.name_prefix,
              patient.name_family,
            ]
              .filter(Boolean)
              .join(' ')
          : 'Onbekend';

        return {
          time: new Date(apt.period_start).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          patientName: fullName,
          patientId: patient?.id || '',
          type: apt.type_display || 'afspraak',
        };
      }),
      recentIntents: [], // Populated by client from store history
    };

    return NextResponse.json({ context }, { status: 200 });
  } catch (error) {
    console.error('[Cortex Context API] Error:', error);
    return NextResponse.json(
      {
        error:
          'Er ging iets mis bij het ophalen van context. Probeer het opnieuw.',
      },
      { status: 500 }
    );
  }
}
