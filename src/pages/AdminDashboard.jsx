import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Clock, TrendingUp, ClipboardCheck, FileText, MessageCircle, Package2, Target, Building2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { adminApi, casesApi } from '@/api/services';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [openCasesCount, setOpenCasesCount] = useState(0);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    try {
      const [s, allCases] = await Promise.all([
        adminApi.getStats(),
        casesApi.getAll().catch(() => []),
      ]);
      setStats(s);
      setOpenCasesCount((allCases || []).filter(c => c.status === 'OPEN').length);
      setError(null);
    } catch (err) {
      console.error('Error loading admin stats:', err);
      if (!stats) setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted pb-28">
        <Header title="Panel Admin" subtitle="Gestión de usuarios y subastas" />
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <Skeleton width="50%" height={13} />
                <Skeleton width="40%" height={32} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 mb-4">
            <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
            {[0, 1, 2].map(i => (
              <Skeleton key={i} height={36} borderRadius={8} style={{ marginBottom: 8 }} />
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="p-2 bg-muted rounded-lg">
                  <Skeleton height={24} />
                  <Skeleton width="60%" height={12} style={{ marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!stats) return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel Admin" subtitle="Gestión de usuarios y subastas" />
      <div className="max-w-7xl mx-auto px-4 pt-8 text-center">
        <p className="text-muted-foreground mb-4">{error || 'No se pudieron cargar las estadísticas'}</p>
        <Button onClick={() => { setLoading(true); loadStats(); }} variant="outline" className="rounded-full">
          Reintentar
        </Button>
      </div>
      <BottomNav />
    </div>
  );

  const totalUsers = (stats.dealers?.total || 0) + (stats.peritos?.total || 0) + (stats.recompradores?.total || 0);
  const totalVerified = (stats.dealers?.verified || 0) + (stats.peritos?.verified || 0) + (stats.recompradores?.verified || 0);
  const totalPending = (stats.dealers?.pending || 0) + (stats.peritos?.pending || 0) + (stats.recompradores?.pending || 0);

  return (
    <div className="min-h-screen bg-muted pb-28">
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
            <p className="text-2xl font-bold text-foreground">{stats.auctions?.active || 0}</p>
            <p className="text-xs text-muted-foreground">Subastas Activas</p>
          </Card>
        </div>

        {/* Breakdown by role */}
        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-sans">Usuarios por rol</h2>
          <div className="space-y-2">
            {[
              { label: 'Dealers', data: stats.dealers || {} },
              { label: 'Peritos', data: stats.peritos || {} },
              { label: 'Recompradores', data: stats.recompradores || {} },
            ].map(({ label, data }) => (
              <div key={label} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary text-xs">{data.verified || 0} ✓</Badge>
                  {(data.pending || 0) > 0 && <Badge className="bg-accent/10 text-accent-foreground text-[13px] font-semibold min-h-[28px] px-2.5 py-1 border border-accent/20">{data.pending} pend.</Badge>}
                  {(data.rejected || 0) > 0 && <Badge className="bg-destructive/10 text-destructive text-[13px] font-semibold min-h-[28px] px-2.5 py-1 border border-destructive/20">{data.rejected} rech.</Badge>}
                  <span className="text-muted-foreground text-xs">{data.total || 0} total</span>
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
              {totalPending > 0 && <Badge className="bg-accent text-accent-foreground text-[13px] font-semibold min-h-[28px] px-2.5 py-1">{totalPending}</Badge>}
            </Button>
            <Button onClick={() => navigate('/AdminCasos')} variant="outline" className="w-full justify-between rounded-full">
              <span>Casos de Soporte</span>
              {openCasesCount > 0 ? <Badge className="bg-destructive/10 text-destructive text-[13px] font-semibold min-h-[28px] px-2.5 py-1">{openCasesCount}</Badge> : null}
            </Button>
            <Button onClick={() => navigate('/AdminSubastas')} variant="outline" className="w-full justify-between rounded-full">
              <span>Subastas</span><Badge className="bg-secondary/10 text-secondary text-[13px] font-semibold min-h-[28px] px-2.5 py-1">{stats.auctions?.total || 0}</Badge>
            </Button>
            <Button onClick={() => navigate('/AdminInventario')} variant="outline" className="w-full justify-between rounded-full">
              <span>Gestión de Inventario</span><Package2 className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/AdminMetas')} variant="outline" className="w-full justify-between rounded-full">
              <span>Metas de Ventas</span><Target className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/AdminSucursales')} variant="outline" className="w-full justify-between rounded-full">
              <span>Sucursales</span><Building2 className="w-4 h-4" />
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
              <p className="text-lg font-bold text-foreground">{stats.inspections?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold text-accent-foreground">{stats.inspections?.pending || 0}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-lg font-bold text-primary">{stats.inspections?.completed || 0}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
