'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, X } from 'lucide-react'; 
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 
  const supabase = createClient();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please fill in all input criteria fields.");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Trigger success toast verification modal banner
    setShowPopup(true);
    setLoading(false);

    // Optional: Clear form inputs so the user sees something happened
    setPassword('');

    // Wait 4 seconds so the user can easily read the confirmation instructions
    setTimeout(() => {
      router.push('/login');
    }, 4000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 relative">
      {/* Toast Notification Banner Elements */}
      {showPopup && (
        <div className="absolute top-6 right-6 max-w-md w-full bg-black text-white p-4 shadow-xl flex items-start space-x-4 border border-neutral-800 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
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
          <p className="mt-2 text-sm text-gray-500">Establish a new scheduler profile scope</p>
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
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-black py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:bg-gray-400"
          >
            {loading ? 'Registering Scope...' : 'Create Account'}
          </button>
          
          <Link
            href="/login"
            className="block text-center w-full border border-black py-3 text-sm font-medium text-black transition-all hover:bg-gray-50"
          >
            Already have account? Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}