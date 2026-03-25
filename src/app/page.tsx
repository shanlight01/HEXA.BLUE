'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import CategoryPill from '@/components/ui/CategoryPill';
import ProviderCard from '@/components/ui/ProviderCard';
import { CATEGORIES, type ServiceCategory } from '@/types';
import { mockProviders } from '@/data/mockProviders';
import { useMatching } from '@/hooks/useMatching';

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // Quick match for featured section: show top-rated available providers
  const featuredResults = useMatching(
    mockProviders,
    selectedCategory
      ? { service: '', category: selectedCategory, urgency: false }
      : { service: '', urgency: false }
  );

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (id: ServiceCategory) => {
    setSelectedCategory(selectedCategory === id ? null : id);
  };

  const displayResults = selectedCategory
    ? featuredResults
    : featuredResults.slice(0, 6);

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__badge fade-in">
          🤖 Propulsé par l&apos;IA · Lomé, Togo
        </div>
        <h1 className="hero__title fade-in fade-in-delay-1">
          Trouvez le bon<br />
          <span className="hero__title-gradient">prestataire en secondes</span>
        </h1>
        <p className="hero__subtitle fade-in fade-in-delay-2">
          Décrivez simplement ce dont vous avez besoin. Notre IA comprend votre demande et vous connecte aux meilleurs professionnels de Lomé.
        </p>
        <div className="fade-in fade-in-delay-3">
          <SearchBar onSearch={handleSearch} placeholder="Ex: Je cherche un plombier urgent à Tokoin..." />
        </div>
      </section>

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
              : 'Prestataires en vedette'}
          </h2>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push('/search');
            }}
          >
            Voir tout →
          </a>
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
