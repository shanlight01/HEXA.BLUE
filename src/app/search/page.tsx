/**
 * src/app/search/page.tsx
 * 
 * Page de recherche de prestataires.
 * Intègre l'API Gemini pour la compréhension du langage naturel, 
 * le filtrage par catégorie, et la géolocalisation dynamique.
 */
'use client';

// Imports des hooks React et Next.js
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Imports des composants UI nécessaires
import SearchBar from '@/components/ui/SearchBar';
import ProviderCard from '@/components/ui/ProviderCard';
import CategoryPill from '@/components/ui/CategoryPill';

// Imports des outils de données (Firestore, Algorithme de Matching, Géolocalisation)
import { useProviders } from '@/hooks/useProviders';
import { useMatching } from '@/hooks/useMatching';
import { CATEGORIES, type SearchIntent, type ServiceCategory, LOME_NEIGHBORHOODS } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || ''; // Requête initiale depuis l'URL
  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');

  const [query, setQuery] = useState(initialQuery);
  const [intent, setIntent] = useState<SearchIntent | null>(null); // Intention détectée par l'IA
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // Rayon de recherche (par défaut 5km)
  
  // Utilisation du hook GPS pour localiser l'utilisateur
  const { coordinates, requestLocation, error: geoError } = useGeolocation();
  
  // Récupération en direct des prestataires depuis Firestore
  const { providers, loading: providersLoading } = useProviders();

  // On initialise les coordonnées à partir du GPS ou de l'URL
  const activeCoordinates = coordinates || (initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : undefined);

  // Prépare l'intention de recherche avec la localisation actuelle
  const currentIntentWithLocation = intent ? {
    ...intent,
    userCoordinates: activeCoordinates,
    searchRadiusKm: searchRadius === 999 ? undefined : searchRadius, // 999 signifie "Toute la ville" (rayon illimité)
  } : null;

  // Calcule les résultats correspondants
  const results = useMatching(providers, currentIntentWithLocation);

  /**
   * Appelle l'API AI pour comprendre la requête naturelle de l'utilisateur.
   */
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);

    try {
      // Envoie la requête textuelle au serveur pour analyse par l'IA (Gemini)
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        // L'IA nous renvoie une "intention" structurée (catégorie, urgence, etc.)
        setIntent(data.intent);
        setSelectedCategory(data.intent.category || null);
      }
    } catch {
      // Solution de secours (Fallback) : extraction basique par mot-clé si l'API échoue
      const lower = searchQuery.toLowerCase();
      const matchedCat = CATEGORIES.find(
        (c) => lower.includes(c.label.toLowerCase()) || lower.includes(c.id)
      );
      setIntent({
        service: searchQuery,
        urgency: lower.includes('urgent'),
        category: matchedCat?.id,
      });
      setSelectedCategory(matchedCat?.id || null);
    } finally {
      setLoading(false);
    }
  };

  // Lance la recherche initiale au montage si le lien contenait une query
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    // Demande la localisation si on n'a ni state ni coords URL
    if (!initialLat || !initialLng) {
      requestLocation(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécute une seule fois

  const handleCategoryFilter = (id: ServiceCategory) => {
    const newCat = selectedCategory === id ? null : id;
    setSelectedCategory(newCat);
    setIntent((prev) =>
      prev ? { ...prev, category: newCat || undefined } : { service: '', urgency: false, category: newCat || undefined }
    );
  };

  // Bouton pour élargir la zone de recherche si peu de résultats
  const expandRadius = () => {
    if (searchRadius === 5) setSearchRadius(10);
    else if (searchRadius === 10) setSearchRadius(999);
  };

  return (
    <div className="page-container">
      <div className="search-page__header">
        <h1 className="section-heading">Recherche Intelligente</h1>
        <SearchBar onSearch={performSearch} loading={loading} />

        {intent && (
          <div className="search-page__intent">
            {intent.service && <span className="intent-tag">🔎 {intent.service}</span>}
            {intent.location && !activeCoordinates && <span className="intent-tag">📍 {intent.location}</span>}
            {activeCoordinates && <span className="intent-tag" title="GPS Actif">📍 À proximité ({searchRadius === 999 ? 'Toute la ville' : `${searchRadius}km`})</span>}
            {intent.urgency && <span className="intent-tag">⚡ Urgent</span>}
            {intent.category && (
              <span className="intent-tag">
                {CATEGORIES.find((c) => c.id === intent.category)?.icon}{' '}
                {CATEGORIES.find((c) => c.id === intent.category)?.label}
              </span>
            )}
          </div>
        )}
      </div>

      {geoError && (
        <div className="alert alert--error mb-4">
          Impossible de trouver votre position. Affichage des quartiers standards de Lomé.
        </div>
      )}

      {/* Category filters */}
      <div className="categories-container" style={{ marginBottom: 'var(--space-xl)' }}>
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            category={cat}
            isActive={selectedCategory === cat.id}
            onClick={handleCategoryFilter}
          />
        ))}
      </div>

      {/* Results Section */}
      <p className="search-page__results-info">
        {loading
          ? '🔄 Analyse de votre demande par l\'IA...'
          : `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''} ${activeCoordinates ? `dans un rayon de ${searchRadius === 999 ? 'Toute la ville' : `${searchRadius}km`}` : ''}`}
      </p>

      {loading || providersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-64 border border-gray-100 flex flex-col p-6 animate-pulse">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="mt-auto grid grid-cols-2 gap-3">
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="providers-grid mt-8">
            {results.map((result) => (
              <ProviderCard key={result.provider.uid} result={result} />
            ))}
          </div>

          {/* Bouton pour élargir la recherche si GPS actif et rayon limité */}
          {activeCoordinates && searchRadius !== 999 && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
                Besoin de plus de choix ?
              </p>
              <button onClick={expandRadius} className="btn-secondary" style={{ maxWidth: '300px' }}>
                Élargir à {searchRadius === 5 ? '10km' : 'Toute la ville'}
              </button>
            </div>
          )}
        </>
      ) : query ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300 mt-8">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun prestataire ne correspond</h3>
          <p className="text-gray-500 text-center max-w-sm mb-6">
            {activeCoordinates && searchRadius !== 999 
              ? 'Essayez d\'élargir votre zone de recherche ci-dessous' 
              : 'Essayez une recherche différente ou explorez les catégories'}
          </p>
          {activeCoordinates && searchRadius !== 999 && (
             <button onClick={expandRadius} className="bg-primary hover:bg-primary-dark text-white shadow-md px-6 py-2.5 rounded-xl font-medium transition-colors">
               Chercher dans {searchRadius === 5 ? '10km' : 'Toute la ville'}
             </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300 mt-8">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Commencez votre recherche</h3>
          <p className="text-gray-500 text-center max-w-sm mb-6">Décrivez le service dont vous avez besoin</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
