# GUIDE DU PROJET — PROXISERV 🚀

Bienvenue dans le code source de ProxiServ ! Voici une explication simple de la structure du projet pour vous aider à mieux comprendre.

## 📁 Structure des dossiers

### 1. `src/app` (Le cœur de l'application)
C'est ici que sont définies toutes les **pages** de votre site :
- `page.tsx` : La page d'accueil.
- `login/` & `register/` : Pages de connexion et d'inscription.
- `search/` : La page de recherche avec l'algorithme d'IA.
- `register-service/` : Le formulaire pour devenir prestataire.
- `provider/[id]/` : Les profils publics des prestataires.
- `profile/` : Votre tableau de bord personnel.
- `api/ai/` : Le point de contact secret avec l'IA de Google (Gemini).

### 2. `src/lib/firebase` (La base de données)
Contient tout ce qui concerne la connexion avec **Firebase** (le serveur) :
- `config.ts` : Les clés d'accès (apiKey, etc.).
- `firestore.ts` : Toutes les fonctions pour Lire/Écrire des données (utilisateurs, prestataires).
- `auth.ts` : Gère la connexion et déconnexion.
- `storage.ts` : Gère l'envoi d'images (avatars, diplômes).

### 3. `src/components` (Les pièces du puzzle)
Contient des petits bouts d'interface réutilisables sur plusieurs pages :
- `SearchBar.tsx` : La barre de recherche.
- `ProviderCard.tsx` : La carte qui affiche un prestataire.
- `CategoryPill.tsx` : Les petites bulles de catégories (Plomberie, etc.).

### 4. `src/hooks` (La logique réutilisable)
Des fonctions spéciales pour gérer des données intelligentes :
- `useAuth.ts` : Savoir si l'utilisateur est connecté.
- `useMatching.ts` : L'algorithme qui choisit quel prestataire afficher en premier.
- `useGeolocation.ts` : Demander la position GPS à l'utilisateur.

---

## 🛠️ Fichiers de configuration (À la racine)

- **`.env.local`** : Contient vos codes secrets Firebase. **NE JAMAIS PARTAGER CE FICHIER.**
- **`.gitignore`** : Liste des fichiers que Git doit ignorer (comme les dossiers lourds ou les fichiers secrets).
- **`package.json`** : Liste toutes les bibliothèques installées pour faire tourner le projet.
- **`tailwind.config.ts`** : Définit les couleurs et le style visuel de l'application.
- **`tsconfig.json`** : Configuration pour TypeScript (qui aide à éviter les erreurs de code).

---

## 💡 Astuces rapides
- Pour lancer le site en mode développement : `npm run dev`
- Pour construire le site final (Production) : `npm run build`
- Pour réparer les erreurs de style : `npm run lint`

Si vous avez d'autres questions, n'hésitez pas ! 😊
