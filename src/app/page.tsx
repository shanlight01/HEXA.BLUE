/**
 * src/app/page.tsx
 * 
 * Page d'accueil principale de QuickService AI.
 * Affiche l'entête, la barre de recherche, la demande de géolocalisation
 * et les prestataires mis en avant.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CategoryPill from '@/components/ui/CategoryPill';
import ProviderCard from '@/components/ui/ProviderCard';
import { CATEGORIES, type ServiceCategory } from '@/types';
import { mockProviders } from '@/data/mockProviders';
import { useMatching } from '@/hooks/useMatching';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  
  // Custom hook pour la géolocalisation
  const { coordinates, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // FIX: Demande de la position au montage de la page d'accueil si pas déjà demandée
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Génère les résultats "en vedette" optimisés par l'IA et la proximité
  const featuredResults = useMatching(
    mockProviders,
    selectedCategory
      ? { service: '', category: selectedCategory, urgency: false, userCoordinates: coordinates || undefined }
      : { service: '', urgency: false, userCoordinates: coordinates || undefined }
  );

  const handleSearch = (query: string) => {
    // On passe les coordonnées via l'URL (si disponibles) pour éviter un 2ème prompt
    const latLngParams = coordinates 
      ? `&lat=${coordinates.lat}&lng=${coordinates.lng}` 
      : '';
    router.push(`/search?q=${encodeURIComponent(query)}${latLngParams}`);
  };

  const handleCategoryClick = (id: ServiceCategory) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  // N'afficher que 6 prestataires s'il n'y a pas de catégorie active
  const displayResults = selectedCategory
    ? featuredResults
    : featuredResults.slice(0, 6);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__badge fade-in">
          🤖 Propulsé par l&apos;IA · 
          {geoLoading ? ' Localisation...' : coordinates ? ' Localisé' : ' Lomé, Togo'}
        </div>
        <h1 className="hero__title fade-in fade-in-delay-1">
          Trouvez le bon<br />
          <span className="hero__title-gradient">prestataire en secondes</span>
        </h1>
        <p className="hero__subtitle fade-in fade-in-delay-2">
          Décrivez simplement ce dont vous avez besoin. Notre IA comprend votre demande et vous connecte aux meilleurs professionnels de Lomé, au plus proche de vous.
        </p>
        <div className="fade-in fade-in-delay-3">
          <SearchBar onSearch={handleSearch} placeholder="Ex: Je cherche un plombier urgent avec WhatsApp..." />
        </div>
      </section>

      {/* Affichage des erreurs / avertissements de GPS */}
      {geoError && (
        <div className="alert alert--warning" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FEF3C7' }}>
          📍 <strong>Localisation désactivée :</strong> {geoError} Les prestataires seront triés par défaut.
        </div>
      )}

      {/* Categories */}
      <section>
        <h2 className="section-heading">Catégories populaires</h2>
        <div className="categories-container">
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              category={cat}
              isActive={selectedCategory === cat.id}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </section>

      {/* Featured Providers */}
      <section className="featured-section">
        <div className="featured-header">
          <h2 className="section-heading" style={{ marginBottom: 0 }}>
            {selectedCategory
              ? `Prestataires — ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`
              : 'Prestataires proches de vous'}
          </h2>
          <button
            onClick={() => router.push('/search')}
            style={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            Voir tout →
          </button>
        </div>
        <p className="section-subheading">
          {displayResults.length} prestataire{displayResults.length > 1 ? 's' : ''} disponible{displayResults.length > 1 ? 's' : ''}
        </p>

        {displayResults.length > 0 ? (
          <div className="providers-grid">
            {displayResults.map((result) => (
              <ProviderCard key={result.provider.uid} result={result} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p className="empty-state__text">Aucun prestataire trouvé</p>
            <p className="empty-state__hint">Essayez une autre catégorie</p>
          </div>
        )}
      </section>
    </div>
  );
}
