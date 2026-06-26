'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, Variants } from 'motion/react';
import { Radio, Cpu, HardDrive, Lock, CheckCircle2 } from 'lucide-react';

export default function FeaturesPage() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ];

  const technicalSpecs = [
    { 
      icon: <Cpu className="w-5 h-5 text-[#476800]" />,
      title: "Isolated Execution Paths", 
      desc: "Every automated trigger runs inside its own secure, sandboxed container layer to remove interference or data slowdowns from unexpected peak traffic spikes." 
    },
    { 
      icon: <HardDrive className="w-5 h-5 text-[#476800]" />,
      title: "Multi-Region Redundancy", 
      desc: "Distributed cloud infrastructure architecture prevents double-firing or skipped intervals, guaranteeing total stability even during regional system issues." 
    },
    { 
      icon: <Lock className="w-5 h-5 text-[#476800]" />,
      title: "Encrypted Webhook Handshakes", 
      desc: "Secure your endpoints natively with outbound cryptographic signature validation to verify data streams strictly belong to trusted processes." 
    },
  ];

  // Animation Variant Presets
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 120, damping: 18 } 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] text-[#191C1E] antialiased font-body overflow-x-hidden">
      
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
            className="font-heading text-2xl font-bold tracking-tighter text-[#4d4f51] hover:opacity-80 transition-opacity"
          >
            CRON.IO
          </Link>
          
          {/* Central Navigation Links with Layout ID Animation Sliders */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors py-1 ${
                    isActive 
                      ? 'text-[#4d4f51]' 
                      : 'text-[#878a82] hover:text-[#476800]'
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

      {/* Main Content Area */}
      <main className="flex-grow pt-40 pb-24">
        
        {/* Intro Hero Header */}
        <section className="max-w-[1120px] mx-auto px-4 md:px-12 text-center pb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-4 block font-medium"
          >
            Core Capabilities
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-heading lg:text-[5vw] lg:leading-[0.8] text-4xl md:text-[54px] font-bold tracking-tight text-[#4d4f51] max-w-5xl mx-auto mb-6 leading-[1.1]"
          >
            EVERY YOU NEED TO RUN PROCESSES WITH COMPLETE CERTAINTY.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm md:text-base text-[#73777F] max-w-2xl mx-auto leading-relaxed"
          >
            Forget maintaining complex local task managers or troubleshooting opaque system logs. Manage your critical web connections inside a clean cloud visual framework designed around execution security.
          </motion.p>
        </section>

        {/* Feature Section 1: Interactive Split View */}
        <section className="bg-white border-y border-[#C3C9B2]/20 py-24">
          <div className="max-w-[1120px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:col-span-6"
            >
              <div className="w-10 h-10 rounded-xl bg-[#BEF264]/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#476800]" />
              </div>
              <h2 className="font-heading text-3xl font-bold lg:text-[3vw] lg:leading-[0.9] tracking-tight text-[#4d4f51]">
                SMART PATH ROUTING AND LOCALIZED FAILOVER.
              </h2>
              <p className="text-sm text-[#73777F] leading-relaxed">
                When destination APIs encounter brief connection timeouts, our automated pipeline safely shields the interaction. The platform pauses and runs specialized step-by-step retry formulas to prevent system crashes across your application database.
              </p>
              
              <div className="pt-4 space-y-3">
                <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm text-[#73777F]">
                  <CheckCircle2 className="w-4 h-4 text-[#476800] flex-shrink-0" />
                  <span>Automatic exponential network delay intervals</span>
                </motion.div>
                <motion.div whileHover={{ x: 3 }} className="flex items-center gap-3 text-sm text-[#73777F]">
                  <CheckCircle2 className="w-4 h-4 text-[#476800] flex-shrink-0" />
                  <span>Real-time fallback path switching mechanics</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Simulated Live Interface Panel with Scroll triggered floating interaction */}
            <motion.div 
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-6 bg-[#F7F9FB] border border-[#C3C9B2]/30 rounded-[24px] p-6 font-mono text-xs text-[#535848] flex flex-col justify-between shadow-sm min-h-[260px]"
            >
              <div className="space-y-1.5">
                <div className="text-[#476800] mb-3 font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#476800] animate-ping" />
                  // PATH TELEMETRY REPORT
                </div>
                <div className="opacity-70">[STATUS] 503 Server Busy — Delay Handled</div>
                <div className="opacity-70">[RETRY #1] Commencing step recovery window...</div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 inline-block"
                >
                  [RECOVERY] Injecting safety path mutation buffer
                </motion.div>
              </div>
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="p-3 bg-[#BEF264]/20 rounded-xl text-[#476800] border border-[#476800]/20 font-bold mt-4 flex items-center gap-2"
              >
                <span>✓</span> Target server connected successfully on fallback pass.
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* Deep Specs Grid Section */}
        <section className="py-24 max-w-[1120px] mx-auto px-4 md:px-12">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-2 block font-medium">Under The Hood</span>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-[4vw] lg:leading-[0.9] font-bold text-[#4d4f51]">
              ENGINEERED FOR ABSOLUTE INFRASTRUCTURE RESILIENCE.
            </h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {technicalSpecs.map((spec) => (
              <motion.div 
                key={spec.title} 
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: "0px 12px 30px rgba(71, 104, 0, 0.05)" }}
                className="p-8 rounded-[24px] bg-white border border-[#C3C9B2]/30 shadow-sm flex flex-col justify-between transition-shadow duration-300"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F7F9FB] border border-[#C3C9B2]/20 flex items-center justify-center mb-6">
                    {spec.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-3 text-[#4d4f51]">{spec.title}</h3>
                  <p className="text-sm text-[#73777F] leading-relaxed">{spec.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>

      {/* Footer Element */}
      <footer className="bg-[#F7F9FB] border-t border-[#C3C9B2]/30 w-full py-10 mt-auto">
        <div className="max-w-[1120px] mx-auto px-4 md:px-12 flex flex-col items-center justify-center gap-4 text-center text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[#434938]/70">
            <Link href="/" className="font-heading font-bold tracking-tighter text-[#4d4f51] text-sm hover:opacity-80 transition-opacity">
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