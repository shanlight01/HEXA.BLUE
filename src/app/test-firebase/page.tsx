'use client';

import { useEffect, useState } from 'react';
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase/config';
import { CheckCircle2, XCircle, Loader2, Database, ShieldCheck } from 'lucide-react';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<{
    auth: 'loading' | 'ok' | 'fail';
    db: 'loading' | 'ok' | 'fail';
  }>({ auth: 'loading', db: 'loading' });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus({ auth: 'fail', db: 'fail' });
      return;
    }

    // Small delay to simulate check
    const check = async () => {
      try {
        const auth = getFirebaseAuth();
        const db = getFirebaseDb();
        
        setStatus({
          auth: auth ? 'ok' : 'fail',
          db: db ? 'ok' : 'fail'
        });
      } catch (e) {
        console.error(e);
        setStatus({ auth: 'fail', db: 'fail' });
      }
    };

    check();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Firebase Diagnostic</h1>
          <p className="text-gray-500 text-sm mt-1">Checking ProxiServ connectivity</p>
        </div>

        <div className="space-y-4">
          {/* Auth Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary w-5 h-5" />
              <span className="font-semibold text-gray-700">Authentication</span>
            </div>
            {status.auth === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
            {status.auth === 'ok' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {status.auth === 'fail' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>

          {/* Firestore Check */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Database className="text-accent w-5 h-5" />
              <span className="font-semibold text-gray-700">Firestore Database</span>
            </div>
            {status.db === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
            {status.db === 'ok' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {status.db === 'fail' && <XCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className={`p-4 rounded-xl text-center text-sm font-medium ${
            status.auth === 'ok' && status.db === 'ok' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {status.auth === 'ok' && status.db === 'ok' 
              ? '✅ Connection established successfully!' 
              : '❌ Configuration error detected.'}
          </div>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
