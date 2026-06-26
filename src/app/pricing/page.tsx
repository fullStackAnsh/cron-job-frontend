'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const pathname = usePathname();

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ];

  const plans = [
    {
      name: 'Hobby',
      desc: 'Perfect for side projects, testing scripts, and basic webhooks.',
      price: '0',
      period: 'forever',
      features: [
        'Up to 5,000 runs per month',
        'Clean 1-minute standard steps',
        '3 days of historical runtime logs',
        'Helpful community workspace support'
      ],
      cta: 'Start Free',
      href: '/signup',
      popular: false,
    },
    {
      name: 'Pro',
      desc: 'For growing production platforms requiring absolute reliability.',
      price: billingCycle === 'monthly' ? '29' : '24',
      period: 'per month',
      features: [
        'Up to 500,000 runs per month',
        'High-frequency sub-minute cycles',
        '30 days of clean historical data storage',
        'Smart auto-retry failure engine',
        'Direct priority team response support'
      ],
      cta: 'Upgrade to Pro',
      href: '/signup',
      popular: true,
    },
    {
      name: 'Enterprise',
      desc: 'Tailored specifically for critical company workloads and infrastructure.',
      price: 'Custom',
      period: 'tailored quotas',
      features: [
        'Unlimited monthly runs & data pools',
        'Uncapped zero-throttling channel limits',
        'Custom permanent log backups (S3/Cloud)',
        'Private Slack connect architecture channel',
        'Full compliance and validation framework package'
      ],
      cta: 'Contact Sales',
      href: '/login',
      popular: false,
    },
  ];

  // Motion Presets
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
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

      {/* Pricing Section Content Frame */}
      <main className="flex-grow pt-40 pb-24 max-w-[1120px] w-full mx-auto px-4 md:px-12 text-center">
        
        <div className="mb-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs text-[#476800] tracking-[0.2em] uppercase mb-4 block font-medium"
          >
            Predictable Scale
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="font-heading lg:text-[5vw] lg:leading-[0.8] text-4xl md:text-[54px] font-bold tracking-tight text-[#4d4f51] mb-4"
          >
            SIMPLE <br/>TRANSPARENT<br/> PRICING
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm md:text-base text-[#73777F] max-w-xl mx-auto leading-relaxed"
          >
            Pay only for what your tasks actually use. No complex cluster setup, node management, or unexpected hidden overage headaches.
          </motion.p>
        </div>

        {/* Dynamic Billing Switcher Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1 bg-[#ECEEF0] p-1 rounded-xl mb-16 border border-[#C3C9B2]/20 relative"
        >
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
              billingCycle === 'monthly' ? 'text-[#4d4f51]' : 'text-[#73777F] hover:text-[#4d4f51]'
            }`}
          >
            {billingCycle === 'monthly' && (
              <motion.span 
                layoutId="activeCycleBg"
                className="absolute inset-0 bg-white rounded-lg shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            Monthly
          </button>

          <button 
            onClick={() => setBillingCycle('annual')}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
              billingCycle === 'annual' ? 'text-[#476800]' : 'text-[#73777F] hover:text-[#4d4f51]'
            }`}
          >
            {billingCycle === 'annual' && (
              <motion.span 
                layoutId="activeCycleBg"
                className="absolute inset-0 bg-[#BEF264] rounded-lg shadow-sm z-[-1]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            Annual (-20%)
          </button>
        </motion.div>

        {/* Plan Cards Matrix Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch"
        >
          {plans.map((plan) => (
            <motion.div 
              key={plan.name} 
              variants={cardVariants}
              whileHover={{ 
                y: plan.popular ? -12 : -6,
                boxShadow: "0px 14px 34px rgba(67, 73, 56, 0.06)" 
              }}
              className={`p-8 rounded-[24px] bg-white border flex flex-col justify-between transition-shadow duration-300 relative ${
                plan.popular 
                  ? 'border-[#476800] shadow-md ring-1 ring-[#476800]/10 md:-translate-y-2' 
                  : 'border-[#C3C9B2]/30 shadow-sm'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 bg-[#BEF264] text-[#476800] font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#476800]/20">
                  Most Popular
                </span>
              )}
              
              <div>
                <h3 className="font-heading text-[22px] font-bold mb-2 text-[#4d4f51]">{plan.name}</h3>
                <p className="text-sm text-[#73777F] min-h-[44px] mb-6 leading-relaxed">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-8 border-b border-[#C3C9B2]/20 pb-6">
                  {plan.price !== 'Custom' && <span className="text-4xl font-bold tracking-tight text-[#4d4f51]">$</span>}
                  
                  {/* Fluid Price State Adjuster */}
                  <span className="text-4xl font-bold tracking-tight text-[#4d4f51] inline-block min-w-[50px]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={plan.price}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="inline-block"
                      >
                        {plan.price}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  
                  <span className="text-xs font-mono text-[#73777F] ml-1">/ {plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-[#73777F]">
                      <CheckCircle2 className="w-4 h-4 text-[#476800] mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link 
                  href={plan.href}
                  className={`w-full py-3 rounded-xl font-bold text-sm text-center block transition-all ${
                    plan.popular 
                      ? 'bg-[#BEF264] text-[#476800] hover:opacity-90 shadow-sm' 
                      : 'bg-[#4d4f51] text-white hover:bg-[#4d4f51]/90'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
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