import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './config';

export async function signUp(email: string, password: string, name: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase non configuré. Ajoutez vos clés dans .env.local');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase non configuré. Ajoutez vos clés dans .env.local');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase non configuré. Ajoutez vos clés dans .env.local');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOut() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => { };
  }
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => { };
  }
  return onAuthStateChanged(auth, callback);
}
