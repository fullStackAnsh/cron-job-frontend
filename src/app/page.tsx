'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-32 animate-pulse rounded-full bg-[#ECEEF0]" />
          <div className="h-2 w-48 animate-pulse rounded-full bg-[#ECEEF0]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] text-[#191C1E] selection:bg-[#BEF264] antialiased">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full bg-[#F7F9FB]/80 backdrop-blur-md border-b border-[#C3C9B2]/30 z-50 transition-all duration-300">
        <div className="flex justify-between items-center max-w-[1120px] mx-auto px-4 md:px-12 py-4">
          <div className="text-2xl font-bold tracking-tighter text-[#191C1E]">
            CRON.IO
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-[#434938] font-medium hover:text-[#476800] transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-[#BEF264] text-[#4B6E00] px-5 py-2.5 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Core Segment */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden relative">
        <div className="relative z-10 max-w-[1120px] mx-auto px-4 md:px-12 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 bg-[#BEF264]/20 border border-[#476800]/20 px-3 py-1 rounded-full mb-8">
            <span className="text-[14px] text-[#476800]">⚡</span>
            <span className="font-mono text-[12px] text-[#476800] uppercase tracking-widest font-medium">Next-Gen Scheduler Engine</span>
          </div>

          <h1 className="text-4xl md:text-[56px] md:leading-[1.1] font-bold tracking-tight max-w-4xl mb-6 text-[#191C1E]">
            Establish automated job scopes across your stack with absolute runtime certainty.
          </h1>
          
          <p className="text-base text-[#434938] max-w-2xl mb-12 opacity-90 leading-relaxed">
            High-performance distributed cron platform tailored for modern infrastructure. Track logs, verify state payloads, and failover instantly with clean webhook routing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center max-w-md">
            <Link 
              href="/signup" 
              className="bg-[#BEF264] text-[#4B6E00] px-8 py-4 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-[#476800]/10 transition-all active:scale-95 text-center flex-1"
            >
              Create Free Account
            </Link>
            <Link 
              href="/login" 
              className="bg-[#191C1E] text-[#F7F9FB] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#191C1E]/90 transition-all flex items-center justify-center gap-3 flex-1"
            >
              <span>⚙️</span> Launch Terminal
            </Link>
          </div>

          {/* Precision Code Preview Window */}
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-[#C3C9B2]/30 overflow-hidden shadow-md">
            <div className="bg-[#E6E8EA] px-4 py-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#BA1A1A]/20 border border-[#BA1A1A]/30"></div>
                <div className="w-3 h-3 rounded-full bg-[#BEF264] border border-[#476800]/30"></div>
                <div className="w-3 h-3 rounded-full bg-[#BEC6E0] border border-[#565E74]/30"></div>
              </div>
              <div className="font-mono text-xs text-[#434938]/80">scheduler_instance.config</div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#BEF264] rounded-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4B6E00] animate-pulse"></div>
                <span className="font-mono text-[10px] font-bold text-[#4B6E00]">LIVE METRICS</span>
              </div>
            </div>
            <div className="p-6 sm:p-8 text-left font-mono text-sm leading-relaxed overflow-x-auto bg-[#FFFFFF]">
              <div className="text-[#434938]/50 mb-2">// Global scope synchronization active</div>
              <div className="flex gap-4">
                <span className="text-[#434938]/30 select-none w-4">1</span>
                <span><span className="text-[#476800] font-medium">const</span> cluster = <span className="text-[#476800] font-medium">await</span> Cron.<span className="text-[#565E74]">establishScope</span>(<span className="text-[#476800]">'production_worker_node'</span>);</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#434938]/30 select-none w-4">2</span>
                <span>cluster.<span className="text-[#565E74]">onEvent</span>(<span className="text-[#476800]">'0 */5 * * *'</span>, <span className="text-[#476800] font-medium">async</span> () =&gt; &#123;</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#434938]/30 select-none w-4">3</span>
                <span className="pl-4">console.<span className="text-[#565E74]">log</span>(<span className="text-[#476800]">'Triggering data sync routines...'</span>);</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#434938]/30 select-none w-4">4</span>
                <span className="pl-4"><span className="text-[#476800] font-medium">await</span> cluster.<span className="text-[#565E74]">dispatchPayload</span>(&#123; status: <span className="text-[#476800]">'synchronized'</span> &#125;);</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#434938]/30 select-none w-4">5</span>
                <span>&#125;);</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Grid Highlights Section */}
      <section id="features" className="py-24 bg-white border-t border-[#C3C9B2]/20">
        <div className="max-w-[1120px] mx-auto px-4 md:px-12">
          <div className="mb-16">
            <span className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-4 block font-medium">Engine Highlights</span>
            <h2 className="text-3xl md:text-[40px] max-w-2xl text-[#191C1E] font-bold leading-tight">
              Engineered for workflows that can never drop an execution context.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 */}
            <div className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                <span className="text-xl text-[#476800]">⏱️</span>
              </div>
              <h3 className="text-[20px] font-bold mb-3 text-[#191C1E]">Sub-Minute Intervals</h3>
              <p className="text-sm text-[#434938] opacity-80 leading-relaxed">
                Break out of standard crontab boundaries. Trigger automation loops at tight millisecond or second steps flawlessly.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                <span className="text-xl text-[#476800]">🛡️</span>
              </div>
              <h3 className="text-[20px] font-bold mb-3 text-[#191C1E]">Smart Auto-Retry</h3>
              <p className="text-sm text-[#434938] opacity-80 leading-relaxed">
                Endpoints down? Cron.io executes localized backoff mechanics to queue and safely redeploy payloads without state conflicts.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                <span className="text-xl text-[#476800]">📊</span>
              </div>
              <h3 className="text-[20px] font-bold mb-3 text-[#191C1E]">Deep Telemetry Analytics</h3>
              <p className="text-sm text-[#434938] opacity-80 leading-relaxed">
                Clean visibility over every runtime cycle. Instant trace logs down to headers, body outputs, and round-trip times.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Infrastructure Split Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-[1120px] mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 order-2 md:order-1">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[#191C1E]">Precision-grade infrastructure for serious engineering.</h2>
              <p className="text-[#434938] opacity-90 leading-relaxed max-w-lg">
                We built CRON.IO because generic job schedulers lack the observability required for high-stakes financial and data synchronization pipelines.
              </p>
            </div>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#BEF264] flex items-center justify-center flex-shrink-0 text-[10px] text-[#4B6E00] font-bold">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[#191C1E] block mb-1">State Verification</span>
                  <p className="text-sm text-[#434938]/80">Validate every payload before execution begins.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#BEF264] flex items-center justify-center flex-shrink-0 text-[10px] text-[#4B6E00] font-bold">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-[#191C1E] block mb-1">Zero-Config Webhooks</span>
                  <p className="text-sm text-[#434938]/80">Integrate with your stack in under 30 seconds.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex-1 order-1 md:order-2 w-full">
            <div className="aspect-square rounded-[32px] overflow-hidden bg-[#E6E8EA] relative border border-[#C3C9B2]/30 flex items-center justify-center p-8">
              {/* Minimalist Graphic Element Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ECEEF0] to-[#F2F4F6]" />
              
              <div className="absolute bottom-8 left-8 p-6 bg-white/90 backdrop-blur rounded-2xl border border-[#C3C9B2]/30 shadow-xl max-w-xs z-10">
                <div className="text-[10px] font-mono font-bold text-[#476800] mb-2 tracking-wider">SYSTEM UPTIME</div>
                <div className="text-3xl font-bold text-[#191C1E] tracking-tighter">99.999%</div>
                <div className="mt-4 flex gap-1">
                  <div className="h-8 w-1.5 bg-[#BEF264] rounded-full"></div>
                  <div className="h-8 w-1.5 bg-[#BEF264] rounded-full"></div>
                  <div className="h-8 w-1.5 bg-[#BEF264] rounded-full"></div>
                  <div className="h-8 w-1.5 bg-[#ECEEF0] rounded-full"></div>
                  <div className="h-8 w-1.5 bg-[#BEF264] rounded-full"></div>
                  <div className="h-8 w-1.5 bg-[#BEF264] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Footer */}
      <footer className="bg-[#F7F9FB] border-t border-[#C3C9B2]/30 w-full py-12">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1120px] mx-auto px-4 md:px-12 gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-lg font-bold text-[#191C1E]">CRON.IO</div>
            <p className="text-xs text-[#434938]/70 max-w-xs text-center md:text-left">
              Professional grade scheduling for distributed systems. Built for the modern architect.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a className="text-[#565E74] hover:text-[#476800] underline transition-all" href="#">Status</a>
            <a className="text-[#565E74] hover:text-[#476800] underline transition-all" href="#">API</a>
            <a className="text-[#565E74] hover:text-[#476800] underline transition-all" href="#">Security</a>
            <a className="text-[#565E74] hover:text-[#476800] underline transition-all" href="#">Privacy</a>
            <a className="text-[#565E74] hover:text-[#476800] underline transition-all" href="#">Terms</a>
          </div>
          <div className="text-xs text-[#434938]/60">
            © 2026 CRON.IO Engine. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}