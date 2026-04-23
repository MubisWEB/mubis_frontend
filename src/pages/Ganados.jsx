import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Gauge,
  MapPin,
  Search,
  Trophy,
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { auctionsApi, interestRequestsApi } from '@/api/services';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WonAuctionGridCard, WonAuctionMobileCard } from '@/components/WonAuctionCard';
import { normalizeWonAuction } from '@/lib/auctions';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/roles';

const TABS = [
  { key: 'in_progress', label: 'En proceso' },
  { key: 'rejected', label: 'Rechazado' },
  { key: 'completed', label: 'Finalizado' },
];

const EMPTY_MESSAGES = {
  in_progress: {
    title: 'No hay operaciones en proceso',
    subtitle: 'Cuando ganes una subasta o contactes desde Se Busca, aparecera aqui',
  },
  rejected: {
    title: 'No hay operaciones rechazadas',
    subtitle: 'Las subastas canceladas y solicitudes rechazadas apareceran aqui',
  },
  completed: {
    title: 'No hay operaciones finalizadas',
    subtitle: 'Las subastas y solicitudes completadas apareceran aqui',
  },
};

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
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

function formatCountdown(deadline) {
  const remaining = new Date(deadline).getTime() - Date.now();
  if (remaining <= 0) return 'Expirado';
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function normalizeInterestRequest(item) {
  const group = item.status === 'EN_NEGOCIACION'
    ? 'in_progress'
    : item.status === 'ACEPTADO'
      ? 'completed'
      : 'rejected';

  return {
    id: `interest-${item.id}`,
    type: 'interest',
    group,
    status: item.status,
    title: item.vehicleLabel,
    details: item.vehicleDetails || {},
    branch: item.branch,
    dealer: item.dealer,
    deadline: item.deadline,
  };
}

function InterestCard({ item }) {
  return (
    <Card className="overflow-hidden border border-border rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
          <Search className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">Se Busca</p>
            </div>
            <Badge className="text-xs bg-secondary/10 text-secondary border border-secondary/20 flex-shrink-0">
              {item.group === 'in_progress' ? 'En proceso' : item.group === 'completed' ? 'Finalizado' : 'Rechazado'}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            {item.details?.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.details.year}
              </span>
            )}
            {item.details?.km && (
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                {Number(item.details.km).toLocaleString('es-CO')} km
              </span>
            )}
            {item.branch?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.branch.city}
              </span>
            )}
          </div>

          {item.branch && (
            <div className="mt-2 text-xs text-muted-foreground break-words">
              <p className="flex items-center gap-1">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                <span className="min-w-0">{item.branch.name}</span>
              </p>
              {item.branch.phone && <p className="mt-1">Tel: {item.branch.phone}</p>}
              {item.dealer?.telefono && <p className="mt-1">Contacto: {item.dealer.telefono}</p>}
            </div>
          )}

          {item.group === 'in_progress' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
              <Clock className="w-3 h-3" />
              <span>Expira en {formatCountdown(item.deadline)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Ganados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [wonItems, setWonItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in_progress');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [auctions, interests] = await Promise.all([
          auctionsApi.getWon().catch(() => []),
          role === 'recomprador'
            ? interestRequestsApi.getMine().catch(() => [])
            : interestRequestsApi.getIncoming().catch(() => []),
        ]);

        setWonItems([
          ...(auctions || []).map((auction) => ({
            ...normalizeWonAuction(auction),
            type: 'auction',
          })),
          ...(interests || []).map(normalizeInterestRequest),
        ]);
      } catch (err) {
        console.error('Error loading won items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (role) load();
  }, [role]);

  const grouped = useMemo(() => {
    const groups = { in_progress: [], rejected: [], completed: [] };
    for (const item of wonItems) {
      if (item.type === 'interest') groups[item.group].push(item);
      else if (item.isCancelled) groups.rejected.push(item);
      else if (item.isCompleted) groups.completed.push(item);
      else groups.in_progress.push(item);
    }
    return groups;
  }, [wonItems]);

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

    if (window.innerWidth < 768) return <WonAuctionMobileCard {...cardProps} />;
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
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-foreground truncate">Ganadas</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {wonItems.length === 0
            ? 'Aun no tienes operaciones ganadas'
            : `${wonItems.length} ${wonItems.length === 1 ? 'operacion' : 'operaciones'}`}
        </p>
      </div>

      <div className="px-4 md:px-8 pt-4 pb-2">
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = grouped[tab.key]?.length || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-center py-2 px-2 rounded-lg text-sm font-medium transition-all min-w-0 ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="truncate inline-block max-w-full">{tab.label}</span>
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

      <div className="px-4 md:px-8 py-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <WonCardSkeleton key={i} />)}
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
            {currentList.map((item) => (
              item.type === 'interest'
                ? <InterestCard key={item.id} item={item} />
                : renderAuctionCard(item)
            ))}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
