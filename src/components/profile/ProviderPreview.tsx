import { Star, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/types';

export default function ProviderPreview({
  name,
  category,
  skills,
  location,
  bio,
  priceRange
}: {
  name: string;
  category: string;
  skills: string[];
  location: string;
  bio: string;
  priceRange: string;
}) {
  
  const catObj = CATEGORIES.find(c => c.id === category);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-primary/20 flex flex-col items-center max-w-sm w-full animate-in zoom-in-95">
      <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center text-3xl font-bold uppercase text-gray-400">
        {name?.charAt(0) || 'U'}
      </div>
      
      <h3 className="text-xl font-extrabold text-foreground mt-4 text-center">
        {name || 'Votre Nom'}
      </h3>
      
      {catObj ? (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-base" role="img" aria-label={catObj.label}>{catObj.icon}</span>
            {catObj.label}
          </div>
      ) : (
        <span className="text-sm font-medium text-gray-400 mt-1">Sélectionnez une catégorie</span>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-1.5 min-h-[50px] w-full">
        {skills.slice(0, 5).map(skill => (
          <span key={skill} className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-lg">
             {skill}
          </span>
        ))}
        {skills.length > 5 && (
           <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-500 rounded-lg">
             +{skills.length - 5}
           </span>
        )}
        {skills.length === 0 && (
           <span className="text-xs text-gray-400 border border-dashed border-gray-300 px-3 py-1 rounded-full w-full text-center block">Aucune compétence ajoutée</span>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 my-4" />

      <div className="w-full space-y-3">
         <div className="flex items-center text-sm text-gray-600 font-medium">
            <MapPin className="w-4 h-4 mr-2 text-red-500 shrink-0" />
            <span className="truncate">{location ? location : 'Lieu non défini'}</span>
         </div>
         <div className="flex items-center text-sm text-gray-600 font-medium">
            <Briefcase className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
            <span>Tarif: {priceRange === 'low' ? 'Économique' : priceRange === 'high' ? 'Premium' : 'Standard'}</span>
         </div>
      </div>

      <div className="w-full bg-gray-50 rounded-xl p-3 mt-4 mt-auto min-h-[60px]">
         <p className="text-xs text-gray-500 text-center italic line-clamp-3">
            {bio ? `"${bio}"` : "Votre bio apparaîtra ici..."}
         </p>
      </div>

      <button disabled className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed text-sm">
        Contacter le pro <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
