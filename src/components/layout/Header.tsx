'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import { Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm leading-none py-1">
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

          <div className="flex items-center space-x-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Profile Circle */}
                <Link 
                  href="/profile" 
                  className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Me'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />
                  )}
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-gray-600 hover:text-primary px-4 py-2 transition-all"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
