'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CategoryPill from '@/components/ui/CategoryPill';
import ProviderCard from '@/components/ui/ProviderCard';
import { CATEGORIES, type ServiceCategory } from '@/types';
import { useProviders } from '@/hooks/useProviders';
import { useMatching } from '@/hooks/useMatching';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, SearchX, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  
  const { coordinates, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const { providers, loading: providersLoading } = useProviders();

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
    const latLngParams = coordinates 
      ? `&lat=${coordinates.lat}&lng=${coordinates.lng}` 
      : '';
    router.push(`/search?q=${encodeURIComponent(query)}${latLngParams}`);
  };

  const handleCategoryClick = (id: ServiceCategory) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  const displayResults = selectedCategory
    ? featuredResults
    : featuredResults.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center bg-white border-b border-gray-100 overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs md:text-sm mb-6 border border-blue-100 animate-fade-in">
          <span role="img" aria-label="Robot" className="text-base">🤖</span> 
          Propulsé par l&apos;IA 
          <span className="text-blue-300 mx-1">•</span> 
          <MapPin className="w-3.5 h-3.5" />
          {geoLoading ? 'Localisation...' : coordinates ? 'Localisé' : 'Lomé, Togo'}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-4 animate-fade-in-up">
          Trouvez le bon<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">prestataire en secondes</span>
        </h1>
        
        <p className="mt-4 text-sm md:text-lg text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100">
          Décrivez simplement ce dont vous avez besoin. Notre IA comprend votre demande et vous connecte aux meilleurs professionnels de Lomé, au plus proche de vous.
        </p>
        
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-200">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <div className="max-w-7xl mx-auto">
        {geoError && (
          <div className="mx-4 sm:mx-8 mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p><strong>Localisation désactivée :</strong> {geoError}. Les prestataires seront triés par défaut.</p>
          </div>
        )}

        {/* Categories */}
        <section className="pt-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 px-4 sm:px-8">Catégories populaires</h2>
          <div className="flex overflow-x-auto pb-4 gap-3 px-4 sm:px-8 snap-x [&::-webkit-scrollbar]:hidden">
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
        </section>

        {/* Featured Providers */}
        <section className="px-4 sm:px-8 py-8 md:py-12">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {selectedCategory
                ? `Prestataires — ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`
                : 'Prestataires proches de vous'}
            </h2>
            <button
              onClick={() => router.push('/search')}
              className="hidden md:block text-primary font-bold hover:underline"
            >
              Voir tout →
            </button>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-8">
            {displayResults.length} prestataire{displayResults.length > 1 ? 's' : ''} disponible{displayResults.length > 1 ? 's' : ''}
          </p>

          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-64 border border-gray-100 flex flex-col p-6 shadow-sm animate-pulse">
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
          ) : displayResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayResults.map((result) => (
                <ProviderCard key={result.provider.uid} result={result} />
              ))}
            </div>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <SearchX className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun prestataire trouvé</h3>
              <p className="text-gray-500 text-center max-w-sm mb-6">
                Il n&apos;y a actuellement aucun professionnel inscrit dans cette catégorie proche de vous.
              </p>
              <button onClick={() => router.push('/register-service')} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                Soyez le premier à vous inscrire !
              </button>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => router.push('/search')}
              className="text-primary font-bold hover:underline"
            >
              Voir tous les prestataires →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
