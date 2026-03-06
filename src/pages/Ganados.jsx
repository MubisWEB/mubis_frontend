import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, CheckCircle, Clock, ChevronRight, CalendarPlus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getWonAuctionsByUserId, getCurrentUser, getAuctions, updateAuction } from '@/lib/mockStore';
import ExtensionModal from '@/components/ExtensionModal';

const COMPLETION_WINDOW_MS = 96 * 60 * 60 * 1000; // 4 días
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms) {
  if (ms <= 0) return 'Completado';
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

export default function Ganados() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [, setTick] = useState(0);
  const [extensionModal, setExtensionModal] = useState({ open: false, auctionId: null, vehicleName: '' });

  useEffect(() => {
    if (!currentUser?.id) return;
    let won = getWonAuctionsByUserId(currentUser.id);
    if (won.length === 0) {
      const allAuctions = getAuctions();
      const endedWithoutMe = allAuctions.filter(a => a.status === 'ended' && a.winnerId && a.winnerId !== currentUser.id);
      const toAssign = endedWithoutMe.slice(0, 2);
      toAssign.forEach(a => {
        updateAuction(a.id, { winnerId: currentUser.id });
      });
      if (toAssign.length > 0) {
        won = getWonAuctionsByUserId(currentUser.id);
      }
    }
    setWonAuctions(won);
  }, [currentUser?.id]);

  useEffect(() => {
    if (wonAuctions.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [wonAuctions.length]);

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  const getCompletionWindow = (auction) => {
    const extensionMs = (auction.extensionDays || 0) * ONE_DAY_MS;
    return COMPLETION_WINDOW_MS + extensionMs;
  };

  const handleExtensionConfirm = ({ days, reason }) => {
    const { auctionId } = extensionModal;
    const auction = wonAuctions.find(a => a.id === auctionId);
    const currentExtension = auction?.extensionDays || 0;
    updateAuction(auctionId, {
      extensionDays: currentExtension + days,
      extensionReason: reason,
    });
    setWonAuctions(prev => prev.map(a =>
      a.id === auctionId ? { ...a, extensionDays: currentExtension + days, extensionReason: reason } : a
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Mis Ganados" subtitle={wonAuctions.length > 0 ? `${wonAuctions.length} subastas ganadas` : undefined} />

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
              const endTime = new Date(auction.ends_at).getTime();
              const windowMs = getCompletionWindow(auction);
              const remaining = windowMs - (Date.now() - endTime);
              const isCompleted = remaining <= 0;
              const canExtend = !isCompleted && remaining < ONE_DAY_MS;

              return (
                <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden border border-border shadow-sm rounded-2xl bg-card cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
                    <div className="relative h-36">
                      {auction.photos?.[0] && <img src={auction.photos[0]} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold px-2.5 py-1 rounded-full text-xs"><CheckCircle className="w-3 h-3 mr-1" />Ganado</Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-foreground font-sans">{auction.brand} {auction.model}</h3>
                          <p className="text-muted-foreground text-sm">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Precio final</p>
                          <p className="text-xl font-bold text-primary">{formatPrice(auction.current_bid)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4" /><span>{auction.city}</span>
                      </div>

                      {/* Completion status */}
                      <div className={`rounded-xl p-3 flex items-center justify-between ${isCompleted ? 'bg-primary/10 border border-primary/20' : canExtend ? 'bg-destructive/10 border border-destructive/20' : 'bg-secondary/10 border border-secondary/20'}`}>
                        <div className="flex items-center gap-2">
                          {isCompleted ? <CheckCircle className="w-4 h-4 text-primary" /> : <Clock className={`w-4 h-4 ${canExtend ? 'text-destructive' : 'text-secondary'}`} />}
                          <div>
                            <p className="text-xs font-semibold text-foreground">{isCompleted ? 'Trato completado' : 'Cierre automático'}</p>
                            <p className="text-[10px] text-muted-foreground">{isCompleted ? 'Transacción finalizada por Mubis' : `Faltan ${formatCountdown(remaining)}`}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* Extend button */}
                      {canExtend && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3 rounded-xl border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExtensionModal({ open: true, auctionId: auction.id, vehicleName: `${auction.brand} ${auction.model}` });
                          }}
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" />Solicitar extensión de plazo
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

      <ExtensionModal
        open={extensionModal.open}
        onOpenChange={(open) => setExtensionModal(prev => ({ ...prev, open }))}
        onConfirm={handleExtensionConfirm}
        vehicleName={extensionModal.vehicleName}
      />

      <BottomNav />
    </div>
  );
}
