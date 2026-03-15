import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Car, Gavel, ReceiptText, TrendingUp, PackageCheck, Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { analyticsApi } from '@/api/services';
import { toast } from 'sonner';

const PRIMARY = '#1a9d3d';
const SECONDARY = '#9d4edd';
const COLORS = [PRIMARY, SECONDARY, '#f59e0b', '#3b82f6', '#ef4444'];

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const STATUS_LABELS = {
  ACTIVE: 'Activas',
  PENDING_DECISION: 'Dec. pendiente',
  ENDED: 'Finalizadas',
  CLOSED: 'Cerradas',
};

export default function MiRendimiento() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await analyticsApi.myPerformance();
      setData(res);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar el rendimiento');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { icon: Car, label: 'Mis vehículos', value: data?.vehicles ?? 0, color: 'text-primary' },
    { icon: Gavel, label: 'Subastas totales', value: data?.auctions?.total ?? 0, color: 'text-secondary' },
    { icon: ReceiptText, label: 'Transacciones completadas', value: data?.transactions?.completed ?? 0, color: 'text-primary' },
    { icon: TrendingUp, label: 'Revenue total', value: formatPrice(data?.transactions?.revenue ?? 0), color: 'text-secondary' },
    { icon: PackageCheck, label: 'Entregas pendientes', value: data?.inventory?.pendingDelivery ?? 0, color: 'text-yellow-600' },
  ];

  const auctionsPie = data?.auctions?.byStatus
    ? Object.entries(data.auctions.byStatus)
        .map(([key, val]) => ({ name: STATUS_LABELS[key] || key, value: val || 0 }))
        .filter(d => d.value > 0)
    : [];

  const topAuctions = data?.topAuctions || [];

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Mi Rendimiento" showBack />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subastas por estado */}
        {auctionsPie.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4">Subastas por estado</p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={auctionsPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                      {auctionsPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {auctionsPie.map((d, i) => (
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

        {/* Top 5 subastas */}
        {topAuctions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="p-4 border border-border shadow-sm rounded-xl">
              <p className="font-bold text-foreground mb-4">Mis top 5 subastas</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left pb-2">Vehículo</th>
                      <th className="text-right pb-2">Pujas</th>
                      <th className="text-right pb-2">Puja actual</th>
                      <th className="text-right pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAuctions.map((a, i) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2 font-medium text-foreground">
                          {a.brand} {a.model} <span className="text-muted-foreground font-normal">{a.year}</span>
                        </td>
                        <td className="py-2 text-right font-bold text-secondary">{a.bids_count || 0}</td>
                        <td className="py-2 text-right text-primary font-semibold">
                          {a.current_bid ? `$${(a.current_bid / 1000000).toFixed(1)}M` : '—'}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            a.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            a.status === 'ENDED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {!data && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay datos de rendimiento disponibles.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
