import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Car, DollarSign, CheckCircle, BarChart3, UserCheck,
  AlertTriangle, Target, Package,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { analyticsApi, usersApi } from '@/api/services';

// ── Datos simulados ───────────────────────────────────────────────────────────
const MONTHS_LABELS = (() => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleString('es-CO', { month: 'short', year: '2-digit' });
  });
})();

const SIM_AS = {
  pipeline: [
    { etapa: 'Solicitudes', count: 14, color: '#8b5cf6' },
    { etapa: 'Inspeccionados', count: 9, color: '#6366f1' },
    { etapa: 'En subasta', count: 7, color: '#3b82f6' },
    { etapa: 'Con oferta', count: 5, color: '#06b6d4' },
    { etapa: 'Cerrados', count: 3, color: '#10b981' },
  ],
  vendedores: [
    { nombre: 'Ana Martinez', solicitudes: 6, cierres: 2, funnel: { inspeccion: 5, subasta: 3, oferta: 2 } },
    { nombre: 'Carlos Ruiz', solicitudes: 4, cierres: 1, funnel: { inspeccion: 3, subasta: 2, oferta: 1 } },
  ],
  inventario: { enStock: 12, reservadas: 3, vendidasMes: 5 },
  inventarioRetail: { vestido: 8, patio: 4, metaMes: 15, gap: 3 },
  metas: { capacidadPatio: 20, comprasActual: 14, metaCompras: 18 },
  monthly: [
    { publicados: 4, vendidos: 2, comprados: 2 },
    { publicados: 5, vendidos: 3, comprados: 2 },
    { publicados: 4, vendidos: 2, comprados: 2 },
    { publicados: 6, vendidos: 3, comprados: 3 },
    { publicados: 5, vendidos: 3, comprados: 2 },
    { publicados: 7, vendidos: 4, comprados: 3 },
  ].map((d, i) => ({ ...d, mes: MONTHS_LABELS[i] })),
  alertas: { sinLeer: 2, peritajesSinAsignar: 1, stockBajo: true },
};

const EMPTY_MONTHLY = MONTHS_LABELS.map((mes) => ({ mes, publicados: 0, vendidos: 0, comprados: 0 }));
const EMPTY_PIPELINE = [
  { etapa: 'En peritaje', count: 0, color: '#6366f1' },
  { etapa: 'Rechazadas', count: 0, color: '#ef4444' },
  { etapa: 'Activas', count: 0, color: '#3b82f6' },
  { etapa: 'En decision', count: 0, color: '#f59e0b' },
  { etapa: 'Postventa', count: 0, color: '#06b6d4' },
  { etapa: 'Sin ganador', count: 0, color: '#10b981' },
];
const EMPTY_INVENTORY = { enStock: 0, reservadas: 0, vendidasMes: 0, vestido: 0, patio: 0, metaMes: 0, gap: 0 };
const EMPTY_GOALS = { capacidadPatio: 0, comprasActual: 0, metaCompras: 0, objetivo: 0, actual: 0 };
const EMPTY_ALERTS = { sinLeer: 0, peritajesSinAsignar: 0, stockBajo: false };

