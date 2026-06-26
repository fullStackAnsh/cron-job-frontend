'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'motion/react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Define allowed routes where the mobile menu should strictly appear
  const allowedRoutes = ['/', '/about', '/faq', '/features', '/pricing'];

  // Guard clause: Do not render anything if the current path isn't in our allowed whitelist
  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  const menuLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
    { name: 'Sign In', href: '/login' },
    { name: 'Get Started', href: '/signup' },
  ];

  // Overlay Backdrop Animations
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  // Content Menu Card Wrapper Animations (With Staggered Child Setup)
  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 26,
        staggerChildren: 0.04,
        delayChildren: 0.05
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  // Individual Nav Items Stagger Targets
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 260, damping: 20 } 
    }
  };

  return (
    <div className="md:hidden">
      {/* Floating Hamburger Button Container */}
      <div className="fixed top-4 right-4 z-[100]">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl bg-[#F7F9FB]/80 backdrop-blur border border-[#C3C9B2]/30 text-[#191C1E] shadow-sm hover:bg-[#F7F9FB] transition-colors"
          aria-label="Open Menu"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      {/* Glassmorphism Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#F7F9FB]/60 backdrop-blur-xl"
          >
            
            {/* Close / Cross Button */}
            <motion.button
              onClick={() => setIsOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#191C1E]/5 text-[#191C1E] hover:bg-[#191C1E]/10 transition-colors"
              aria-label="Close Menu"
            >
              {/* Cross Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Fullscreen Vertical Navigation Links Stack */}
            <motion.nav 
              variants={menuVariants}
              className="flex flex-col items-center gap-4 w-full max-w-xs px-6"
            >
              {menuLinks.map((link) => {
                const isActive = pathname === link.href;
                const isActionBtn = link.href === '/signup';

                return (
                  <motion.div 
                    key={link.href}
                    variants={itemVariants} 
                    className="w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`w-full text-center py-3.5 px-6 rounded-xl font-medium tracking-wide transition-colors block ${
                        isActionBtn
                          ? 'bg-[#BEF264] text-[#4B6E00] font-bold shadow-sm'
                          : isActive
                          ? 'bg-[#191C1E]/10 text-[#191C1E] font-semibold'
                          : 'text-[#434938] hover:bg-[#191C1E]/5 hover:text-[#191C1E]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}