import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';

const updateSchema = z.object({
  request_for_help: z.string().optional(),
  decision: z.enum(['geschikt', 'niet_geschikt']).optional(),
  decision_notes: z.string().optional(),
  decision_department: z.string().optional(),
});

function serializeScreening(screening: any) {
  const activities = [...(screening.screening_activities || [])].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

  const documents = [...(screening.screening_documents || [])].sort((a, b) => {
    const aTime = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
    const bTime = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
    return bTime - aTime;
  });

  return {
    ...screening,
    screening_activities: activities,
    screening_documents: documents,
  };
}

async function getPractitionerForUser(supabase: Awaited<ReturnType<typeof createClient>>, userId?: string) {
  if (!userId) return null;

  const { data } = await supabase
    .from('practitioners')
    .select('id, name_given, name_family')
    .eq('user_id', userId)
    .maybeSingle();

  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string }> }
) {
  try {
    const { screeningId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('screenings')
      .select('*, screening_activities(*), screening_documents(*)')
      .eq('id', screeningId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching screening:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen screening', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Screening niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ screening: serializeScreening(data) });
  } catch (error) {
    console.error('Unexpected error in GET /api/screenings/[screeningId]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string }> }
) {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validatiefout', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { screeningId } = await params;
    const supabase = await createClient();

    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'request_for_help')) {
      updates.request_for_help = parsed.data.request_for_help || null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'decision_notes')) {
      updates.decision_notes = parsed.data.decision_notes || null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'decision_department')) {
      updates.decision_department = parsed.data.decision_department || null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'decision')) {
      const decision = parsed.data.decision;

      if (decision === 'geschikt' && !parsed.data.decision_department) {
        return NextResponse.json(
          { error: 'Afdeling is verplicht bij een positief besluit' },
          { status: 400 }
        );
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const practitioner = await getPractitionerForUser(supabase, user?.id);

      updates.decision = decision;
      updates.decision_date = new Date().toISOString();
      updates.decision_by = practitioner?.id || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Geen velden om bij te werken ontvangen' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('screenings')
      .update(updates)
      .eq('id', screeningId)
      .select('*, screening_activities(*), screening_documents(*)')
      .single();

    if (error) {
      console.error('Error updating screening:', error);
      return NextResponse.json(
        { error: 'Fout bij bijwerken screening', details: error.message },
        { status: 500 }
      );
    }

    if (parsed.data.decision) {
      const newStatus = parsed.data.decision === 'geschikt' ? 'active' : 'cancelled';
      const { error: statusError } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', data.patient_id);

      if (statusError) {
        console.error('Error updating patient status:', statusError);
      }
    }

    return NextResponse.json({ screening: serializeScreening(data) });
  } catch (error) {
    console.error('Unexpected error in PUT /api/screenings/[screeningId]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}
