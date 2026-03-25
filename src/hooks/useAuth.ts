'use client';

import { useState, useEffect } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { onAuthChange } from '@/lib/firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // No Firebase configured — skip auth, run in demo mode
      setState({ user: null, loading: false });
      return;
    }

    const unsubscribe = onAuthChange((user) => {
      setState({ user, loading: false });
    });
    return unsubscribe;
  }, []);

  return state;
}
