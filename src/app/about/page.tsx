'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, Variants } from 'motion/react';
import { Eye, Waypoints } from 'lucide-react';

export default function AboutPage() {
  const pathname = usePathname();
  
  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ];

  // Motion Container Preset Configurations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 130, damping: 20 } 
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

      {/* Main Content Wrapper */}
      <main className="flex-grow pt-44 pb-24 max-w-[1120px] w-full mx-auto px-6 md:px-12">
        
        {/* Core Narrative / Story Section */}
        <div className="max-w-3xl mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-4 block font-medium"
          >
            Our Purpose
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-heading text-4xl md:text-[52px] font-bold tracking-tight text-[#4d4f51] mb-6 leading-[1.1]"
          >
            We build predictable pipelines for applications that cannot afford to drop signals.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base md:text-lg text-[#73777F] leading-relaxed"
          >
            CRON.IO was built out of pure development frustration. Traditional task schedulers are often treated as black boxes, leaving engineers blind when critical data transfers time out. We built a platform designed specifically around execution visibility, isolated processing paths, and absolute state clarity.
          </motion.p>
        </div>

        {/* Core Principles Grid with Viewport Triggered Cascade */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#C3C9B2]/30 pt-16"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#C3C9B2]/20 shadow-sm flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#476800]" />
            </div>
            <h3 className="font-mono text-xs text-[#476800] uppercase tracking-wider font-bold">
              01 / Full Observable Tracing
            </h3>
            <p className="text-sm text-[#73777F] leading-relaxed max-w-md">
              We never obscure system states. If an external system delays an automation link, you get immediate access to real-time execution logs, body records, and header data logs down to the millisecond.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#C3C9B2]/20 shadow-sm flex items-center justify-center">
              <Waypoints className="w-5 h-5 text-[#476800]" />
            </div>
            <h3 className="font-mono text-xs text-[#476800] uppercase tracking-wider font-bold">
              02 / Decoupled Network Safety
            </h3>
            <p className="text-sm text-[#73777F] leading-relaxed max-w-md">
              Heavy automated processes should never impact your principal application performance. By offloading job execution blocks to our secure network layers, your primary servers remain fast and reliable.
            </p>
          </motion.div>
        </motion.div>

        {/* Action Callout Panel Container Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="mt-24 bg-[#4d4f51] rounded-[32px] p-12 text-center text-white relative overflow-hidden shadow-lg"
        >
          {/* Subtle glowing layer effect matching the theme design guidelines */}
          <div className="absolute inset-0 bg-[#BEF264]/5 pointer-events-none" />
          
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Ready to secure your application architecture?
          </h2>
          <p className="text-sm text-[#ECEEF0]/80 max-w-md mx-auto mb-8 leading-relaxed">
            Configure your first automated webhook path in under 30 seconds with complete security.
          </p>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link 
              href="/signup" 
              className="bg-[#BEF264] text-[#476800] px-6 py-3 rounded-xl font-bold text-sm block shadow-sm transition-opacity hover:opacity-95"
            >
              Get Started Instantly
            </Link>
          </motion.div>
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