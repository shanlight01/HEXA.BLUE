/**
 * src/hooks/useMatching.ts
 *
 * Algorithme de correspondance : associe les besoins de l'utilisateur
 * (extraits par Gemini) aux prestataires disponibles en utilisant un système de pondération.
 */
import { useMemo } from 'react';
import type { User, SearchIntent, MatchResult } from '@/types';

// Rayon de la Terre en km (pour la formule de Haversine)
const R = 6371;

/**
 * Calcule la distance en km entre deux points GPS via la formule de Haversine.
 * // FIX: Utilisation d'une vraie formule de calcul de distance au lieu d'une approximation.
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance maximale acceptable en km pour Lomé (environ 25km couvre presque tout le Grand Lomé)
const MAX_CITY_DISTANCE_KM = 25;

/**
 * Calcule un score de correspondance (0 à 1) pour un prestataire donné.
 * Formule : (Note * 0.35) + (Proximité * 0.30) + (Disponibilité * 0.20) + (Prix * 0.15)
 */
export function calculateMatchScore(
  provider: User,
  intent: SearchIntent
): MatchResult | null {
  const profile = provider.serviceProfile;
  if (!profile) return null;

  // 1. Score de Note (0-1)
  const ratingScore = profile.rating / 5;

  // 2. Score de Proximité (0-1)
  let proximityScore = 0.5; // neutre par défaut
  let exactDistanceKm: number | undefined;

  // Si on a les coordonnées de l'utilisateur ET du prestataire
  if (intent.userCoordinates && profile.coordinates) {
    exactDistanceKm = getDistanceKm(
      intent.userCoordinates.lat,
      intent.userCoordinates.lng,
      profile.coordinates.lat,
      profile.coordinates.lng
    );
    // Plus la distance est proche de 0, plus le score tend vers 1
    proximityScore = Math.max(0, 1 - (exactDistanceKm / MAX_CITY_DISTANCE_KM));
  } 
  // Fallback au quartier si pas de GPS utilisateur
  else if (intent.location && profile.location && intent.location.toLowerCase() === profile.location.toLowerCase()) {
    proximityScore = 1; // Correspondance exacte du quartier
  }

  // Si on limite par un rayon de recherche précis
  if (intent.searchRadiusKm && exactDistanceKm !== undefined) {
    if (exactDistanceKm > intent.searchRadiusKm) {
      return null; // Hors de la zone de recherche demandée, on l'exclut
    }
  }

  // 3. Score de Disponibilité
  const availabilityScore = profile.isAvailable ? 1 : 0.1;

  // 4. Score de Prix (0-1)
  let priceScore = 0.5; // neutre par défaut
  if (intent.pricePreference && profile.priceRange) {
    if (intent.pricePreference === profile.priceRange) {
      priceScore = 1;
    } else {
      const priceOrder = { low: 0, medium: 1, high: 2 };
      const diff = Math.abs(
        priceOrder[intent.pricePreference] - priceOrder[profile.priceRange]
      );
      priceScore = diff === 1 ? 0.5 : 0.2;
    }
  }

  // Poids: Note 35%, Proximité 30%, Disponibilité 20%, Prix 15%
  const score =
    ratingScore * 0.35 +
    proximityScore * 0.3 +
    availabilityScore * 0.2 +
    priceScore * 0.15;

  return {
    provider,
    score,
    distanceKm: exactDistanceKm,
    breakdown: {
      ratingScore,
      proximityScore,
      availabilityScore,
      priceScore,
    },
  };
}

/**
 * Hook React pour filtrer et trier la liste de prestataires.
 */
export function useMatching(
  providers: User[],
  intent: SearchIntent | null
): MatchResult[] {
  return useMemo(() => {
    if (!intent) return [];

    const results: MatchResult[] = [];

    for (const provider of providers) {
      if (!provider.serviceProfile) continue;

      // Filtre catégorie strict, si demandé
      if (
        intent.category &&
        provider.serviceProfile.category !== intent.category
      ) {
        continue;
      }

      const result = calculateMatchScore(provider, intent);
      if (result) results.push(result); // result is null if outside strict search radius
    }

    // Tri prioritaire: Distance (si GPS actif), puis Score
    results.sort((a, b) => {
      // Si géolocalisation active et on veut forcer la proximité
      if (intent.userCoordinates && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        // Optionnel: On pourrait trier STRICTEMENT par distance. 
        // Ici on garde un tri mixte où la distance compte pour beacoup dans le score total.
        return b.score - a.score; 
      }
      return b.score - a.score;
    });

    // Urgence absolue : la disponibilité passe avant tout
    if (intent.urgency) {
      results.sort((a, b) => {
        const aAvail = a.provider.serviceProfile?.isAvailable ? 1 : 0;
        const bAvail = b.provider.serviceProfile?.isAvailable ? 1 : 0;
        if (aAvail !== bAvail) return bAvail - aAvail;
        return b.score - a.score;
      });
    }

    return results;
  }, [providers, intent]); // FIX: React hook dependency array optimization
}
