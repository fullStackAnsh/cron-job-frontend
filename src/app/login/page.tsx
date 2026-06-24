'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
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
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-black py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          
          <Link
            href="/signup"
            className="block text-center w-full border border-black py-3 text-sm font-medium text-black transition-all hover:bg-gray-50 raw-link-styling"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}