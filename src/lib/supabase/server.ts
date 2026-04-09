import { createClient } from '@supabase/supabase-js'

/**
 * Crée un client Supabase côté serveur (Route Handlers / Server Components).
 * Utilise les variables d'environnement du projet.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, supabaseAnonKey)
}
