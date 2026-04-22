import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { auctionsApi } from '@/api/services';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { WonAuctionGridCard, WonAuctionMobileCard } from '@/components/WonAuctionCard';
import { normalizeWonAuction } from '@/lib/auctions';

const TABS = [
  { key: 'in_progress', label: 'En proceso' },
  { key: 'rejected', label: 'Rechazada' },
  { key: 'completed', label: 'Finalizado' },
];

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
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const EMPTY_MESSAGES = {
  in_progress: { title: 'No hay subastas en proceso', subtitle: 'Cuando ganes una subasta que esté en trámite, aparecerá aquí' },
  rejected: { title: 'No hay subastas rechazadas', subtitle: 'Las subastas canceladas aparecerán aquí' },
  completed: { title: 'No hay subastas finalizadas', subtitle: 'Las subastas completadas aparecerán aquí' },
};

export default function Ganados() {
  const navigate = useNavigate();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in_progress');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await auctionsApi.getWon();
        setWonAuctions((data || []).map(normalizeWonAuction));
      } catch (err) {
        console.error('Error loading won auctions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const groups = { in_progress: [], rejected: [], completed: [] };
    for (const a of wonAuctions) {
      if (a.isCancelled) groups.rejected.push(a);
      else if (a.isCompleted) groups.completed.push(a);
      else groups.in_progress.push(a);
    }
    return groups;
  }, [wonAuctions]);

  const currentList = grouped[activeTab] || [];

  const handleChat = (auction) => {
    navigate(`/Chat/${auction.id}`);
  };

  const renderAuctionCard = (auction) => {
    const cardProps = {
      key: auction.id,
      auction,
      formatPrice,
      navigate,
      isCompleted: auction.isCompleted,
      isCancelled: auction.isCancelled,
      onChat: handleChat,
    };

    if (window.innerWidth < 768) {
      return <WonAuctionMobileCard {...cardProps} />;
    }
    return <WonAuctionGridCard {...cardProps} />;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

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
            : `${wonAuctions.length} ${wonAuctions.length === 1 ? 'subasta ganada' : 'subastas ganadas'}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = grouped[tab.key]?.length || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
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
        ) : currentList.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {EMPTY_MESSAGES[activeTab].title}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {EMPTY_MESSAGES[activeTab].subtitle}
            </p>
            {activeTab === 'in_progress' && (
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
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {currentList.map(renderAuctionCard)}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
