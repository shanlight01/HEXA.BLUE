import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SearchIntent, ServiceCategory } from '@/types';

const CATEGORY_MAP: Record<string, ServiceCategory> = {
  coiffeur: 'coiffure',
  coiffeuse: 'coiffure',
  coiffure: 'coiffure',
  tresses: 'coiffure',
  plombier: 'plomberie',
  plomberie: 'plomberie',
  electricien: 'electricite',
  électricien: 'electricite',
  electricite: 'electricite',
  électricité: 'electricite',
  menuisier: 'menuiserie',
  menuiserie: 'menuiserie',
  couturier: 'couture',
  couturière: 'couture',
  couture: 'couture',
  mécanicien: 'mecanique',
  mecanicien: 'mecanique',
  mecanique: 'mecanique',
  mécanique: 'mecanique',
  informaticien: 'informatique',
  informatique: 'informatique',
  ordinateur: 'informatique',
  cuisinier: 'cuisine',
  cuisinière: 'cuisine',
  cuisine: 'cuisine',
  traiteur: 'cuisine',
  ménage: 'menage',
  menage: 'menage',
  nettoyage: 'menage',
  maçon: 'maconnerie',
  macon: 'maconnerie',
  maçonnerie: 'maconnerie',
  maconnerie: 'maconnerie',
  peintre: 'peinture',
  peinture: 'peinture',
  jardinier: 'jardinage',
  jardinage: 'jardinage',
};

export async function extractSearchIntent(
  userQuery: string
): Promise<SearchIntent> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback: basic keyword extraction when no API key
    return fallbackExtraction(userQuery);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Tu es un assistant qui extrait les intentions de recherche de services locaux à Lomé, Togo.
Analyse la requête suivante et retourne un JSON valide avec ces champs :
- "service": le type de service demandé (en français, singulier)
- "location": le quartier mentionné (ou null si non précisé)
- "urgency": true si la demande est urgente, false sinon
- "pricePreference": "low", "medium", "high" ou null

Quartiers connus de Lomé : Agoè, Adidogomé, Deckon, Hedzranawoé, Tokoin, Bè, Kodjoviakopé, Nyékonakpoè, Djidjolé, Agbalépédogan, Cassablanca, Adawlato, Gbossimé, Kégué, Amadahomé.

Requête : "${userQuery}"

Réponds UNIQUEMENT avec le JSON, sans markdown ni texte additionnel.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON from response
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Map service to category
    const category = mapToCategory(parsed.service);

    return {
      service: parsed.service || '',
      location: parsed.location || undefined,
      urgency: parsed.urgency || false,
      category,
      pricePreference: parsed.pricePreference || undefined,
    };
  } catch (error) {
    console.error('Gemini API error, falling back to keyword extraction:', error);
    return fallbackExtraction(userQuery);
  }
}

function fallbackExtraction(query: string): SearchIntent {
  const lower = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const original = query.toLowerCase();

  // Detect service
  let service = '';
  let category: ServiceCategory | undefined;

  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    const normalizedKey = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(normalizedKey) || original.includes(keyword)) {
      service = keyword;
      category = cat;
      break;
    }
  }

  // Detect location
  const locations = [
    'Agoè', 'Adidogomé', 'Deckon', 'Hedzranawoé', 'Tokoin',
    'Bè', 'Kodjoviakopé', 'Nyékonakpoè', 'Djidjolé', 'Agbalépédogan',
    'Cassablanca', 'Adawlato', 'Gbossimé', 'Kégué', 'Amadahomé',
  ];

  let location: string | undefined;
  for (const loc of locations) {
    if (original.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  // Detect urgency
  const urgencyKeywords = ['urgent', 'urgente', 'vite', 'rapidement', 'maintenant', 'immédiat', 'tout de suite'];
  const urgency = urgencyKeywords.some((k) => original.includes(k));

  return { service, location, urgency, category };
}

function mapToCategory(service: string): ServiceCategory | undefined {
  if (!service) return undefined;
  const lower = service.toLowerCase();

  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }

  return undefined;
}
