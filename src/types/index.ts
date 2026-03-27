// ============================================
// QuickService AI — Type Definitions
// ============================================

export interface ServiceProfile {
  category: ServiceCategory;
  skills: string[];
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  whatsapp: string;
  rating: number;
  isAvailable: boolean;
  priceRange?: 'low' | 'medium' | 'high';
  bio?: string;
  completedJobs?: number;
}
export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  isProvider: boolean;
  serviceProfile?: ServiceProfile;
  createdAt?: string;
  photoURL?: string;
  avatarUrl?: string; // New avatar
  location?: string; // e.g. "Agoè, Lomé"
  providerCredentials?: { name: string; url: string }[];
}

export type ServiceCategory =
  | 'coiffure'
  | 'plomberie'
  | 'electricite'
  | 'menuiserie'
  | 'couture'
  | 'mecanique'
  | 'informatique'
  | 'cuisine'
  | 'menage'
  | 'maconnerie'
  | 'peinture'
  | 'jardinage';

export interface SearchIntent {
  service: string;
  location?: string;
  userCoordinates?: { lat: number; lng: number };
  searchRadiusKm?: number;
  urgency: boolean;
  category?: ServiceCategory;
  pricePreference?: 'low' | 'medium' | 'high';
}

export interface MatchResult {
  provider: User;
  score: number;
  distanceKm?: number;
  breakdown: {
    ratingScore: number;
    proximityScore: number;
    availabilityScore: number;
    priceScore: number;
  };
}

export interface CategoryInfo {
  id: ServiceCategory;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'coiffure', label: 'Coiffure', icon: '💇', color: '#E91E63' },
  { id: 'plomberie', label: 'Plomberie', icon: '🔧', color: '#2196F3' },
  { id: 'electricite', label: 'Électricité', icon: '⚡', color: '#FF9800' },
  { id: 'menuiserie', label: 'Menuiserie', icon: '🪚', color: '#795548' },
  { id: 'couture', label: 'Couture', icon: '🧵', color: '#9C27B0' },
  { id: 'mecanique', label: 'Mécanique', icon: '🔩', color: '#607D8B' },
  { id: 'informatique', label: 'Informatique', icon: '💻', color: '#00BCD4' },
  { id: 'cuisine', label: 'Cuisine', icon: '🍳', color: '#F44336' },
  { id: 'menage', label: 'Ménage', icon: '🧹', color: '#4CAF50' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: '🧱', color: '#FF5722' },
  { id: 'peinture', label: 'Peinture', icon: '🎨', color: '#673AB7' },
  { id: 'jardinage', label: 'Jardinage', icon: '🌿', color: '#8BC34A' },
];

export const LOME_NEIGHBORHOODS = [
  'Agoè', 'Adidogomé', 'Deckon', 'Hedzranawoé', 'Tokoin',
  'Bè', 'Kodjoviakopé', 'Nyékonakpoè', 'Djidjolé', 'Agbalépédogan',
  'Cassablanca', 'Adawlato', 'Gbossimé', 'Kégué', 'Amadahomé',
] as const;

export type LomeNeighborhood = typeof LOME_NEIGHBORHOODS[number];
