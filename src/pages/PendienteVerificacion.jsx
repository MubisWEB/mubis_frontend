import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, XCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MubisLogo from '@/components/MubisLogo';
import TopBar from "@/components/TopBar";
import { useAuth } from '@/lib/AuthContext';

const STATUS_CONFIG = {
  PENDING: { icon: Clock, label: 'En revisión', color: 'bg-accent/10 text-accent-foreground', message: 'Tu cuenta está siendo revisada por nuestro equipo. Te notificaremos cuando sea aprobada.' },
  REJECTED: { icon: XCircle, label: 'Rechazada', color: 'bg-destructive/10 text-destructive', message: 'Tu solicitud fue rechazada. Contacta soporte si crees que es un error.' },
  SUSPENDED: { icon: AlertTriangle, label: 'Suspendida', color: 'bg-destructive/10 text-destructive', message: 'Tu cuenta ha sido suspendida. Contacta soporte para más información.' },
};

export default function PendienteVerificacion() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const status = user?.verification_status || 'PENDING';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <TopBar />
      <nav className="w-full bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="sm" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center border border-border/60 shadow-sm rounded-2xl">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-muted">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <Badge className={`mb-4 ${config.color}`}>{config.label}</Badge>
          <h1 className="text-xl font-bold text-foreground mb-2 font-sans">Estado de tu cuenta</h1>
          <p className="text-muted-foreground text-sm mb-2">{user?.nombre || 'Usuario'} · {user?.email}</p>
          <p className="text-muted-foreground text-sm mb-6">{config.message}</p>
          <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 gap-2">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </Button>
        </Card>
      </main>
    </div>
  );
}
