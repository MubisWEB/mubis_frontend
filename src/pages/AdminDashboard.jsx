import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Clock, TrendingUp, ClipboardCheck, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getAdminStats, getUsers } from '@/lib/mockStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const s = getAdminStats();
    setStats(s);
    const interval = setInterval(() => setStats(getAdminStats()), 3000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const totalUsers = stats.dealers.total + stats.peritos.total + stats.recompradores.total;
  const totalVerified = stats.dealers.verified + stats.peritos.verified + stats.recompradores.verified;
  const totalPending = stats.dealers.pending + stats.peritos.pending + stats.recompradores.pending;

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Panel Admin" subtitle="Gestión de usuarios y subastas" />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 text-center border border-border shadow-sm">
            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Usuarios</p>
          </Card>
          <Card className="p-4 text-center border border-border shadow-sm">
            <UserCheck className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalVerified}</p>
            <p className="text-xs text-muted-foreground">Verificados</p>
          </Card>
          <Card className="p-4 text-center border border-border shadow-sm">
            <Clock className="w-6 h-6 text-accent-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </Card>
          <Card className="p-4 text-center border border-border shadow-sm">
            <TrendingUp className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.auctions.active}</p>
            <p className="text-xs text-muted-foreground">Subastas Activas</p>
          </Card>
        </div>

        {/* Breakdown by role */}
        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Usuarios por rol</h2>
          <div className="space-y-2">
            {[
              { label: 'Dealers', data: stats.dealers },
              { label: 'Peritos', data: stats.peritos },
              { label: 'Recompradores', data: stats.recompradores },
            ].map(({ label, data }) => (
              <div key={label} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary text-xs">{data.verified} ✓</Badge>
                  {data.pending > 0 && <Badge className="bg-accent/10 text-accent-foreground text-xs">{data.pending} pend.</Badge>}
                  {data.rejected > 0 && <Badge className="bg-destructive/10 text-destructive text-xs">{data.rejected} rech.</Badge>}
                  <span className="text-muted-foreground text-xs">{data.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Button onClick={() => navigate('/AdminDealers')} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 justify-between rounded-full">
              <span>Ver Todos los Usuarios</span><Users className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/AdminSolicitudes')} variant="outline" className="w-full justify-between rounded-full">
              <span>Solicitudes Pendientes</span>
              {totalPending > 0 && <Badge className="bg-accent text-accent-foreground">{totalPending}</Badge>}
            </Button>
            <Button onClick={() => navigate('/AdminSubastas')} variant="outline" className="w-full justify-between rounded-full">
              <span>Subastas</span><Badge className="bg-secondary/10 text-secondary">{stats.auctions.total}</Badge>
            </Button>
          </div>
        </Card>

        {/* Inspections summary */}
        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-secondary" /> Peritajes
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold text-foreground">{stats.inspections.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold text-accent-foreground">{stats.inspections.pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold text-primary">{stats.inspections.completed}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
