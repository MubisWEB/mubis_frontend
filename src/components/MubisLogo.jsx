import React from 'react';

export default function MubisLogo({ size = 'md', variant = 'dark' }) {
  const sizes = {
    sm: { text: 'text-2xl', dot: 'w-[0.22em] h-[0.22em]' },
    md: { text: 'text-3xl', dot: 'w-[0.22em] h-[0.22em]' },
    lg: { text: 'text-4xl', dot: 'w-[0.22em] h-[0.22em]' },
    xl: { text: 'text-5xl', dot: 'w-[0.22em] h-[0.22em]' }
  };

  const colors = {
    dark: 'text-foreground',
    light: 'text-white'
  };

  const sizeConfig = sizes[size];

  return (
    <div 
      className={`${sizeConfig.text} ${colors[variant]} inline-flex items-baseline font-bold`} 
      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
    >
      <span>mub</span>
      <span className="relative inline-block" style={{ fontVariantLigatures: 'none' }}>
        <span style={{ fontSize: '0.75em', position: 'relative', top: '0.15em' }}>ı</span>
        <span 
          className={`absolute ${sizeConfig.dot} top-[0.08em] left-1/2 -translate-x-1/2 rounded-full`}
          style={{ backgroundColor: '#39FF14' }}
        />
      </span>
      <span>s</span>
      <span className="text-[0.24em] font-sans font-normal ml-0.5 opacity-60 relative -top-[1.1em]">™</span>
    </div>
  );
}
