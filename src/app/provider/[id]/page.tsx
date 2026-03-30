import { getUserDocument } from '@/lib/firebase/firestore';
import { notFound } from 'next/navigation';
import { BadgeCheck, MapPin, Star, Clock, Phone, Briefcase } from 'lucide-react';
import ContactButton from '@/components/ui/ContactButton';
import { CATEGORIES } from '@/types';

export default async function ProviderProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const provider = await getUserDocument(params.id);

  if (!provider || !provider.isProvider || !provider.serviceProfile) {
    notFound();
  }

  const profile = provider.serviceProfile;
  const categoryInfo = CATEGORIES.find(c => c.id === profile.category);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 flex items-end px-8 pb-4">
           {categoryInfo && (
             <span className="bg-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-2 text-gray-800">
               {categoryInfo.icon} {categoryInfo.label}
             </span>
           )}
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="absolute -top-12 left-8 w-24 h-24 bg-primary/10 text-primary rounded-full border-4 border-white flex items-center justify-center text-4xl font-extrabold uppercase shadow-md">
            {provider.name.charAt(0)}
          </div>

          <div className="mt-14 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                {provider.name}
                {profile.rating >= 4.5 && (
                  <span title="Profil Vérifié"><BadgeCheck className="w-6 h-6 text-blue-500" /></span>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  {profile.rating.toFixed(1)} <span className="text-gray-400 ml-1">({profile.completedJobs || 0} avis)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                  {profile.location}
                </div>
                <div className={`flex items-center ${profile.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {profile.isAvailable ? 'Disponible' : 'Occupé'}
                </div>
              </div>
            </div>

            <div className="shrink-0">
               <ContactButton phone={profile.phone} providerName={provider.name} />
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <UserIcon className="w-5 h-5 text-primary" />
               À propos
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {profile.bio || "Ce prestataire n'a pas encore ajouté de description à son profil, mais ses compétences et avis parlent pour lui."}
            </p>
          </div>

          {/* Skills Section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-accent" />
               Compétences & Spécialités
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Just an inline user icon since we didn't import it at the top
function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )
}
