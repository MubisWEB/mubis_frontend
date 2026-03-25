import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign, TrendingUp, Car, Banknote,
  Users, FileText, MessageCircle, Package2, Target, Building2, Upload,
  BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { superadminApi, companiesApi, casesApi, adminApi } from '@/api/services';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const MONTHS = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [openCasesCount, setOpenCasesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState(null);

  // Filters
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [companyId, setCompanyId] = useState('all');

  const loadData = async () => {
    try {
      const params = { period, year };
      if (period === 'monthly') params.month = month;
      if (companyId !== 'all') params.companyId = companyId;

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
  }, [period, year, month, companyId]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [period, year, month, companyId]);

  const kpis = dashboard?.kpis || {};
  const salesByCompany = dashboard?.salesByCompany || [];
  const salesByBranch = dashboard?.salesByBranch || [];
  const salesTrend = dashboard?.salesTrend || [];
  const topDealers = dashboard?.topDealers || [];

  // Pie chart data for company distribution
  const companyPieData = useMemo(() =>
    salesByCompany.map(c => ({ name: c.companyName, value: c.transactionCount })),
    [salesByCompany]
  );

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-muted pb-28">
        <Header title="SuperAdmin" subtitle="Panel de control" />
        <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
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

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">

        {/* Filters */}
        <Card className="p-3 border border-border shadow-sm">
          <div className="flex gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px] h-9 text-xs rounded-lg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[90px] h-9 text-xs rounded-lg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            {period === 'monthly' && (
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[120px] h-9 text-xs rounded-lg border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger className="flex-1 min-w-[140px] h-9 text-xs rounded-lg border-border">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Quick Actions */}
        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
