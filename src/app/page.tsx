'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import SearchBar from '@/components/ui/SearchBar';
import CategoryPill from '@/components/ui/CategoryPill';
import ProviderCard, { ProviderCardSkeleton } from '@/components/ui/ProviderCard';
import CountrySelector, { COUNTRIES, CountryData } from '@/components/ui/CountrySelector';

import { CATEGORIES, type ServiceCategory } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { useMatching } from '@/hooks/useMatching';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, SearchX, AlertTriangle, Wifi, Map as MapIcon, List as ListIcon, Loader2 } from 'lucide-react';

const MapDisplay = dynamic(() => import('@/components/ui/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center rounded-3xl animate-pulse">
      <p className="text-gray-400 font-medium">Chargement de la carte...</p>
    </div>
  )
});

export default function HomePage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { coordinates, locationName, permissionState, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { providers, loading: providersLoading, error: providersError } = useProviders();

  const featuredResults = useMatching(
    providers,
    selectedCategory
      ? { service: '', category: selectedCategory, urgency: false, userCoordinates: coordinates || undefined }
      : { service: '', urgency: false, userCoordinates: coordinates || undefined }
  );

  const handleSearch = (query: string) => {
    const geo = coordinates ? `&lat=${coordinates.lat}&lng=${coordinates.lng}` : '';
    router.push(`/search?q=${encodeURIComponent(query)}${geo}`);
  };

  const handleCategoryClick = (id: ServiceCategory) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  // Filter providers to the selected country bounds
  const boundedResults = featuredResults.filter(result => {
    const coords = result.provider.serviceProfile?.coordinates;
    if (!coords) return false;
    
    // Bounds: [[southWestLat, southWestLng], [northEastLat, northEastLng]]
    const [[minLat, minLng], [maxLat, maxLng]] = selectedCountry.bounds;
    return (
      coords.lat >= minLat && coords.lat <= maxLat &&
      coords.lng >= minLng && coords.lng <= maxLng
    );
  });

  const displayResults = selectedCategory ? boundedResults : boundedResults.slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Smart Geolocation Banner */}
      {permissionState === 'prompt' && !coordinates && (
        <div className="bg-indigo-600 px-4 py-3 text-white flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 relative z-30">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-indigo-200 shrink-0" />
            <span className="text-sm font-medium text-center sm:text-left">
              Pour une meilleure expérience, trouvez les prestataires autour de vous.
            </span>
          </div>
          <button
            onClick={() => requestLocation()}
            disabled={geoLoading}
            className="bg-white text-indigo-600 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors shrink-0 disabled:opacity-75"
          >
            {geoLoading ? 'Activation...' : 'Activer ma localisation'}
          </button>
        </div>
      )}

      {/* Denied Geolocation Fallback */}
      {permissionState === 'denied' && !coordinates && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-amber-900 relative z-30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-center sm:text-left">
              Localisation bloquée. Chercher des prestataires dans une ville précise :
            </span>
          </div>
          <div className="flex bg-white rounded-lg overflow-hidden border border-amber-200 shadow-sm shrink-0">
             <input type="text" placeholder="Entrez une ville..." className="px-3 py-2 outline-none text-sm w-48 sm:w-64 focus:ring-2 focus:ring-amber-400 bg-white items-center" />
             <button className="bg-amber-100 hover:bg-amber-200 px-3 py-2 text-amber-800 font-bold transition-colors">OK</button>
          </div>
        </div>
      )}

      {/* Country Selector */}
      <CountrySelector
        selectedCountryId={selectedCountry.id}
        onSelectCountry={setSelectedCountry}
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8 text-center relative z-20 flex flex-col items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-[700px] h-[300px] opacity-30 blur-3xl -z-10"
          style={{
            background: 'radial-gradient(ellipse, #6366f1 0%, #8b5cf6 40%, transparent 70%)',
          }}
        />

        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-5 text-center text-balance">
            Trouvez le bon<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-primary">
              prestataire en secondes
            </span>
          </h1>

          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto text-center text-balance">
            Décrivez simplement ce dont vous avez besoin. Notre IA comprend votre demande
            et vous connecte aux meilleurs professionnels de la région.
          </p>

          <div className="w-full max-w-[700px] mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 py-2 px-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm shadow-sm border border-indigo-100">
            {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {geoLoading ? 'Localisation en cours…' : locationName ? locationName : coordinates ? 'Localisé avec succès' : selectedCountry.name}
          </div>
        </div>
      </section>

      {/* ── 2. Categories ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-8 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2 text-center">Catégories populaires</h2>
          <div className="categories-container flex flex-wrap justify-center gap-[10px] py-5 w-full max-w-full mx-auto">
            {CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <CategoryPill
                  category={cat}
                  isActive={selectedCategory === cat.id}
                  onClick={handleCategoryClick}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Results ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full relative z-0">
        {providersError && !providersLoading && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <Wifi className="w-5 h-5 text-red-400 shrink-0" />
            <p>{providersError}</p>
          </div>
        )}

        {/* Header row with Map/List Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              {selectedCategory
                ? `Prestataires — ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`
                : 'Prestataires près de vous'}
            </h2>
            {!providersLoading && (
              <p className="text-gray-400 text-sm font-medium">
                {displayResults.length} prestataire{displayResults.length > 1 ? 's' : ''} disponible{displayResults.length > 1 ? 's' : ''} au {selectedCountry.name}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ListIcon className="w-4 h-4" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                viewMode === 'map' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Carte
            </button>
          </div>
        </div>

        {/* Content View */}
        {providersLoading ? (
          viewMode === 'list' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-3xl border border-gray-200"></div>
          )
        ) : viewMode === 'map' ? (
           <MapDisplay results={displayResults} activeCountry={selectedCountry} userLocation={coordinates} />
        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayResults.map((result) => (
              <ProviderCard key={result.provider.uid} result={result} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <SearchX className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun prestataire trouvé</h3>
            <p className="text-gray-400 text-center max-w-sm mb-8 text-sm">
              Il n&apos;y a actuellement aucun professionnel inscrit dans cette catégorie pour la zone {selectedCountry.name}.
            </p>
            <button
              onClick={() => router.push('/register-service')}
              className="text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}
            >
              Soyez le premier à vous inscrire !
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
