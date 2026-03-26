# 📁 `src/app`

Ce dossier utilise le **Next.js App Router**. Il définit toutes les pages et routes de l'application.

## Structure
- `/` (`page.tsx`) : La page d'accueil avec le grand champ de recherche.
- `/search` : La page des résultats de recherche.
- `/dashboard` : Le tableau de bord de l'utilisateur pour gérer son profil.
- `/register-service` : Le formulaire pour s'inscrire comme prestataire.
- `/(auth)` : Contient les pages de connexion (`login`) et d'inscription (`register`).
- `/api/ai` : La route backend (`route.ts`) qui fait le lien sécurisé avec l'API Google Gemini.
- `globals.css` : Le système de design global (CSS natif optimisé pour l'Afrique de l'Ouest).
- `layout.tsx` : Le gabarit principal appliqué à toutes les pages (Menu, Header).
