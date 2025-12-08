import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import {
  CreateReportSchema,
  CreateVerpleegkundigSchema,
  calculateShiftDate,
  type ReportListResponse,
  VERPLEEG_REPORT_TYPES,
} from '@/lib/types/report';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type'); // Optional: filter by type
    const types = searchParams.get('types'); // Optional: comma-separated list of types
    const startDate = searchParams.get('startDate'); // Optional: YYYY-MM-DD
    const endDate = searchParams.get('endDate'); // Optional: YYYY-MM-DD
    const includeInHandover = searchParams.get('includeInHandover'); // Optional: 'true'

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

    // Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return NextResponse.json(
        { error: 'startDate moet in YYYY-MM-DD formaat zijn' },
        { status: 400 }
      );
    }
    if (endDate && !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'endDate moet in YYYY-MM-DD formaat zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let query = supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Filter by single type
    if (type) {
      query = query.eq('type', type);
    }

    // Filter by multiple types (comma-separated)
    if (types) {
      const typeList = types.split(',').map((t) => t.trim());
      query = query.in('type', typeList);
    }

    // Filter by date range (for shift_date, used by verpleegkundig)
    if (startDate && endDate) {
      query = query.gte('shift_date', startDate).lte('shift_date', endDate);
    } else if (startDate) {
      query = query.gte('shift_date', startDate);
    } else if (endDate) {
      query = query.lte('shift_date', endDate);
    }

    // Filter for handover reports only
    if (includeInHandover === 'true') {
      query = query.eq('include_in_handover', true);
    }

    const { data, error } = await query;

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

    // Check if this is a verpleegkundig report
    const isVerpleegkundig = body.type === 'verpleegkundig';

    // Use appropriate schema
    const result = isVerpleegkundig
      ? CreateVerpleegkundigSchema.safeParse(body)
      : CreateReportSchema.safeParse(body);

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
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Get practitioner ID for the current user
    const { data: practitioner } = await supabase
      .from('practitioners')
      .select('id')
      .eq('user_id', authData.user.id)
      .single();

    if (isVerpleegkundig) {
      // Handle verpleegkundig report
      const { patient_id, content, category, include_in_handover } =
        result.data as z.infer<typeof CreateVerpleegkundigSchema>;

      const now = new Date();
      const shiftDate = calculateShiftDate(now);

      const { data, error } = await supabase
        .from('reports')
        .insert({
          patient_id,
          type: 'verpleegkundig',
          content,
          structured_data: { category },
          include_in_handover: include_in_handover ?? false,
          shift_date: shiftDate,
          created_by: practitioner?.id ?? null,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating verpleegkundig report:', error);
        return NextResponse.json(
          { error: 'Opslaan mislukt', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data, { status: 201 });
    } else {
      // Handle standard report
      const {
        patient_id,
        type,
        content,
        ai_confidence,
        ai_reasoning,
        encounter_id,
        intake_id,
      } = result.data as z.infer<typeof CreateReportSchema>;

      const { data, error } = await supabase
        .from('reports')
        .insert({
          patient_id,
          type,
          content,
          ai_confidence,
          ai_reasoning,
          encounter_id,
          intake_id,
          created_by: practitioner?.id ?? null,
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
    }
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
