'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="header">
      <div className="header__container">
        <Link href="/" className="header__logo">
          <span className="header__logo-icon">⚡</span>
          <span className="header__logo-text">
            Quick<span className="header__logo-accent">Service</span>
          </span>
        </Link>

        <nav className="header__nav">
          <Link href="/search" className="header__link">
            Rechercher
          </Link>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" className="header__link">
                    Tableau de bord
                  </Link>
                  <Link href="/register-service" className="header__link header__link--cta">
                    + Devenir Prestataire
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="header__link">
                    Connexion
                  </Link>
                  <Link href="/register" className="header__link header__link--cta">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
