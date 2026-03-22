import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { auctionsApi } from '@/api/services';
import Skeleton from 'react-loading-skeleton';
import { WonAuctionMobileCard } from '@/components/WonAuctionCard';

const WonCardSkeleton = () => (
  <div className="rounded-2xl border border-border overflow-hidden bg-card">
    <Skeleton height={170} borderRadius={0} />
    <div className="p-3.5">
      <Skeleton width="55%" height={16} />
      <Skeleton width="35%" height={12} style={{ marginTop: 4 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
      <Skeleton height={36} borderRadius={12} style={{ marginTop: 10 }} />
    </div>
  </div>
);

export default function Ganados() {
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await auctionsApi.getWon();
        setWonAuctions(data || []);
      } catch (err) {
        console.error('Error loading won auctions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Header section */}
      <div className="bg-card border-b border-border px-4 py-5">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/Comprar')}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-foreground">Subastas Ganadas</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {wonAuctions.length === 0 
            ? 'Aún no has ganado ninguna subasta' 
            : `${wonAuctions.length} ${wonAuctions.length === 1 ? 'subasta ganada' : 'subastas ganadas'}`
          }
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <WonCardSkeleton key={i} />
            ))}
          </div>
        ) : wonAuctions.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay subastas ganadas</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Cuando ganes una subasta, aparecerá aquí
            </p>
            <Button 
              onClick={() => navigate('/Comprar')}
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Explorar subastas
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {wonAuctions.map((auction) => (
              <WonAuctionMobileCard 
                key={auction.id} 
                auction={auction}
                onNavigate={() => navigate(`/subasta/${auction.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
