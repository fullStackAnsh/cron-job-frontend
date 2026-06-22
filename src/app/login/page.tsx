'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, X } from 'lucide-react'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (type: 'LOGIN' | 'SIGNUP') => {
    setLoading(true);
    
    const { data, error } = type === 'LOGIN' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // --- SIGNUP FLOW ---
    if (type === 'SIGNUP') {

      setShowPopup(true);
      setLoading(false);
      return; 
    }
    
    // --- LOGIN FLOW (With Database existence check) ---
    if (type === 'LOGIN' && data.user) {
      try {
        // Verify if the user records exist in your backend database table
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${data.user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        // If backend explicitly says user does not exist in your user table
        if (response.status === 404) {
          alert("Invalid credentials. Account records not found.");
          await supabase.auth.signOut(); // Force sign out from auth session
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Backend validation failed, routing safely:", dbError);
        // Optional fallback: If backend server is down, decide whether to block or allow them through
      }
    }

    // Proceed straight to the workspace application if all checks pass
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 relative">
      {showPopup && (
        <div className="absolute top-6 right-6 max-w-md w-full bg-black text-white p-4 shadow-xl flex items-start space-x-4 border border-neutral-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-1 bg-neutral-900 border border-neutral-800 rounded">
            <Mail className="h-5 w-5 text-gray-300" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold tracking-wide">Verification Link Transmitted</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We sent a validation token to <span className="text-white font-medium font-mono">{email}</span>. 
              Please verify your account before logging in.
            </p>
          </div>
          <button onClick={() => setShowPopup(false)} className="text-neutral-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="w-full max-w-md space-y-8 border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black">CRON.IO</h2>
          <p className="mt-2 text-sm text-gray-500">Log in or establish a new scheduler scope</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border border-gray-200 p-3 text-sm focus:border-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 p-3 text-sm focus:border-black focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => handleAuth('LOGIN')}
            disabled={loading}
            className="w-full bg-black py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          <button
            onClick={() => handleAuth('SIGNUP')}
            disabled={loading}
            className="w-full border border-black py-3 text-sm font-medium text-black transition-all hover:bg-gray-50 disabled:bg-gray-400"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}