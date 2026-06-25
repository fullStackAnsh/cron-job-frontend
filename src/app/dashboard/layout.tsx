'use client';
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, ListOrdered, LogOut, Menu, PlayCircle, X, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  // Shimmer UI for Logout Transition
  if (isSigningOut) {
    return (
      <div className="flex h-screen w-screen bg-[#EFEFEC] p-0 md:p-6 lg:p-8 animate-pulse">
        {/* Sidebar Shimmer */}
        <div className="hidden md:flex w-72 bg-white rounded-[32px] p-8 flex-col justify-between border border-[#EFEFEC]/50">
          <div className="space-y-10">
            <div className="h-6 w-24 bg-[#EFEFEC] rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 w-full bg-[#EFEFEC] rounded-2xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-full bg-[#EFEFEC] rounded-2xl" />
          </div>
        </div>
        {/* Main Content Shimmer */}
        <div className="flex-1 md:pl-8">
          <div className="w-full h-full bg-white rounded-[32px] p-12 border border-[#EFEFEC]/50" />
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#EFEFEC] p-4 sm:p-6 md:p-8 antialiased">
        <aside className="hidden md:flex w-72 bg-white rounded-[32px] p-8 flex-col justify-between border border-[#EFEFEC]/50 shadow-[0_20px_50px_rgba(40,55,17,0.03)]">
          <div className="space-y-10">
            <h1 className="text-xl font-semibold tracking-[0.15em] text-[#283711]">CRON.IO</h1>
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#EFEFEC] p-0 md:p-6 lg:p-8 antialiased overflow-hidden items-start">
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-[#EFEFEC] flex items-center justify-between px-6 z-40 md:hidden shadow-[0_4px_24px_rgba(40,55,17,0.02)]">
        <h1 className="text-xl font-semibold tracking-[0.15em] text-[#283711]">CRON.IO</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-3 rounded-xl bg-[#EFEFEC]/60 text-[#283711]">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white p-8 flex flex-col justify-between z-50 transform transition-transform duration-500 border-r md:border-r-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-0 md:h-full md:transform-none md:translate-x-0 md:rounded-[32px] md:shadow-[0_20px_50px_rgba(40,55,17,0.04)] md:border md:border-[#EFEFEC]/50`}>
        <div className="space-y-10">
          <div className="flex items-center justify-between md:block">
            <h1 className="text-xl font-semibold tracking-[0.15em] text-[#283711]">CRON.IO</h1>
            <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl bg-[#EFEFEC]/60 text-[#283711] md:hidden"><X className="h-5 w-5" /></button>
          </div>
          <nav className="space-y-2.5">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className={`flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-semibold ${isActive('/dashboard') ? "bg-[#9EE970] text-[#283711]" : "bg-[#EFEFEC]/60 hover:bg-[#EFEFEC]"}`}>
              <ListOrdered className="h-4 w-4" /> <span>Active Crons</span>
            </Link>
            <Link href="/dashboard/create" onClick={() => setIsOpen(false)} className={`flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-semibold ${isActive('/dashboard/create') ? "bg-[#9EE970] text-[#283711]" : "bg-[#EFEFEC]/60 hover:bg-[#EFEFEC]"}`}>
              <Clock className="h-4 w-4" /> <span>Schedule New Job</span>
            </Link>
            <Link href="/dashboard/runs" onClick={() => setIsOpen(false)} className={`flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-semibold ${isActive('/dashboard/runs') ? "bg-[#9EE970] text-[#283711]" : "bg-[#EFEFEC]/60 hover:bg-[#EFEFEC]"}`}>
              <PlayCircle className="h-4 w-4" /> <span>Runs</span>
            </Link>
          </nav>
        </div>

        <div className="space-y-1 mt-auto">
          <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className={`flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-semibold ${isActive('/dashboard/profile') ? "bg-[#9EE970] text-[#283711]" : "text-[#BDBDBB] hover:text-[#283711] hover:bg-[#EFEFEC]/60"}`}>
            <User className="h-4 w-4" /> <span>Account Profile</span>
          </Link>
          <button onClick={handleSignOut} className="flex items-center space-x-4 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#BDBDBB] hover:text-[#283711] hover:bg-[#EFEFEC]/60 w-full">
            <LogOut className="h-4 w-4" /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto p-6 md:p-0 md:pl-6 lg:pl-8 pt-28 md:pt-0">
        <div className="w-full min-h-full bg-white rounded-[32px] p-8 md:p-12 border border-[#EFEFEC]/50 shadow-[0_20px_50px_rgba(40,55,17,0.04)]">
          {children}
        </div>
      </main>
    </div>
  );
}