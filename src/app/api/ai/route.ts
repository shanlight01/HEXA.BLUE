/**
 * src/app/api/ai/route.ts
 * 
 * Route API côté serveur (Next.js App Router).
 * Reçoit la requête textuelle de l'utilisateur et appelle le service Gemini
 * pour en extraire l'intention structurée (service, localisation, urgence, etc).
 */
import { NextRequest, NextResponse } from 'next/server';
import { extractSearchIntent } from '@/lib/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // Validation basique de la requête
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "query" est requis et doit être une chaîne.' },
        { status: 400 }
      );
    }

    // Appel au service externe d'IA (ou son fallback local si pas de clé)
    const intent = await extractSearchIntent(query);

    return NextResponse.json({
      intent,
      originalQuery: query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur API Route AI :', error);
    // Gestion propre des erreurs pour le frontend
    return NextResponse.json(
      { error: 'Erreur inattendue lors de l\'analyse de la requête par l\'IA.' },
      { status: 500 }
    );
  }
}
