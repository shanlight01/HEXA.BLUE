/**
 * src/components/layout/Header.tsx
 * 
 * En-tête principal de l'application (Desktop).
 * Affiche le logo, la navigation et le bouton de connexion/profil.
 */
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link href="/" className="header__logo">
          QuickService <span className="header__logo-ai">AI</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="header__nav">
          <Link href="/search" className="header__nav-link">
            Rechercher
          </Link>
          <Link href="/register-service" className="header__nav-link">
            Devenir Prestataire
          </Link>
          <div className="header__nav-actions">
            {loading ? (
              <div className="loading-spinner" style={{ width: 24, height: 24 }} />
            ) : user ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Mon Profil
              </Link>
            ) : (
              <Link href="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Connexion
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
