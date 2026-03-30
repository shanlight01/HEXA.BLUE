/**
 * src/app/api/chat/route.ts
 *
 * Route API pour le chatbot Gemini intégré à ProxiServ.
 * Reçoit l'historique de la conversation et retourne la réponse du modèle.
 */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Tu es l'assistant de ProxiServ, une plateforme de mise en relation entre clients et prestataires de services à Lomé, Togo.
Tu aides uniquement les utilisateurs à trouver le bon service ou prestataire (coiffure, plomberie, électricité, menuiserie, couture, mécanique, informatique, cuisine, ménage, maçonnerie, peinture, jardinage).
Si la demande est hors sujet, redirige poliment vers les services disponibles.
Réponds toujours en français, de façon concise, utile et amicale.`;

export async function POST(request: NextRequest) {
  try {
    const { history, message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { reply: "Je ne suis pas disponible pour le moment. Veuillez utiliser la barre de recherche pour trouver un prestataire." },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Reconstitue l'historique Gemini depuis notre format simplifié
    const geminiHistory = (history || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Erreur chatbot IA :', error);
    return NextResponse.json(
      { reply: "Une erreur s'est produite. Essayez de reformuler votre question." },
      { status: 200 }
    );
  }
}