function SectionTitle({ color = 'bg-secondary', children, sub }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-5 rounded-full ${color}`} />
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);
const PIPELINE_COLORS = ['#6366f1', '#ef4444', '#3b82f6', '#f59e0b', '#06b6d4', '#10b981'];

function buildPipelineData(pipeline) {
  if (!pipeline) return EMPTY_PIPELINE;

  return [
    { etapa: 'En peritaje', count: pipeline.inProcess || 0, color: PIPELINE_COLORS[0] },
    { etapa: 'Rechazadas', count: pipeline.inspectionRejected || 0, color: PIPELINE_COLORS[1] },
    { etapa: 'Activas', count: pipeline.active || 0, color: PIPELINE_COLORS[2] },
    { etapa: 'En decision', count: pipeline.pendingDecision || 0, color: PIPELINE_COLORS[3] },
    { etapa: 'Postventa', count: pipeline.transactionsPending || 0, color: PIPELINE_COLORS[4] },
    { etapa: 'Sin ganador', count: pipeline.finalizedWithoutWinner || 0, color: PIPELINE_COLORS[5] },
  ];
}

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
  const monthlyData = dashboard?.monthlyVehicleStats?.length ? dashboard.monthlyVehicleStats : EMPTY_MONTHLY;
  const pipelineData = buildPipelineData(dashboard?.auctions?.pipeline);
  const pipelineMax = Math.max(...pipelineData.map((item) => item.count), 1);
  const widgets = dashboard?.widgets || {};
  const sellerPerformance = widgets.sellerPerformance || [];
  const inventory = widgets.inventory || EMPTY_INVENTORY;
  const goalsSummary = widgets.goalsSummary || EMPTY_GOALS;
  const alerts = widgets.alerts || EMPTY_ALERTS;
  const inventoryRetail = widgets.inventory || EMPTY_INVENTORY;
  const goalActual = goalsSummary.actual ?? EMPTY_GOALS.actual;
  const goalTarget = goalsSummary.objetivo || EMPTY_GOALS.objetivo;
  const goalPct = Math.min(100, Math.round((goalActual / Math.max(goalTarget, 1)) * 100));
  const capacityTarget = Math.max(inventory.enStock || 0, goalsSummary.capacidadPatio || 0, 1);

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel de Sucursal" subtitle="Vista de tu sucursal" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-4 border border-border rounded-2xl animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-7 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Equipo" value={NUM((team.dealers || 0) + (team.peritos || 0))} sub={`${team.dealers || 0} dealers · ${team.peritos || 0} peritos`} />
            <KpiCard icon={Car} label="Subastas activas" value={NUM(byStatus.ACTIVE)} sub={`${NUM(byStatus.ENDED || 0)} finalizadas`} />
            <KpiCard icon={DollarSign} label="Ingresos sucursal" value={COP(dashboard?.revenue?.total)} color="text-primary" sub={`${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`} />
            <KpiCard icon={CheckCircle} label="Verificaciones pendientes" value={NUM(pendingUsers.length)} alert={pendingUsers.length > 0} />
          </div>
        )}

        {/* ── Vehículos por Mes + Pipeline ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionTitle color="bg-secondary" sub="(últimos 6 meses)">Vehículos por Mes</SectionTitle>
            <Card className="p-4 border border-border rounded-2xl shadow-sm h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={2} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="publicados" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Publicados" />
                  <Bar dataKey="vendidos" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Vendidos" />
                  <Bar dataKey="comprados" fill="#10b981" radius={[3, 3, 0, 0]} name="Comprados" />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div>
            <SectionTitle color="bg-indigo-500">Pipeline de la Sucursal</SectionTitle>
            <Card className="p-4 border border-border rounded-2xl shadow-sm h-[280px] flex flex-col justify-center">
              <div className="space-y-4">
                {pipelineData.map((item, i) => {
                  const pct = Math.round((item.count / pipelineMax) * 100);
                  const previous = pipelineData[i - 1]?.count || 0;
                  const conv = i > 0 && previous > 0 ? Math.round((item.count / previous) * 100) : null;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium text-foreground">{item.etapa}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{item.count}</span>
                          {conv !== null && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{conv}% conv.</span>}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Vendedores + Inventario ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-blue-500">Vendedores</SectionTitle>
            <div className="space-y-3">
              {sellerPerformance.map((v, i) => (
                <div key={i} className={`p-3 rounded-xl ${i % 2 === 0 ? 'bg-muted/40' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">{v.nombre}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{v.solicitudes} sol.</span>
                      <span className="font-bold text-foreground">{v.cierres} cierres</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Sol.', value: v.solicitudes, max: Math.max(v.solicitudes, 1), color: '#6366f1' },
                      { label: 'Cierre', value: v.cierres, max: Math.max(v.solicitudes, 1), color: '#3b82f6' },
                      { label: 'Tasa', value: v.tasa, max: 100, color: '#10b981' },
                    ].map((f, j) => (
                      <div key={j} className="flex-1">
                        <p className="text-[9px] text-muted-foreground mb-0.5">{f.label}</p>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.round(f.value / f.max * 100)}%`, backgroundColor: f.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <div>
              <SectionTitle color="bg-emerald-500">Inventario</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-3 border border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm text-center">
                  <Package className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-700">{inventory.enStock}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">En stock</p>
                </Card>
                <Card className="p-3 border border-blue-200 bg-blue-50 rounded-2xl shadow-sm text-center">
                  <Car className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{inventory.reservadas}</p>
                  <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Reservadas</p>
                </Card>
                <Card className="p-3 border border-purple-200 bg-purple-50 rounded-2xl shadow-sm text-center">
                  <DollarSign className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">{inventory.vendidasMes}</p>
                  <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Vend. mes</p>
                </Card>
              </div>
            </div>

            <Card className="p-4 border border-border rounded-2xl shadow-sm">
              <SectionTitle color="bg-teal-500">Objetivo Retail</SectionTitle>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-muted/40 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium">Vestido</p>
                  <p className="text-xl font-bold text-foreground">{inventoryRetail.vestido}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium">Patio</p>
                  <p className="text-xl font-bold text-foreground">{inventoryRetail.patio}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-foreground">Meta del mes</span>
                <span className="text-sm font-bold text-foreground">{(inventoryRetail.vestido || 0) + (inventoryRetail.patio || 0)} / {inventoryRetail.metaMes}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round(((inventoryRetail.vestido || 0) + (inventoryRetail.patio || 0)) / Math.max(inventoryRetail.metaMes || 1, 1) * 100)}%` }} />
              </div>
              <p className="text-xs text-amber-600 font-medium">Gap: {inventoryRetail.gap} vehículos para la meta</p>
            </Card>
          </div>
        </div>

        {/* ── Metas ─────────────────────────────────────────────────────────── */}
        <Card className="p-4 border border-border rounded-2xl shadow-sm">
          <SectionTitle color="bg-primary">Metas</SectionTitle>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Capacidad del patio</span>
                </div>
                <span className="text-sm font-bold text-foreground">{inventory.enStock} / {capacityTarget}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((inventory.enStock || 0) / Math.max(capacityTarget, 1) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">Compras vs Meta</span>
                </div>
                <span className="text-sm font-bold text-foreground">{goalActual} / {goalTarget}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-secondary" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Alertas Locales ───────────────────────────────────────────────── */}
        <div>
          <SectionTitle color="bg-amber-500">Alertas Locales</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 border border-amber-200 bg-amber-50 rounded-2xl shadow-sm text-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-700">{alerts.sinLeer}</p>
              <p className="text-[10px] text-amber-600 font-semibold leading-tight mt-0.5">Sin leer</p>
            </Card>
            <Card className="p-3 border border-amber-200 bg-amber-50 rounded-2xl shadow-sm text-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-700">{alerts.peritajesSinAsignar}</p>
              <p className="text-[10px] text-amber-600 font-semibold leading-tight mt-0.5">Sin asignar</p>
            </Card>
            <Card className={`p-3 border rounded-2xl shadow-sm text-center ${alerts.stockBajo ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <Package className={`w-4 h-4 mx-auto mb-1 ${alerts.stockBajo ? 'text-red-500' : 'text-emerald-500'}`} />
              <p className={`text-sm font-bold ${alerts.stockBajo ? 'text-red-600' : 'text-emerald-600'}`}>{alerts.stockBajo ? 'Bajo' : 'OK'}</p>
              <p className={`text-[10px] font-semibold leading-tight mt-0.5 ${alerts.stockBajo ? 'text-red-500' : 'text-emerald-500'}`}>Stock</p>
            </Card>
          </div>
        </div>

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-foreground pt-1">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Solicitudes', sub: `${pendingUsers.length} pendientes`, path: '/AdminSolicitudes', icon: UserCheck, alert: pendingUsers.length > 0 },
            { label: 'Subastas', sub: `${NUM(byStatus.ACTIVE || 0)} activas`, path: '/AdminSubastas', icon: Car },
            { label: 'Movimientos', sub: `${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`, path: '/AdminMovimientos', icon: DollarSign },
            { label: 'Postventa', sub: `${NUM(dashboard?.auctions?.pipeline?.transactionsPending || 0)} pendientes`, path: '/AdminInventario', icon: Package },
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
