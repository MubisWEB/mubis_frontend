import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import {
  Car, Gavel, ReceiptText, TrendingUp, Users, MousePointerClick,
  PackageCheck, Package2, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { analyticsApi } from '@/api/services';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';

const PRIMARY = '#1a9d3d';
const SECONDARY = '#9d4edd';
const COLORS = [PRIMARY, SECONDARY, '#f59e0b', '#3b82f6', '#ef4444'];

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function StatCard({ icon: Icon, label, value, color = 'text-primary', delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="p-4 border border-border shadow-sm rounded-xl hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      </Card>
    </motion.div>
  );
}

export default function AdminAnaliticas() {
  const [overview, setOverview] = useState(null);
  const [market, setMarket] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [dealersData, setDealersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [ov, mk, pp, dl] = await Promise.all([
        analyticsApi.overview().catch(() => null),
        analyticsApi.market().catch(() => null),
        analyticsApi.inventoryPipeline().catch(() => null),
        analyticsApi.dealers().catch(() => []),
      ]);
      setOverview(ov);
      setMarket(mk);
      setPipeline(pp);
      setDealersData(Array.isArray(dl) ? dl : []);
    } catch (err) {
      toast.error('Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted pb-28">
        <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />
        <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card">
                <Skeleton width="50%" height={12} />
                <Skeleton width="40%" height={28} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
            <Skeleton height={200} />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Overview stats
  const stats = [
    { icon: Car, label: 'Total vehículos', value: overview?.vehicles ?? 0, color: 'text-primary' },
    { icon: Gavel, label: 'Subastas activas', value: overview?.auctions?.byStatus?.ACTIVE ?? 0, color: 'text-secondary' },
    { icon: ReceiptText, label: 'Transacciones', value: overview?.transactions?.total ?? 0, color: 'text-primary' },
    { icon: TrendingUp, label: 'Revenue total', value: formatPrice(overview?.transactions?.totalRevenue ?? 0), color: 'text-secondary' },
    { icon: Users, label: 'Usuarios totales', value: overview?.users?.total ?? 0, color: 'text-primary' },
    { icon: MousePointerClick, label: 'Pujas totales', value: overview?.bids ?? 0, color: 'text-secondary' },
  ];

  // Auctions pie
  const auctionStatus = overview?.auctions?.byStatus
    ? [
        { name: 'Activas', value: overview.auctions.byStatus.ACTIVE || 0 },
        { name: 'Dec. pendiente', value: overview.auctions.byStatus.PENDING_DECISION || 0 },
        { name: 'Finalizadas', value: overview.auctions.byStatus.ENDED || 0 },
        { name: 'Cerradas', value: overview.auctions.byStatus.CLOSED || 0 },
      ].filter(d => d.value > 0)
    : [];

  // Monthly trend
  const monthly = (market?.monthly || []).map(m => ({
    mes: m.month?.slice(5) || m.month,
    subastas: m.count || 0,
    revenue: m.revenue || 0,
  }));

  // Pipeline
  const pipelineStats = pipeline
    ? [
        { label: 'Esperando pago', value: pipeline.awaitingPayment ?? 0 },
        { label: 'Esperando docs', value: pipeline.awaitingDocs ?? 0 },
        { label: 'Docs en tránsito', value: pipeline.awaitingDispatch ?? 0 },
        { label: 'En camino', value: pipeline.awaitingDelivery ?? 0 },
        { label: 'Entregados', value: pipeline.delivered ?? 0 },
      ]
    : [];

  // Top 5 brands by price
  const topBrands = (market?.priceByBrand || [])
    .slice(0, 5)
    .map(b => ({ name: b.brand, precio: Math.round(b._avg?.current_bid || 0) }));

  // Top 5 models
  const topModels = (market?.topModels || []).slice(0, 5);

  // Top dealers
  const topDealers = [...dealersData]
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-6">

        {/* Overview KPIs */}
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Resumen general</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.05} />
            ))}
          </div>
        </div>

        {/* Subastas por estado (pie) */}
        {auctionStatus.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-secondary" />Subastas por estado
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={auctionStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                      {auctionStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {auctionStatus.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-foreground">{d.name}</span>
                      </div>
                      <span className="font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tendencia mensual */}
        {monthly.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />Tendencia mensual
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="gradSubastas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SECONDARY} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={SECONDARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="subastas" stroke={SECONDARY} fill="url(#gradSubastas)" strokeWidth={2} name="Subastas" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Pipeline de inventario */}
        {pipelineStats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Package2 className="w-4 h-4 text-secondary" />Pipeline de inventario
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {pipelineStats.map((p, i) => (
                  <div key={p.label} className="text-center p-3 bg-muted rounded-xl">
                    <p className="text-2xl font-bold font-mono" style={{ color: COLORS[i % COLORS.length] }}>{p.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{p.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Market: Top marcas */}
        {topBrands.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-secondary" />Top marcas por precio promedio
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topBrands} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip formatter={(v) => [formatPrice(v), 'Precio prom.']} />
                  <Bar dataKey="precio" fill={SECONDARY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Top modelos */}
        {topModels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />Top modelos más pujados
              </p>
              <div className="space-y-2">
                {topModels.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="font-medium text-foreground">{m.brand} {m.model} {m.year}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">{m.bids_count} pujas</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(m.current_bid || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Ranking dealers */}
        {topDealers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />Ranking de dealers
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left pb-2">#</th>
                      <th className="text-left pb-2">Nombre</th>
                      <th className="text-left pb-2 hidden md:table-cell">Empresa</th>
                      <th className="text-right pb-2">Subastas</th>
                      <th className="text-right pb-2">Completadas</th>
                      <th className="text-right pb-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDealers.map((d, i) => (
                      <tr key={d.id || i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-bold text-muted-foreground">{i + 1}</td>
                        <td className="py-2 font-medium text-foreground">{d.nombre || d.name || '—'}</td>
                        <td className="py-2 text-muted-foreground hidden md:table-cell">{d.company || '—'}</td>
                        <td className="py-2 text-right">{d.auctions || 0}</td>
                        <td className="py-2 text-right text-primary font-medium">{d.completedTransactions || 0}</td>
                        <td className="py-2 text-right font-bold text-secondary">
                          {d.revenue ? `$${(d.revenue / 1000000).toFixed(1)}M` : '$0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
