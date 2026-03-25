'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ onSearch, loading, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    'Je cherche un plombier à Tokoin',
    'Coiffeuse urgente à Agoè',
    'Électricien disponible à Deckon',
    'Couturière pour robe sur mesure',
    'Mécanicien auto à Bè',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    onSearch(s);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="search-bar-wrapper">
      <form onSubmit={handleSubmit} className="search-bar-form">
        <div className={`search-bar ${isFocused ? 'search-bar--focused' : ''}`}>
          <span className="search-bar__icon">
            {loading ? (
              <span className="search-bar__spinner" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            )}
          </span>
          <input
            ref={inputRef}
            id="main-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder || 'Décrivez le service que vous cherchez...'}
            className="search-bar__input"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="search-bar__clear"
              aria-label="Effacer"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="search-bar__submit"
            disabled={!query.trim() || loading}
          >
            {loading ? 'Recherche...' : 'Chercher'}
          </button>
        </div>
      </form>

      {isFocused && !query && (
        <div className="search-suggestions">
          <p className="search-suggestions__title">💡 Essayez par exemple :</p>
          {suggestions.map((s) => (
            <button
              key={s}
              className="search-suggestions__item"
              onMouseDown={() => handleSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
