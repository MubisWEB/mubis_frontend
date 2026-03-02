import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

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

    // Auto focus next input
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
    
    // Simular verificación
    setTimeout(() => {
      localStorage.setItem('mubis_authenticated', 'true');
      localStorage.setItem('mubis_user_role', role);
      localStorage.setItem('mubis_user_email', email);
      
      toast.success('¡Verificación exitosa!', {
        description: 'Tu cuenta ha sido verificada'
      });

      if (role === 'dealer') {
        navigate(createPageUrl('Subastas'));
      } else {
        navigate(createPageUrl('Home'));
      }
    }, 1500);
  };

  const handleResend = () => {
    toast.success('Código reenviado', {
      description: 'Revisa tu correo electrónico'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 via-violet-800 to-violet-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <MubisLogo size="xl" variant="light" />
          <h1 className="text-2xl font-bold text-white mt-4">Verifica tu Correo</h1>
          <p className="text-violet-200 text-sm mt-2">
            Enviamos un código de 6 dígitos a
          </p>
          <p className="text-white font-semibold mt-1">{email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-violet-600" />
              </div>
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
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-xl font-bold"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ¿No recibiste el código?{' '}
                <button
                  onClick={handleResend}
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Reenviar
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}