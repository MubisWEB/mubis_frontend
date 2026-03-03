import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Car, Clock, CheckCircle2 } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TopBar from "@/components/TopBar";

const mockHistory = [
  { id: 1, kind: 'bought', status: 'won', vehicle: 'Chevrolet Onix 2021', counterparty: 'Vendedor: Juan P.', amount: 36000000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 2, kind: 'bought', status: 'won', vehicle: 'Toyota Hilux 2020', counterparty: 'Vendedor: Camila R.', amount: 52000000, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: 3, kind: 'sold', status: 'listed', vehicle: 'Hyundai Tucson 2020', counterparty: 'Compró: Autonal', amount: 85000000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 4, kind: 'sold', status: 'listed', vehicle: 'Ford Ranger 2019', counterparty: 'Compró: Derco', amount: 118000000, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
  { id: 5, kind: 'sold', status: 'in_process', vehicle: 'Mazda CX-30 2022', counterparty: 'Compró: Grupo Los Coches', amount: 65000000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 6, kind: 'bought', status: 'in_process', vehicle: 'Kia Seltos 2021', counterparty: 'Vendedor: Andrés M.', amount: 120000000, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];

export default function movimientosPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('dealer');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => { setUserRole(localStorage.getItem('mubis_user_role') || 'dealer'); }, []);

  const formatShortPrice = (price) => `$${(Math.abs(price) / 1000000).toFixed(0)}M`;
  const formatDate = (date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy'; if (days === 1) return 'Ayer'; return `Hace ${days} días`;
  };

  const stats = useMemo(() => ({ soldMonth: 150000000, boughtMonth: 87000000, soldInProcess: 65000000, boughtInProcess: 120000000 }), []);
  const filteredHistory = useMemo(() => [...mockHistory].filter(tx => tx.status !== 'in_process').sort((a, b) => b.date.getTime() - a.date.getTime()), []);
  const visibleHistory = filteredHistory.slice(0, visibleCount);
  const go = (path) => navigate(createPageUrl(path));

  const StatCard = ({ title, value, onClick, icon, accent }) => {
    const accentClasses = accent === 'purple' ? 'border-secondary/20 hover:border-secondary/40' : 'border-primary/20 hover:border-primary/40';
    return (
      <button onClick={onClick} className="text-left" aria-label={title}>
        <Card className={`p-4 border shadow-sm rounded-xl bg-card w-full transition ${accentClasses}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatShortPrice(value)}</p>
            </div>
            <div className="shrink-0">{icon}</div>
          </div>
        </Card>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="lg" />
        </div>
      </nav>

      <div className="px-4 py-4 -mt-2">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3">
          <StatCard title="Vendido mes" value={stats.soldMonth} onClick={() => go('/movimientos/vendidos')} accent="green"
            icon={<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><ArrowDownLeft className="w-5 h-5 text-primary" /></div>} />
          <StatCard title="Comprado mes" value={stats.boughtMonth} onClick={() => go('/movimientos/comprados')} accent="purple"
            icon={<div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-secondary" /></div>} />
          <StatCard title="Proceso vendidos" value={stats.soldInProcess} onClick={() => go('/movimientos/vendidos-en-proceso')} accent="green"
            icon={<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>} />
          <StatCard title="Proceso comprados" value={stats.boughtInProcess} onClick={() => go('/movimientos/comprados-en-proceso')} accent="purple"
            icon={<div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-secondary" /></div>} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-bold text-foreground font-sans">Movimientos</p>
            <p className="text-xs text-muted-foreground">Últimos {Math.min(visibleCount, filteredHistory.length)}</p>
          </div>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
            {visibleHistory.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-sm text-foreground font-medium">Todavía no tienes movimientos</p>
                <p className="text-xs text-muted-foreground mt-1">Cuando compres o subastes carros, se verán acá.</p>
              </div>
            ) : (
              visibleHistory.map((tx) => {
                const isSold = tx.kind === 'sold';
                const iconWrap = isSold ? 'bg-primary/10' : 'bg-secondary/10';
                const icon = isSold ? <ArrowDownLeft className="w-5 h-5 text-primary" /> : <ArrowUpRight className="w-5 h-5 text-secondary" />;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconWrap}`}>{icon}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{tx.vehicle}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(tx.date)}{tx.counterparty ? ` · ${tx.counterparty}` : ''}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-foreground text-sm">{formatShortPrice(tx.amount)}</p>
                      {!isSold && tx.status === 'won' && <Badge className="bg-secondary/10 text-secondary text-[10px] border-0 mt-1">Ganada</Badge>}
                      {isSold && <Badge className="bg-primary/10 text-primary text-[10px] border-0 mt-1">Subastado</Badge>}
                    </div>
                  </div>
                );
              })
            )}
          </Card>
          {filteredHistory.length > visibleCount && (
            <Button variant="outline" onClick={() => setVisibleCount((v) => Math.min(v + 10, filteredHistory.length))} className="w-full mt-3 rounded-full">Ver más</Button>
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}
