'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Camera, LogOut, CheckCircle, Loader2, AlertTriangle, UserIcon, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProfileForm from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.uid)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      // Fallback si pas de profil (cas rare avec Supabase + signUp Trigger manuel de fallback)
      if (!profileData) {
         setProfile({ id: user.uid, name: user.displayName || 'Utilisateur', email: user.email, isProvider: false });
      } else {
         setProfile(profileData);
      }

      // Fetch Provider Status
      if (profileData?.isProvider || profileData?.isprovider) { // Handles case sensitivity just in case
        const { data: providerData, error: provError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', user.uid)
          .single();
          
        if (!provError && providerData) setProvider(providerData);
      }
      
    } catch (err: any) {
      console.error("Erreur de chargement", err);
      setError("Impossible de charger les données depuis le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      await supabase.from('profiles').update({ avatar_url: publicUrlData.publicUrl }).eq('id', user.uid);
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
      
    } catch (err) {
      alert("Échec du téléchargement de l'avatar. Avez-vous configuré le bucket 'avatars' en public ?");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleToggleStatus = async () => {
     if (!user || !provider) return;
     setTogglingStatus(true);
     try {
        const newStatus = !provider.active;
        const { error } = await supabase.from('providers').update({ active: newStatus }).eq('id', user.uid);
        if (error) throw error;
        setProvider((prev: any) => ({ ...prev, active: newStatus }));
     } catch (err) {
        alert("Erreur lors du changement de statut.");
     } finally {
        setTogglingStatus(false);
     }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (authLoading || (loading && !profile)) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-pulse">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden h-48">
          <div className="absolute top-0 left-0 w-full h-32 bg-gray-200 opacity-50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
           <div className="md:col-span-2 h-96 bg-white rounded-2xl p-6 shadow-sm border border-gray-100" />
           <div className="h-48 bg-white rounded-2xl p-6 shadow-sm border border-gray-100" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 max-w-md mx-auto shadow-sm">
          <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erreur de connexion</h2>
          <p className="text-sm mb-6 font-medium">{error}</p>
          <button onClick={loadData} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isProvider = profile.isProvider || profile.isprovider;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Header & Avatar System */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-accent/20 opacity-80" />
        
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-100 relative overflow-hidden group">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-5xl font-extrabold uppercase text-white shadow-inner ${isProvider ? 'bg-primary' : 'bg-blue-400'}`}>
                {profile.name?.charAt(0) || '?'}
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left pt-2 md:pt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex flex-col md:flex-row items-center md:justify-start gap-2">
            {profile.name}
            {isProvider && <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />}
          </h1>
          <p className="text-gray-500 font-medium">{profile.email}</p>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isProvider ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'}`}>
              {isProvider ? 'PRESTATAIRE ACTIF' : 'PROFIL CLIENT'}
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-600">
               Membre
            </span>
          </div>
        </div>

        <button onClick={handleLogout} className="relative z-10 p-3 text-red-400 hover:text-red-500 transition-all hover:bg-red-50 hover:scale-105 rounded-full mt-4 md:mt-0 shadow-sm md:shadow-none bg-white">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Left Col: Personal Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative">
            <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><UserIcon className="w-5 h-5" /></span>
              Vos Informations
            </h2>
            
            <ProfileForm 
              initialData={profile} 
              userId={profile.id} 
              onSuccess={(data) => setProfile((prev: any) => ({...prev, ...data}))} 
            />
          </div>

          {/* Provider Credentials Section */}
          {isProvider && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-foreground flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Info className="w-5 h-5" /></span>
                  Attestations & Diplômes
                </h2>
                <button 
                  onClick={() => document.getElementById('cred-upload')?.click()} 
                  className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  + Ajouter
                </button>
              </div>
              
              <input 
                id="cred-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf,image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.uid}-${Date.now()}.${fileExt}`;
                    const filePath = `credentials/${fileName}`;

                    // Upload to new credentials bucket
                    const { error: uploadError } = await supabase.storage
                      .from('credentials')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage.from('credentials').getPublicUrl(filePath);
                    
                    const newCred = { name: file.name, url: publicUrlData.publicUrl };
                    const updatedCreds = [...(provider?.credentials || []), newCred];
                    
                    await supabase.from('providers').update({ credentials: updatedCreds }).eq('id', user.uid);
                    setProvider((prev: any) => ({ ...prev, credentials: updatedCreds }));
                    alert("Document ajouté avec succès ✅");
                  } catch (err) {
                    alert("Erreur lors de l'envoi du document.");
                  }
                }} 
              />

              {(!provider?.credentials || provider.credentials.length === 0) ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-gray-500 mb-2 text-sm">Aucun document pour le moment.</p>
                  <p className="text-xs text-gray-400">Ajoutez vos diplômes ou attestations pour rassurer vos clients.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {provider.credentials.map((cred: any, idx: number) => (
                    <li key={idx} className="py-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700 truncate max-w-[200px] sm:max-w-xs">{cred.name}</span>
                      <a href={cred.url} target="_blank" rel="noreferrer" className="text-primary text-xs font-black hover:underline bg-primary/5 px-4 py-1.5 rounded-full whitespace-nowrap">Voir le document</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Provider Status & CTA */}
        <div className="space-y-6">
           
          {isProvider && provider ? (
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                  Statut Pro
                  <div className="flex items-center">
                    <button 
                       onClick={handleToggleStatus} 
                       disabled={togglingStatus}
                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${provider.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                       <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${provider.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
               </h2>
               
               <div className={`p-4 rounded-xl border ${provider.active ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-sm font-bold ${provider.active ? 'text-green-700' : 'text-gray-500'}`}>
                     {provider.active ? "Vous êtes visible et recevez des demandes." : "Vous êtes invisible sur la plateforme."}
                  </p>
               </div>

               <div className="mt-6 flex flex-col gap-3">
                  <button onClick={() => router.push('/register-service')} className="w-full bg-gray-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-gray-800 transition-colors">
                     Mettre à jour ma fiche Pro
                  </button>
                  <p className="text-xs text-center text-gray-400"><Info className="inline w-3 h-3 mr-1"/> Modifier votre spécialité ou vos tarifs</p>
               </div>
             </div>
          ) : (
             <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-2xl rounded-full" />
               <h2 className="text-xl font-extrabold mb-2 relative z-10">Devenir Prestataire</h2>
               <p className="text-sm text-primary-100 mb-6 relative z-10 leading-relaxed">
                  Générez plus de revenus en proposant vos services aux habitants de Lomé dès aujourd'hui.
               </p>
               <button onClick={() => router.push('/register-service')} className="relative z-10 w-full bg-white text-primary font-black py-4 rounded-xl shadow-xl hover:scale-105 transition-all">
                 Commencer maintenant
               </button>
             </div>
          )}

        </div>

      </div>
    </div>
  );
}
