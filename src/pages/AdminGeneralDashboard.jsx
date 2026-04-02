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
  Users, Car, DollarSign, TrendingUp,
  CheckCircle, Building2, BarChart3, UserPlus, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { analyticsApi, usersApi, branchesApi, companiesApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

// ── Modal: Crear Admin Sucursal ───────────────────────────────────────────────
function CreateAdminModal({ branches, onCreated }) {
  const [form, setForm] = useState({ email: '', nombre: '', branchId: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.nombre || !form.branchId) {
      toast.error('Completa los campos requeridos');
      return;
    }
    try {
      setLoading(true);
      await usersApi.createAdmin({ ...form, telefono: form.telefono || undefined });
      toast.success('Admin creado', { description: `${form.nombre} fue creado como Admin de Sucursal.` });
      setOpen(false);
      setForm({ email: '', nombre: '', branchId: '', telefono: '' });
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

  const byRole = dashboard?.users?.byRole || {};
  const byStatus = dashboard?.auctions?.byStatus || {};

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel General" subtitle="Vista del concesionario" />

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">

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

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-foreground pt-1">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Solicitudes', sub: `${pendingUsers.length} pendientes`, path: '/AdminSolicitudes', icon: Users, alert: pendingUsers.length > 0 },
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
