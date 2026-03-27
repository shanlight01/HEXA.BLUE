'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold text-foreground tracking-tight flex items-center">
            Proxi<span className="text-primary">Serv</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              Rechercher
            </Link>
            <Link href="/register-service" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              Devenir Prestataire
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : user ? (
              <Link href="/profile" className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-sm">
                Mon Profil
              </Link>
            ) : (
              <Link href="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
