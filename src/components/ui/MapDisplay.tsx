'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MatchResult } from '@/types';
import { CountryData } from './CountrySelector';

// Fix Leaflet's default icon path issues in Next.js/Webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pin for providers
const ProviderIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map view updates dynamically when country bounds change
function MapUpdater({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
}

interface MapDisplayProps {
  results: MatchResult[];
  activeCountry: CountryData;
  userLocation?: { lat: number; lng: number } | null;
}

export default function MapDisplay({ results, activeCountry, userLocation }: MapDisplayProps) {
  // Only render on client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-3xl border border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 font-medium">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer
        bounds={activeCountry.bounds}
        zoomControl={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater bounds={activeCountry.bounds} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <strong>Votre position</strong>
            </Popup>
          </Marker>
        )}

        {/* Providers Markers */}
        {results.map((result) => {
          const coords = result.provider.serviceProfile?.coordinates;
          if (!coords) return null;

          return (
            <Marker
              key={result.provider.uid}
              position={[coords.lat, coords.lng]}
              icon={ProviderIcon}
            >
              <Popup className="rounded-xl">
                <div className="text-center min-w-[150px]">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {result.provider.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 capitalize">
                    {result.provider.serviceProfile?.category}
                  </p>
                  <p className="font-semibold text-indigo-600 text-xs">
                    {(result.score * 100).toFixed(0)}% de correspondance
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
