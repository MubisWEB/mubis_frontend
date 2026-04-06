import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Mail, Phone, MapPin, Building,
  CheckCircle2, XCircle, Calendar, Briefcase, UserCheck,
} from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { usersApi } from '@/api/services';

const ROLE_LABELS = {
  dealer: 'Dealer',
  recomprador: 'Recomprador',
  perito: 'Perito',
  admin_general: 'Admin General',
  admin_sucursal: 'Admin Sucursal',
  superadmin: 'Superadmin',
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDealerDetalle() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getById(userId)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggleVerification = async () => {
    const newStatus = user.verification_status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    try {
      await usersApi.verify(userId, newStatus);
      setUser(prev => ({ ...prev, verification_status: newStatus }));
      toast.success(newStatus === 'VERIFIED' ? 'Usuario verificado' : 'Verificación removida');
    } catch { toast.error('Error al actualizar verificación'); }
  };

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  const getActivityStats = () => {
    if (!user) return [];
    const stats = user.stats || {};
    if (user.role === 'dealer') return [
      { label: 'Vehículos', value: stats.vehicles ?? '—' },
      { label: 'Subastas activas', value: stats.activeAuctions ?? '—' },
      { label: 'Cerradas', value: stats.endedAuctions ?? '—' },
      { label: 'Valor total', value: stats.totalRevenue != null ? formatPrice(stats.totalRevenue) : '—' },
    ];
    if (user.role === 'recomprador') return [
      { label: 'Pujas', value: stats.bidsCount ?? '—' },
      { label: 'Ganadas', value: stats.wonCount ?? '—' },
      { label: 'Invertido', value: stats.totalSpent != null ? formatPrice(stats.totalSpent) : '—' },
    ];
    if (user.role === 'perito') return [
      { label: 'Peritajes', value: stats.totalInspections ?? '—' },
      { label: 'Completados', value: stats.completedInspections ?? '—' },
      { label: 'Pendientes', value: stats.pendingInspections ?? '—' },
    ];
    if (user.role === 'admin_general') return [
      { label: 'Sucursales', value: stats.branches ?? '—' },
      { label: 'Usuarios', value: stats.users ?? '—' },
      { label: 'Subastas', value: stats.auctions ?? '—' },
    ];
    if (user.role === 'admin_sucursal') return [
      { label: 'Dealers', value: stats.dealers ?? '—' },
      { label: 'Subastas', value: stats.auctions ?? '—' },
      { label: 'Activos', value: stats.activeVehicles ?? '—' },
    ];
    return [];
  };

  if (loading) return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Usuario no encontrado</p>
        <Button onClick={() => navigate('/AdminDealers')} variant="outline">Volver</Button>
      </div>
    </div>
  );

  const activityStats = getActivityStats();
  const isVerified = user.verification_status === 'VERIFIED';
  const initials = (user.nombre || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header backTo="/AdminDealers" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-3">

        {/* Profile card */}
        <Card className="p-5 border border-border shadow-sm flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-secondary/15 border-2 border-secondary/30 flex items-center justify-center text-xl font-bold text-secondary">
            {initials}
          </div>
          <h1 className="text-lg font-bold text-foreground text-center">{user.nombre}</h1>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Badge variant="outline" className="text-xs">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            <Badge className={`text-xs ${isVerified ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
              {isVerified ? <><Shield className="w-3 h-3 mr-1" />Verificado</> : 'Sin verificar'}
            </Badge>
          </div>
        </Card>

        {/* Stats mini-cards */}
        {activityStats.length > 0 && (
          <div className={`grid grid-cols-${Math.min(activityStats.length, 4)} gap-2`}>
            {activityStats.map((s, i) => (
              <Card key={i} className="p-3 text-center border border-border shadow-sm">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Información */}
        <Card className="p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-secondary" />
            <h2 className="font-bold text-sm text-foreground">Información</h2>
          </div>
          <InfoRow icon={Mail} label="Correo" value={user.email} />
          <InfoRow icon={Phone} label="Teléfono" value={user.telefono} />
          <InfoRow icon={MapPin} label="Ciudad" value={user.ciudad} />
          <InfoRow icon={Building} label="Empresa · Sucursal" value={user.company ? `${user.company}${user.branch ? ` · ${user.branch}` : ''}` : null} />
          <InfoRow icon={Briefcase} label="NIT" value={user.nit} />
          <InfoRow icon={Calendar} label="Miembro desde" value={joinDate} />
        </Card>

        {/* Verificación */}
        <Card className="p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h2 className="font-bold text-sm text-foreground">Verificación</h2>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isVerified
                ? <CheckCircle2 className="w-5 h-5 text-primary" />
                : <XCircle className="w-5 h-5 text-muted-foreground" />}
              <span className="text-sm font-medium text-foreground">
                {isVerified ? 'Cuenta verificada' : 'Pendiente de verificación'}
              </span>
            </div>
            <Badge className={isVerified
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted text-muted-foreground border-border'}>
              {user.verification_status}
            </Badge>
          </div>
          <Button
            onClick={handleToggleVerification}
            className={`w-full rounded-full font-semibold ${isVerified
              ? 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            variant="outline"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {isVerified ? 'Remover verificación' : 'Marcar como verificado'}
          </Button>
        </Card>

      </div>
      <BottomNav currentPage="AdminDashboard" />
    </div>
  );
}
