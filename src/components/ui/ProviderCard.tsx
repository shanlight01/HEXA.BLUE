import type { User, MatchResult } from '@/types';
import ContactButton from './ContactButton';
import { BadgeCheck, MapPin, Star, Clock } from 'lucide-react';
import Link from 'next/link';

interface ProviderCardProps {
  result: MatchResult;
}

/** Skeleton affiché pendant le chargement */
export function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="h-2 w-full skeleton" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full skeleton" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 w-1/2 skeleton rounded-md" />
            <div className="h-4 w-1/3 skeleton rounded-md" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-8 w-20 skeleton rounded-md" />
          <div className="h-8 w-24 skeleton rounded-md" />
          <div className="h-8 w-20 skeleton rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 skeleton rounded-full" />
          <div className="h-6 w-20 skeleton rounded-full" />
          <div className="h-6 w-14 skeleton rounded-full" />
        </div>
        <div className="h-12 skeleton rounded-md" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 skeleton rounded-xl" />
          <div className="h-10 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProviderCard({ result }: ProviderCardProps) {
  const { provider, score, distanceKm } = result;
  const profile = provider.serviceProfile!;
  const scorePercent = Math.round(score * 100);

  // Badge "Vérifié" si score ≥ 80% et note ≥ 4.5
  const isVerified = scorePercent >= 80 && profile.rating >= 4.5;

  const scoreColor =
    scorePercent >= 80
      ? 'text-emerald-600'
      : scorePercent >= 50
      ? 'text-amber-600'
      : 'text-gray-500';

  const bannerColor =
    scorePercent >= 80
      ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
      : scorePercent >= 50
      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
      : 'bg-gray-200';

  return (
    <div className="provider-card group relative bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Barre de score colorée */}
      <div className={`h-1.5 w-full ${bannerColor}`} />

      <div className="p-6 flex-1 flex flex-col">
        {/* En-tête : avatar + nom + score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar initial */}
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-extrabold uppercase shadow-inner shrink-0">
              {provider.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                {provider.name}
                {isVerified && (
                  <span
                    title="Prestataire Vérifié"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Vérifié
                  </span>
                )}
              </h3>
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mt-0.5">
                {profile.category}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <div className={`text-2xl font-black ${scoreColor}`}>{scorePercent}%</div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Match
            </div>
          </div>
        </div>

        {/* Note · Distance · Disponibilité */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs font-medium">
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-current" />
            {profile.rating.toFixed(1)}
            <span className="text-gray-400 font-normal">({profile.completedJobs ?? 0})</span>
          </span>

          <span className="flex items-center gap-1 text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {distanceKm !== undefined
              ? `${distanceKm < 1 ? (distanceKm * 1000).toFixed(0) + ' m' : distanceKm.toFixed(1) + ' km'}`
              : profile.location}
          </span>

          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              profile.isAvailable
                ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                : 'text-red-600 bg-red-50 border-red-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {profile.isAvailable ? 'Disponible' : 'Occupé'}
          </span>
        </div>

        {/* Compétences */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg border border-gray-200">
              +{profile.skills.length - 3}
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-gray-500 text-sm line-clamp-2 mt-auto mb-5">
          {profile.bio || 'Aucune description fournie.'}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Link href={`/provider/${provider.uid}`} className="w-full">
            <button className="w-full py-2.5 border-2 border-primary/20 text-primary hover:bg-primary/5 font-semibold rounded-2xl text-sm transition-colors">
              Voir le profil
            </button>
          </Link>
          <ContactButton phone={profile.phone} providerName={provider.name} />
        </div>
      </div>
    </div>
  );
}
