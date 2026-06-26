'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ];

  const faqs = [
    { 
      q: "How exact is the execution accuracy?", 
      a: "CRON.IO syncs over atomic clock networks ensuring internal drift never exceeds 15 milliseconds. Your automation loops hit their targets flawlessly right on time." 
    },
    { 
      q: "What happens if our target application goes down?", 
      a: "If your webhook endpoint reports a network issue, our resilience engine holds the payload safely in a localized fallback layer. We run automated retry steps across a 24-hour window with linear jitter delays to avoid overloading your stack." 
    },
    { 
      q: "Can we securely capture execution logs and metrics?", 
      a: "Absolutely. Response bodies, headers, round-trip processing times, and historical statuses are logged thoroughly. Traces can be evaluated directly from the visual interface or piped out automatically to standard cloud buckets." 
    },
    { 
      q: "Do you support standard cron expressions and formats?", 
      a: "Yes. Our engine natively parses Vixie cron, Quartz scheduler layouts, and standard five-field crontab parameters, alongside advanced sub-minute interval modifiers." 
    },
    { 
      q: "How are high-frequency tasks throttled?", 
      a: "We do not artificially throttle connections. Tasks run within isolated processing containers, allowing parallel threads to scale dynamically based on your workspace tier allotments." 
    },
    { 
      q: "Do you provide dedicated custom enterprise SLAs?", 
      a: "Yes. For platforms operating high-stakes production pipelines, we offer custom enterprise operational licenses backed by guaranteed 99.999% platform availability terms." 
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Stagger configurations for standard container cascade
  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 120, damping: 20 } 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB] text-[#4d4f51] antialiased font-body overflow-x-hidden">
        
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
          
          {/* Central Navigation Links with Slider Layout Sync */}
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

      {/* Main Core Section */}
      <main className="flex-grow pt-44 pb-32 max-w-[800px] w-full mx-auto px-6">
        
        <div className="mb-20 text-center select-none">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-6 block font-medium"
          >
            Engine Knowledge
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-heading text-4xl md:text-5xl lg:text-[4vw] lg:leading-[0.8] font-bold tracking-tighter text-[#4d4f51]"
          >
            Frequently Asked Questions
          </motion.h1>
        </div>

        {/* Accordion List Component with layoutId animation orchestration */}
        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="text-left space-y-4"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                layout="position"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="bg-white border border-[#C3C9B2]/30 rounded-[20px] p-6 shadow-sm cursor-pointer transition-colors duration-200 hover:border-[#C3C9B2]/60 group select-none"
              >
                <div className="flex justify-between items-center gap-6">
                  <h3 className="font-heading text-base md:text-lg font-bold text-[#4d4f51] group-hover:text-[#476800] transition-colors duration-200">
                    {faq.q}
                  </h3>
                  <motion.div 
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    className="w-8 h-8 rounded-xl bg-[#F7F9FB] flex items-center justify-center border border-[#C3C9B2]/20 text-[#476800] flex-shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </div>
                
                {/* Collapsible Panel using Framer Motion Auto-Height calculation */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: "auto", 
                        opacity: 1,
                        transition: { height: { type: "spring", stiffness: 220, damping: 26 }, opacity: { duration: 0.2, delay: 0.05 } }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: { height: { duration: 0.25, ease: "easeInOut" }, opacity: { duration: 0.15 } }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-[#ECEEF0]">
                        <p className="text-sm text-[#73777F] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

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