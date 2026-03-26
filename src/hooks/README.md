# 📁 `src/hooks`

Ce dossier contient des "Custom Hooks" React. Ce sont des fonctions spéciales qui encapsulent de la logique réutilisable.

## Contenu
- `useAuth.ts` : Écoute en temps réel si un utilisateur est connecté ou non via Firebase. Gère l'état de chargement initial.
- `useMatching.ts` : C'est **le cerveau de l'application**. Il prend les filtres de recherche et compare chaque prestataire en attribuant un "Score de Match" basé sur la note, la proximité (via distance Haversine), la disponibilité et le prix.
- `useGeolocation.ts` : Communique avec le navigateur ou le téléphone pour obtenir la position GPS réelle de l'utilisateur (avec gestion des permissions et erreurs).
