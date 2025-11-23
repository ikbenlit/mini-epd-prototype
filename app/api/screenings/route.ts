import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';

const querySchema = z.object({
  patientId: z.string().uuid('patientId moet een geldige UUID zijn'),
});

const createSchema = z.object({
  patient_id: z.string().uuid('patient_id moet een geldige UUID zijn'),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ patientId: searchParams.get('patientId') });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'patientId query parameter is verplicht' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { patientId } = parsed.data;

    const { data, error } = await supabase
      .from('screenings')
      .select('*, screening_activities(*), screening_documents(*)')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching screening:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen screening', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      const { data: created, error: insertError } = await supabase
        .from('screenings')
        .insert({ patient_id: patientId })
        .select('*, screening_activities(*), screening_documents(*)')
        .single();

      if (insertError) {
        console.error('Error creating screening:', insertError);
        return NextResponse.json(
          { error: 'Fout bij aanmaken screening', details: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ screening: serializeScreening(created) });
    }

    return NextResponse.json({ screening: serializeScreening(data) });
  } catch (error) {
    console.error('Unexpected error in GET /api/screenings:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validatiefout', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('screenings')
      .insert({ patient_id: parsed.data.patient_id })
      .select('*, screening_activities(*), screening_documents(*)')
      .single();

    if (error) {
      console.error('Error creating screening:', error);
      return NextResponse.json(
        { error: 'Fout bij aanmaken screening', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ screening: serializeScreening(data) }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/screenings:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Onverwachte serverfout', details: message },
      { status: 500 }
    );
  }
}
