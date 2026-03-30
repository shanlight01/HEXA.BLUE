// ============================================
// ProxiServ — Définitions des Types
// ============================================

/**
 * Profil détaillé d'un prestataire de services.
 */
export interface ServiceProfile {
  category: ServiceCategory; // Métier (ex: Plomberie)
  skills: string[];          // Liste des compétences (ex: ["Soudure", "PVC"])
  location: string;          // Quartier (ex: "Agoè")
  coordinates?: {            // Position GPS précise (si activée)
    lat: number;
    lng: number;
  };
  phone: string;             // Numéro de contact direct (WhatsApp)
  rating: number;            // Note moyenne (0-5)
  isAvailable: boolean;      // État actuel (Disponible / Occupé)
  priceRange?: 'low' | 'medium' | 'high'; // Gamme de prix
  bio?: string;              // Description textuelle du profil
  completedJobs?: number;    // Nombre total de missions effectuées
}

/**
 * Structure d'un utilisateur (Client ou Prestataire).
 */
export interface User {
  uid: string;            // Identifiant unique généré par Firebase
  name: string;           // Nom complet
  email: string;          // Adresse email
  phone?: string;         // Numéro de téléphone standard
  isProvider: boolean;    // Vrai si l'utilisateur propose des services
  serviceProfile?: ServiceProfile; // Détails du service (si isProvider est vrai)
  createdAt?: string;     // Date de création du compte
  photoURL?: string;      // Photo de profil
  avatarUrl?: string;     // URL de l'avatar personnalisé
  location?: string;      // Lieu de résidence global
  providerCredentials?: { name: string; url: string }[]; // Diplômes ou certifications
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
