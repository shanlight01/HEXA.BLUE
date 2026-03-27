'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserDocument, updateUserDocument } from '@/lib/firebase/firestore';
import { uploadAvatar, uploadCredential } from '@/lib/firebase/storage';
import { User } from '@/types';
import { Camera, FileText, History, LogOut, CheckCircle, Loader2, User as UserIcon } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getUserDocument(user.uid).then(data => {
        if (data) {
          setDbUser(data);
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            location: data.location || '',
          });
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSaveInfo = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserDocument(user.uid, formData);
      setDbUser(prev => prev ? { ...prev, ...formData } : null);
      alert('Info updated successfully!');
    } catch {
      alert('Failed to update info.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      await updateUserDocument(user.uid, { avatarUrl: url });
      setDbUser(prev => prev ? { ...prev, avatarUrl: url } : null);
    } catch (err) {
      alert('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCredentialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingDoc(true);
    try {
      const url = await uploadCredential(user.uid, file, file.name);
      
      const updatedCreds = [...(dbUser?.providerCredentials || []), { name: file.name, url }];
      await updateUserDocument(user.uid, { providerCredentials: updatedCreds });
      
      setDbUser(prev => prev ? { ...prev, providerCredentials: updatedCreds } : null);
    } catch (err) {
       alert('Failed to upload credential');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dbUser) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Header & Avatar System */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
        
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 relative overflow-hidden group">
            {dbUser.avatarUrl ? (
              <img src={dbUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 capitalize bg-gray-50">
                {dbUser.name?.charAt(0) || '?'}
              </div>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left pt-2 md:pt-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
            {dbUser.name}
            {dbUser.isProvider && <CheckCircle className="w-6 h-6 text-blue-500 shrink-0" />}
          </h1>
          <p className="text-gray-500 font-medium">{dbUser.email}</p>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${dbUser.isProvider ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
              {dbUser.isProvider ? 'Professional' : 'Client Profile'}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} className="relative z-10 p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm md:shadow-none hover:bg-red-50">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Left Col: Personal Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><UserIcon className="w-4 h-4" /></span>
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ex: Agoè, Lomé" className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              
              <div className="pt-2 flex justify-end">
                <button onClick={handleSaveInfo} disabled={saving} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Provider Credentials Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-accent"><FileText className="w-4 h-4" /></span>
                Provider Credentials
              </h2>
              {dbUser.isProvider && (
                 <button onClick={() => docInputRef.current?.click()} className="text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-lg hover:bg-primary/20">
                   {uploadingDoc ? 'Uploading...' : '+ Add Document'}
                 </button>
              )}
            </div>
            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,image/*" onChange={handleCredentialUpload} />

            {!dbUser.isProvider ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 mb-3 text-sm">You are not registered as a service provider.</p>
                <button onClick={() => router.push('/register-service')} className="text-primary font-semibold hover:underline">Register your service</button>
              </div>
            ) : (dbUser.providerCredentials && dbUser.providerCredentials.length > 0) ? (
              <ul className="divide-y divide-gray-100">
                {dbUser.providerCredentials.map((cred: any, idx: number) => (
                  <li key={idx} className="py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> {cred.name}</span>
                    <a href={cred.url} target="_blank" rel="noreferrer" className="text-blue-500 text-xs font-semibold hover:underline bg-blue-50 px-3 py-1 rounded-full">View</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                Upload diplomas, ID cards, or certificates to earn the <strong className="text-blue-600">Verified Badge</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Service History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><History className="w-4 h-4" /></span>
               History
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Searches</div>
                <div className="text-sm text-gray-700 font-medium">"Plombier Deckon"</div>
                <div className="text-xs text-gray-500 mt-1">Found 3 providers</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contacted</div>
                <div className="text-sm text-gray-700 font-medium">Koffi Eau Pro</div>
                <div className="text-xs text-green-600 font-medium mt-1">Via WhatsApp</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
