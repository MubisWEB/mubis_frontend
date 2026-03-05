import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, CheckCircle, Zap, Banknote, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import ProntoPagoModal from '@/components/ProntoPagoModal';
import { useNavigate } from 'react-router-dom';
import { getWonAuctionsByUserId, getCurrentUser, getProntoPagoByUserAndAuction } from '@/lib/mockStore';

export default function Ganados() {
  const currentUser = getCurrentUser();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [prontoPagoAuction, setProntoPagoAuction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    const won = getWonAuctionsByUserId(currentUser.id);
    setWonAuctions(won);
  }, [currentUser?.id, refreshKey]);

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
            {wonAuctions.map((auction, index) => {
              const existingPP = currentUser ? getProntoPagoByUserAndAuction(currentUser.id, auction.id) : null;
              return (
                <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden border border-border shadow-sm rounded-2xl bg-card cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
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
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4" /><span>{auction.city}</span>
                      </div>

                      {/* Pronto Pago CTA */}
                      {existingPP ? (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs font-semibold text-foreground">Pronto Pago aprobado</p>
                              <p className="text-[10px] text-muted-foreground">Recibes: {formatPrice(existingPP.netAmount)}</p>
                            </div>
                          </div>
                          <Badge className="bg-primary/10 text-primary text-xs font-semibold">{existingPP.status}</Badge>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setProntoPagoAuction(auction)}
                          variant="outline"
                          className="w-full h-11 rounded-xl border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Pronto Pago — Obtén liquidez al instante
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ProntoPagoModal
        open={!!prontoPagoAuction}
        onClose={() => setProntoPagoAuction(null)}
        auction={prontoPagoAuction}
        userId={currentUser?.id}
        onComplete={() => setRefreshKey(k => k + 1)}
      />
      <BottomNav />
    </div>
  );
}
