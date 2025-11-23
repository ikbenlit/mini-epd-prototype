import { NextRequest, NextResponse } from 'next/server';

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DEEPGRAM_API_KEY ontbreekt' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Bestand ontbreekt' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await fetch(DEEPGRAM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': file.type || 'audio/webm',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram error', response.status, errorText);
      return NextResponse.json(
        { error: 'Deepgram transcribe mislukt', details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || '';

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Unexpected error in Deepgram route', error);
    return NextResponse.json({ error: 'Onverwachte fout' }, { status: 500 });
  }
}
