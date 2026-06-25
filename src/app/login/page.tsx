'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    
    if (data.user) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${data.user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 404) {
          toast.error("Invalid credentials. Account records not found.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error("Backend validation failed, routing safely:", dbError);
      }
    }

    toast.success('Successfully logged in!');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7F9] p-4 font-sans antialiased">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Login Module Wrapper */}
      <div className="w-full max-w-[480px] flex flex-col items-center">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#111] uppercase tracking-[0.05em] mb-2">
            CRON.IO
          </h1>
          <p className="text-[14px] text-[#6A737D]">
            Log in or establish a new scheduler scope
          </p>
        </div>

        {/* Inner Content Card */}
        <div className="w-full bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-[#E1E4E6] flex flex-col gap-6">
          
          {/* Email Block */}
          <div className="w-full flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-wider text-[#959DA5] uppercase">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full bg-white text-[#1B1F23] placeholder-[#A3A9AE] text-[15px] border border-[#E1E4E6] rounded-[16px] px-4 py-3.5 transition-colors focus:outline-none focus:border-[#1B1F23]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Block */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold tracking-wider text-[#959DA5] uppercase">
                Password
              </label>
              
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white text-[#1B1F23] placeholder-[#A3A9AE] text-[15px] border border-[#E1E4E6] rounded-[16px] px-4 py-3.5 transition-colors focus:outline-none focus:border-[#1B1F23]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button Interactivity Layout */}
          <div className="flex flex-col gap-3 pt-2">
            
            {/* Sign In Trigger */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#494F55] hover:bg-black text-white py-4 px-6 text-[15px] font-semibold rounded-[18px] transition-colors disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
            >
              {loading ? (
                <svg 
                  className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
            
            {/* Create Account Link */}
            <Link
              href="/signup"
              className="block w-full text-center text-[#1B1F23] bg-[#B9F85D] hover:bg-[#a6e64c] py-4 px-6 text-[15px] font-semibold rounded-[18px] transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Global Nav Bottom Meta info */}
        <div className="flex gap-4 mt-8 text-[12px] text-[#959DA5]">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/help" className="hover:underline">Help Center</Link>
        </div>
      </div>
    </div>
  );
}