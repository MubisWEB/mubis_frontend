import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Shield, Clock, DollarSign, Users } from 'lucide-react';
import { bannersApi } from '@/api/services';

// Fallback banners (hardcoded) used when no banners from API
const Banner1 = () => (
  <div className="w-full h-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-between px-6 sm:px-10 lg:px-16">
    <div className="flex-1">
      <p className="text-violet-200 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">Plataforma líder en Colombia</p>
      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight">Subastas que mueven<br />el mercado automotriz</h3>
    </div>
    <div className="hidden sm:flex items-center gap-3">
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
        <Gavel className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold">+500 subastas</div>
        <div className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold">+120 Dealers</div>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-40 h-full opacity-10">
      <svg viewBox="0 0 200 100" className="w-full h-full"><circle cx="180" cy="10" r="80" fill="white"/><circle cx="140" cy="90" r="50" fill="white"/></svg>
    </div>
  </div>
);

const Banner2 = () => (
  <div className="w-full h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-between px-6 sm:px-10 lg:px-16">
    <div className="hidden sm:flex items-center gap-4">
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
        <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
      </div>
      <div className="text-white">
        <p className="text-5xl lg:text-6xl font-black leading-none">100</p>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">puntos</p>
      </div>
    </div>
    <div className="flex-1 sm:text-right">
      <p className="text-emerald-200 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">Peritaje certificado</p>
      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight">Cada vehículo, verificado<br />al máximo detalle</h3>
    </div>
    <div className="absolute bottom-0 left-0 w-60 h-full opacity-5">
      <svg viewBox="0 0 240 100" className="w-full h-full"><rect x="10" y="20" width="60" height="60" rx="12" fill="white"/><rect x="80" y="40" width="40" height="40" rx="8" fill="white"/><rect x="130" y="10" width="70" height="70" rx="14" fill="white"/></svg>
    </div>
  </div>
);

const Banner3 = () => (
  <div className="w-full h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-between px-6 sm:px-10 lg:px-16">
    <div className="flex-1">
      <p className="text-orange-100 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">Rapidez garantizada</p>
      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight">Cierre de venta<br />en solo 96 horas</h3>
    </div>
    <div className="hidden sm:flex items-center gap-4">
      <div className="flex gap-2">
        {['4', 'días'].map((text, i) => (
          <div key={i} className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className={`text-white ${i === 0 ? 'text-3xl lg:text-4xl font-black' : 'text-xs font-bold uppercase'}`}>{text}</span>
          </div>
        ))}
      </div>
      <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-white/80" />
    </div>
    <div className="absolute top-0 left-1/2 w-40 h-full opacity-10">
      <svg viewBox="0 0 160 100" className="w-full h-full"><polygon points="80,5 155,95 5,95" fill="white"/></svg>
    </div>
  </div>
);

const Banner4 = () => (
  <div className="w-full h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-between px-6 sm:px-10 lg:px-16">
    <div className="hidden sm:flex items-center gap-3">
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
        <DollarSign className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-300" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="line-through text-white/40 text-sm font-bold">Comisión 3%</span>
        <span className="text-emerald-300 text-xl lg:text-2xl font-black">$0 comisión</span>
      </div>
    </div>
    <div className="flex-1 sm:text-right">
      <p className="text-blue-200 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">Para compradores</p>
      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight">Compra sin comisión,<br />solo buenos precios</h3>
    </div>
  </div>
);

const Banner5 = () => (
  <div className="w-full h-full bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 flex items-center justify-between px-6 sm:px-10 lg:px-16">
    <div className="flex-1">
      <p className="text-rose-200 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">Red exclusiva</p>
      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight">Dealers y Recompradores<br />conectados en un solo lugar</h3>
    </div>
    <div className="hidden sm:flex items-center gap-3">
      <Users className="w-10 h-10 lg:w-12 lg:h-12 text-white/80" />
      <div className="flex flex-col gap-2">
        <div className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold">Dealers verificados</div>
        <div className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold">Subastas privadas</div>
      </div>
    </div>
    <div className="absolute top-0 right-10 w-32 h-full opacity-10">
      <svg viewBox="0 0 120 100" className="w-full h-full"><circle cx="30" cy="30" r="25" fill="white"/><circle cx="90" cy="30" r="25" fill="white"/><circle cx="60" cy="75" r="30" fill="white"/></svg>
    </div>
  </div>
);

const fallbackBanners = [Banner1, Banner2, Banner3, Banner4, Banner5];

export default function SponsorBanner() {
  const [index, setIndex] = useState(0);
  const [apiBanners, setApiBanners] = useState(null); // null = loading

  useEffect(() => {
    bannersApi.getActive()
      .then(data => setApiBanners(Array.isArray(data) && data.length > 0 ? data : []))
      .catch(() => setApiBanners([]));
  }, []);

  const useApi = apiBanners && apiBanners.length > 0;
  const count = useApi ? apiBanners.length : fallbackBanners.length;
  const safeIndex = index % count;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(p => (p + 1) % count);
    }, 5000);
    return () => clearInterval(timer);
  }, [count]);

  const FallbackBanner = fallbackBanners[safeIndex];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
      <div className="relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: '970 / 150' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {useApi ? (
              <div
                className="w-full h-full relative flex items-center justify-between px-6 sm:px-10 lg:px-16"
                style={{
                  background: `linear-gradient(to right, var(--tw-gradient-from, #7c3aed), var(--tw-gradient-to, #9333ea))`,
                }}
                onClick={() => apiBanners[safeIndex].linkUrl && window.open(apiBanners[safeIndex].linkUrl, '_blank')}
                role={apiBanners[safeIndex].linkUrl ? 'link' : undefined}
                style={{ cursor: apiBanners[safeIndex].linkUrl ? 'pointer' : 'default' }}
              >
                {apiBanners[safeIndex].imageUrl && (
                  <img
                    src={apiBanners[safeIndex].imageUrl}
                    alt={apiBanners[safeIndex].title || 'Banner'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {(apiBanners[safeIndex].title || apiBanners[safeIndex].subtitle) && (
                  <div className="flex-1 z-10">
                    {apiBanners[safeIndex].title && (
                      <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-lg">
                        {apiBanners[safeIndex].title}
                      </h3>
                    )}
                    {apiBanners[safeIndex].subtitle && (
                      <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow-lg">
                        {apiBanners[safeIndex].subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <FallbackBanner />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === safeIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
