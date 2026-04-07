import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { bannersApi } from '@/api/services';
import { BANNERS_UPDATED_EVENT, BANNERS_UPDATED_STORAGE_KEY } from '@/lib/bannerEvents';

function isBannerActive(banner) {
  if (typeof banner?.isActive === 'boolean') return banner.isActive;
  if (typeof banner?.active === 'boolean') return banner.active;
  if (typeof banner?.enabled === 'boolean') return banner.enabled;
  if (typeof banner?.status === 'string') {
    return ['active', 'enabled', 'published'].includes(banner.status.toLowerCase());
  }
  return true;
}

function normalizeBanner(banner, index) {
  return {
    id: banner?.id || banner?._id || banner?.bannerId || `banner-${index}`,
    imageUrl: banner?.imageUrl || banner?.image_url || banner?.url || banner?.src || '',
    title: banner?.title || banner?.name || '',
    subtitle: banner?.subtitle || banner?.description || banner?.text || '',
    linkUrl: banner?.linkUrl || banner?.link_url || banner?.href || '',
    active: isBannerActive(banner),
  };
}

function normalizeBannerList(data) {
  const list =
    Array.isArray(data) ? data :
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.banners) ? data.banners :
    Array.isArray(data?.data) ? data.data :
    [];

  return list
    .map(normalizeBanner)
    .filter((banner) => banner.imageUrl && banner.active);
}

export default function SponsorBanner() {
  const [index, setIndex] = useState(0);
  const [banners, setBanners] = useState([]);

  const loadActiveBanners = useCallback(async () => {
    try {
      const data = await bannersApi.getActive();
      setBanners(normalizeBannerList(data));
    } catch {
      setBanners([]);
    }
  }, []);

  useEffect(() => {
    loadActiveBanners();
  }, [loadActiveBanners]);

  useEffect(() => {
    const handleBannerUpdate = () => loadActiveBanners();
    const handleStorage = (event) => {
      if (event.key === BANNERS_UPDATED_STORAGE_KEY) {
        loadActiveBanners();
      }
    };

    window.addEventListener(BANNERS_UPDATED_EVENT, handleBannerUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(BANNERS_UPDATED_EVENT, handleBannerUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadActiveBanners]);

  const count = banners.length;

  useEffect(() => {
    if (count <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 5000);

    return () => clearInterval(timer);
  }, [count]);

  useEffect(() => {
    setIndex(0);
  }, [count]);

  const activeBanner = useMemo(() => {
    if (!count) return null;
    return banners[index % count];
  }, [banners, count, index]);

  if (!activeBanner) return null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 my-4">
      <div className="relative w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: '970 / 150' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div
              className="w-full h-full relative flex items-center justify-between px-6 sm:px-10 lg:px-16"
              style={{
                background: 'linear-gradient(to right, #111827, #1f2937)',
                cursor: activeBanner.linkUrl ? 'pointer' : 'default',
              }}
              onClick={() => activeBanner.linkUrl && window.open(activeBanner.linkUrl, '_blank')}
              role={activeBanner.linkUrl ? 'link' : undefined}
            >
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title || 'Banner'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {(activeBanner.title || activeBanner.subtitle) && (
                <div className="relative z-10 max-w-2xl">
                  {activeBanner.title && (
                    <h3 className="text-white text-lg sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-lg">
                      {activeBanner.title}
                    </h3>
                  )}
                  {activeBanner.subtitle && (
                    <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow-lg">
                      {activeBanner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((banner, bannerIndex) => (
              <button
                key={banner.id}
                onClick={() => setIndex(bannerIndex)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${bannerIndex === index % count ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
