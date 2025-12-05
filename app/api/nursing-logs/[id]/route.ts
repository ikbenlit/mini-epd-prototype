import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/auth/server';
import {
  UpdateNursingLogSchema,
  calculateShiftDate,
} from '@/lib/types/nursing-log';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'id moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = UpdateNursingLogSchema.safeParse(body);

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

    // Check if log exists and belongs to current user
    const { data: existingLog, error: fetchError } = await supabase
      .from('nursing_logs')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingLog) {
      return NextResponse.json(
        { error: 'Dagnotitie niet gevonden' },
        { status: 404 }
      );
    }

    if (existingLog.created_by !== authData.user.id) {
      return NextResponse.json(
        { error: 'Je kunt alleen je eigen notities bewerken' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    const { category, content, timestamp, include_in_handover } = result.data;

    if (category !== undefined) updateData.category = category;
    if (content !== undefined) updateData.content = content;
    if (include_in_handover !== undefined)
      updateData.include_in_handover = include_in_handover;

    // If timestamp changes, recalculate shift_date
    if (timestamp !== undefined) {
      updateData.timestamp = timestamp;
      updateData.shift_date = calculateShiftDate(timestamp);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Geen velden om te updaten' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('nursing_logs')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating nursing log:', error);
      return NextResponse.json(
        { error: 'Bijwerken mislukt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/nursing-logs/[id]:', error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'id moet een geldige UUID zijn' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Check if log exists and belongs to current user
    const { data: existingLog, error: fetchError } = await supabase
      .from('nursing_logs')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingLog) {
      return NextResponse.json(
        { error: 'Dagnotitie niet gevonden' },
        { status: 404 }
      );
    }

    if (existingLog.created_by !== authData.user.id) {
      return NextResponse.json(
        { error: 'Je kunt alleen je eigen notities verwijderen' },
        { status: 403 }
      );
    }

    // Hard delete (RLS policy already ensures user can only delete own logs)
    const { error } = await supabase
      .from('nursing_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nursing log:', error);
      return NextResponse.json(
        { error: 'Verwijderen mislukt', details: error.message },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/nursing-logs/[id]:', error);
    return NextResponse.json(
      { error: 'Onverwachte serverfout' },
      { status: 500 }
    );
  }
}
