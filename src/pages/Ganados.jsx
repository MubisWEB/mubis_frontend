import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle, Clock, ChevronRight, CalendarPlus } from 'lucide-react';
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
          <div className="space-y-3">
            {wonAuctions.map((auction, index) => {
              const endTime = new Date(auction.ends_at).getTime();
              const windowMs = getCompletionWindow(auction);
              const remaining = windowMs - (Date.now() - endTime);
              const isCompleted = remaining <= 0;
              const canExtend = !isCompleted && remaining < ONE_DAY_MS;
              const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';

              return (
                <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
                    <div className="flex p-3 gap-3">
                      <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
                        <img src={auction.photos?.[0] || defaultImage} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />
                        <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                          <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Ganado
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-base leading-tight truncate">{auction.brand} {auction.model}</h3>
                          <p className="text-muted-foreground text-xs">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
                          <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${isCompleted ? 'bg-primary/10 text-primary' : canExtend ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
                            {isCompleted ? <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" /> : <Clock className="w-2.5 h-2.5 flex-shrink-0" />}
                            <span className="font-medium">{isCompleted ? 'Completado' : formatCountdown(remaining)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        {canExtend && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-2 h-7 rounded-full text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExtensionModal({ open: true, auctionId: auction.id, vehicleName: `${auction.brand} ${auction.model}` });
                            }}
                          >
                            <CalendarPlus className="w-3 h-3 mr-1" />Extensión
                          </Button>
                        )}
                      </div>
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
