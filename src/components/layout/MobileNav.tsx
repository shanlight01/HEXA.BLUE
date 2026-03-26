/**
 * src/components/layout/MobileNav.tsx
 * 
 * Barre de navigation collée en bas de l'écran (mobile uniquement).
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/search', label: 'Chercher', icon: '🔍' },
  { href: '/register-service', label: 'Proposer', icon: '➕' },
  { href: '/dashboard', label: 'Profil', icon: '👤' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
          >
            <span className="mobile-nav__icon">{item.icon}</span>
            <span className="mobile-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
