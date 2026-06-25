'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };
    checkUser();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F4F2]">
      {/* Native Tailwind Shimmer UI */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-32 animate-pulse rounded-full bg-[#EFEFEC]" />
        <div className="h-2 w-48 animate-pulse rounded-full bg-[#EFEFEC]" />
      </div>
    </div>
  );
}