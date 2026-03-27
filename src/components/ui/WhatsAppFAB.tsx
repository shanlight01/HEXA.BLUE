'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFAB() {
  const pathname = usePathname();

  // Optionally hide on some pages (e.g. login/register)
  if (pathname.includes('/login') || pathname.includes('/register')) return null;

  return (
    <a
      href="https://wa.me/22890000000" // Generic support number or dynamic depending on context
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
      aria-label="Contact Support on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
        Need Help?
      </span>
    </a>
  );
}
