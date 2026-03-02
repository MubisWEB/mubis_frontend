import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const mockHistory = [
  // Comprados (dealer)
  { id: 1, kind: 'bought', status: 'won', vehicle: 'Chevrolet Onix 2021', counterparty: 'Vendedor: Juan P.', amount: 36000000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 2, kind: 'bought', status: 'won', vehicle: 'Toyota Hilux 2020', counterparty: 'Vendedor: Camila R.', amount: 52000000, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },

  // Vendidos (seller)
  { id: 3, kind: 'sold', status: 'listed', vehicle: 'Hyundai Tucson 2020', counterparty: 'Compró: Autonal', amount: 85000000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 4, kind: 'sold', status: 'listed', vehicle: 'Ford Ranger 2019', counterparty: 'Compró: Derco', amount: 118000000, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },

  // En proceso (no entregado)
  { id: 5, kind: 'sold', status: 'in_process', vehicle: 'Mazda CX-30 2022', counterparty: 'Compró: Grupo Los Coches', amount: 65000000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 6, kind: 'bought', status: 'in_process', vehicle: 'Kia Seltos 2021', counterparty: 'Vendedor: Andrés M.', amount: 120000000, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];

export default function movimientosPage() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState('dealer');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const role = localStorage.getItem('mubis_user_role') || 'dealer';
    setUserRole(role);
  }, []);

  const formatShortPrice = (price) => {
    return `$${(Math.abs(price) / 1000000).toFixed(0)}M`;
  };

  const formatDate = (date) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  // 👇 Ejemplos que pediste (luego se conectan al backend)
  const stats = useMemo(() => {
    return {
      soldMonth: 150000000,
      boughtMonth: 87000000,
      soldInProcess: 65000000,
      boughtInProcess: 120000000,
    };
  }, []);

  const filteredHistory = useMemo(() => {
    return [...mockHistory]
      .filter(tx => tx.status !== 'in_process') // movimientos = finalizados
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  const visibleHistory = filteredHistory.slice(0, visibleCount);

  const go = (path) => navigate(createPageUrl(path));

  const StatCard = ({ title, value, onClick, icon, accent }) => {
    const accentClasses =
      accent === 'purple'
        ? 'border-violet-100 hover:border-violet-200'
        : accent === 'green'
          ? 'border-emerald-100 hover:border-emerald-200'
          : 'border-gray-100 hover:border-gray-200';

    return (
      <button onClick={onClick} className="text-left" aria-label={title}>
        <Card className={`p-4 border shadow-sm rounded-xl bg-white w-full transition ${accentClasses}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{title}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatShortPrice(value)}</p>
            </div>
            <div className="shrink-0">{icon}</div>
          </div>
        </Card>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      {/* Header */}
      <div className="bg-gradient-brand rounded-b-3xl">
        <div className="px-4 pt-8 pb-6">
          <div className="text-center">
            <MubisLogo size="xl" variant="light" />
          </div>
        </div>
      </div>


      {/* 4 Cards */}
      <div className="px-4 py-4 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard
            title="Vendido mes"
            value={stats.soldMonth}
            onClick={() => go('/movimientos/vendidos')}
            accent="green"
            icon={
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
              </div>
            }
          />

          <StatCard
            title="Comprado mes"
            value={stats.boughtMonth}
            onClick={() => go('/movimientos/comprados')}
            accent="purple"
            icon={
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-violet-00" />
              </div>
            }
          />

          <StatCard
            title="Proceso vendidos"
            value={stats.soldInProcess}
            onClick={() => go('/movimientos/vendidos-en-proceso')}
            accent="green"
            icon={
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-700" />
              </div>
            }
          />

          <StatCard
            title="Proceso comprados"
            value={stats.boughtInProcess}
            onClick={() => go('/movimientos/comprados-en-proceso')}
            accent="purple"
            icon={
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-700" />
              </div>
            }
          />
        </motion.div>

        {/* Movimientos */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-bold text-gray-900">Movimientos</p>
            <p className="text-xs text-gray-500">Últimos {Math.min(visibleCount, filteredHistory.length)}</p>
          </div>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
            {visibleHistory.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-sm text-gray-600 font-medium">Todavía no tienes movimientos</p>
                <p className="text-xs text-gray-500 mt-1">Cuando compres o subastes carros, se verán acá.</p>
              </div>
            ) : (
              visibleHistory.map((tx) => {
                const isSold = tx.kind === 'sold';
                const iconWrap = isSold ? 'bg-emerald-100' : 'bg-violet-100';
                const icon = isSold ? (
                  <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-violet-700" />
                );

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconWrap}`}>
                        {icon}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {tx.vehicle}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatDate(tx.date)}
                          {tx.counterparty ? ` · ${tx.counterparty}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {formatShortPrice(tx.amount)}
                      </p>

                      {/* Comprados: mostrar Ganada */}
                      {!isSold && tx.status === 'won' && (
                        <Badge className="bg-violet-100 text-violet-700 text-[10px] border-0 mt-1">
                          Ganada
                        </Badge>
                      )}

                      {/* Vendidos: NO decir ganada. Solo “Subastado” */}
                      {isSold && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-0 mt-1">
                          Subastado
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {/* Mostrar últimos 10 -> botón de más */}
          {filteredHistory.length > visibleCount && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount((v) => Math.min(v + 10, filteredHistory.length))}
              className="w-full mt-3 rounded-xl"
            >
              Ver más
            </Button>
          )}
        </motion.div>
      </div>

      <BottomNav currentPage="Movimientos" />
    </div>
  );
}
