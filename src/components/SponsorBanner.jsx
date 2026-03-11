import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sponsors = [
  {
    name: 'GM Financial Colombia',
    tagline: 'Impulsando el inventario de los concesionarios líderes.',
    gradient: 'linear-gradient(135deg, #003A8F 0%, #0056D6 100%)',
    accent: '#4A90D9',
  },
  {
    name: 'Interstate Batteries',
    tagline: 'Energía confiable para cada vehículo.',
    gradient: 'linear-gradient(135deg, #0B6B3A 0%, #0E8A4A 60%, #D4A017 100%)',
    accent: '#D4A017',
  },
  {
    name: 'Renting Colombia',
    tagline: 'La movilidad empresarial más eficiente.',
    gradient: 'linear-gradient(135deg, #F36F21 0%, #F9A825 100%)',
    accent: '#FFFFFF',
  },
];

export default function SponsorBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(p => (p + 1) % sponsors.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const sponsor = sponsors[index];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden shadow-md hover:brightness-105 transition-all duration-300"
            style={{
              background: sponsor.gradient,
              borderRadius: '22px',
              minHeight: '96px',
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

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 sm:px-8 py-5 md:py-0 md:h-[100px] gap-3 md:gap-6">
              {/* Logo / Name */}
              <div className="flex-shrink-0 text-center md:text-left">
                <span className="text-white font-black text-lg sm:text-xl tracking-tight">
                  {sponsor.name}
                </span>
              </div>

              {/* Tagline */}
              <p className="flex-1 text-white/90 text-sm sm:text-base font-medium text-center leading-snug">
                {sponsor.tagline}
              </p>

              {/* CTA */}
              <button
                className="flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors"
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
            </div>
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
