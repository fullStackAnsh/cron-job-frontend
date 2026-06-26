'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { Clock, Globe, Settings, Shield, BarChart3, Binary, Bell, Terminal, CheckCircle2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ];

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

  // Explicitly typing variants solves the strict index signature error
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.2 
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 150, 
        damping: 20 
      } 
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FB]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-6 w-32 animate-pulse rounded-full bg-[#ECEEF0]" />
          <div className="h-2 w-48 animate-pulse rounded-full bg-[#ECEEF0]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] text-[#191C1E] selection:bg-[#BEF264] antialiased font-body overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full bg-[#F7F9FB]/80 backdrop-blur-md border-b border-[#C3C9B2]/30 z-50 transition-all duration-300"
      >
        <div className="flex justify-between items-center max-w-[1120px] mx-auto px-4 md:px-12 py-4">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="font-heading text-2xl font-bold tracking-tighter text-[#191C1E] hover:opacity-80 transition-opacity"
          >
            CRON.IO
          </Link>
          
          {/* Central Dynamic Navigation Links (Aceternity LayoutId Slider) */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors py-1 ${
                    isActive ? 'text-[#191C1E]' : 'text-[#878a82] hover:text-[#476800]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[#476800] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="lg:flex hidden items-center gap-4">
            <Link 
              href="/login" 
              className="text-[#888b83] font-medium hover:text-[#476800] transition-colors text-sm"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link 
                href="/signup" 
                className="bg-[#BEF264] text-[#535848] px-5 py-2.5 rounded-lg font-bold shadow-sm text-sm block"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

        </div>
      </motion.nav>

      {/* Main Container Wrapper */}
      <main className="flex-grow">
        
        {/* Hero Core Segment */}
        <section className="pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-[1120px] mx-auto px-4 md:px-12 flex flex-col items-center text-center"
          >
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-[#BEF264]/20 border border-[#476800]/20 px-3 py-1 rounded-full mb-8 cursor-default"
            >
              <span className="text-[14px] text-[#476800]">⚡</span>
              <span className="font-mono text-[12px] text-[#476800] uppercase tracking-widest font-medium">Next-Gen Scheduler Engine</span>
            </motion.div>

            <h1 className="font-heading text-4xl md:text-[64px] md:leading-[1.05] lg:text-[6vw] font-bold -tracking-tighter lg:leading-[0.8] md:[word-spacing:-0.05em] max-w-4xl mb-6 text-[#4d4f51]">
              ORCHESTRATE <br/>END TO END<br /> JOB SCOPES.
            </h1>
            
            <p className="text-base text-[#929391] max-w-2xl mb-12 opacity-90 leading-relaxed">
              The premium scheduling platform built for modern teams. Monitor execution in real time, prevent failures before they happen, and keep your infrastructure running flawlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center max-w-md">
              <motion.div className="flex-1" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/signup" 
                  className="block bg-[#BEF264] text-[#4B6E00] px-8 py-4 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-[#476800]/10 transition-shadow text-center"
                >
                  Create Account
                </Link>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/login" 
                  className="bg-[#191C1E] text-[#F7F9FB] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#191C1E]/90 transition-all flex items-center justify-center gap-3 w-full"
                >
                  Launch Terminal
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Grid Highlights Section (Bento Style with Smooth Scroll Reveals) */}
        <section id="features" className="py-24 bg-white border-t border-[#C3C9B2]/20 font-body">
          <div className="max-w-[1120px] mx-auto px-4 md:px-12">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <span className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-4 block font-medium">Engine Highlights</span>
              <h2 className="font-heading text-3xl md:text-[40px] lg:text-[4vw] lg:leading-[0.9] max-w-2xl text-[#4d4f51] font-bold leading-tight">
                Built for tasks that simply cannot fail.
              </h2>
            </motion.div>

            {/* Bento Grid with staggered scroll loading */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* Box 1: Core Scheduling */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-8 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Clock className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[22px] font-bold mb-3 text-[#4d4f51]">Flexible Time Configuration</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed max-w-xl">
                    Set up automation loops your way. Fully supports standard crontab expressions, sub-minute intervals, or simple manual inputs without requiring deep terminal knowledge.
                  </p>
                </div>
              </motion.div>

              {/* Box 2: Timezone */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-4 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Globe className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Global Time Adaptability</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Align schedules dynamically with your workspace or system timezone effortlessly.
                  </p>
                </div>
              </motion.div>

              {/* Box 3: HTTP Customization */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-6 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Settings className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Tailored HTTP Requests & Headers</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Choose any request format (GET, POST, PATCH) and attach personalized headers for seamless auth token management and flawless delivery across your server architecture.
                  </p>
                </div>
              </motion.div>

              {/* Box 4: Autoretries & Failsafe */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-6 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Shield className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Smart Resilience & Timeouts</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Endpoints down? Localized backoff strategies immediately handle failing servers while customizable timeouts guarantee heavy jobs never stall your system flow.
                  </p>
                </div>
              </motion.div>

              {/* Box 5: Deep Telemetry */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-4 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <BarChart3 className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Isolated Error Logging</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Never lose trace of errors. Historical failure logs are saved independently, meaning future successful cycles will never overwrite critical debugging data.
                  </p>
                </div>
              </motion.div>

              {/* Box 6: Intelligent Tracking */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-8 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Binary className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[22px] font-bold mb-3 text-[#4d4f51]">Prediction Engines & Smart Validation</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed max-w-xl">
                    See into your future queue with built-in runtime prediction logs. Combine it with regex pattern matching to screen incoming script results and confirm perfect outcomes.
                  </p>
                </div>
              </motion.div>

              {/* Box 7: Webhooks & Alerts */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-6 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Bell className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Pristine Alerts & Webhooks</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Receive clean emails or hook instant alerts straight into Slack and third-party tools whenever workflows run or encounters hit a snag.
                  </p>
                </div>
              </motion.div>

              {/* Box 8: Zero Install */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(71, 104, 0, 0.04)" }}
                className="p-8 rounded-[24px] bg-[#F7F9FB] border border-[#C3C9B2]/30 flex flex-col justify-between md:col-span-6 transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center mb-6">
                    <Terminal className="w-5 h-5 text-[#476800]" />
                  </div>
                  <h3 className="font-heading text-[20px] font-bold mb-3 text-[#4d4f51]">Developer API & Cloud Panel</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">
                    Zero installations or infrastructure maintenance required. Build pipelines programmatically via a comprehensive developer-first API and a sleek web browser dashboard.
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Infrastructure Split Section */}
        <section className="py-24 overflow-hidden bg-[#F7F9FB]/50 border-t border-[#C3C9B2]/20 font-body">
          <div className="max-w-[1120px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-16 lg:gap-24">
            
            {/* Left Column: Copywriting */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-10 lg:col-span-7 order-2 lg:order-1"
            >
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase block font-medium">Enterprise Foundation</span>
                <h2 className="font-heading text-3xl md:text-[40px] font-bold text-[#4d4f51] leading-[1.15] tracking-tight">
                  Precision-grade infrastructure for modern, serious engineering.
                </h2>
                <p className="text-sm text-[#73777F] leading-relaxed max-w-xl">
                  We built CRON.IO because generic job schedulers lack the real-time observability required for high-stakes financial calculations, heavy data synchronization, and absolute reliability.
                </p>
              </div>

              {/* Grid Checkmarks Micro-interactions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { title: "State Verification", desc: "Validate payload integrity before any job thread triggers execution." },
                  { title: "Zero-Config Webhooks", desc: "Plug securely into your current applications in less than 30 seconds flat." },
                  { title: "Concurrency Locks", desc: "Prevent overlapping job attempts and handle multiple database queues without collisions." },
                  { title: "Payload Cryptography", desc: "Secure data signing ensures endpoints only process validated triggers from us." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ x: 4 }} 
                    className="flex gap-3 items-start group cursor-default"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#476800] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="font-bold text-sm text-[#4d4f51] mb-1 group-hover:text-[#476800] transition-colors">{item.title}</h4>
                      <p className="text-xs text-[#73777F] leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right Column: Premium Interactive Chart Display */}
            <motion.div 
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-5 order-1 lg:order-2 w-full"
            >
              <div className="aspect-[4/3] sm:aspect-square rounded-[32px] overflow-hidden bg-[#E6E8EA] relative border border-[#C3C9B2]/30 flex items-center justify-center p-8 transition-transform hover:scale-[1.01] duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#ECEEF0] via-[#F2F4F6] to-white opacity-80" />
                <div className="absolute top-12 right-12 w-48 h-48 bg-[#BEF264]/10 rounded-full blur-3xl" />
                
                {/* Floating System Uptime Card Panel with Spring Entry */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="relative p-6 bg-white/95 backdrop-blur rounded-2xl border border-[#C3C9B2]/30 shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-w-xs w-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-mono font-bold text-[#476800] tracking-wider uppercase">System Live Uptime</div>
                    <span className="flex h-2 w-2 rounded-full bg-[#476800] animate-pulse" />
                  </div>
                  <div className="font-heading text-4xl font-bold text-[#4d4f51] tracking-tighter">99.999%</div>
                  
                  {/* Staggered Interactive Histogram Bars */}
                  <div className="mt-5 flex items-end gap-1.5 h-10">
                    {[60, 85, 70, 95, 40, 100, 90, 95].map((height, index) => (
                      <motion.div 
                        key={index}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + (index * 0.05), type: "spring", stiffness: 80 }}
                        className={`w-full rounded-sm ${height < 50 ? 'bg-[#ECEEF0]' : 'bg-[#BEF264]'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>
      </main>

      {/* Aligned Footer Element */}
      <footer className="bg-[#F7F9FB] border-t border-[#C3C9B2]/30 w-full py-10 mt-auto">
        <div className="max-w-[1120px] mx-auto px-4 md:px-12 flex flex-col items-center justify-center gap-4 text-center text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[#434938]/70">
            <Link href="/" className="font-heading font-bold tracking-tighter text-[#191C1E] text-sm hover:opacity-80 transition-opacity">
              CRON.IO
            </Link>
            <span className="hidden sm:inline text-[#C3C9B2]/60">|</span>
            <span className="font-mono">&copy; 2026 Engine. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}