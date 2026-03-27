/**
 * src/hooks/useProviders.ts
 * 
 * Fetches the live list of active service providers from Firestore.
 */
import { useState, useEffect } from 'react';
import { getAllProviders } from '@/lib/firebase/firestore';
import type { User } from '@/types';

export function useProviders() {
  const [providers, setProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProviders() {
      try {
        setLoading(true);
        const data = await getAllProviders();
        if (mounted) {
          setProviders(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching providers:', err);
        if (mounted) {
          setError(err.message || 'Failed to load providers.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProviders();

    return () => {
      mounted = false;
    };
  }, []);

  return { providers, loading, error };
}
