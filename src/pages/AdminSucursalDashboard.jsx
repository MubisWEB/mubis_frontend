import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Car, DollarSign, CheckCircle, BarChart3, UserCheck,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { analyticsApi, usersApi } from '@/api/services';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'text-secondary', alert }) {
  return (
    <Card className={`p-4 border shadow-sm rounded-2xl ${alert ? 'border-amber-300 bg-amber-50' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${alert ? 'bg-amber-100' : 'bg-secondary/10'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : color}`} />
        </div>
        {alert && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1" />}
      </div>
      <p className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

export default function AdminSucursalDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);

  const loadData = async () => {
    try {
      const [dash, users] = await Promise.all([
        analyticsApi.branchDashboard(branchId).catch(() => null),
        usersApi.getPending().catch(() => []),
      ]);
      setDashboard(dash);
      setPendingUsers(users || []);
    } catch (err) {
      console.error('Error loading branch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, []);

  const byStatus = dashboard?.auctions?.byStatus || {};
  const team = dashboard?.team || {};

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel de Sucursal" subtitle="Vista de tu sucursal" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Alerta de usuarios pendientes */}
        {pendingUsers.length > 0 && (
          <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
            <Users className="w-5 h-5 text-secondary flex-shrink-0" />
            <p className="text-sm font-semibold text-secondary flex-1">
              {pendingUsers.length} usuario{pendingUsers.length !== 1 ? 's' : ''} pendiente{pendingUsers.length !== 1 ? 's' : ''} de verificación
            </p>
            <button
              onClick={() => navigate('/AdminSolicitudes')}
              className="text-xs font-semibold text-secondary underline underline-offset-2 flex-shrink-0"
            >
              Ver
            </button>
          </div>
        )}

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-4 border border-border rounded-2xl animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-7 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={Users} label="Equipo" value={NUM((team.dealers || 0) + (team.peritos || 0))} sub={`${team.dealers || 0} dealers · ${team.peritos || 0} peritos`} />
            <KpiCard icon={Car} label="Subastas activas" value={NUM(byStatus.ACTIVE)} sub={`${NUM(byStatus.ENDED || 0)} finalizadas`} />
            <KpiCard icon={DollarSign} label="Ingresos sucursal" value={COP(dashboard?.revenue?.total)} color="text-primary" sub={`${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`} />
            <KpiCard icon={CheckCircle} label="Verificaciones pendientes" value={NUM(pendingUsers.length)} alert={pendingUsers.length > 0} />
          </div>
        )}

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-foreground pt-1">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Solicitudes', sub: `${pendingUsers.length} pendientes`, path: '/AdminSolicitudes', icon: UserCheck, alert: pendingUsers.length > 0 },
            { label: 'Subastas', sub: `${NUM(byStatus.ACTIVE || 0)} activas`, path: '/AdminSubastas', icon: Car },
            { label: 'Movimientos', sub: `${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`, path: '/AdminMovimientos', icon: DollarSign },
            { label: 'Analíticas', sub: 'Ver métricas', path: '/AdminAnaliticas', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-colors ${item.alert ? 'bg-amber-50 border-amber-200' : 'bg-card border-border hover:bg-muted/30'}`}
            >
              <item.icon className={`w-5 h-5 mb-2 ${item.alert ? 'text-amber-600' : 'text-secondary'}`} />
              <p className={`text-sm font-semibold ${item.alert ? 'text-amber-800' : 'text-foreground'}`}>{item.label}</p>
              <p className={`text-xs mt-0.5 ${item.alert ? 'text-amber-600' : 'text-muted-foreground'}`}>{item.sub}</p>
            </button>
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
