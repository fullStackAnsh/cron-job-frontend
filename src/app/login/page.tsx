'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // Imported toast utilities

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    // Basic frontend validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message); // Replaced alert with toast
      setLoading(false);
      return;
    }
    
    // --- LOGIN FLOW (With Database existence check) ---
    if (data.user) {
      try {
        // Verify if the user records exist in your backend database table
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${data.user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        // If backend explicitly says user does not exist in your user table
        if (response.status === 404) {
          toast.error("Invalid credentials. Account records not found."); // Replaced alert with toast
          await supabase.auth.signOut(); // Force sign out from auth session
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Backend validation failed, routing safely:", dbError);
        // Optional fallback: If backend server is down, decide whether to block or allow them through
      }
    }

    toast.success('Successfully logged in!'); // Success toast added
    
    // Proceed straight to the workspace application if all checks pass
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EFEFEC] p-6 sm:p-12 antialiased">
      {/* Toast notification container mounted here locally for ease of setup */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Outer container */}
      <div className="w-full max-w-[480px] bg-white rounded-[40px] p-10 sm:p-14 border border-[#EFEFEC]/50 flex flex-col items-center shadow-[0_20px_50px_rgba(40,55,17,0.08)]">
        
        {/* Typography Hierarchy */}
        <div className="text-center mb-10 w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#283711] uppercase tracking-[0.12em]">
            CRON.IO
          </h2>
          <p className="mt-3 text-sm font-medium text-[#BDBDBB] max-w-[280px] mx-auto leading-relaxed">
            Log in or establish a new scheduler scope
          </p>
        </div>

        {/* Unified form area */}
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

          {/* Operational button stack */}
          <div className="pt-4 space-y-3">
            
            {/* Sign In Button with CSS Spinner */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#494F55] hover:bg-black active:scale-[0.99] text-white py-4 px-6 text-sm font-semibold rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-70 disabled:pointer-events-none shadow-sm flex items-center justify-center tracking-wide"
            >
              {loading ? (
                <svg 
                  className="animate-spin h-5 w-5 text-white" 
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
                    tracking-wide
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* Create Account Button */}
            <Link
              href="/signup"
              className="block w-full text-center hover:bg-[#9EE970] text-[#283711] bg-[#bcff95] active:scale-[0.99] py-4 px-6 text-sm font-semibold rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] tracking-wide shadow-sm"
            >
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}