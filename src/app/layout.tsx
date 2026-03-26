/**
 * src/app/layout.tsx
 * 
 * Layout racine de l'application Next.js (S'applique à toutes les pages).
 * Contient les balises <html>, <body>, le Header de base et le MobileNav.
 */
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'QuickService AI — Trouvez les meilleurs prestataires à Lomé',
  description:
    'Recherchez et trouvez instantanément des prestataires de services locaux à Lomé grâce à l\'intelligence artificielle. Coiffure, plomberie, électricité et plus encore.',
  keywords: 'services, Lomé, Togo, prestataire, IA, coiffure, plomberie, électricité',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
