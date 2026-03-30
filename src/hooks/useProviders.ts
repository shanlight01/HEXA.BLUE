/**
 * src/hooks/useProviders.ts
 *
 * Récupère la liste des prestataires actifs depuis Firestore.
 * Gère les erreurs de connectivité (ex: client hors-ligne) avec une logique de réessai.
 */
import { useState, useEffect } from 'react';
import { getAllProviders } from '@/lib/firebase/firestore';
import type { User } from '@/types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/** Vérifie si l'erreur Firebase est liée à un problème de connexion réseau. */
function isOfflineError(err: any): boolean {
  return (
    err?.code === 'unavailable' ||
    (typeof err?.message === 'string' &&
      err.message.toLowerCase().includes('offline'))
  );
}

export function useProviders() {
  const [providers, setProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProviders(attempt = 1) {
      try {
        if (attempt === 1) setLoading(true);
        const data = await getAllProviders();
        if (mounted) {
          setProviders(data);
          setError(null);
        }
      } catch (err: any) {
        console.warn(`Tentative ${attempt}/${MAX_RETRIES} — Erreur Firestore :`, err?.message);

        if (mounted && isOfflineError(err) && attempt < MAX_RETRIES) {
          // Réessai après un délai croissant
          setTimeout(() => {
            if (mounted) fetchProviders(attempt + 1);
          }, RETRY_DELAY_MS * attempt);
          return; // Ne pas mettre loading à false pendant les réessais
        }

        if (mounted) {
          // Après tous les essais, afficher un message clair
          setError(
            isOfflineError(err)
              ? 'Connexion au serveur impossible. Vérifiez votre connexion internet.'
              : err.message || 'Impossible de charger les prestataires.'
          );
        }
      } finally {
        // On ne termine le chargement que si ce n'est pas un réessai en cours
        if (mounted) setLoading(false);
      }
    }

    fetchProviders();

    return () => {
      mounted = false;
    };
  }, []);

  return { providers, loading, error };
}
