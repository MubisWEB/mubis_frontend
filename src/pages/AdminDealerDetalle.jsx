import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone, MapPin, Building, CheckCircle, Trophy, Gavel, ClipboardCheck } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import TopBar from "@/components/TopBar";
import { getUserById, updateUser, getAuctionsByDealerId, getBidsByUserId, getWonAuctionsByUserId, getInspections, getVehicles } from '@/lib/mockStore';

export default function AdminDealerDetalle() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = getUserById(userId);

  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Usuario no encontrado</p>
          <Button onClick={() => navigate('/AdminDealers')} variant="outline">Volver</Button>
        </div>
      </div>
    );
  }

  const handleToggleVerification = () => {
    const newStatus = user.verification_status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    updateUser(userId, { verification_status: newStatus });
    toast.success(newStatus === 'VERIFIED' ? 'Usuario verificado' : 'Verificación removida');
    navigate(0); // refresh
  };

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  // Activity based on role
  const getActivity = () => {
    if (user.role === 'dealer') {
      const auctions = getAuctionsByDealerId(user.id);
      const vehicles = getVehicles().filter(v => v.dealerId === user.id);
      const active = auctions.filter(a => a.status === 'active').length;
      const ended = auctions.filter(a => a.status === 'ended').length;
      const totalRevenue = auctions.reduce((s, a) => s + (a.current_bid || 0), 0);
      return { type: 'dealer', stats: [
        { label: 'Vehículos', value: vehicles.length },
        { label: 'Subastas activas', value: active },
        { label: 'Subastas cerradas', value: ended },
        { label: 'Valor total', value: formatPrice(totalRevenue) },
      ]};
    }
    if (user.role === 'recomprador') {
      const bids = getBidsByUserId(user.id);
      const won = getWonAuctionsByUserId(user.id);
      const totalSpent = won.reduce((s, a) => s + (a.current_bid || 0), 0);
      return { type: 'recomprador', stats: [
        { label: 'Pujas realizadas', value: bids.length },
        { label: 'Subastas ganadas', value: won.length },
        { label: 'Total invertido', value: formatPrice(totalSpent) },
      ]};
    }
    if (user.role === 'perito') {
      const inspections = getInspections().filter(i => i.peritoId === user.id || i.lockedByPeritoId === user.id);
      const completed = inspections.filter(i => i.status === 'COMPLETED').length;
      const pending = inspections.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS').length;
      return { type: 'perito', stats: [
        { label: 'Peritajes totales', value: inspections.length },
        { label: 'Completados', value: completed },
        { label: 'Pendientes', value: pending },
      ]};
    }
    return { type: 'unknown', stats: [] };
  };

  const activity = getActivity();
  const isVerified = user.verification_status === 'VERIFIED';

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/AdminDealers')} className="text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
          <MubisLogo size="md" />
          <div className="w-10"></div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-sans">{user.nombre}</h1>
        <div className="flex items-center justify-center gap-2">
          <Badge className="bg-white/20 text-white border-white/30 text-xs">{user.role}</Badge>
          {isVerified && <Badge className="bg-primary/20 text-white border-primary/30"><Shield className="w-3 h-3 mr-1" />Verificado</Badge>}
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className={`grid grid-cols-${Math.min(activity.stats.length, 3)} gap-3 mb-4`}>
          {activity.stats.map((s, i) => (
            <Card key={i} className="p-3 text-center border border-border shadow-sm">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Información de Contacto</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.telefono}</span></div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.ciudad}</span></div>
            {user.company && <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.company} · {user.branch}</span></div>}
            {user.nit && <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">NIT: {user.nit}</span></div>}
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Verificación</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-foreground">Estado:</span>
            <Badge className={isVerified ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}>
              {user.verification_status}
            </Badge>
          </div>
          <Button onClick={handleToggleVerification} className={`w-full rounded-full ${isVerified ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
            {isVerified ? 'Remover Verificación' : 'Marcar como Verificado'}
          </Button>
        </Card>
      </div>
      <BottomNav currentPage="AdminDashboard" />
    </div>
  );
}
