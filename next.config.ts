import type { NextConfig } from "next";

/**
 * Configuration principale de Next.js
 */
const nextConfig: NextConfig = {
  eslint: {
    // Désactive la vérification ESLint pendant le build pour éviter les blocages.
    // Utile pour la rapidité du déploiement.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'aipekkhmzurxpvbpliwq.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  },
};

export default nextConfig;
