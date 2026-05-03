import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign, TrendingUp, Car, Banknote,
  Users, FileText, MessageCircle, Package2, Building2, Upload, Image,
  BarChart3, ArrowUpRight, Handshake, AlertTriangle, Activity, Globe,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { superadminApi, companiesApi, casesApi, adminApi, branchesApi } from '@/api/services';
import { formatCompactCOP } from '@/lib/formatters';

const COP = formatCompactCOP;
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MONTHS_LABELS = (() => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleString('es-CO', { month: 'short', year: '2-digit' });
  });
})();

// ── Componente: separador de sección ─────────────────────────────────────────
function SectionTitle({ color = 'bg-secondary', children, sub }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-5 rounded-full ${color}`} />
      <h2 className="text-base font-bold text-foreground">{children}</h2>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

const YEARS = Array.from({ length: 5 }, (_, i) => 2026 + i); // 2026 en adelante
const MONTHS = [
  { value: 'all', label: 'Todo el año' },
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

// Simulación de KPIs cuando el back aún no devuelve datos
const EMPTY_KPIS = { totalSales: 0, totalTransactions: 0, activeVehicles: 0, totalBrokerage: 0 };
const EMPTY_MONTHLY = MONTHS_LABELS.map((mes) => ({ mes, publicados: 0, vendidos: 0, comprados: 0 }));
const EMPTY_PIPELINE = [
  { etapa: 'En peritaje', count: 0, color: '#6366f1' },
  { etapa: 'Rechazadas', count: 0, color: '#ef4444' },
  { etapa: 'Activas', count: 0, color: '#3b82f6' },
  { etapa: 'En decision', count: 0, color: '#f59e0b' },
  { etapa: 'Postventa', count: 0, color: '#06b6d4' },
  { etapa: 'Sin ganador', count: 0, color: '#10b981' },
];
const EMPTY_API_STATS = { consumed: 0, limit: null, cost: 0, errorRate: 0, noDataRate: 0, breakdown: [] };
const EMPTY_ALERTS = { sinLeer: 0, peritajesSinAsignar: 0, dealsPendientes: 0 };
const EMPTY_SUMMARY = { concesionariosActivos: 0, adminsCreados: 0, partnersAsociados: 0 };

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [openCasesCount, setOpenCasesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState(null);

  // Filters
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('all');
  const [companyId, setCompanyId] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [branches, setBranches] = useState([]);

  // Load branches when company changes
  useEffect(() => {
    if (companyId !== 'all') {
      branchesApi.getAll().then(all => setBranches((all || []).filter(b => b.companyId === companyId || b.company?.id === companyId))).catch(() => setBranches([]));
    } else {
      setBranches([]);
      setBranchId('all');
    }
  }, [companyId]);

  const loadData = async () => {
    try {
      const period = month === 'all' ? 'yearly' : 'monthly';
      const params = { period, year };
      if (month !== 'all') params.month = month;
      if (companyId !== 'all') params.companyId = companyId;
      if (branchId !== 'all') params.branchId = branchId;

      const [dash, comps, allCases, stats] = await Promise.all([
        superadminApi.getDashboard(params),
        companiesApi.getAll().catch(() => []),
        casesApi.getAll().catch(() => []),
        adminApi.getStats().catch(() => null),
      ]);

      setDashboard(dash);
      setCompanies((comps || []).filter(c => c.active));
      setOpenCasesCount((allCases || []).filter(c => c.status === 'OPEN').length);
      if (stats) {
        const p = (stats.dealers?.pending || 0) + (stats.peritos?.pending || 0) + (stats.recompradores?.pending || 0);
        setPendingCount(p);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      if (!dashboard) setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [year, month, companyId, branchId]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [year, month, companyId, branchId]);

  const kpis = {
    totalSales: dashboard?.kpis?.totalSales ?? EMPTY_KPIS.totalSales,
    totalTransactions: dashboard?.kpis?.totalTransactions ?? EMPTY_KPIS.totalTransactions,
    activeVehicles: dashboard?.kpis?.activeVehicles ?? EMPTY_KPIS.activeVehicles,
    totalBrokerage: dashboard?.kpis?.totalBrokerage ?? EMPTY_KPIS.totalBrokerage,
  };
  const salesByCompany = dashboard?.salesByCompany || [];
  const salesByBranch = dashboard?.salesByBranch || [];
  const salesTrend = dashboard?.salesTrend || [];
  const topDealers = dashboard?.topDealers || [];
  const monthlyVehicleStats = dashboard?.monthlyVehicleStats?.length ? dashboard.monthlyVehicleStats : EMPTY_MONTHLY;
  const monthlyTotals = monthlyVehicleStats.reduce(
    (acc, item) => ({
      publicados: acc.publicados + (item.publicados || 0),
      vendidos: acc.vendidos + (item.vendidos || 0),
      comprados: acc.comprados + (item.comprados || 0),
    }),
    { publicados: 0, vendidos: 0, comprados: 0 },
  );
  const pipelineData = buildPipelineData(dashboard?.pipeline);
  const pipelineMax = Math.max(...pipelineData.map((item) => item.count), 1);
  const summary = dashboard?.summary || EMPTY_SUMMARY;
  const wholesaleStats = dashboard?.wholesaleStats || [];
  const apiStats = dashboard?.apiStats || EMPTY_API_STATS;
  const operationalAlerts = dashboard?.operationalAlerts || EMPTY_ALERTS;

  // Pie chart data for company distribution
  const companyPieData = useMemo(() =>
    salesByCompany.map(c => ({ name: c.companyName, value: c.transactionCount })),
    [salesByCompany]
  );

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-muted pb-28">
        <Header title="SuperAdmin" subtitle="Panel de control" />
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <Skeleton width="50%" height={13} />
                <Skeleton width="70%" height={28} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton width="40%" height={16} style={{ marginBottom: 16 }} />
            <Skeleton height={180} borderRadius={8} />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!dashboard && error) {
    return (
      <div className="min-h-screen bg-muted pb-28">
        <Header title="SuperAdmin" subtitle="Panel de control" />
        <div className="max-w-7xl mx-auto px-4 pt-8 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => { setLoading(true); loadData(); }} variant="outline" className="rounded-full">
            Reintentar
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="SuperAdmin" subtitle="Panel de control" />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

        {/* Filters */}
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex gap-2 flex-wrap items-center">
            {/* 1. Empresa */}
            <Select value={companyId} onValueChange={(v) => { setCompanyId(v); setBranchId('all'); }}>
              <SelectTrigger className="flex-1 min-w-[150px] h-9 text-xs rounded-lg border-border">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* 2. Sucursal (solo si hay empresa seleccionada) */}
            {companyId !== 'all' && (
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="flex-1 min-w-[140px] h-9 text-xs rounded-lg border-border">
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {/* 3. Año (2026 en adelante) */}
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[90px] h-9 text-xs rounded-lg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* 4. Mes */}
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-lg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{COP(kpis.totalSales)}</p>
            <p className="text-xs text-muted-foreground">Ventas totales</p>
          </Card>

          <Card className="p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{NUM(kpis.totalTransactions)}</p>
            <p className="text-xs text-muted-foreground">Transacciones</p>
          </Card>

          <Card className="p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Car className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{NUM(kpis.activeVehicles)}</p>
            <p className="text-xs text-muted-foreground">Vehículos activos</p>
          </Card>

          <Card className="p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{COP(kpis.totalBrokerage)}</p>
            <p className="text-xs text-muted-foreground">Corretaje generado</p>
          </Card>
        </div>

        {/* Sales Trend */}
        {salesTrend.length > 0 && (
          <Card className="p-4 border border-border shadow-sm">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-secondary" /> Tendencia de ventas
            </h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value, name) => [COP(value), name === 'totalSales' ? 'Ventas' : 'Transacciones']}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="totalSales" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Ventas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Sales by Company */}
        {salesByCompany.length > 0 && (
          <Card className="p-4 border border-border shadow-sm">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-secondary" /> Ventas por empresa
            </h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCompany} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="companyName" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip
                    formatter={(value) => [COP(value), 'Ventas']}
                    contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }}
                  />
                  <Bar dataKey="totalSales" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Company table */}
            <div className="mt-4 space-y-2">
              {salesByCompany.map((c, i) => (
                <div key={c.companyId} className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="font-medium text-foreground">{c.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{c.transactionCount} transac.</span>
                    <span className="font-semibold text-foreground">{COP(c.totalSales)}</span>
                    <Badge className="bg-primary/10 text-primary text-[10px]">{COP(c.brokerage)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sales by Branch */}
        {salesByBranch.length > 0 && (
          <Card className="p-4 border border-border shadow-sm">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Ventas por sucursal
            </h2>
            <div className="space-y-2">
              {salesByBranch.map((b, i) => (
                <div key={b.branchId} className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
                  <div>
                    <span className="font-medium text-foreground">{b.branchName}</span>
                    <span className="text-xs text-muted-foreground ml-2">{b.companyName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{b.transactionCount} transac.</span>
                    <span className="font-semibold text-foreground">{COP(b.totalSales)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Distribution Pie + Top Dealers */}
        <div className="grid grid-cols-1 gap-4">
          {/* Company distribution */}
          {companyPieData.length > 0 && (
            <Card className="p-4 border border-border shadow-sm">
              <h2 className="font-bold text-foreground mb-3">Distribución de transacciones</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={companyPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2} dataKey="value">
                      {companyPieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Top Dealers */}
          {topDealers.length > 0 && (
            <Card className="p-4 border border-border shadow-sm">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" /> Top Dealers
              </h2>
              <div className="space-y-2">
                {topDealers.slice(0, 10).map((d, i) => (
                  <div key={d.dealerId} className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-medium text-foreground">{d.dealerName}</span>
                        <p className="text-[10px] text-muted-foreground">{d.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{d.vehiclesSold} vendidos</p>
                      <p className="text-[10px] text-muted-foreground">{COP(d.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── Vehículos por Mes + Pipeline ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionTitle color="bg-secondary" sub="(últimos 6 meses)">Vehículos por Mes</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-2xl p-3 bg-purple-50 border border-purple-100">
                <p className="text-xl font-bold text-purple-700">{monthlyTotals.publicados}</p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Publicados</p>
              </div>
              <div className="rounded-2xl p-3 bg-blue-50 border border-blue-100">
                <p className="text-xl font-bold text-blue-700">{monthlyTotals.vendidos}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Vendidos</p>
              </div>
              <div className="rounded-2xl p-3 bg-emerald-50 border border-emerald-100">
                <p className="text-xl font-bold text-emerald-700">{monthlyTotals.comprados}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Comprados</p>
              </div>
            </div>
            <Card className="p-4 border border-border rounded-2xl shadow-sm h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVehicleStats} barGap={2} barCategoryGap="25%">
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
            <SectionTitle color="bg-indigo-500">Pipeline de Transacciones</SectionTitle>
            <Card className="p-4 border border-border rounded-2xl shadow-sm" style={{ minHeight: 290 }}>
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
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Mayoristas + API ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-border rounded-2xl shadow-sm">
            <SectionTitle color="bg-cyan-500">Mayoristas</SectionTitle>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[300px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground font-semibold pb-2 pr-3">Nombre</th>
                    <th className="text-right text-xs text-muted-foreground font-semibold pb-2 pr-3">Part.%</th>
                    <th className="text-right text-xs text-muted-foreground font-semibold pb-2 pr-3">Ganadas</th>
                    <th className="text-right text-xs text-muted-foreground font-semibold pb-2 pr-3">Precio Prom.</th>
                    <th className="text-right text-xs text-muted-foreground font-semibold pb-2">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesaleStats.map((m, i) => (
                    <tr key={i} className={`${i % 2 === 1 ? 'bg-muted/40' : ''}`}>
                      <td className="py-2.5 pr-3 font-semibold text-foreground text-sm">{m.nombre}</td>
                      <td className="py-2.5 pr-3 text-right text-muted-foreground text-xs">{m.participacion}%</td>
                      <td className="py-2.5 pr-3 text-right font-bold text-foreground">{m.ganadas}</td>
                      <td className="py-2.5 pr-3 text-right text-muted-foreground text-[11px]">{COP(m.precioPromedio)}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.conversion >= 65 ? 'bg-emerald-100 text-emerald-700' : m.conversion >= 55 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {m.conversion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div>
            <SectionTitle color="bg-blue-500">Consultas Externas (API)</SectionTitle>
            <div className="space-y-3">
              <Card className="p-4 border border-border rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-semibold text-foreground">Consumo API</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{NUM(apiStats.consumed)}</p>
                </div>
                <p className="text-xs text-muted-foreground text-right">Consultas reales de Verifik/Fasecolda - ultimos 30 dias</p>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 border border-emerald-200 bg-emerald-50 rounded-2xl shadow-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600 mb-2" />
                  <p className="text-xl font-bold text-emerald-700">{COP(apiStats.cost)}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Costo total</p>
                </Card>
                <Card className="p-4 border border-red-200 bg-red-50 rounded-2xl shadow-sm">
                  <Activity className="w-4 h-4 text-red-500 mb-2" />
                  <p className="text-xl font-bold text-red-600">{apiStats.errorRate}%</p>
                  <p className="text-[10px] text-red-500 font-semibold mt-0.5">Tasa de error</p>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Card className="p-4 border border-amber-200 bg-amber-50 rounded-2xl shadow-sm">
                  <Activity className="w-4 h-4 text-amber-500 mb-2" />
                  <p className="text-xl font-bold text-amber-600">{apiStats.noDataRate || 0}%</p>
                  <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Sin datos</p>
                </Card>
                <Card className="p-4 border border-border rounded-2xl shadow-sm bg-card">
                  <p className="text-xs font-semibold text-foreground mb-1">Endpoint principal</p>
                  <p className="text-sm font-bold text-foreground">{apiStats.breakdown?.[0]?.endpoint || 'Sin consumo'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{NUM(apiStats.breakdown?.[0]?.consumed || 0)} consultas</p>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alertas + Resumen ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionTitle color="bg-amber-500">Alertas Operacionales</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Sin leer', value: operationalAlerts.sinLeer },
                { label: 'Sin asignar', value: operationalAlerts.peritajesSinAsignar },
                { label: 'Deals pend.', value: operationalAlerts.dealsPendientes },
              ].map((a, i) => (
                <Card key={i} className="p-3 border border-amber-200 bg-amber-50 rounded-2xl shadow-sm text-center">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-700">{a.value}</p>
                  <p className="text-[10px] text-amber-600 font-semibold leading-tight mt-0.5">{a.label}</p>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle color="bg-primary">Resumen General</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 border border-border rounded-2xl shadow-sm text-center">
                <Building2 className="w-4 h-4 text-secondary mx-auto mb-1" />
                <p className="text-2xl font-bold text-secondary">{summary.concesionariosActivos}</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">Concesionarios</p>
              </Card>
              <Card className="p-3 border border-border rounded-2xl shadow-sm text-center">
                <Users className="w-4 h-4 text-secondary mx-auto mb-1" />
                <p className="text-2xl font-bold text-secondary">{summary.adminsCreados}</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">Admins</p>
              </Card>
              <Card className="p-3 border border-border rounded-2xl shadow-sm text-center">
                <Handshake className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{summary.partnersAsociados}</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">Partners</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3">Acciones rápidas</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <Button onClick={() => navigate('/AdminDealers')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Users className="w-5 h-5 text-secondary" />
              <span className="text-xs">Usuarios</span>
            </Button>
            <Button onClick={() => navigate('/AdminSolicitudes')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5 relative">
              <FileText className="w-5 h-5 text-secondary" />
              <span className="text-xs">Solicitudes</span>
              {pendingCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full p-0 px-1.5">
                  {pendingCount}
                </Badge>
              )}
            </Button>
            <Button onClick={() => navigate('/AdminCasos')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5 relative">
              <MessageCircle className="w-5 h-5 text-secondary" />
              <span className="text-xs">Soporte</span>
              {openCasesCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full p-0 px-1.5">
                  {openCasesCount}
                </Badge>
              )}
            </Button>
            <Button onClick={() => navigate('/AdminEmpresas')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Building2 className="w-5 h-5 text-secondary" />
              <span className="text-xs">Empresas</span>
            </Button>
            <Button onClick={() => navigate('/AdminCargaMasiva')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Upload className="w-5 h-5 text-secondary" />
              <span className="text-xs">Carga masiva</span>
            </Button>
            <Button onClick={() => navigate('/AdminSucursales')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-xs">Sucursales</span>
            </Button>
            <Button onClick={() => navigate('/AdminSubastas')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Car className="w-5 h-5 text-secondary" />
              <span className="text-xs">Subastas</span>
            </Button>
            <Button onClick={() => navigate('/AdminInventario')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Package2 className="w-5 h-5 text-secondary" />
              <span className="text-xs">Inventario</span>
            </Button>
            <Button onClick={() => navigate('/AdminBanners')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Image className="w-5 h-5 text-secondary" />
              <span className="text-xs">Banners</span>
            </Button>
            <Button onClick={() => navigate('/AdminPartners')} variant="outline" className="h-auto py-3 rounded-xl flex flex-col items-center gap-1.5">
              <Handshake className="w-5 h-5 text-secondary" />
              <span className="text-xs">Partners</span>
            </Button>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
