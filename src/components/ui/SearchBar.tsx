'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const PLACEHOLDERS = [
  'Need an electrician in Agoè?',
  'Looking for a plumber near Deckon?',
  'Want a hairdresser at home?',
  'Search for mechanic in Bè...',
];

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Typewriter effect state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter logic
  useEffect(() => {
    const currentString = PLACEHOLDERS[placeholderIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedPlaceholder.length === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        timeout = setTimeout(() => {}, 500); // Pause before typing new word
      } else {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentString.substring(0, displayedPlaceholder.length - 1));
        }, 50); // Deleting speed
      }
    } else {
      if (displayedPlaceholder.length === currentString.length) {
        timeout = setTimeout(() => setIsDeleting(true), 2500); // Pause at end of word
      } else {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentString.substring(0, displayedPlaceholder.length + 1));
        }, 100); // Typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isDeleting, placeholderIndex]);

  // Keyboard shortcut "/"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative group">
      {/* Glow effect container */}
      <div className={`absolute -inset-1 rounded-2xl blur-lg transition-all duration-500 opacity-75 group-hover:opacity-100 ${
        isFocused ? 'bg-glow-gradient animate-gradient-glow opacity-100' : 'bg-gradient-to-r from-primary/30 to-accent/30'
      }`} />
      
      <form onSubmit={handleSubmit} className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 transition-all">
        <div className="pl-4 pr-2 text-gray-400">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-primary' : ''}`} />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={displayedPlaceholder}
          className="flex-1 min-w-0 bg-transparent text-lg text-gray-900 placeholder:text-gray-400 border-none outline-none ring-0 px-2 py-3"
          autoComplete="off"
        />

        <button
          type="submit"
          className="ml-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
          disabled={!query.trim() || loading}
        >
          <span>Search</span>
        </button>
      </form>

      {/* Shortcuts hint */}
      <div className="absolute top-full left-0 mt-3 flex w-full justify-center">
        <span className="text-sm text-gray-500/80">Press <kbd className="font-mono bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">/</kbd> to search</span>
      </div>
    </div>
  );
}
