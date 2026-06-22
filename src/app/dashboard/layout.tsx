'use client';
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Clock, ListOrdered, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Safely wait until component mounts to prevent SSR / Hydration mismatch errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // SSR Fallback matching desktop layout to prevent content layout shifts during hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <aside className="hidden md:flex w-64 border-r border-gray-200 bg-white p-6 flex-col justify-between">
          <div className="space-y-8">
            <h1 className="text-xl font-bold tracking-wider text-black">CRON.IO</h1>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 md:p-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile Sticky Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40 md:hidden">
        <h1 className="text-xl font-bold tracking-wider text-black">CRON.IO</h1>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 rounded-md hover:bg-gray-100 text-slate-900 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Sidebar Layout */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white p-6 flex flex-col justify-between z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:transform-none md:translate-x-0 md:z-auto
      `}>
        <div className="space-y-8">
          <div className="flex items-center justify-between md:block">
            <h1 className="text-xl font-bold tracking-wider text-black">CRON.IO</h1>
            {/* Close button for explicit mobile interaction */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 rounded-md hover:bg-gray-100 text-slate-900 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 rounded-md px-3 py-3 md:py-2 text-base md:text-sm font-medium text-slate-900 hover:bg-gray-100 transition-colors"
            >
              <ListOrdered className="h-5 w-5 md:h-4 md:w-4" /> <span>Active Crons</span>
            </Link>
            <Link 
              href="/dashboard/create" 
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 rounded-md px-3 py-3 md:py-2 text-base md:text-sm font-medium text-slate-900 hover:bg-gray-100 transition-colors"
            >
              <Clock className="h-5 w-5 md:h-4 md:w-4" /> <span>Schedule New Job</span>
            </Link>
          </nav>
        </div>

        <button 
          onClick={(e) => {
            setIsOpen(false);
            handleSignOut();
          }} 
          className="flex items-center space-x-3 rounded-md px-3 py-3 md:py-2 text-base md:text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-auto"
        >
          <LogOut className="h-5 w-5 md:h-4 md:w-4" /> <span>Logout</span>
        </button>
      </aside>

      {/* Main App Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 pt-20 md:pt-10 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}