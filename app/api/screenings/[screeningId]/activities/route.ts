import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';

const createSchema = z.object({
  activity_text: z
    .string()
    .min(3, 'Beschrijf minimaal 3 tekens')
    .max(2000, 'Maximaal 2000 tekens'),
});

async function getPractitionerForUser(supabase: Awaited<ReturnType<typeof createClient>>, userId?: string) {
  if (!userId) return null;

  const { data } = await supabase
    .from('practitioners')
    .select('id, name_given, name_family')
    .eq('user_id', userId)
    .maybeSingle();

  return data;
}

function formatPractitionerName(practitioner: any) {
  if (!practitioner) return null;
  const given = (practitioner.name_given || []).join(' ');
  const family = practitioner.name_family || '';
  return `${given} ${family}`.trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string }> }
) {
  try {
    const { screeningId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('screening_activities')
      .select('*')
      .eq('screening_id', screeningId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen activiteiten', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activities: data || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/screenings/[screeningId]/activities:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string }> }
) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validatiefout', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { screeningId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const practitioner = await getPractitionerForUser(supabase, user.id);
    const displayName = formatPractitionerName(practitioner) || user.user_metadata?.full_name || user.email || 'Onbekende gebruiker';

    const { data, error } = await supabase
      .from('screening_activities')
      .insert({
        screening_id: screeningId,
        activity_text: parsed.data.activity_text,
        created_by: practitioner?.id || null,
        created_by_name: displayName,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { error: 'Fout bij toevoegen activiteit', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/screenings/[screeningId]/activities:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}
