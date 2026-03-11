import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bannerGM from '@/assets/banner-gm.png';
import bannerMapfre from '@/assets/banner-mapfre.png';
import bannerInterstate from '@/assets/banner-interstate.png';

const sponsors = [
  { name: 'GM Financial', bannerImage: bannerGM },
  { name: 'Mapfre', bannerImage: bannerMapfre },
  { name: 'Interstate Batteries', bannerImage: bannerInterstate },
];

export default function SponsorBanner() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex(p => (p + 1) % sponsors.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
      <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-md bg-white"
      style={{ aspectRatio: '970 / 250' }}
      >
        <div className="relative w-full h-full">
          <AnimatePresence mode="sync" custom={direction}>
            <motion.img
              key={index}
              src={sponsors[index].bannerImage}
              alt={sponsors[index].name}
              custom={direction}
              variants={{
                enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 1 }),
                center: { x: 0, opacity: 1 },
                exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 1 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}