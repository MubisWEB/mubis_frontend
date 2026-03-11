import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bannerGM from '@/assets/banner-gm.png';
import bannerMapfre from '@/assets/banner-mapfre.png';
import bannerInterstate from '@/assets/banner-interstate.png';

const sponsors = [
  {
    name: 'GM Financial',
    layout: 'image-banner',
    bannerImage: bannerGM,
  },
  {
    name: 'Mapfre',
    layout: 'image-banner',
    bannerImage: bannerMapfre,
  },
  {
    name: 'Interstate Batteries',
    layout: 'image-banner',
    bannerImage: bannerInterstate,
  },
];

function LayoutImageBanner({ sponsor }) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src={sponsor.bannerImage}
        alt={sponsor.name}
        className="w-full h-full object-cover object-center"
        style={sponsor.imgStyle || {}}
      />
    </div>
  );
}

export default function SponsorBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex(p => (p + 1) % sponsors.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const sponsor = sponsors[index];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-2 mb-2">
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
              borderRadius: '18px',
              aspectRatio: '6 / 2',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <LayoutImageBanner sponsor={sponsor} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
