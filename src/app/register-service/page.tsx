'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { activateProviderProfile } from '@/lib/firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { CATEGORIES, LOME_NEIGHBORHOODS, type ServiceCategory, type ServiceProfile } from '@/types';
import { CheckCircle2, MapPin, Phone, Briefcase, ChevronRight, ChevronLeft, Loader2, Info, DollarSign, User as UserIcon } from 'lucide-react';

export default function RegisterServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Récupère l'utilisateur connecté
  
  // États pour gérer les étapes du formulaire et les données
  const [step, setStep] = useState(1); // Étape actuelle (1, 2 ou 3)
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [priceRange, setPriceRange] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/register-service');
    }
  }, [user, authLoading, router]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  /**
   * Soumission finale du formulaire vers Firestore.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("👉 Bouton Activer cliqué !");

    // Vérification rigoureuse de l'utilisateur actif via Firebase Auth
    if (!auth?.currentUser) {
      console.warn("⚠️ Utilisateur non authentifié via auth.currentUser !");
      alert("Votre session a expiré ou vous n'êtes pas connecté. Redirection...");
      router.push('/login?redirect=/register-service');
      return;
    }
    const currentUid = auth.currentUser.uid;

    setLoading(true);
    console.log(`✔️ Authentification OK pour l'UID: ${currentUid}`);

    try {
      // 1. Sauvegarde dans 'providers/{userId}' comme demandé
      console.log("📝 Début de l'écriture Firestore dans providers/...");
      await setDoc(doc(db, 'providers', currentUid), {
        category,
        skills,
        location,
        phone,
        priceRange,
        bio,
        plan: "standard",
        active: true,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log("✅ Écriture dans providers/ réussie !");

      // 2. Mise à jour de la collection 'users' existante (rétrocompatibilité pour garantir l'affichage)
      console.log("📝 Mise à jour de users/ pour isProvider=true...");
      const profile: ServiceProfile = {
        category: category as ServiceCategory,
        skills,
        location,
        phone,
        priceRange,
        bio,
        rating: 5.0,
        isAvailable: true,
        completedJobs: 0
      };
      
      // On utilise setDoc au lieu de updateDoc (dans activateProviderProfile) pour éviter une erreur silencieuse si le doc user n'existait pas encore
      await setDoc(doc(db, 'users', currentUid), {
        isProvider: true,
        serviceProfile: profile
      }, { merge: true });
      console.log("✅ Écriture dans users/ réussie !");
      
      setSuccess(true);
      console.log("✅ Inscription terminée avec succès !");

      // Redirection après 2 secondes vers le profil
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      console.error("❌ ERREUR LORS DE L'ÉCRITURE FIRESTORE:", err);
      alert(`Une erreur est survenue lors de l'enregistrement : ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !success)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre profil prestataire est activé !</h2>
          <p className="text-gray-500 mb-6">Votre profil est maintenant actif et visible par les clients dans votre région.</p>
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirection vers votre profil...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-4">Créer votre profil pro ✨</h1>
          <p className="text-gray-500">Rejoignez ProxiServ et boostez votre activité en 3 étapes simples.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 px-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Spécialité', icon: Briefcase },
            { num: 2, label: 'Contact', icon: MapPin },
            { num: 3, label: 'Détails', icon: UserIcon }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${step >= s.num ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
                 <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 font-semibold ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Que savez-vous faire de mieux ? *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all appearance-none"
                  required
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Précisez vos compétences clés ({skills.length}/10)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-primary transition-all min-h-[50px]">
                  {skills.map((skill) => (
                    <span key={skill} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">✕</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Pose de carreaux..."
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
                  />
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Appuyez sur Entrée pour ajouter une compétence
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Dans quel quartier intervenez-vous le plus ? *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                  required
                >
                  <option value="">-- Sélectionnez votre quartier --</option>
                  {LOME_NEIGHBORHOODS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  Numéro de contact (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 9X XX XX XX"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Petite biographie (facultatif)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Artisan diplômé avec 5 ans d'expérience..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Positionnement tarifaire
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {(['low', 'medium', 'high'] as const).map((p) => {
                    const isDisabled = p === 'low' || p === 'high';
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setPriceRange(p)}
                        className={`relative py-4 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all border-2 ${
                          priceRange === p 
                            ? 'bg-primary/5 border-primary text-primary' 
                            : isDisabled
                            ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}
                      >
                        {p === 'low' && 'Économique'}
                        {p === 'medium' && 'Standard'}
                        {p === 'high' && 'Premium'}
                        {isDisabled && (
                          <span className="absolute -top-2.5 px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[9px] uppercase tracking-wider font-bold shadow-sm">
                            Bientôt
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Retour
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && (!category || skills.length === 0)) ||
                  (step === 2 && (!location || !phone))
                }
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                Suivant <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {loading ? 'Activation...' : 'Activer mon Profil'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
