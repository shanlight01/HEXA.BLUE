import { NextRequest, NextResponse } from 'next/server';
import { extractSearchIntent } from '@/lib/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "query" est requis.' },
        { status: 400 }
      );
    }

    const intent = await extractSearchIntent(query);

    return NextResponse.json({
      intent,
      originalQuery: query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI route error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de la requête.' },
      { status: 500 }
    );
  }
}
