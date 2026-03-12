import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { bidsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import Skeleton from 'react-loading-skeleton';

const MovRowSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
    <Skeleton width={40} height={40} borderRadius={12} />
    <div style={{ flex: 1 }}>
      <Skeleton width="60%" height={14} />
      <Skeleton width="30%" height={11} style={{ marginTop: 4 }} />
    </div>
    <Skeleton width={60} height={16} />
  </div>
);

export default function Movimientos() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const role = currentUser?.role;
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    const load = async () => {
      try {
        setLoading(true);
        const myBids = await bidsApi.getMine();

        // Build movements from bids
        const bidMovements = (myBids || []).map(bid => ({
          id: bid.id,
          kind: 'bought',
          vehicle: bid.auction
            ? `${bid.auction.brand} ${bid.auction.model} ${bid.auction.year}`
            : (bid.vehicleLabel || 'Vehículo'),
          amount: bid.amount,
          date: new Date(bid.createdAt),
          status: 'bid',
        }));

        bidMovements.sort((a, b) => b.date - a.date);
        setMovements(bidMovements);
      } catch (err) {
        console.error('Error loading movements:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  const formatShortPrice = (price) => `$${(Math.abs(price) / 1000000).toFixed(0)}M`;
  const formatDate = (date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy'; if (days === 1) return 'Ayer'; return `Hace ${days} días`;
  };

  const totalComprado = movements.filter(m => m.kind === 'bought').reduce((s, m) => s + m.amount, 0);
  const totalVendido = movements.filter(m => m.kind === 'sold').reduce((s, m) => s + m.amount, 0);
  const pujas = movements.filter(m => m.kind === 'bought').length;
  const ventas = movements.filter(m => m.kind === 'sold').length;

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Movimientos</h1>
            <p className="text-xs text-muted-foreground">{movements.length} transacciones</p>
          </div>
        </div>
        {/* Métricas */}
        <div className={`grid gap-3 ${role === 'dealer' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {role === 'dealer' && (
            <Card className="p-3 border border-border rounded-xl text-center">
              <p className="text-2xl font-bold text-secondary">{ventas}</p>
              <p className="text-xs text-muted-foreground">Vendidos</p>
              <p className="text-sm font-semibold text-foreground mt-1">{formatShortPrice(totalVendido)}</p>
            </Card>
          )}
          <Card className="p-3 border border-border rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{pujas}</p>
            <p className="text-xs text-muted-foreground">Comprados</p>
            <p className="text-sm font-semibold text-foreground mt-1">{formatShortPrice(totalComprado)}</p>
          </Card>
        </div>

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          {loading ? (
            <div>{[1,2,3,4,5].map(i => <MovRowSkeleton key={i} />)}</div>
          ) : movements.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-foreground font-medium">Todavía no tienes movimientos</p>
              <p className="text-xs text-muted-foreground mt-1">Cuando compres o subastes carros, se verán acá.</p>
            </div>
          ) : (
            movements.map((tx) => {
              const isSold = tx.kind === 'sold';
              const iconWrap = isSold ? 'bg-primary/10' : 'bg-secondary/10';
              const icon = isSold ? <ArrowDownLeft className="w-5 h-5 text-primary" /> : <ArrowUpRight className="w-5 h-5 text-secondary" />;
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconWrap}`}>{icon}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{tx.vehicle}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground text-sm">{formatShortPrice(tx.amount)}</p>
                    {isSold && <Badge className="bg-primary/10 text-primary text-[10px] border-0 mt-1">Subastado</Badge>}
                    {!isSold && <Badge className="bg-secondary/10 text-secondary text-[10px] border-0 mt-1">Puja</Badge>}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
