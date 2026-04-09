/**
 * src/hooks/useProviders.ts
 *
 * Récupère la liste des prestataires actifs depuis Supabase.
 * Données réparties entre les tables `providers` et `profiles`.
 */
import { useState, useEffect } from 'react';
import type { User, ServiceProfile } from '@/types';
import { supabase } from '@/lib/supabase/client';

export function useProviders() {
  const [providers, setProviders] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Count total providers
        const { count, error: countError } = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error("Erreur count providers:", countError.message);
          throw countError;
        }
        if (isMounted) setTotalCount(count || 0);

        // 2. Fetch active providers (sans name/email/avatar_url — pas dans cette table)
        const { data: providerRows, error: fetchError } = await supabase
          .from('providers')
          .select('id, category, skills, location, phone, "priceRange", bio, active, credentials')
          .eq('active', true);

        if (fetchError) {
          console.error("Erreur fetch providers:", fetchError.message);
          throw fetchError;
        }

        if (!providerRows || providerRows.length === 0) {
          if (isMounted) setProviders([]);
          return;
        }

        // 3. Fetch corresponding profiles (name, email, avatar_url)
        const providerIds = providerRows.map((p: any) => p.id);
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', providerIds);

        if (profileError) {
          console.error("Erreur fetch profiles:", profileError.message);
          // On continue sans les profils plutôt que de crash
        }

        // 4. Créer un lookup map pour les profils
        const profileMap = new Map<string, any>();
        if (profileRows) {
          profileRows.forEach((p: any) => profileMap.set(p.id, p));
        }

        // 5. Fusionner providers + profiles
        if (isMounted) {
          const mappedUsers: User[] = providerRows.map((item: any) => {
            const profile = profileMap.get(item.id);
            return {
              uid: item.id,
              name: profile?.name || 'Artisan Anonyme',
              email: profile?.email || '',
              avatarUrl: profile?.avatar_url,
              isProvider: true,
              providerCredentials: item.credentials,
              serviceProfile: {
                category: item.category as any,
                skills: item.skills || [],
                location: item.location,
                phone: item.phone,
                priceRange: item.priceRange,
                bio: item.bio,
                rating: 5.0,
                isAvailable: item.active,
                completedJobs: 0,
              } as ServiceProfile,
            };
          });
          setProviders(mappedUsers);
        }
      } catch (err: any) {
        console.error("Erreur hook useProviders:", err?.message || JSON.stringify(err));
        if (isMounted) setError("Impossible de charger les prestataires.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  return { providers, totalCount, loading, error };
}

