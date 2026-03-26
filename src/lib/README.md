# 📁 `src/lib`

Ce dossier contient la configuration des librairies tierces et les services externes (Firebase, IA).
Ce code ne contient aucun composant React.

## Structure
- `/firebase` :
  - `config.ts` : Initialisation sécurisée de la connexion Firebase.
  - `auth.ts` : Fonctions utilitaires d'authentification (Connexion, Inscription, Déconnexion).
  - `firestore.ts` : Fonctions pour lire et écrire dans la base de données.
- `/ai` :
  - `gemini-service.ts` : Intégration de l'Intelligence Artificielle Google Gemini. Contient le prompt structuré pour extraire des actions à partir du texte tapé par l'utilisateur.
