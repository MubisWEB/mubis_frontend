import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
];

function ensurePhotos(photos) {
  if (!photos || photos.length === 0) return DEMO_PHOTOS.slice(0, 5);
  if (photos.length >= 5) return photos;
  const result = [...photos];
  let idx = 0;
  while (result.length < 5) {
    const candidate = DEMO_PHOTOS[idx % DEMO_PHOTOS.length];
    if (!result.includes(candidate)) result.push(candidate);
    idx++;
  }
  return result;
}

/**
 * Photo gallery: 1 large image + 4 small thumbnails.
 * Clicking a thumbnail swaps it with the main image.
 * Props:
 * - photos: string[] of image URLs
 * - alt: alt text for main image
 * - height: CSS height for the container (default '320px')
 * - overlay: ReactNode to render over the gallery (badges, back button, etc.)
 */
export default function PhotoGallery({ photos, alt = '', height = '320px', overlay }) {
  const allPhotos = ensurePhotos(photos);
  const [mainIndex, setMainIndex] = useState(0);

  const mainPhoto = allPhotos[mainIndex];
  const thumbs = allPhotos.filter((_, i) => i !== mainIndex).slice(0, 4);

  return (
    <div className="relative flex gap-1 bg-muted overflow-hidden" style={{ height }}>
      {/* Main image */}
      <div className="flex-1 relative overflow-hidden cursor-pointer" onClick={() => setMainIndex(prev => (prev + 1) % allPhotos.length)}>
        <AnimatePresence mode="wait">
          <motion.img
            key={mainIndex}
            src={mainPhoto}
            alt={alt}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        {/* Nav arrows on main */}
        <button
          onClick={(e) => { e.stopPropagation(); setMainIndex(prev => prev === 0 ? allPhotos.length - 1 : prev - 1); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMainIndex(prev => prev === allPhotos.length - 1 ? 0 : prev + 1); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors md:hidden"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails grid */}
      <div className="hidden md:grid w-[35%] grid-cols-2 grid-rows-2 gap-1">
        {thumbs.map((photo, i) => {
          const realIndex = allPhotos.indexOf(photo);
          return (
            <div
              key={i}
              className={`overflow-hidden cursor-pointer transition-opacity hover:opacity-80 ${i === 3 ? 'relative' : ''}`}
              onClick={() => setMainIndex(realIndex)}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
              {i === 3 && allPhotos.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+{allPhotos.length - 5}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: dots + counter */}
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 md:hidden">
        <Camera className="w-3 h-3" />{mainIndex + 1}/{allPhotos.length}
      </div>

      {/* Desktop counter */}
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full items-center gap-1 hidden md:flex">
        <Camera className="w-3 h-3" />{allPhotos.length} fotos
      </div>

      {/* Overlay content (back button, badges, etc.) */}
      {overlay}
    </div>
  );
}
