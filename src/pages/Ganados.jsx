import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, LayoutGrid, LayoutList, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { auctionsApi } from '@/api/services';
import Skeleton from 'react-loading-skeleton';
import { WonAuctionGridCard, WonAuctionListCard, WonAuctionMobileCard } from '@/components/WonAuctionCard';

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

const formatPrice = (price) => {
  const n = Number(price) || 0;
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};

function getAuctionState(auction) {
  const now = Date.now();
  const endsAt = auction.ends_at || auction.auction_end;
  const remaining = endsAt ? new Date(endsAt).getTime() - now : 0;
  const isCompleted = auction.status === 'COMPLETED' || auction.status === 'ENDED';
  const isCancelled = auction.status === 'CANCELLED';
  const canExtend = !isCompleted && !isCancelled && remaining <= 0;
  return { remaining, isCompleted, isCancelled, canExtend };
}

export default function Ganados() {
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');

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

  const formatPrice = (price) => {
    if (!price) return '$0';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const handleExtend = (auction) => {
    // Navigate to detail page to handle extension
    navigate(`/DetalleSubasta/${auction.id}?from=ganados`);
  };

  const calculateTimeRemaining = (auction) => {
    if (!auction.completionDeadline) return 0;
    const deadline = new Date(auction.completionDeadline);
    const now = new Date();
    return deadline - now;
  };

  const isAuctionCompleted = (auction) => {
    return auction.status === 'completed' || auction.paymentStatus === 'completed';
  };

  const isAuctionCancelled = (auction) => {
    return auction.status === 'cancelled';
  };

  const canExtendDeadline = (auction) => {
    if (isAuctionCompleted(auction) || isAuctionCancelled(auction)) return false;
    const remaining = calculateTimeRemaining(auction);
    return remaining > 0 && remaining < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Header section */}
      <div className="bg-card border-b border-border px-4 md:px-8 py-5">
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

      {/* Toolbar */}
      <div className="px-4 md:px-8 pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-2xl border-border bg-muted/50 text-foreground font-semibold h-10 text-sm w-auto">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="price_high">Precio: mayor</SelectItem>
              <SelectItem value="price_low">Precio: menor</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:flex items-center border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <WonCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {search ? 'Sin resultados' : 'No hay subastas ganadas'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? 'Intenta con otro término de búsqueda' : 'Cuando ganes una subasta, aparecerá aquí'}
            </p>
            {!search && (
              <Button
                onClick={() => navigate('/Comprar')}
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Explorar subastas
              </Button>
            )}
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
                formatPrice={formatPrice}
                navigate={navigate}
                isCompleted={isAuctionCompleted(auction)}
                canExtend={canExtendDeadline(auction)}
                remaining={calculateTimeRemaining(auction)}
                onExtend={handleExtend}
                isCancelled={isAuctionCancelled(auction)}
              />
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
