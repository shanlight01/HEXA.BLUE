'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';

import { CATEGORIES, LOME_NEIGHBORHOODS, type ServiceCategory } from '@/types';
import ProviderPreview from '@/components/profile/ProviderPreview';
import { CheckCircle2, MapPin, Phone, Briefcase, ChevronRight, ChevronLeft, Loader2, Info, User as UserIcon, DollarSign } from 'lucide-react';

type ProviderForm = {
  category: ServiceCategory | '';
  skills: string[];
  location: string;
  phone: string;
  bio: string;
  priceRange: 'low' | 'medium' | 'high';
};

export default function RegisterServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [loadingContext, setLoadingContext] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userName, setUserName] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { isValid } } = useForm<ProviderForm>({
    mode: 'onChange',
    defaultValues: {
      category: '',
      skills: [],
      location: '',
      phone: '',
      bio: '',
      priceRange: 'medium'
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/register-service');
      return;
    }

    const loadExistingProvider = async () => {
      if (!user) return;
      try {
        // Fetch User profile just for the name in the preview
        const { data: profile } = await supabase.from('profiles').select('name, isProvider').eq('id', user.uid).single();
        if (profile) {
           setUserName(profile.name || '');
           if (profile.isProvider) setIsUpdating(true);
        }

        // Fetch Provider specifically to prefill
        const { data: provider } = await supabase.from('providers').select('*').eq('id', user.uid).single();
        if (provider) {
           setIsUpdating(true);
           setValue('category', provider.category);
           setValue('skills', provider.skills || []);
           setValue('location', provider.location);
           setValue('phone', provider.phone);
           setValue('bio', provider.bio || '');
           setValue('priceRange', provider.priceRange || 'medium');
        }
      } catch (err) {
        console.warn("Pas de données prestataire existantes");
      } finally {
        setLoadingContext(false);
      }
    };

    if (user) loadExistingProvider();
  }, [user, authLoading, router, setValue]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formValues.skills.includes(trimmed) && formValues.skills.length < 10) {
      setValue('skills', [...formValues.skills, trimmed], { shouldValidate: true });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', formValues.skills.filter(s => s !== skill), { shouldValidate: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: ProviderForm) => {
    if (!user) return;
    setSaving(true);

    try {
      // 1. Upsert into providers
      const { error: providerError } = await supabase
        .from('providers')
        .upsert({
          id: user.uid,
          category: data.category,
          skills: data.skills,
          location: data.location,
          phone: data.phone,
          priceRange: data.priceRange,
          bio: data.bio,
          active: true, // Always true on creation/update
          updated_at: new Date().toISOString()
        });

      if (providerError) throw providerError;

      // 2. Update profiles to set isProvider = true (if not already true, simplifies RLS triggers)
      await supabase.from('profiles').update({ "isProvider": true }).eq('id', user.uid);

      // Animation
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0EA5E9', '#F97316', '#10B981'] // Primary, accent, success colors
      });

      setTimeout(() => {
        router.push('/profile');
      }, 2500);

    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
      setSaving(false);
    }
  };

  if (authLoading || loadingContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate Progress
  let progress = 0;
  if (formValues.category) progress += 20;
  if (formValues.skills.length > 0) progress += 15;
  if (formValues.location) progress += 20;
  if (formValues.phone && formValues.phone.length > 6) progress += 20;
  if (formValues.bio) progress += 15;
  if (formValues.priceRange) progress += 10;
  progress = Math.min(progress, 100);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-4">
            {isUpdating ? 'Mettre à jour mon offre 🚀' : 'Créer votre profil pro ✨'}
          </h1>
          <p className="text-gray-500">
             {isUpdating ? 'Ajustez vos informations pour attirer plus de clients.' : 'Rejoignez ProxiServ et boostez votre activité en 3 étapes simples.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Tracker Horizontal */}
            <div className="flex items-center justify-between mb-8 px-4 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              
              {[
                { num: 1, label: 'Spécialité', icon: Briefcase },
                { num: 2, label: 'Contact', icon: MapPin },
                { num: 3, label: 'Détails', icon: UserIcon }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${step >= s.num ? 'bg-primary text-white scale-110 ring-4 ring-primary/20' : 'bg-white text-gray-400 border border-gray-200'}`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5 text-white" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-3 uppercase tracking-widest font-bold ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
              {/* Form Steps */}
              <div className="flex-1">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Que savez-vous faire de mieux ? *
                      </label>
                      <Controller
                        name="category"
                        rules={{ required: true }}
                        control={control}
                        render={({ field }) => (
                          <select {...field} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                            <option value="">-- Choisir une catégorie --</option>
                            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                          </select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Précisez vos compétences clés ({formValues.skills.length}/10) *</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-primary transition-all min-h-[60px]">
                        {formValues.skills.map((skill) => (
                          <span key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 rounded-full p-0.5">✕</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ex: Pose de carreaux..."
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-medium py-1"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                        <Info className="w-3 h-3" /> Appuyez sur Entrée pour valider une compétence
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Dans quel quartier intervenez-vous le plus ? *
                      </label>
                      <Controller
                        name="location"
                        rules={{ required: true }}
                        control={control}
                        render={({ field }) => (
                          <select {...field} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all cursor-pointer">
                            <option value="">-- Sélectionnez votre quartier --</option>
                            {LOME_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        Numéro de contact Pro (WhatsApp) *
                      </label>
                      <Controller
                        name="phone"
                        rules={{ required: true, minLength: 6 }}
                        control={control}
                        render={({ field }) => (
                          <input type="tel" {...field} placeholder="+228 9X XX XX XX" className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all font-medium" />
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-primary" />
                        Petite biographie (Recommandé)
                      </label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => (
                          <textarea {...field} rows={4} placeholder="Ex: Artisan diplômé avec 5 ans d'expérience. Je garantis un travail soigné..." className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all resize-none font-medium text-sm" />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Positionnement tarifaire
                      </label>
                      <Controller
                        name="priceRange"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                            {(['low', 'medium', 'high'] as const).map(p => {
                              const isDisabled = p === 'low' || p === 'high';
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => !isDisabled && onChange(p)}
                                  className={`relative py-4 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all border-2 ${
                                    value === p 
                                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                      : isDisabled
                                      ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {p === 'low' && 'Économique'}
                                  {p === 'medium' && 'Standard'}
                                  {p === 'high' && 'Premium'}
                                  {isDisabled && <span className="absolute -top-2.5 px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[9px] uppercase tracking-widest font-black shadow-sm">Bientôt</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="pt-8 border-t border-gray-100 mt-6 flex gap-3">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm">
                    <ChevronLeft className="w-5 h-5" /> Retour
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={(step === 1 && (!formValues.category || formValues.skills.length === 0)) || (step === 2 && (!formValues.location || !formValues.phone))}
                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-gray-900/10"
                  >
                    Suivant <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-primary/30 active:scale-95"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {saving ? 'Confetti...' : isUpdating ? 'Mettre à jour' : 'Activer mon Profil'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:block sticky top-24">
             <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full border border-gray-200">Aperçu en direct</span>
             </div>
             <ProviderPreview 
                name={userName}
                category={formValues.category}
                skills={formValues.skills}
                location={formValues.location}
                bio={formValues.bio}
                priceRange={formValues.priceRange}
             />
          </div>

        </div>
      </div>
    </div>
  );
}
