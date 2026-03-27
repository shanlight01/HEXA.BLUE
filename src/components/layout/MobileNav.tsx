'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Chercher', icon: Search },
  { href: '/register-service', label: 'Proposer', icon: PlusCircle },
  { href: '/profile', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
