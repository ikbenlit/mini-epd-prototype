import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import {
  CreateNursingLogSchema,
  calculateShiftDate,
  type NursingLogListResponse,
} from '@/lib/types/nursing-log';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const date = searchParams.get('date'); // Optional: YYYY-MM-DD format

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

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'date moet in YYYY-MM-DD formaat zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('nursing_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false });

    // Filter by shift_date if date is provided
    if (date) {
      query = query.eq('shift_date', date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching nursing logs:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen dagnotities', details: error.message },
        { status: 500 }
      );
    }

    const response: NursingLogListResponse = {
      logs: data ?? [],
      total: data?.length ?? 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/nursing-logs:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateNursingLogSchema.safeParse(body);

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

    const { patient_id, category, content, timestamp, include_in_handover } =
      result.data;

    // Use provided timestamp or current time
    const logTimestamp = timestamp || new Date().toISOString();

    // Calculate shift_date from timestamp
    const shiftDate = calculateShiftDate(logTimestamp);

    const { data, error } = await supabase
      .from('nursing_logs')
      .insert({
        patient_id,
        category,
        content,
        timestamp: logTimestamp,
        shift_date: shiftDate,
        include_in_handover: include_in_handover ?? false,
        created_by: authData.user.id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating nursing log:', error);
      return NextResponse.json(
        { error: 'Opslaan mislukt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/nursing-logs:', error);
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
