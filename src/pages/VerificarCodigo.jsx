import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail as MailIcon, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import TopBar from '@/components/TopBar';
import MubisLogo from '@/components/MubisLogo';
import { Mail } from 'lucide-react';

export default function VerificarCodigo() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setEmail(urlParams.get('email') || '');
    setRole(urlParams.get('role') || '');
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('Por favor ingresa el código completo');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('mubis_authenticated', 'true');
      localStorage.setItem('mubis_user_role', role);
      localStorage.setItem('mubis_user_email', email);
      toast.success('¡Verificación exitosa!', { description: 'Tu cuenta ha sido verificada' });
      if (role === 'dealer') {
        navigate(createPageUrl('Subastas'));
      } else {
        navigate(createPageUrl('Home'));
      }
    }, 1500);
  };

  const handleResend = () => {
    toast.success('Código reenviado', { description: 'Revisa tu correo electrónico' });
  };

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
          <Card className="p-8 bg-card border border-border shadow-sm rounded-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                <MailIcon className="w-8 h-8 text-secondary" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                Verifica tu correo
              </h1>
              <p className="text-muted-foreground text-sm">
                Enviamos un código de 6 dígitos a
              </p>
              <p className="text-foreground font-semibold text-sm mt-1">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold rounded-full shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Verificar código'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No recibiste el código?{' '}
                <button
                  onClick={handleResend}
                  className="text-secondary font-semibold hover:underline"
                >
                  Reenviar
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

    </div>
  );
}
