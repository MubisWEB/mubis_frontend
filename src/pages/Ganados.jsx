import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getWonAuctionsByUserId, getCurrentUser } from '@/lib/mockStore';

export default function Ganados() {
  const currentUser = getCurrentUser();
  const [wonAuctions, setWonAuctions] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const won = getWonAuctionsByUserId(currentUser.id);
    setWonAuctions(won);
  }, [currentUser?.id]);

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Ganados" subtitle={wonAuctions.length > 0 ? `${wonAuctions.length} subastas ganadas` : undefined} />

      <div className="px-4 py-5">
        {wonAuctions.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-secondary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-sans">Aún no has ganado subastas</h3>
            <p className="text-muted-foreground">Participa en las subastas activas<br />para ganar vehículos</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {wonAuctions.map((auction, index) => (
              <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="overflow-hidden border border-border shadow-sm rounded-2xl bg-card">
                  <div className="relative h-36">
                    {auction.photos?.[0] && <img src={auction.photos[0]} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3 mr-1" />Ganado</Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground font-sans">{auction.brand} {auction.model}</h3>
                        <p className="text-muted-foreground text-sm">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tu oferta ganadora</p>
                        <p className="text-xl font-bold text-primary">{formatPrice(auction.current_bid)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" /><span>{auction.city}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
