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
import { getFirebaseDb } from './config';
import type { User, ServiceProfile, ServiceCategory } from '@/types';

const USERS_COLLECTION = 'users';

export async function createUserDocument(uid: string, data: Omit<User, 'uid'>) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, USERS_COLLECTION, uid), { uid, ...data });
}

export async function getUserDocument(uid: string): Promise<User | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUserDocument(uid: string, data: Partial<User>) {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), data);
}

export async function activateProviderProfile(
  uid: string,
  profile: ServiceProfile
) {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    isProvider: true,
    serviceProfile: profile,
  });
}

export async function updateProviderAvailability(
  uid: string,
  isAvailable: boolean
) {
  const db = getFirebaseDb();
  if (!db) return;
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    'serviceProfile.isAvailable': isAvailable,
  });
}

export async function getProvidersByCategory(
  category: ServiceCategory
): Promise<User[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const q = query(
    collection(db, USERS_COLLECTION),
    where('isProvider', '==', true),
    where('serviceProfile.category', '==', category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as User);
}

export async function getAllProviders(): Promise<User[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const q = query(
    collection(db, USERS_COLLECTION),
    where('isProvider', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as User);
}
