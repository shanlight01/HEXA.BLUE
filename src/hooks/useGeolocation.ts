/**
 * src/hooks/useGeolocation.ts
 * 
 * Hook React personnalisé pour obtenir et suivre la position GPS de l'utilisateur
 * via l'API Geolocation du navigateur, avec Geocoding inversé.
 */
import { useState, useCallback, useEffect } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  locationName: string | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    locationName: null,
    loading: false,
    error: null,
  });

  const [permissionState, setPermissionState] = useState<PermissionState | 'prompt'>('prompt');

  const requestLocation = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        locationName: null,
        loading: false,
        error: "La géolocalisation n'est pas supportée par votre navigateur.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        let locName = null;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
            const country = data.address?.country || '';
            if (city && country) {
              locName = `${city}, ${country}`;
            } else if (country) {
              locName = country;
            } else if (city) {
              locName = city;
            }
          }
        } catch (err) {
          console.error("Erreur de récupération du nom de la ville", err);
        }

        setState({
          coordinates: { lat, lng },
          locationName: locName,
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
          locationName: null,
          loading: false,
          error: errorMessage,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Check initial permission on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        
        // Auto-fetch if already granted silently
        if (result.state === 'granted') {
          requestLocation();
        }

        result.onchange = () => {
          setPermissionState(result.state);
        };
      }).catch(err => console.error("Permission checking error", err));
    }
  }, [requestLocation]);

  return { ...state, permissionState, requestLocation };
}
