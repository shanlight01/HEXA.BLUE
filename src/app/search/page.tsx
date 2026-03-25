'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/ui/SearchBar';
import ProviderCard from '@/components/ui/ProviderCard';
import CategoryPill from '@/components/ui/CategoryPill';
import { mockProviders } from '@/data/mockProviders';
import { useMatching } from '@/hooks/useMatching';
import { CATEGORIES, type SearchIntent, type ServiceCategory } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const results = useMatching(mockProviders, intent);

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
      // Fallback: basic category matching
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

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryFilter = (id: ServiceCategory) => {
    const newCat = selectedCategory === id ? null : id;
    setSelectedCategory(newCat);
    setIntent((prev) =>
      prev ? { ...prev, category: newCat || undefined } : { service: '', urgency: false, category: newCat || undefined }
    );
  };

  return (
    <div className="page-container">
      <div className="search-page__header">
        <h1 className="section-heading">Rechercher un prestataire</h1>
        <SearchBar onSearch={performSearch} loading={loading} />

        {intent && (
          <div className="search-page__intent">
            {intent.service && <span className="intent-tag">🔎 {intent.service}</span>}
            {intent.location && <span className="intent-tag">📍 {intent.location}</span>}
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

      {/* Results */}
      <p className="search-page__results-info">
        {loading
          ? '🔄 Analyse de votre demande par l\'IA...'
          : `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
      </p>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : results.length > 0 ? (
        <div className="providers-grid">
          {results.map((result) => (
            <ProviderCard key={result.provider.uid} result={result} />
          ))}
        </div>
      ) : query ? (
        <div className="empty-state">
          <div className="empty-state__icon">😕</div>
          <p className="empty-state__text">Aucun prestataire ne correspond</p>
          <p className="empty-state__hint">Essayez une recherche différente ou explorez les catégories</p>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
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
