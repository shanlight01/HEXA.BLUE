'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Page d'Inscription Simplifiée
 * Permet de créer un compte avec Nom, Email et Mot de passe.
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification de base de la configuration Firebase
    if (!auth || !db) {
      setError("Le service d'authentification n'est pas disponible pour le moment.");
      setLoading(false);
      return;
    }

    try {
      // 1. Création du compte dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Enregistrement des données complémentaires dans Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        isProvider: false, // Par défaut, l'utilisateur n'est pas prestataire
        createdAt: new Date().toISOString(),
      });

      // 3. Redirection vers l'accueil après succès
      router.push('/');
    } catch (err: any) {
      // Gestion simplifiée des erreurs Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError("Cette adresse email est déjà utilisée.");
      } else if (err.code === 'auth/weak-password') {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else if (err.code === 'auth/invalid-email') {
        setError("L'adresse email n'est pas valide.");
      } else {
        setError("Une erreur est survenue lors de l'inscription : " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez ProxiServ pour trouver les meilleurs services à Lomé.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Champ Nom */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Nom complet</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ex: Jean Dupont"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Champ Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="votre@email.com"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400 font-medium">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
