import type { User, MatchResult } from '@/types';
import WhatsAppButton from './WhatsAppButton';
import { BadgeCheck, MapPin, Star, Clock } from 'lucide-react';

interface ProviderCardProps {
  result: MatchResult;
}

export default function ProviderCard({ result }: ProviderCardProps) {
  const { provider, score, distanceKm } = result;
  const profile = provider.serviceProfile!;
  const scorePercent = Math.round(score * 100);
  
  // Decide if this provider gets the "Verified Trust Badge" (Score > 80% and rating > 4.5)
  const isVerified = scorePercent >= 80 && profile.rating >= 4.5;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out flex flex-col h-full">
      {/* Top Banner indicating Match score */}
      <div className={`h-2 w-full ${scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-accent' : 'bg-gray-300'}`} />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
              {provider.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                {provider.name}
                {isVerified && (
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                )}
              </h3>
              <p className="text-sm font-medium text-accent uppercase tracking-wider">{profile.category}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-black ${scorePercent >= 80 ? 'text-green-600' : 'text-gray-900'}`}>{scorePercent}%</div>
            <div className="text-xs text-gray-500 font-medium uppercase">Match</div>
          </div>
        </div>

        {/* Rating and Distance */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center text-yellow-500 font-semibold bg-yellow-50 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 fill-current mr-1" />
            {profile.rating.toFixed(1)} <span className="text-gray-400 font-normal ml-1">({profile.completedJobs || 0})</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <span className="font-medium text-gray-700">
              {distanceKm !== undefined ? `${distanceKm.toFixed(1)} km away` : profile.location}
            </span>
          </div>

          <div className={`flex items-center ${profile.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
            <Clock className="w-4 h-4 mr-1" />
            {profile.isAvailable ? 'Available Now' : 'Busy'}
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-md">
              +{profile.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Provider Bio snippet */}
        <p className="text-gray-600 text-sm line-clamp-2 mt-auto mb-6">
          {profile.bio || "No description provided."}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button className="w-full py-2.5 border-2 border-primary/20 text-primary hover:bg-primary/5 font-semibold rounded-xl text-sm transition-colors">
            View Profile
          </button>
          <WhatsAppButton phone={profile.whatsapp} providerName={provider.name} />
        </div>
      </div>
    </div>
  );
}
