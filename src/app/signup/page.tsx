'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // Installed toast utilities

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("Please fill in all input criteria fields.");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Trigger explicit success toast configuration
    toast.success('Account profile initialized successfully!');
    
    // Explicit notification helper telling them to check their inbox
    toast((t) => (
      <span className="text-xs font-medium leading-relaxed text-[#283711]">
        Verification token transmitted! Please validate your email at <b>{email}</b> before authenticating.
      </span>
    ), {
      duration: 6000,
      icon: '✉️',
    });

    // Clear form data inputs cleanly
    setPassword('');
    setLoading(false);

    // Controlled micro-delay allowing the validation prompt to be fully absorbed
    setTimeout(() => {
      router.push('/login');
    }, 4500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EFEFEC] p-6 sm:p-12 antialiased relative overflow-x-hidden">
      {/* Toast notification wrapper container mounted globally within viewport layout */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Form Container Card */}
      <div className="w-full max-w-[480px] bg-white rounded-[40px] p-10 sm:p-14 flex flex-col items-center shadow-[0_20px_50px_rgba(40,55,17,0.08)] border border-[#EFEFEC]/50">
        
        {/* Typography Hierarchy */}
        <div className="text-center mb-10 w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#283711] uppercase tracking-[0.12em]">
            CRON.IO
          </h2>
          <p className="mt-3 text-sm font-medium text-[#BDBDBB] max-w-[280px] mx-auto leading-relaxed">
            Establish a new scheduler profile scope
          </p>
        </div>

        {/* Unified, perfectly aligned form element area */}
        <div className="w-full space-y-4">
          
          {/* Email Input Field */}
          <div className="relative w-full">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#EFEFEC]/60 text-[#283711] placeholder-[#BDBDBB] text-sm font-medium rounded-2xl px-6 py-4 transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#283711]/20 text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input Field */}
          <div className="relative w-full">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#EFEFEC]/60 text-[#283711] placeholder-[#BDBDBB] text-sm font-medium rounded-2xl px-6 py-4 transition-all duration-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#283711]/20 text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button Interactivity Engine Stack */}
          <div className="pt-4 space-y-3">
            
            {/* Create Account Primary Button with Forest Green SVG Spinner */}
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full text-center hover:bg-[#9EE970] text-[#283711] bg-[#bcff95] active:scale-[0.99] py-4 px-6 text-sm font-semibold rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] tracking-wide shadow-sm disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
            >
              {loading ? (
                <svg 
                  className="animate-spin h-5 w-5 text-[#283711]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
            
            {/* Already have account? Login Link Button */}
            <Link
              href="/login"
              className="w-full bg-[#494F55] hover:bg-black active:scale-[0.99] text-white py-4 px-6 text-sm font-semibold rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm flex items-center justify-center tracking-wide"
            >
              Already have account? Login Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}