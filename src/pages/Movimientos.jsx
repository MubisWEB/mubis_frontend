import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getBidsByUserId, getAuctions, getCurrentUser, getUserRole } from '@/lib/mockStore';

export default function Movimientos() {
  const currentUser = getCurrentUser();
  const role = getUserRole();
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const myBids = getBidsByUserId(currentUser.id);
    const allAuctions = getAuctions();

    // Build movements from bids
    const bidMovements = myBids.map(bid => {
      const auction = allAuctions.find(a => a.id === bid.auctionId);
      return {
        id: bid.id,
        kind: 'bought',
        vehicle: auction ? `${auction.brand} ${auction.model} ${auction.year}` : 'Vehículo',
        amount: bid.amount,
        date: new Date(bid.createdAt),
        status: 'bid',
      };
    });

    // Build movements from my auctions (if dealer)
    if (role === 'dealer') {
      const myAuctions = allAuctions.filter(a => a.dealerId === currentUser.id);
      myAuctions.forEach(a => {
        bidMovements.push({
          id: `sold-${a.id}`,
          kind: 'sold',
          vehicle: `${a.brand} ${a.model} ${a.year}`,
          amount: a.current_bid || a.starting_price || 0,
          date: new Date(a.createdAt),
          status: a.status,
        });
      });
    }

    bidMovements.sort((a, b) => b.date - a.date);
    setMovements(bidMovements);
  }, [currentUser?.id, role]);

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
      <Header title="Movimientos" subtitle={`${movements.length} transacciones`} />

      <div className="px-4 py-4 space-y-4">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 border border-border rounded-xl text-center">
            <p className="text-2xl font-bold text-secondary">{pujas}</p>
            <p className="text-xs text-muted-foreground">Vendidos</p>
            <p className="text-sm font-semibold text-foreground mt-1">{formatShortPrice(totalComprado)}</p>
          </Card>
          <Card className="p-3 border border-border rounded-xl text-center">
            <p className="text-2xl font-bold text-primary">{ventas}</p>
            <p className="text-xs text-muted-foreground">Comprados</p>
            <p className="text-sm font-semibold text-foreground mt-1">{formatShortPrice(totalVendido)}</p>
          </Card>
        </div>

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
          {movements.length === 0 ? (
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
