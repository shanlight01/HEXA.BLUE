/**
 * src/app/search/page.tsx
 * 
 * Page de recherche de prestataires.
 * Intègre l'API Gemini pour la compréhension du langage naturel, 
 * le filtrage par catégorie, et la géolocalisation dynamique.
 */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import ProviderCard from '@/components/ui/ProviderCard';
import CategoryPill from '@/components/ui/CategoryPill';
import { mockProviders } from '@/data/mockProviders';
import { useMatching } from '@/hooks/useMatching';
import { CATEGORIES, type SearchIntent, type ServiceCategory, LOME_NEIGHBORHOODS } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');

  const [query, setQuery] = useState(initialQuery);
  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default 5km
  
  // Utilisation du hook GPS
  const { coordinates, requestLocation, error: geoError } = useGeolocation();

  // On initialise les coords de l'intent avec l'URL ou le state
  const activeCoordinates = coordinates || (initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : undefined);

  // FIX: useMatching memoization handles recalculation smoothly when radius/coordinates change
  const currentIntentWithLocation = intent ? {
    ...intent,
    userCoordinates: activeCoordinates,
    searchRadiusKm: searchRadius === 999 ? undefined : searchRadius, // 999 is "unlimited city"
  } : null;

  const results = useMatching(mockProviders, currentIntentWithLocation);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setIntent(data.intent);
        setSelectedCategory(data.intent.category || null);
      }
    } catch {
      // Fallback: extraction basique par mot-clé si l'API échoue
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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="providers-grid">
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
        <div className="empty-state">
          <div className="empty-state__icon">😕</div>
          <p className="empty-state__text">Aucun prestataire ne correspond</p>
          <p className="empty-state__hint">
            {activeCoordinates && searchRadius !== 999 
              ? 'Essayez d\'élargir votre zone de recherche ci-dessous' 
              : 'Essayez une recherche différente ou explorez les catégories'}
          </p>
          {activeCoordinates && searchRadius !== 999 && (
             <button onClick={expandRadius} className="btn-primary" style={{ maxWidth: '300px', margin: 'var(--space-lg) auto 0' }}>
               Chercher dans {searchRadius === 5 ? '10km' : 'Toute la ville'}
             </button>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🌍</div>
          <p className="empty-state__text">Commencez votre recherche</p>
          <p className="empty-state__hint">Décrivez le service dont vous avez besoin</p>
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
