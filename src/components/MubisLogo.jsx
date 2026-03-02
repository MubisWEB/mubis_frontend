import React from 'react';
import { Link } from 'react-router-dom';

export default function MubisLogo({ size = 'md', linkTo = null }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const logo = (
    <span className={`${sizes[size]} font-black tracking-tight text-foreground`}>
      mubis
    </span>
  );

  if (linkTo) {
    return <Link to={linkTo}>{logo}</Link>;
  }

  return logo;
}
