import React from 'react';
import { Card } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getAdminStats } from '@/lib/mockStore';

export default function AdminAnaliticas() {
  const stats = getAdminStats();

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Analíticas" subtitle="Métricas en tiempo real" backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Card className="p-6 border border-border shadow-sm text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-2">Analíticas</h3>
          <p className="text-sm text-muted-foreground mb-4">Dashboard de analíticas próximamente</p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-muted rounded-xl"><p className="text-xl font-bold text-foreground">{stats.auctions.total}</p><p className="text-xs text-muted-foreground">Subastas totales</p></div>
            <div className="p-3 bg-muted rounded-xl"><p className="text-xl font-bold text-foreground">{stats.inspections.completed}</p><p className="text-xs text-muted-foreground">Peritajes completados</p></div>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
