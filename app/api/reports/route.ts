import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import { CreateReportSchema, type ReportListResponse } from '@/lib/types/report';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId query parameter is verplicht' },
        { status: 400 }
      );
    }

    if (!z.string().uuid().safeParse(patientId).success) {
      return NextResponse.json(
        { error: 'patientId moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen rapportages', details: error.message },
        { status: 500 }
      );
    }

    const response: ReportListResponse = {
      reports: data ?? [],
      total: data?.length ?? 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validatiefout',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const { patient_id, type, content, ai_confidence, ai_reasoning } = result.data;
    const { data, error } = await supabase
      .from('reports')
      .insert({
        patient_id,
        type,
        content,
        ai_confidence,
        ai_reasoning,
        created_by: authData.user.id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json(
        { error: 'Opslaan mislukt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/reports:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Ongeldige JSON in request body' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
