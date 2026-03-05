import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { BarChart3, Users, Gavel, FileCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getAdminStats, getAuctions, getInspections, getUsers } from '@/lib/mockStore';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(280 60% 50%)'];

export default function AdminAnaliticas() {
  const stats = getAdminStats();

  const auctionsByCompany = useMemo(() => {
    const auctions = getAuctions();
    const map = {};
    auctions.forEach(a => {
      const co = a.dealerCompany || 'Sin empresa';
      map[co] = (map[co] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, []);

  const inspByBranch = useMemo(() => {
    const insps = getInspections().filter(i => i.status === 'COMPLETED');
    const map = {};
    insps.forEach(i => {
      const b = i.dealerBranch || 'Sin sucursal';
      map[b] = (map[b] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, []);

  const usersByRole = useMemo(() => {
    const users = getUsers().filter(u => u.role !== 'admin' && u.verification_status === 'VERIFIED');
    const map = {};
    users.forEach(u => {
      const r = u.role.charAt(0).toUpperCase() + u.role.slice(1);
      map[r] = (map[r] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  const kpis = [
    { icon: Gavel, label: 'Subastas activas', value: stats.auctions.active, color: 'text-primary' },
    { icon: TrendingUp, label: 'Finalizadas con ganador', value: stats.auctions.withWinner, color: 'text-secondary' },
    { icon: FileCheck, label: 'Peritajes completados', value: stats.inspections.completed, color: 'text-primary' },
    { icon: Users, label: 'Usuarios verificados', value: stats.dealers.verified + stats.peritos.verified + stats.recompradores.verified, color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {/* KPIs */}
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

        {/* Subastas por empresa */}
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

        {/* Peritajes por sucursal */}
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

        {/* Usuarios por rol */}
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
