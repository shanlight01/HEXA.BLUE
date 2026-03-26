/**
 * src/data/mockProviders.ts
 * 
 * Contient les données statiques des prestataires pour le prototype.
 * Les coordonnées GPS sont basées sur de vraies positions à Lomé, Togo.
 */

import type { User } from '@/types';

// Points de repère réels pour Lomé
export const GPS_KOINF = {
  AGOE: { lat: 6.2201, lng: 1.1895 },
  LOMENAVAA: { lat: 6.1366, lng: 1.2222 }, // Kodjoviakope roughly
  DECKON: { lat: 6.1325, lng: 1.2268 },
  HEDZRANAWOE: { lat: 6.1732, lng: 1.2464 },
  TOKOIN: { lat: 6.1518, lng: 1.2185 },
  BE: { lat: 6.1378, lng: 1.2429 },
  ADIDOGOME: { lat: 6.1953, lng: 1.1578 },
  KEGUE: { lat: 6.1824, lng: 1.2587 },
  DJIDJOLE: { lat: 6.1970, lng: 1.1855 },
}

export const mockProviders: User[] = [
  // 1. Coiffure
  {
    uid: 'prov_1',
    email: 'ama.koffi@example.com',
    name: 'Ama Koffi',
    isProvider: true,
    serviceProfile: {
      category: 'coiffure',
      skills: ['Tresses africaines', 'Tissage', 'Défrisage', 'Locks'],
      location: 'Agoè',
      coordinates: GPS_KOINF.AGOE,
      whatsapp: '+22890112233',
      rating: 4.8,
      completedJobs: 342,
      isAvailable: true,
      priceRange: 'medium',
      bio: "Coiffeuse professionnelle avec 8 ans d'expérience. Je me déplace à domicile si nécessaire.",
    },
  },
  // 2. Plomberie
  {
    uid: 'prov_2',
    email: 'kodjo.mensah@example.com',
    name: 'Kodjo Mensah',
    isProvider: true,
    serviceProfile: {
      category: 'plomberie',
      skills: ['Fuites', 'Installation tuyauterie', 'Chauffe-eau', 'Débouchage'],
      location: 'Tokoin',
      coordinates: GPS_KOINF.TOKOIN,
      whatsapp: '+22899445566',
      rating: 4.6,
      completedJobs: 185,
      isAvailable: false,
      priceRange: 'medium',
      bio: "Intervention rapide pour toutes vos urgences en plomberie. Travail propre et garanti.",
    },
  },
  // 3. Électricité
  {
    uid: 'prov_3',
    email: 'yaome.elec@example.com',
    name: 'Yaomé Dossou',
    isProvider: true,
    serviceProfile: {
      category: 'electricite',
      skills: ['Dépannage 24/7', 'Installation complète', 'Climatisation'],
      location: 'Deckon',
      coordinates: GPS_KOINF.DECKON,
      whatsapp: '+22891223344',
      rating: 4.9,
      completedJobs: 512,
      isAvailable: true,
      priceRange: 'high',
      bio: "Artisan électricien certifié CEET. Sécurité et normes respectées.",
    },
  },
  // 4. Menuiserie
  {
    uid: 'prov_4',
    email: 'adjo.wood@example.com',
    name: 'Komi Afantchao',
    isProvider: true,
    serviceProfile: {
      category: 'menuiserie',
      skills: ['Meubles sur mesure', 'Réparation', 'Pose de portes'],
      location: 'Bè',
      coordinates: GPS_KOINF.BE,
      whatsapp: '+22892334455',
      rating: 4.2,
      completedJobs: 89,
      isAvailable: true,
      priceRange: 'low',
      bio: "Menuisier menuisier passionné par le bois de teck. Des prix très abordables pour tous.",
    },
  },
  // 5. Couture
  {
    uid: 'prov_5',
    email: 'ablavi.fashion@example.com',
    name: 'Ablavi Dosseh',
    isProvider: true,
    serviceProfile: {
      category: 'couture',
      skills: ['Robes sur mesure', 'Tenues traditionnelles', 'Retouches'],
      location: 'Hedzranawoé',
      coordinates: GPS_KOINF.HEDZRANAWOE,
      whatsapp: '+22893445566',
      rating: 4.9,
      completedJobs: 189,
      isAvailable: true,
      priceRange: 'high',
      bio: "Styliste-couturière spécialisée en mode africaine contemporaine. Pagne, bazin, et wax.",
    },
  },
  // 6. Mécanique
  {
    uid: 'prov_6',
    email: 'garage.sylvanus@example.com',
    name: 'Garage Sylvanus',
    isProvider: true,
    serviceProfile: {
      category: 'mecanique',
      skills: ['Vidange', 'Moteur', 'Diagnostic auto', 'Climatisation auto'],
      location: 'Adidogomé',
      coordinates: GPS_KOINF.ADIDOGOME,
      whatsapp: '+22890556677',
      rating: 4.5,
      completedJobs: 420,
      isAvailable: true,
      priceRange: 'medium',
      bio: "Spécialiste voitures japonaises et allemandes. Pièces d'origine garanties.",
    },
  },
  // 7. Informatique
  {
    uid: 'prov_7',
    email: 'tech.edem@example.com',
    name: 'Edem Tech',
    isProvider: true,
    serviceProfile: {
      category: 'informatique',
      skills: ['Réparation PC', 'Installation réseau', 'Dépannage Mac'],
      location: 'Kégué',
      coordinates: GPS_KOINF.KEGUE,
      whatsapp: '+22891667788',
      rating: 4.7,
      completedJobs: 156,
      isAvailable: false,
      priceRange: 'medium',
      bio: "Technicien informatique. Je peux récupérer vos données perdues ou booster votre PC.",
    },
  },
  // 8. Cuisine
  {
    uid: 'prov_8',
    email: 'saveurs.akouvi@example.com',
    name: 'Maman Akouvi',
    isProvider: true,
    serviceProfile: {
      category: 'cuisine',
      skills: ['Traiteur événements', 'Plats locaux', 'Pâtisserie'],
      location: 'Djidjolé',
      coordinates: GPS_KOINF.DJIDJOLE,
      whatsapp: '+22892778899',
      rating: 5.0,
      completedJobs: 45,
      isAvailable: true,
      priceRange: 'low',
      bio: "Cuisine togolaise de fête! Akoumé, djinkoumé, ayimolou... sur commande uniquement.",
    },
  },
  // 9. Informatique / Mobile
  {
    uid: 'prov_9',
    email: 'phone.clinic@example.com',
    name: 'Phone Clinic Lomé',
    isProvider: true,
    serviceProfile: {
      category: 'informatique',
      skills: ['Réparation écran', 'Déblocage', 'Batterie'],
      location: 'Deckon',
      coordinates: GPS_KOINF.DECKON,
      whatsapp: '+22893889900',
      rating: 4.4,
      completedJobs: 890,
      isAvailable: true,
      priceRange: 'medium',
      bio: "Boutique à Deckon. Réparation express de tous smartphones en moins d'une heure.",
    },
  },
  // 10. Plomberie
  {
    uid: 'prov_10',
    email: 'koffi.eau@example.com',
    name: 'Koffi Eau Pro',
    isProvider: true,
    serviceProfile: {
      category: 'plomberie',
      skills: ['Puits aménagé', 'Installation pompe', 'Fosse septique'],
      location: 'Agoè',
      coordinates: GPS_KOINF.AGOE,
      whatsapp: '+22890990011',
      rating: 4.3,
      completedJobs: 112,
      isAvailable: true,
      priceRange: 'medium',
      bio: "Gros œuvres en plomberie pour nouvelles constructions. Devis rapide gratuit.",
    },
  },
];
