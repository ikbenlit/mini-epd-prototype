import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { getPatient } from '@/app/epd/patients/actions';
import { getIntakesByPatientId } from '@/app/epd/patients/[id]/intakes/actions';
import { getPatientEncounters } from '@/app/epd/agenda/actions';
import { getActiveCarePlan } from '@/app/epd/patients/[id]/behandelplan/actions';

interface RouteParams {
  params: Promise<{ patientId: string }>;
}

function extractHulpvraag(notes: string | null): string | null {
  if (!notes) return null;
  const firstSentence = notes.split(/[.!?]/)[0];
  return firstSentence.length > 150 ? `${firstSentence.slice(0, 150)}...` : firstSentence;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { patientId } = await params;

    if (!z.string().uuid().safeParse(patientId).success) {
      return NextResponse.json(
        { error: 'patientId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const patient = await getPatient(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patiënt niet gevonden' }, { status: 404 });
    }

    const [intakes, encounters, carePlan] = await Promise.all([
      getIntakesByPatientId(patientId).catch(() => []),
      getPatientEncounters(patientId).catch(() => []),
      getActiveCarePlan(patientId).catch(() => null),
    ]);

    let hulpvraag: string | null = null;
    if (carePlan?.based_on_intake_id) {
      const linkedIntake = intakes.find((intake) => intake.id === carePlan.based_on_intake_id);
      if (linkedIntake?.notes) {
        hulpvraag = extractHulpvraag(linkedIntake.notes);
      }
    }

    return NextResponse.json({
      patient,
      intakes,
      encounters,
      carePlan,
      hulpvraag,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[patientId]/dashboard:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
