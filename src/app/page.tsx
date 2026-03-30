'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import SearchBar from '@/components/ui/SearchBar';
import CategoryPill from '@/components/ui/CategoryPill';
import ProviderCard, { ProviderCardSkeleton } from '@/components/ui/ProviderCard';

import { CATEGORIES, type ServiceCategory } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { useMatching } from '@/hooks/useMatching';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, SearchX, AlertTriangle, Wifi } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const { coordinates, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { providers, loading: providersLoading, error: providersError } = useProviders();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

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

  const displayResults = selectedCategory ? featuredResults : featuredResults.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorative glow — purely visual, non-overlapping */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[300px] opacity-30 blur-3xl -z-0"
          style={{
            background: 'radial-gradient(ellipse, #6366f1 0%, #8b5cf6 40%, transparent 70%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge IA */}
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs md:text-sm mb-6 border border-indigo-100">
            <span role="img" aria-label="IA">✨</span>
            Propulsé par Gemini AI
            <span className="text-indigo-300 mx-1">•</span>
            <MapPin className="w-3.5 h-3.5" />
            {geoLoading ? 'Localisation…' : coordinates ? 'Localisé' : 'Lomé, Togo'}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-5 text-balance">
            Trouvez le bon<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-primary">
              prestataire en secondes
            </span>
          </h1>

          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto text-balance">
            Décrivez simplement ce dont vous avez besoin. Notre IA comprend votre demande
            et vous connecte aux meilleurs professionnels de Lomé.
          </p>

          {/* Search bar — inline, no fixed/absolute */}
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* ── 2. Categories ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">Catégories populaires</h2>
          <div className="flex overflow-x-auto pb-3 gap-2.5 snap-x flex-nowrap scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="snap-start shrink-0">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">

        {/* Géolocation warning */}
        {geoError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p><strong>Localisation désactivée :</strong> {geoError}. Les prestataires seront triés par défaut.</p>
          </div>
        )}

        {/* Firestore offline warning */}
        {providersError && !providersLoading && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
            <Wifi className="w-5 h-5 text-red-400 shrink-0" />
            <p>{providersError}</p>
          </div>
        )}

        {/* Header row */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              {selectedCategory
                ? `Prestataires — ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`
                : 'Prestataires proches de vous'}
            </h2>
            {!providersLoading && (
              <p className="text-gray-400 text-sm font-medium">
                {displayResults.length} prestataire{displayResults.length > 1 ? 's' : ''} disponible{displayResults.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/search')}
            className="hidden md:block text-indigo-600 font-bold hover:underline text-sm"
          >
            Voir tout →
          </button>
        </div>

        {/* Skeleton loaders */}
        {providersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>

        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              Il n&apos;y a actuellement aucun professionnel inscrit dans cette catégorie proche de vous.
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

        {/* Mobile "Voir tout" */}
        <div className="mt-10 text-center md:hidden">
          <button
            onClick={() => router.push('/search')}
            className="text-indigo-600 font-bold hover:underline text-sm"
          >
            Voir tous les prestataires →
          </button>
        </div>
      </main>
    </div>
  );
}
