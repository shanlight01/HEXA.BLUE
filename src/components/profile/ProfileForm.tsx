'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2, CheckCircle, Save } from 'lucide-react';
import { LOME_NEIGHBORHOODS } from '@/types';

type ProfileFormData = {
  name: string;
  phone: string;
  whatsapp: string;
  location: string;
  city: string;
  country: string;
  bio: string;
  gender: 'Male' | 'Female' | 'Other' | '';
};

export default function ProfileForm({ 
  initialData, 
  userId, 
  onSuccess 
}: { 
  initialData: any, 
  userId: string, 
  onSuccess?: (data: any) => void 
}) {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      whatsapp: initialData?.whatsapp || '',
      location: initialData?.location || '',
      city: initialData?.city || 'Lomé',
      country: initialData?.country || 'Togo',
      bio: initialData?.bio || '',
      gender: initialData?.gender || '',
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp,
          location: data.location,
          city: data.city,
          country: data.country,
          bio: data.bio,
          gender: data.gender,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      
      setSuccessMsg('Profil mis à jour ✅');
      if (onSuccess) onSuccess(data);
      
      // Clear message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
      {/* Toast de succès */}
      {successMsg && (
        <div className="absolute -top-12 right-0 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet *</label>
          <input 
            {...register("name", { required: true })} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone Principal</label>
          <input 
            type="tel"
            {...register("phone")} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp (Format: +228...)</label>
          <input 
            type="tel"
            {...register("whatsapp")} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Genre</label>
          <select 
            {...register("gender")} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">-- Optionnel --</option>
            <option value="Male">Homme</option>
            <option value="Female">Femme</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Quartier (Lomé)</label>
          <select 
            {...register("location")} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">-- Sélectionnez --</option>
            {LOME_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ville</label>
          <input 
            {...register("city")} 
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Bio (Max 300 caractères)</label>
        <textarea 
          {...register("bio", { maxLength: 300 })} 
          rows={3}
          maxLength={300}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" 
          placeholder="Racontez-nous un peu de vous..."
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button 
          type="submit" 
          disabled={saving} 
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder mon profil'}
        </button>
      </div>
    </form>
  );
}
