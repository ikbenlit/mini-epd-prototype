import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const BUCKET = 'screening-documents';

async function ensureBucket() {
  const { data, error } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50 MB
    });
    if (createError && !createError.message.includes('already exists')) {
      throw createError;
    }
  } else if (error && !error.message.includes('not found')) {
    throw error;
  }
}

async function getPractitionerByUser(supabase: Awaited<ReturnType<typeof createClient>>, userId?: string) {
  if (!userId) return null;
  const { data } = await supabase
    .from('practitioners')
    .select('id, name_given, name_family')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

function formatDisplayName(practitioner: any, fallback: string) {
  if (practitioner) {
    const given = (practitioner.name_given || []).join(' ');
    const family = practitioner.name_family || '';
    return `${given} ${family}`.trim();
  }
  return fallback;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ screeningId: string }> }
) {
  try {
    const { screeningId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Bestand ontbreekt' }, { status: 400 });
    }

    const documentType = (formData.get('documentType') as string) || 'overig';

    await ensureBucket();

    const filePath = `${screeningId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Upload mislukt', details: uploadError.message },
        { status: 500 }
      );
    }

    const practitioner = await getPractitionerByUser(supabase, user.id);
    const displayName = formatDisplayName(
      practitioner,
      (user.user_metadata?.full_name as string) || user.email || 'Onbekend'
    );

    const { data, error } = await supabase
      .from('screening_documents')
      .insert({
        screening_id: screeningId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        document_type: documentType,
        uploaded_by: practitioner?.id || null,
        uploaded_by_name: displayName,
      })
      .select('*')
      .single();

    if (error) {
      console.error('DB insert error:', error);
      return NextResponse.json(
        { error: 'Opslaan mislukt', details: error.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      document: {
        ...data,
        publicUrl: publicUrlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Unexpected error in POST /documents:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
