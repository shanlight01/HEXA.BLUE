'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp, signInWithGoogle } from '@/lib/firebase/auth';
import { createUserDocument, getUserDocument } from '@/lib/firebase/firestore';
import { Mail, Lock, User, Loader2, Calendar, MapPin, SearchCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('quick');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    country: 'TG',
    gender: 'prefer-not-to-say'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Partial update handler
  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      const existingDoc = await getUserDocument(user.uid);
      if (!existingDoc) {
        await createUserDocument(user.uid, {
          name: user.displayName || 'Google User',
          email: user.email || '',
          isProvider: false,
          createdAt: new Date().toISOString(),
        });
        showFinalToast();
      } else {
        router.push('/profile');
      }
    } catch {
      setError('Google sign-up failed.');
      setGoogleLoading(false);
    }
  };

  const showFinalToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/profile');
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isFull = activeTab === 'full';
      const fullName = isFull 
        ? `${formData.firstName} ${formData.lastName}`.trim() 
        : formData.firstName; // in quick mode, firstName is used as full name

      const user = await signUp(formData.email, formData.password, fullName);
      
      const userDoc = {
        name: fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        dob: isFull ? formData.dob : undefined,
        country: isFull ? formData.country : undefined,
        gender: isFull ? formData.gender : undefined,
        isProvider: false,
        createdAt: new Date().toISOString(),
      };

      await createUserDocument(user.uid, userDoc);
      showFinalToast();
    } catch (err: any) {
      setError(err.message || 'Registration error. Please verify your details.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Onboarding Toast */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-500 z-50 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
        <div className="bg-green-500 rounded-full p-1"><SearchCheck className="w-5 h-5 text-white" /></div>
        <div>
          <h3 className="font-bold text-sm">Welcome to ProxiServ!</h3>
          <p className="text-gray-300 text-xs">Redirecting to your dashboard...</p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Lomé&apos;s fastest growing service network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            type="button"
            className="mb-6 w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Sign up with Google
          </button>

          {/* Registration Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'quick' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('quick')}
            >
              Quick Sign-up
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'full' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('full')}
            >
              Full Profile
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-sm text-red-700">{error}</div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {activeTab === 'quick' ? (
              // Quick Form: Full Name, Email, Password
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                    <input required type="text" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} className="focus:ring-primary focus:border-primary block w-full pl-10 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="Ama Koffi" />
                  </div>
                </div>
              </>
            ) : (
              // Full Form: First Name, Last Name, DOB, Country, Gender
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} className="focus:ring-primary focus:border-primary block w-full px-4 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="Ama" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} className="focus:ring-primary focus:border-primary block w-full px-4 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="Koffi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                    <input required type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} className="focus:ring-primary focus:border-primary block w-full pl-10 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-4 w-4 text-gray-400" /></div>
                    <select value={formData.country} onChange={e => updateForm('country', e.target.value)} className="focus:ring-primary focus:border-primary block w-full pl-10 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none appearance-none">
                      <option value="TG">Togo</option>
                      <option value="GH">Ghana</option>
                      <option value="BJ">Benin</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                <input required type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className="focus:ring-primary focus:border-primary block w-full pl-10 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="you@example.com" />
              </div>
            </div>

            {activeTab === 'full' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                   <select value={formData.gender} onChange={e => updateForm('gender', e.target.value)} className="focus:ring-primary focus:border-primary block w-full px-4 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none appearance-none">
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                   <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="focus:ring-primary focus:border-primary block w-full px-4 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="+228 XX XX XX XX" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                <input required minLength={6} type="password" value={formData.password} onChange={e => updateForm('password', e.target.value)} className="focus:ring-primary focus:border-primary block w-full pl-10 py-2.5 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border outline-none" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading || googleLoading} className="mt-4 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-sm text-gray-600">Already registered? <Link href="/login" className="font-semibold text-primary hover:text-primary-light">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
