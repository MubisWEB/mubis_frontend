import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import MubisLogo from '@/components/MubisLogo';

export default function RegistroConfirmacion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="md" linkTo="/" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-card border border-border shadow-sm rounded-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-secondary" />
            </motion.div>

            <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
              ¡Gracias por tu solicitud!
            </h1>
            
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Nuestro equipo la revisará y te contactaremos cuando sea aprobada.
            </p>

            <p className="text-muted-foreground/60 text-xs mb-8">
              Esto suele tomar entre 24-48 horas hábiles. Te enviaremos un correo con los próximos pasos.
            </p>

            <Button
              onClick={() => navigate('/')}
              className="w-full h-12 font-semibold rounded-full shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Volver al inicio
            </Button>
          </Card>
        </motion.div>
      </main>

    </div>
  );
}
