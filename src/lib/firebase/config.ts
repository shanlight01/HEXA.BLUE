import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Configuration de votre projet Firebase
// Les valeurs sont récupérées depuis le fichier .env.local pour la sécurité.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

// Vérifie si la configuration Firebase est présente et valide.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key');

// Initialisation sécurisée — uniquement côté navigateur (pas pendant le SSR de Next.js).
// Importer ce SDK dans un Server Component provoquerait une erreur "client is offline".
try {
  if (isFirebaseConfigured && typeof window !== 'undefined') {
    // Initialise l'application Firebase (évite les doublons si déjà initialisée).
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    // Initialise les services spécifiques.
    db      = getFirestore(app);
    auth    = getAuth(app);
    storage = getStorage(app);

    // Active la persistance IndexedDB pour éviter "client is offline" au démarrage.
    // Firestore répond depuis le cache local dès la première requête, même si le
    // WebSocket vers Google n'est pas encore établi.
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Plusieurs onglets ouverts — la persistance ne peut être activée que dans un seul.
        console.warn('⚠️ Firestore : persistance multi-onglets impossible.');
      } else if (err.code === 'unimplemented') {
        // Navigateur trop ancien pour IndexedDB.
        console.warn('⚠️ Firestore : ce navigateur ne supporte pas la persistance hors-ligne.');
      }
    });

  } else if (!isFirebaseConfigured) {
    console.warn('⚠️ Firebase non configuré : Clés API manquantes dans .env.local');
  }
} catch (error) {
  console.error('❌ Échec de l\'initialisation de Firebase :', error);
}

export { app, db, auth, storage };
export default app;
