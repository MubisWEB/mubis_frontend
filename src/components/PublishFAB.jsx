import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function PublishFAB({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const linearSmoothTransition = { 
    duration: 0.6, // Un poco más lento para máxima elegancia
    ease: [0.4, 0, 0.2, 1] 
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="fixed bottom-20 right-6 md:right-8 z-50"
    >
      <motion.button
        onClick={onClick}
        animate={{
          // Usamos un valor de ancho lo suficientemente grande para contener el texto
          // Esto evita que el navegador intente adivinar el 'auto' y cause saltos.
          width: isHovered ? 180 : 56, 
        }}
        transition={linearSmoothTransition}
        className="relative h-14 rounded-full bg-secondary text-secondary-foreground shadow-md hover:shadow-lg flex items-center justify-start overflow-hidden p-0"
        aria-label="Publicar carro"
      >
        {/* Icono: Posición fija absoluta para que NADA lo mueva */}
        <div className="flex items-center justify-center w-14 h-14 flex-shrink-0">
          <Plus className="w-6 h-6" />
        </div>

        {/* Texto: Ahora con una máscara de opacidad y ancho fijo */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : 10, // Un ligero deslizamiento sutil para suavizar
          }}
          transition={linearSmoothTransition}
          className="flex items-center"
        >
          <span className="whitespace-nowrap font-semibold text-sm pr-6">
            Publicar carro
          </span>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}