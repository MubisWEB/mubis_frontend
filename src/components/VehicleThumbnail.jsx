import React from 'react';

/**
 * Thumbnail de vehículo con backdrop blur.
 * Cuando la imagen no llena el contenedor, muestra la misma imagen
 * como fondo zoomeado y desenfocado en lugar de un color sólido.
 *
 * Props:
 *   src       - URL de la imagen
 *   alt       - texto alternativo
 *   className - clases del contenedor (tamaño, rounded, etc.)
 *   ratio     - aspect-ratio CSS string, ej: "4/3". Si no se pasa, el
 *               contenedor toma el tamaño dado por className.
 *   children  - badges, overlays, etc.
 */
export default function VehicleThumbnail({ src, alt = '', className = '', ratio, children }) {
  const containerStyle = ratio ? { aspectRatio: ratio } : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle}>
      {/* Fondo: misma imagen, zoomeada y desenfocada */}
      {src && (
        <img
          src={src}
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-75 pointer-events-none"
        />
      )}
      {/* Imagen principal centrada sin recorte */}
      <img
        src={src}
        alt={alt}
        className="relative w-full h-full object-contain"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {children}
    </div>
  );
}
