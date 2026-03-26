/**
 * src/hooks/useGeolocation.ts
 * 
 * Hook React personnalisé pour obtenir et suivre la position GPS de l'utilisateur
 * via l'API Geolocation du navigateur.
 */
import { useState, useCallback } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
  });

  /**
   * Demande la position actuelle à l'utilisateur.
   * // FIX: Ajout d'une fonction réutilisable avec gestion d'état complète.
   */
  const requestLocation = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        loading: false,
        error: "La géolocalisation n'est pas supportée par votre navigateur.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Impossible de récupérer votre position.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "L'accès à la position a été refusé.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Les informations de position sont indisponibles.";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé.";
            break;
        }
        setState({
          coordinates: null,
          loading: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { ...state, requestLocation };
}
