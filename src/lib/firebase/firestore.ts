import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import type { User, ServiceProfile, ServiceCategory } from '@/types';

// Nom de la collection principale dans la base de données Firestore.
const USERS_COLLECTION = 'users';

/**
 * Crée un nouveau document utilisateur lors de son inscription.
 */
export async function createUserDocument(uid: string, data: Omit<User, 'uid'>) {
  if (!db) return;
  await setDoc(doc(db, USERS_COLLECTION, uid), { uid, ...data });
}

/**
 * Récupère les données d'un utilisateur à partir de son identifiant unique (UID).
 */
export async function getUserDocument(uid: string): Promise<User | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

/**
 * Met à jour des informations spécifiques d'un utilisateur.
 */
export async function updateUserDocument(uid: string, data: Partial<User>) {
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), data);
}

/**
 * Transforme un utilisateur simple en "Prestataire" en lui ajoutant un profil de service.
 */
export async function activateProviderProfile(
  uid: string,
  profile: ServiceProfile
) {
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    isProvider: true,
    serviceProfile: profile,
  });
}

/**
 * Change l'état de disponibilité d'un prestataire (ex: Disponible / Occupé).
 */
export async function updateProviderAvailability(
  uid: string,
  isAvailable: boolean
) {
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    'serviceProfile.isAvailable': isAvailable,
  });
}

/**
 * Recherche des prestataires filtrés par une catégorie spécifique (ex: Plomberie).
 */
export async function getProvidersByCategory(
  category: ServiceCategory
): Promise<User[]> {
  if (!db) return [];
  const q = query(
    collection(db, USERS_COLLECTION),
    where('isProvider', '==', true),
    where('serviceProfile.category', '==', category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as User);
}

/**
 * Récupère la liste de TOUS les prestataires inscrits sur la plateforme.
 */
export async function getAllProviders(): Promise<User[]> {
  if (!db) return [];
  const q = query(
    collection(db, USERS_COLLECTION),
    where('isProvider', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as User);
}
