import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";

const stats = { total_dealers: 127, verified_dealers: 98, pending_requests: 12, total_auctions: 342, active_auctions: 45 };
const pendingDealers = [
  { id: '1', name: 'AutoMundo', email: 'contacto@automundo.com', phone: '3001234567', city: 'Bogotá', requested_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), documents_uploaded: true },
  { id: '2', name: 'Carros Premium', email: 'info@carrospremium.com', phone: '3159876543', city: 'Medellín', requested_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), documents_uploaded: true },
  { id: '3', name: 'Motor Sales', email: 'ventas@motorsales.com', phone: '3204567890', city: 'Cali', requested_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), documents_uploaded: false }
];
const recentActivity = [
  { action: 'Dealer aprobado', dealer: 'Autonal', time: 'Hace 2h' },
  { action: 'Documentos verificados', dealer: 'Los Coches', time: 'Hace 5h' },
  { action: 'Nueva solicitud', dealer: 'AutoMundo', time: 'Hace 2 días' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'admin@mubis.com';
  const [displayStats] = useState(isTestUser ? stats : { total_dealers: 0, verified_dealers: 0, pending_requests: 0, total_auctions: 0, active_auctions: 0 });
  const [displayPendingDealers] = useState(isTestUser ? pendingDealers : []);
  const [displayRecentActivity] = useState(isTestUser ? recentActivity : []);

  useEffect(() => { if (localStorage.getItem('mubis_user_role') !== 'admin') navigate(createPageUrl('login')); }, [navigate]);

  const formatDate = (date) => { const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)); if (diff === 0) return 'Hoy'; if (diff === 1) return 'Ayer'; return `Hace ${diff} días`; };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-4 pt-6 pb-6">
        <div className="text-center mb-4"><MubisLogo size="xl" variant="light" /></div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-sans">Panel Admin</h1>
        <p className="text-white/60 text-center text-sm">Gestión de dealers y subastas</p>
      </div>

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 text-center border border-border shadow-sm"><Users className="w-6 h-6 text-secondary mx-auto mb-2" /><p className="text-2xl font-bold text-foreground">{displayStats.total_dealers}</p><p className="text-xs text-muted-foreground">Total Dealers</p></Card>
          <Card className="p-4 text-center border border-border shadow-sm"><UserCheck className="w-6 h-6 text-primary mx-auto mb-2" /><p className="text-2xl font-bold text-foreground">{displayStats.verified_dealers}</p><p className="text-xs text-muted-foreground">Verificados</p></Card>
          <Card className="p-4 text-center border border-border shadow-sm"><Clock className="w-6 h-6 text-accent-foreground mx-auto mb-2" /><p className="text-2xl font-bold text-foreground">{displayStats.pending_requests}</p><p className="text-xs text-muted-foreground">Pendientes</p></Card>
          <Card className="p-4 text-center border border-border shadow-sm"><TrendingUp className="w-6 h-6 text-secondary mx-auto mb-2" /><p className="text-2xl font-bold text-foreground">{displayStats.active_auctions}</p><p className="text-xs text-muted-foreground">Subastas Activas</p></Card>
        </div>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Button onClick={() => navigate(createPageUrl('AdminDealers'))} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 justify-between rounded-full"><span>Ver Todos los Dealers</span><Users className="w-4 h-4" /></Button>
            <Button onClick={() => navigate(createPageUrl('AdminSolicitudes'))} variant="outline" className="w-full justify-between rounded-full"><span>Solicitudes Pendientes</span><Badge className="bg-accent text-accent-foreground">{displayStats.pending_requests}</Badge></Button>
          </div>
        </Card>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground font-sans">Solicitudes Recientes</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('AdminSolicitudes'))} className="text-secondary text-xs">Ver todas</Button>
          </div>
          <div className="space-y-2">
            {displayPendingDealers.slice(0, 3).map(dealer => (
              <div key={dealer.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex-1"><p className="font-semibold text-sm text-foreground">{dealer.name}</p><p className="text-xs text-muted-foreground">{dealer.city} · {formatDate(dealer.requested_date)}</p></div>
                <div className="flex items-center gap-2">{dealer.documents_uploaded ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-accent-foreground" />}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Actividad Reciente</h2>
          <div className="space-y-2">
            {displayRecentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div><p className="font-medium text-foreground">{activity.action}</p><p className="text-xs text-muted-foreground">{activity.dealer}</p></div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
