/**
 * src/hooks/useAuth.ts
 * 
 * Hook React personnalisé pour surveiller l'état de connexion de l'utilisateur en temps réel.
 * Ce hook utilise Firebase Authentication pour savoir si un utilisateur est connecté ou non.
 */
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';

interface AuthState {
  user: User | null;    // L'objet utilisateur de Firebase (si connecté)
  loading: boolean;     // Indique si la vérification est en cours
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Si Firebase n'est pas configuré, on arrête tout de suite pour éviter les erreurs.
    if (!isFirebaseConfigured || !auth) {
      setState({ user: null, loading: false });
      return;
    }

    // Écoute les changements d'état (Connexion / Déconnexion).
    // Cette fonction est appelée automatiquement par Firebase.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setState({ user, loading: false });
    });

    // Nettoyage de l'écouteur quand le composant est détruit.
    return () => unsubscribe();
  }, []);

  return state;
}
