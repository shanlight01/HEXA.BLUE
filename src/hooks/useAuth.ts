/**
 * src/hooks/useAuth.ts
 * 
 * Hook React personnalisé pour écouter l'état de connexion de l'utilisateur.
 * Ce hook gère également le "Mode Demo" si Firebase n'est pas configuré
 * pour permettre à l'application de tourner localement sans crash.
 */
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    // Mode démo : si `auth` est null, Firebase n'est pas initialisé (ex: variables d'env manquantes)
    // On simule qu'aucun utilisateur n'est connecté au lieu de faire planter l'application.
    if (!auth) {
      console.warn("Mode Démo activé : Firebase n'est pas configuré.");
      setState({ user: null, loading: false });
      return;
    }

    // Écoute les changements d'état (connexion / déconnexion)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setState({ user, loading: false });
    });

    return () => unsubscribe();
  }, []);

  return state;
}
