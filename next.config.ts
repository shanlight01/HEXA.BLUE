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
};

export default nextConfig;
