import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { authApi } from '@/api/services';
import { toast } from 'sonner';

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full border border-border shadow-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Enlace inválido</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Este enlace no contiene un token válido. Verifica que hayas copiado el enlace completo del correo.
          </p>
          <Button onClick={() => navigate('/login')} className="rounded-full">Ir al inicio de sesión</Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full border border-border shadow-sm">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Contraseña establecida</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu contraseña ha sido configurada exitosamente. Ya puedes iniciar sesión.
          </p>
          <Button onClick={() => navigate('/login')} className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Iniciar sesión
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authApi.setPassword(token, password);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Token inválido o expirado. Contacta a tu administrador.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full border border-border shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Establece tu contraseña</h2>
          <p className="text-sm text-muted-foreground">
            Tu cuenta ha sido creada. Configura una contraseña para acceder a la plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nueva contraseña</label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-border"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Confirmar contraseña</label>
            <Input
              type="password"
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl border-border"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {loading ? 'Configurando...' : 'Establecer contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
