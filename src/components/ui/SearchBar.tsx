'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const PLACEHOLDERS = [
  'Je cherche un électricien disponible maintenant...',
  'Besoin d\'un coiffeur à domicile...',
  'Réparateur urgent pas cher près de moi...',
  'Un plombier à Agoè pour ce soir ?',
  'Mécanicien disponible à Bè...',
];

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Typewriter animation ───────────────────────────────────────────── */
  useEffect(() => {
    const current = PLACEHOLDERS[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedPlaceholder.length === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(current.substring(0, displayedPlaceholder.length - 1));
        }, 40);
      }
    } else {
      if (displayedPlaceholder.length === current.length) {
        timeout = setTimeout(() => setIsDeleting(true), 2800);
      } else {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(current.substring(0, displayedPlaceholder.length + 1));
        }, 80);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIndex]);

  /* ── Press "/" to focus ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && inputRef.current && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Gradient border wrapper — always visible, brighter on focus */}
      <div
        className="search-gradient-border transition-all duration-300"
        style={{ opacity: isFocused ? 1 : 0.7 }}
      >
        <div className="search-gradient-border-inner">
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-white rounded-[calc(1rem-2px)] p-2"
          >
            {/* Left icon */}
            <div className="pl-3 pr-2 flex items-center">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              ) : (
                <Sparkles
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isFocused ? 'text-indigo-500' : 'text-gray-400'
                  }`}
                />
              )}
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder={displayedPlaceholder}
              className="flex-1 min-w-0 bg-transparent text-base md:text-lg text-gray-900 placeholder:text-gray-400 border-none outline-none ring-0 px-2 py-3"
              autoComplete="off"
            />

            {/* Submit button */}
            <button
              type="submit"
              id="search-submit"
              className="ml-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}
              disabled={!query.trim() || loading}
            >
              Chercher
            </button>
          </form>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Appuyez sur{' '}
        <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
          /
        </kbd>{' '}
        pour rechercher rapidement
      </p>
    </div>
  );
}
