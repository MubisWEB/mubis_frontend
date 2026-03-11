import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sponsors = [
  {
    name: 'GM Financial',
    subtitle: 'Colombia',
    tagline: 'Impulsando el inventario de los concesionarios líderes.',
    gradient: 'linear-gradient(135deg, #003A8F 0%, #0056D6 100%)',
    layout: 'left-heavy', // logo big left, text right
  },
  {
    name: 'Interstate',
    subtitle: 'Batteries',
    tagline: 'Energía confiable para cada vehículo.',
    gradient: 'linear-gradient(135deg, #0B6B3A 0%, #0E8A4A 60%, #D4A017 100%)',
    layout: 'center-split', // centered logo, text below
  },
  {
    name: 'Renting',
    subtitle: 'Colombia',
    tagline: 'La movilidad empresarial más eficiente.',
    gradient: 'linear-gradient(135deg, #00BF6F 0%, #00A85D 50%, #008F4F 100%)',
    layout: 'right-heavy', // text left, logo right
  },
];

/* ---------- per-sponsor logo renderers ---------- */
function GMFinancialLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
        <span className="text-white font-black text-xl sm:text-2xl leading-none">GM</span>
      </div>
      <div className="text-left">
        <span className="text-white font-black text-base sm:text-lg tracking-tight block leading-tight">Financial</span>
        <span className="text-white/70 text-[10px] sm:text-xs font-medium tracking-widest uppercase">Colombia</span>
      </div>
    </div>
  );
}

function InterstateLogo() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-[#D4A017] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor">
            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
          </svg>
        </div>
        <span className="text-white font-black text-base sm:text-lg tracking-tight">Interstate</span>
      </div>
      <span className="text-[#D4A017] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">Batteries</span>
    </div>
  );
}

function RentingLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[18px] bg-white/20 backdrop-blur flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 17h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          <path d="M14 17h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z" />
          <path d="M3 21h18M3 7h4M12 12h6" />
        </svg>
      </div>
      <div className="text-left">
        <span className="text-white font-black text-base sm:text-lg tracking-tight block leading-tight">Renting</span>
        <span className="text-white/80 text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Colombia</span>
      </div>
    </div>
  );
}

const logoComponents = [GMFinancialLogo, InterstateLogo, RentingLogo];

/* ---------- layout renderers ---------- */
function LayoutLeftHeavy({ sponsor, Logo, index }) {
  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 px-8 sm:px-12 py-5 sm:py-0 sm:h-[180px]">
      <div className="flex-shrink-0"><Logo /></div>
      <div className="h-8 w-px bg-white/20 hidden sm:block" />
      <p className="flex-1 text-white/90 text-sm sm:text-base font-medium text-center sm:text-left leading-snug">
        {sponsor.tagline}
      </p>
      <CTAButton />
    </div>
  );
}

function LayoutCenterSplit({ sponsor, Logo }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-8 sm:px-12 py-5 sm:py-0 sm:h-[180px]">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 w-full">
        <CTAButton align="left" className="hidden sm:block order-first" />
        <div className="flex flex-col items-center gap-1 flex-1">
          <Logo />
          <p className="text-white/85 text-xs sm:text-sm font-medium text-center leading-snug mt-1">
            {sponsor.tagline}
          </p>
        </div>
        <CTAButton className="sm:hidden mt-1" />
        <CTAButton align="right" className="hidden sm:block" />
      </div>
    </div>
  );
}

function LayoutRightHeavy({ sponsor, Logo }) {
  return (
    <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-6 px-6 sm:px-8 py-5 sm:py-0 sm:h-[100px]">
      <CTAButton />
      <p className="flex-1 text-white/90 text-sm sm:text-base font-medium text-center sm:text-right leading-snug">
        {sponsor.tagline}
      </p>
      <div className="h-8 w-px bg-white/20 hidden sm:block" />
      <div className="flex-shrink-0"><Logo /></div>
    </div>
  );
}

function CTAButton({ className = '', align }) {
  return (
    <button
      className={`flex-shrink-0 rounded-[18px] px-5 py-2 text-xs sm:text-sm font-semibold transition-colors ${className}`}
      style={{
        background: 'rgba(255,255,255,0.2)',
        color: '#fff',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
    >
      Conocer más
    </button>
  );
}

const layouts = { 'left-heavy': LayoutLeftHeavy, 'center-split': LayoutCenterSplit, 'right-heavy': LayoutRightHeavy };

/* ---------- main component ---------- */
export default function SponsorBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(p => (p + 1) % sponsors.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const sponsor = sponsors[index];
  const LayoutComponent = layouts[sponsor.layout];
  const Logo = logoComponents[index];

  /* rearview-mirror clip path: wide horizontal oval, slightly narrower at edges */
  const mirrorClip = 'ellipse(50% 50% at 50% 50%)';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-4 mb-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden hover:brightness-105 transition-all duration-300"
            style={{
              background: sponsor.gradient,
              borderRadius: '18px',
              height: '100px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            {/* Light sweep */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'sponsorSweep 3s ease-in-out infinite',
              }}
            />

            {/* Glass edge reflection */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)',
              }}
            />

            <LayoutComponent sponsor={sponsor} Logo={Logo} index={index} />
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes sponsorSweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
