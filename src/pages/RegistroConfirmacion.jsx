import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import { useNavigate } from 'react-router-dom';

export default function RegistroConfirmacion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col">
      {/* Header con logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-16 pb-8 text-center"
      >
        <MubisLogo size="xl" variant="light" />
      </motion.div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md text-center"
        >
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#39FF14' }}
          >
            <CheckCircle className="w-12 h-12 text-brand-dark" />
          </motion.div>

          {/* Mensaje */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            ¡Gracias por tu solicitud!
          </h1>
          
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Nuestro equipo la revisará y te contactaremos cuando sea aprobada.
          </p>

          <p className="text-white/60 text-sm mb-10">
            Esto suele tomar entre 24-48 horas hábiles. Te enviaremos un correo con los próximos pasos.
          </p>

          {/* Botón volver */}
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-semibold shadow-xl group"
            style={{ 
              backgroundColor: '#39FF14',
              color: '#1a1a2e'
            }}
          >
            <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-white/40 text-sm">
          ¿Tienes preguntas? Escríbenos a{' '}
          <a href="mailto:soporte@mubis.co" className="text-white/60 hover:text-white underline">
            soporte@mubis.co
          </a>
        </p>
      </div>
    </div>
  );
}
