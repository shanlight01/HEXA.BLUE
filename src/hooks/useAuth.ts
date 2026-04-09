/**
 * src/hooks/useAuth.ts
 * 
 * Hook React personnalisé pour surveiller l'état de connexion de l'utilisateur.
 * Intégration Supabase Auth active.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Remplacer type User par l'équivalent Supabase plus tard, ex: import { User } from '@supabase/supabase-js'
export interface SupabaseUserStub {
  uid: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthState {
  user: SupabaseUserStub | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null, 
    loading: true,
  });

  useEffect(() => {
    // Transformer l'utilisateur Supabase vers notre interface unifiée
    const formatUser = (user: User | null): SupabaseUserStub | null => {
      if (!user) return null;
      return {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || user.user_metadata?.name || null,
        photoURL: user.user_metadata?.avatar_url || null,
      };
    };

    // 1. Récupérer la session courante au premier chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: formatUser(session?.user || null), loading: false });
    });

    // 2. Écouter les changements d'état d'authentification (login, logout, token refresh...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: formatUser(session?.user || null), loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
