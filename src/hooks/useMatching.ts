import { useMemo } from 'react';
import type { User, SearchIntent, MatchResult } from '@/types';

// Distance approximation between Lomé neighborhoods (in relative units 0-1)
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  'Agoè': [1.38, 6.22],
  'Adidogomé': [1.30, 6.20],
  'Deckon': [1.22, 6.17],
  'Hedzranawoé': [1.24, 6.18],
  'Tokoin': [1.21, 6.15],
  'Bè': [1.23, 6.13],
  'Kodjoviakopé': [1.20, 6.14],
  'Nyékonakpoè': [1.19, 6.16],
  'Djidjolé': [1.26, 6.19],
  'Agbalépédogan': [1.28, 6.21],
  'Cassablanca': [1.21, 6.15],
  'Adawlato': [1.22, 6.14],
  'Gbossimé': [1.32, 6.21],
  'Kégué': [1.25, 6.17],
  'Amadahomé': [1.27, 6.18],
};

function getDistance(loc1: string, loc2: string): number {
  const c1 = NEIGHBORHOOD_COORDS[loc1];
  const c2 = NEIGHBORHOOD_COORDS[loc2];
  if (!c1 || !c2) return 0.5; // Unknown → neutral
  const dx = c1[0] - c2[0];
  const dy = c1[1] - c2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

const MAX_DISTANCE = 0.25; // max distance between any two neighborhoods

/**
 * Calculate match score for a provider given a search intent.
 * Score = (Rating * 0.35) + (Proximity * 0.30) + (Availability * 0.20) + (Price * 0.15)
 */
export function calculateMatchScore(
  provider: User,
  intent: SearchIntent
): MatchResult | null {
  const profile = provider.serviceProfile;
  if (!profile) return null;

  // Rating score (0-1): normalized from 0-5
  const ratingScore = profile.rating / 5;

  // Proximity score (0-1): closer = higher
  let proximityScore = 0.5; // default if no location specified
  if (intent.location && profile.location) {
    const dist = getDistance(intent.location, profile.location);
    proximityScore = Math.max(0, 1 - dist / MAX_DISTANCE);
  }

  // Availability score: 1 if available, 0.1 if not
  const availabilityScore = profile.isAvailable ? 1 : 0.1;

  // Price score (0-1): match preference
  let priceScore = 0.5; // neutral default
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

  const score =
    ratingScore * 0.35 +
    proximityScore * 0.3 +
    availabilityScore * 0.2 +
    priceScore * 0.15;

  return {
    provider,
    score,
    breakdown: {
      ratingScore,
      proximityScore,
      availabilityScore,
      priceScore,
    },
  };
}

export function useMatching(
  providers: User[],
  intent: SearchIntent | null
): MatchResult[] {
  return useMemo(() => {
    if (!intent) return [];

    const results: MatchResult[] = [];

    for (const provider of providers) {
      if (!provider.serviceProfile) continue;

      // Filter by category if specified
      if (
        intent.category &&
        provider.serviceProfile.category !== intent.category
      ) {
        continue;
      }

      const result = calculateMatchScore(provider, intent);
      if (result) results.push(result);
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // If urgent, prioritize available providers
    if (intent.urgency) {
      results.sort((a, b) => {
        const aAvail = a.provider.serviceProfile?.isAvailable ? 1 : 0;
        const bAvail = b.provider.serviceProfile?.isAvailable ? 1 : 0;
        if (aAvail !== bAvail) return bAvail - aAvail;
        return b.score - a.score;
      });
    }

    return results;
  }, [providers, intent]);
}
