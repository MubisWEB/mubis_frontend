import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { BarChart3, Users, Gavel, FileCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { adminApi } from '@/api/services';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(280 60% 50%)'];

export default function AdminAnaliticas() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  if (!analytics) return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground text-sm">Cargando analíticas...</p>
      </div>
      <BottomNav />
    </div>
  );

  const {
    stats = {},
    auctionsByCompany = [],
    inspByBranch = [],
    usersByRole = [],
  } = analytics;

  const kpis = [
    { icon: Gavel, label: 'Subastas activas', value: stats.auctions?.active ?? 0, color: 'text-primary' },
    { icon: TrendingUp, label: 'Finalizadas con ganador', value: stats.auctions?.withWinner ?? 0, color: 'text-secondary' },
    { icon: FileCheck, label: 'Peritajes completados', value: stats.inspections?.completed ?? 0, color: 'text-primary' },
    { icon: Users, label: 'Usuarios verificados', value: (stats.dealers?.verified ?? 0) + (stats.peritos?.verified ?? 0) + (stats.recompradores?.verified ?? 0), color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k, i) => (
            <Card key={i} className="p-4 border border-border shadow-sm rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 border border-border shadow-sm rounded-xl">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-secondary" />Subastas por empresa</p>
          {auctionsByCompany.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={auctionsByCompany}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border shadow-sm rounded-xl">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2"><FileCheck className="w-4 h-4 text-secondary" />Peritajes completados por sucursal</p>
          {inspByBranch.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={inspByBranch}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border shadow-sm rounded-xl">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-secondary" />Usuarios verificados por rol</p>
          {usersByRole.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
                    {usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {usersByRole.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-foreground">{r.name}: <span className="font-bold">{r.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
