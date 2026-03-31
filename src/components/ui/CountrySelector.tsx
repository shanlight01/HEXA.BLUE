'use client';

import React from 'react';

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  bounds: [[number, number], [number, number]]; // [southWest, northEast] for Leaflet
  comingSoon?: boolean;
}

export const COUNTRIES: CountryData[] = [
  {
    id: 'tg',
    name: 'Togo',
    flag: '🇹🇬',
    bounds: [[6.11, 0.43], [11.14, 1.8]],
  },
  {
    id: 'gh',
    name: 'Ghana',
    flag: '🇬🇭',
    bounds: [[4.73, -3.26], [11.17, 1.2]],
    comingSoon: true,
  },
  {
    id: 'ci',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    bounds: [[4.35, -8.6], [10.73, -2.5]],
    comingSoon: true,
  },
  {
    id: 'sn',
    name: 'Sénégal',
    flag: '🇸🇳',
    bounds: [[12.3, -17.53], [16.69, -11.36]],
    comingSoon: true,
  },
  {
    id: 'ng',
    name: 'Nigeria',
    flag: '🇳🇬',
    bounds: [[4.27, 2.67], [13.89, 14.68]],
    comingSoon: true,
  },
  {
    id: 'bj',
    name: 'Bénin',
    flag: '🇧🇯',
    bounds: [[6.23, 0.77], [12.4, 3.84]],
    comingSoon: true,
  },
];

interface CountrySelectorProps {
  selectedCountryId: string;
  onSelectCountry: (country: CountryData) => void;
}

export default function CountrySelector({
  selectedCountryId,
  onSelectCountry,
}: CountrySelectorProps) {
  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 relative z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto pb-2 gap-3 snap-x flex-nowrap scrollbar-hide">
          {COUNTRIES.map((country) => {
            const isActive = country.id === selectedCountryId;
            return (
              <button
                key={country.id}
                onClick={() => !country.comingSoon && onSelectCountry(country)}
                disabled={country.comingSoon}
                className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-semibold
                  ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                      : country.comingSoon
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                  }
                `}
              >
                <span className="text-lg leading-none">{country.flag}</span>
                <span>{country.name}</span>
                {country.comingSoon && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-200 rounded-md text-[10px] uppercase font-bold tracking-widest text-gray-600">
                    Bientôt
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
