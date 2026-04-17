import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Car, DollarSign, CheckCircle, Building2, BarChart3, UserPlus, ArrowUpRight,
  AlertTriangle, Target, TrendingUp, Clock, Package,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { analyticsApi, usersApi, branchesApi, companiesApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';

// ── Datos simulados ───────────────────────────────────────────────────────────
const MONTHS_LABELS = (() => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleString('es-CO', { month: 'short', year: '2-digit' });
  });
})();

const SIM_AG = {
  pipeline: [
    { etapa: 'Solicitudes', count: 38, color: '#8b5cf6' },
    { etapa: 'Inspeccionados', count: 26, color: '#6366f1' },
    { etapa: 'En subasta', count: 19, color: '#3b82f6' },
    { etapa: 'Con oferta', count: 13, color: '#06b6d4' },
    { etapa: 'Cerrados', count: 8, color: '#10b981' },
  ],
  vendedores: [
    { nombre: 'Ana Martinez', solicitudes: 12, cierres: 5, tasa: 42 },
    { nombre: 'Carlos Ruiz', solicitudes: 9, cierres: 4, tasa: 44 },
    { nombre: 'Laura Gomez', solicitudes: 8, cierres: 3, tasa: 38 },
  ],
  tasadores: [
    { nombre: 'Pedro Diaz', tiempoRespuesta: '2.3h', tasaCierre: 68 },
    { nombre: 'Maria Lopez', tiempoRespuesta: '1.8h', tasaCierre: 72 },
  ],
  inspectores: [
    { nombre: 'Juan Perez', tiempoPeritaje: '45min', llenado: 94, costoReparacion: 2800000 },
    { nombre: 'Sofia Castro', tiempoPeritaje: '52min', llenado: 88, costoReparacion: 3200000 },
  ],
  metas: { objetivo: 25, actual: 19 },
  demanda: [
    { modelo: 'Toyota Corolla', solicitudes: 8 },
    { modelo: 'Mazda 3', solicitudes: 6 },
    { modelo: 'Chevrolet Onix', solicitudes: 5 },
    { modelo: 'Renault Duster', solicitudes: 4 },
  ],
  monthly: [
    { publicados: 8, vendidos: 5, comprados: 4 },
    { publicados: 11, vendidos: 7, comprados: 6 },
    { publicados: 9, vendidos: 6, comprados: 5 },
    { publicados: 14, vendidos: 9, comprados: 7 },
    { publicados: 12, vendidos: 7, comprados: 6 },
    { publicados: 16, vendidos: 10, comprados: 8 },
  ].map((d, i) => ({ ...d, mes: MONTHS_LABELS[i] })),
  alertas: { sinLeer: 4, peritajesSinAsignar: 2, rechazadas: 3 },
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
const EMPTY_GOALS = { objetivo: 0, actual: 0 };
const EMPTY_ALERTS = { sinLeer: 0, peritajesSinAsignar: 0, rechazadas: 0 };

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

function SectionTitle({ color = 'bg-secondary', children, sub }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-5 rounded-full ${color}`} />
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

function PerfTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className={`text-xs text-muted-foreground font-semibold pb-2 ${i === 0 ? 'text-left pr-3' : 'text-right pr-2'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-muted/40' : ''}>
              {row.map((cell, j) => (
                <td key={j} className={`py-2.5 ${j === 0 ? 'font-semibold text-foreground text-sm pr-3' : 'text-right text-muted-foreground text-xs pr-2'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

// ── Modal: Crear Admin Sucursal ───────────────────────────────────────────────
function CreateAdminModal({ branches, onCreated }) {
  const [form, setForm] = useState({ email: '', nombre: '', branchId: '', telefono: '', trialStart: '', trialEnd: '', brokerageDiscount: '' });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.nombre || !form.branchId) {
      toast.error('Completa los campos requeridos');
      return;
    }
    try {
      setLoading(true);
      await usersApi.createAdmin({
        ...form,
        telefono: form.telefono || undefined,
        trialStart: form.trialStart || undefined,
        trialEnd: form.trialEnd || undefined,
        brokerageDiscount: form.brokerageDiscount ? Number(form.brokerageDiscount) : undefined,
      });
      toast.success('Admin creado', { description: `${form.nombre} fue creado como Admin de Sucursal.` });
      setOpen(false);
      setForm({ email: '', nombre: '', branchId: '', telefono: '', trialStart: '', trialEnd: '', brokerageDiscount: '' });
      onCreated();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) toast.error('Email ya registrado');
      else if (err?.response?.status === 404) toast.error('Sucursal no encontrada');
      else toast.error('Error al crear admin', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-full h-10 px-4 text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />Nuevo admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Crear Admin de Sucursal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Nombre *</Label>
            <Input placeholder="Juan Pérez" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-xl border-border h-11" />
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Email *</Label>
            <Input type="email" placeholder="admin.norte@empresa.co" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border-border h-11" />
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Sucursal *</Label>
            <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
              <SelectTrigger className="rounded-xl border-border h-11"><SelectValue placeholder="Seleccionar sucursal" /></SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name} — {b.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Teléfono (opcional)</Label>
            <Input placeholder="+57 300 000 0000" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="rounded-xl border-border h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Inicio periodo prueba</Label>
              <input type="date" value={form.trialStart} onChange={(e) => setForm({ ...form, trialStart: e.target.value })} className="w-full rounded-xl border border-input h-11 px-3 text-sm bg-background" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Fin periodo prueba</Label>
              <input type="date" value={form.trialEnd} onChange={(e) => setForm({ ...form, trialEnd: e.target.value })} className="w-full rounded-xl border border-input h-11 px-3 text-sm bg-background" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Descuento corretaje (%)</Label>
            <Input type="number" min="0" max="100" placeholder="0-100" value={form.brokerageDiscount} onChange={(e) => setForm({ ...form, brokerageDiscount: e.target.value })} className="rounded-xl border-border h-11" />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 rounded-full">
            {loading ? 'Creando...' : 'Crear admin de sucursal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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

export default function AdminGeneralDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const loadData = async (companyId) => {
    setLoading(true);
    try {
      const [dash, users, branchList] = await Promise.all([
        analyticsApi.companyDashboard(companyId || undefined).catch(() => null),
        usersApi.getPending().catch(() => []),
        branchesApi.getAll().catch(() => []),
      ]);
      setDashboard(dash);
      setPendingUsers(users || []);
      setBranches(branchList || []);
    } catch (err) {
      console.error('Error loading company dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperadmin) {
      companiesApi.getAll().catch(() => []).then(list => setCompanies(list || []));
    }
    loadData(selectedCompanyId);
    const iv = setInterval(() => loadData(selectedCompanyId), 30000);
    return () => clearInterval(iv);
  }, [selectedCompanyId]);

  const handleCompanyChange = (val) => {
    setSelectedCompanyId(val === 'all' ? '' : val);
  };

  const branchChartData = (dashboard?.branches || []).map((b) => ({
    name: b.branch,
    Subastas: b.auctions,
    Dealers: b.dealers,
  }));
  const monthlyData = dashboard?.monthlyVehicleStats?.length ? dashboard.monthlyVehicleStats : EMPTY_MONTHLY;
  const pipelineData = buildPipelineData(dashboard?.auctions?.pipeline);
  const pipelineMax = Math.max(...pipelineData.map((item) => item.count), 1);
  const widgets = dashboard?.widgets || {};
  const sellerPerformance = widgets.sellerPerformance || [];
  const inspectorPerformance = widgets.inspectorPerformance || [];
  const goalsSummary = widgets.goalsSummary || EMPTY_GOALS;
  const demandModels = widgets.demandModels || [];
  const alerts = widgets.alerts || EMPTY_ALERTS;
  const goalActual = goalsSummary.actual ?? EMPTY_GOALS.actual;
  const goalTarget = goalsSummary.objetivo || EMPTY_GOALS.objetivo;
  const goalPct = Math.min(100, Math.round((goalActual / Math.max(goalTarget, 1)) * 100));

  const byRole = dashboard?.users?.byRole || {};
  const byStatus = dashboard?.auctions?.byStatus || {};

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel General" subtitle="Vista del concesionario" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

        {/* Selector de empresa (solo superadmin) */}
        {isSuperadmin && companies.length > 0 && (
          <Card className="p-3 border border-border rounded-2xl bg-card">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Ver como empresa</p>
            <Select value={selectedCompanyId || 'all'} onValueChange={handleCompanyChange}>
              <SelectTrigger className="rounded-xl border-border h-10">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {/* Alerta de usuarios pendientes */}
        {pendingUsers.length > 0 && (
          <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
            <Users className="w-5 h-5 text-secondary flex-shrink-0" />
            <p className="text-sm font-semibold text-secondary flex-1">
              {pendingUsers.length} solicitud{pendingUsers.length !== 1 ? 'es' : ''} de usuario pendiente{pendingUsers.length !== 1 ? 's' : ''}
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
            <KpiCard icon={Users} label="Usuarios totales" value={NUM(dashboard?.users?.total)} sub={`D: ${byRole.DEALER || 0} · P: ${byRole.PERITO || 0} · R: ${byRole.RECOMPRADOR || 0}`} />
            <KpiCard icon={Car} label="Subastas activas" value={NUM(byStatus.ACTIVE)} sub={`${NUM(byStatus.ENDED || 0)} finalizadas`} />
            <KpiCard icon={DollarSign} label="Ingresos totales" value={COP(dashboard?.revenue?.total)} color="text-primary" />
            <KpiCard icon={CheckCircle} label="Verificaciones pendientes" value={NUM(pendingUsers.length)} alert={pendingUsers.length > 0} />
          </div>
        )}

        {/* Botón crear admin */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Sucursales</h2>
          <CreateAdminModal branches={branches} onCreated={() => loadData(selectedCompanyId)} />
        </div>

        {/* Tabla de sucursales */}
        {loading ? (
          <Card className="p-4 border border-border rounded-2xl animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            {[0, 1, 2].map((i) => <div key={i} className="h-4 bg-muted rounded mb-3" />)}
          </Card>
        ) : dashboard?.branches?.length > 0 ? (
          <>
            <div className="space-y-2">
              {dashboard.branches.map((b, idx) => (
                <Card
                  key={idx}
                  className="p-4 border border-border rounded-2xl bg-card cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => navigate(`/AdminSucursalDashboard?branchId=${b.branchId || b.id || idx}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{b.branch}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary/10 text-secondary border border-secondary/20 text-xs">
                        {NUM(b.auctions)} subastas
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Dealers</p>
                      <p className="text-sm font-bold text-foreground">{NUM(b.dealers)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ingresos</p>
                      <p className="text-sm font-bold text-primary">{COP(b.revenue)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Gráfico de sucursales */}
            {branchChartData.length > 0 && (
              <Card className="p-4 border border-border rounded-2xl bg-card">
                <h3 className="text-sm font-bold text-foreground mb-4">Subastas por sucursal</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={branchChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                    <Bar dataKey="Subastas" fill="hsl(265 90% 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-8 text-center border border-border rounded-2xl">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay datos de sucursales disponibles</p>
          </Card>
        )}

        {/* ── Vehículos por Mes + Pipeline ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionTitle color="bg-secondary" sub="(últimos 6 meses)">Vehículos por Mes</SectionTitle>
            <Card className="p-4 border border-border rounded-2xl shadow-sm h-[290px]">
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
            <SectionTitle color="bg-indigo-500">Pipeline del Concesionario</SectionTitle>
            <Card className="p-4 border border-border rounded-2xl shadow-sm h-[290px] flex flex-col justify-center">
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

        {/* ── Rendimiento Vendedores ────────────────────────────────────────── */}
        <Card className="p-4 border border-border rounded-2xl shadow-sm">
          <SectionTitle color="bg-blue-500">Rendimiento Vendedores</SectionTitle>
          <PerfTable
            headers={['Nombre', 'Solicitudes', 'Cierres', 'Tasa']}
            rows={sellerPerformance.map(v => [
              v.nombre,
              v.solicitudes,
              v.cierres,
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.tasa >= 43 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v.tasa}%</span>,
            ])}
          />
        </Card>

        {/* ── Tasadores + Inspectores ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-cyan-500">Rendimiento Tasadores</SectionTitle>
            <PerfTable
              headers={['Nombre', 'T. Respuesta', 'Tasa Cierre']}
              rows={inspectorPerformance.map(t => [
                t.nombre,
                <span className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{t.tiempoPeritaje || '-'}</span>,
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(t.llenado || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{t.llenado || 0}%</span>,
              ])}
            />
          </Card>
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-purple-500">Rendimiento Inspectores</SectionTitle>
            <PerfTable
              headers={['Nombre', 'T. Peritaje', 'Llenado', 'Costo Rep.']}
              rows={inspectorPerformance.map(ins => [
                ins.nombre,
                ins.tiempoPeritaje,
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ins.llenado >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{ins.llenado}%</span>,
                <span className="text-xs text-muted-foreground">{NUM(ins.peritajes || 0)} peritajes</span>,
              ])}
            />
          </Card>
        </div>

        {/* ── Metas + Demanda ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-primary">Metas Mensuales</SectionTitle>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ventas del mes</span>
              </div>
              <span className="text-sm font-bold text-foreground">{goalActual} / {goalTarget}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-1">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${goalPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-right">{goalPct}% completado</p>
          </Card>
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-orange-500">Modelos más Solicitados</SectionTitle>
            <div className="space-y-3">
              {demandModels.map((d, i) => {
                const pct = Math.round((d.solicitudes / Math.max(demandModels[0]?.solicitudes || 1, 1)) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground">{d.modelo}</span>
                      <span className="text-xs font-bold text-muted-foreground">{d.solicitudes} sol.</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Alertas ───────────────────────────────────────────────────────── */}
        <div>
          <SectionTitle color="bg-amber-500">Alertas</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
            {[
              { label: 'Sin leer', value: alerts.sinLeer },
              { label: 'Sin asignar', value: alerts.peritajesSinAsignar },
              { label: 'Rechazadas', value: alerts.rechazadas },
            ].map((a, i) => (
              <Card key={i} className="p-3 border border-amber-200 bg-amber-50 rounded-2xl shadow-sm text-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-700">{a.value}</p>
                <p className="text-[10px] text-amber-600 font-semibold leading-tight mt-0.5">{a.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-foreground pt-1">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Solicitudes', sub: `${pendingUsers.length} pendientes`, path: '/AdminSolicitudes', icon: Users, alert: pendingUsers.length > 0 },
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
