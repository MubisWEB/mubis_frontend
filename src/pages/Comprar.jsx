import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Flame, Radio, Bookmark, LayoutGrid, LayoutList, Trophy } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import FilterSheet from '@/components/FilterSheet';
import FilterPanel from '@/components/FilterPanel';
import BidModal from '@/components/BidModal';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useAuth } from '@/lib/AuthContext';
import { auctionsApi, bidsApi, auditApi } from '@/api/services';
import socket, { joinAuction, leaveAuction, joinActivity } from '@/api/socket';
import Skeleton from 'react-loading-skeleton';

const AuctionCardSkeleton = () => (
  <div className="rounded-2xl border border-border overflow-hidden bg-card">
    <Skeleton height={180} borderRadius={0} />
    <div className="p-3.5">
      <Skeleton width="55%" height={16} />
      <Skeleton width="35%" height={12} style={{ marginTop: 4 }} />
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={80} height={24} />
        <Skeleton width={64} height={32} borderRadius={999} />
      </div>
    </div>
  </div>
);

const formatMoneyShort = (n) => `$${(n / 1000000).toFixed(0)}M`;

export default function Comprar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '' });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [activityItems, setActivityItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activityIdx, setActivityIdx] = useState(0);

  const loadAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await auctionsApi.getActive();
      setVehicles(data.map(a => ({
        ...a,
        auction_end: a.ends_at,
        isLeading: user ? a.leaderId === user.id : false,
        myMaxBid: 0,
      })));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [user]);

  const loadActivity = useCallback(async () => {
    try {
      const data = await auditApi.getActivity(10);
      setActivityItems(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadAuctions();
    loadActivity();
    joinActivity();

    // Realtime: new bids
    socket.on('new_bid', ({ auctionId, currentBid, bidsCount, leaderId }) => {
      setVehicles(prev => prev.map(v =>
        v.id === auctionId
          ? { ...v, current_bid: currentBid, bids_count: bidsCount, leaderId, isLeading: user ? leaderId === user.id : false }
          : v
      ));
    });

    socket.on('audit_event_created', (event) => {
      if (event.type === 'bid_created') {
        setActivityItems(prev => [event, ...prev].slice(0, 10));
      }
    });

    // Polling fallback cada 15s
    const interval = setInterval(() => { loadAuctions(); loadActivity(); }, 15000);
    return () => {
      clearInterval(interval);
      socket.off('new_bid');
      socket.off('audit_event_created');
    };
  }, [loadAuctions, loadActivity]);

  useEffect(() => {
    if (activityItems.length <= 1) return;
    const timer = setInterval(() => {
      setActivityIdx(prev => (prev + 1) % activityItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activityItems.length]);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = async (maxAmount) => {
    if (!selectedVehicle || !user) return;
    try {
      const result = await bidsApi.place(selectedVehicle.id, maxAmount);
      setVehicles(prev => prev.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, current_bid: result.visibleBid, bids_count: result.bidsCount, isLeading: result.leaderId === user.id, myMaxBid: maxAmount }
          : v
      ));
      loadActivity();
      if (result.outbid) {
        toast.error('No lideras esta subasta', { description: `Ya existe una puja máxima superior. Puja visible: ${formatMoneyShort(result.visibleBid)}` });
      } else {
        toast.success('¡Lideras la subasta!', { description: `Puja visible: ${formatMoneyShort(result.visibleBid)} · ${selectedVehicle.brand} ${selectedVehicle.model}` });
      }
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al pujar';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];
    if (search) { const q = search.toLowerCase(); list = list.filter(v => (`${v.brand} ${v.model}`).toLowerCase().includes(q)); }
    if (filters.brand) list = list.filter(v => v.brand === filters.brand);
    if (filters.yearFrom) list = list.filter(v => v.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) list = list.filter(v => v.year <= parseInt(filters.yearTo));
    if (filters.mileageMax) list = list.filter(v => (v.mileage || v.km || 0) <= parseInt(filters.mileageMax));
    if (sortBy === 'ending_soon') list.sort((a, b) => new Date(a.auction_end || a.ends_at) - new Date(b.auction_end || b.ends_at));
    else if (sortBy === 'price_low') list.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0));
    else if (sortBy === 'price_high') list.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0));
    else if (sortBy === 'most_bids') list.sort((a, b) => (b.bids_count || 0) - (a.bids_count || 0));
    return list;
  }, [vehicles, search, filters, sortBy]);

  const currentActivity = activityItems[activityIdx];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <Header />

      {/* Live Activity Banner */}
      <div className="px-4 md:px-8 pt-3">
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Radio className="w-3.5 h-3.5 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Actividad en vivo</p>
              <AnimatePresence mode="wait">
                {currentActivity ? (
                  <motion.p key={currentActivity.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="text-sm text-foreground truncate">
                    {currentActivity.message}
                  </motion.p>
                ) : (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
                    Sin actividad reciente
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>
      {/* Search & Sort bar */}
      <div className="bg-background px-4 md:px-8 pt-3 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline" className="px-2.5 py-1 text-xs border-border bg-muted/50 text-muted-foreground">
            <Flame className="w-3 h-3 mr-1 text-secondary" />
            {vehicles.length} activas
          </Badge>

          <button
            onClick={() => navigate('/Ganados')}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
          >
            <Trophy className="w-3.5 h-3.5" />
            Ganadas
          </button>

          <button
            onClick={() => navigate('/Guardadas')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Guardadas
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 rounded-2xl border-border bg-muted/50 text-foreground font-semibold h-10 text-sm">
              <SlidersHorizontal className="w-4 h-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="ending_soon">Por terminar</SelectItem>
              <SelectItem value="most_bids">Más populares</SelectItem>
              <SelectItem value="price_low">Precio: menor</SelectItem>
              <SelectItem value="price_high">Precio: mayor</SelectItem>
            </SelectContent>
          </Select>
          <div className="md:hidden">
            <FilterSheet filters={filters} setFilters={setFilters} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-8 pt-2 pb-4 md:flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-foreground font-sans">Subastas</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehículos</span>
              <div className="hidden md:flex items-center bg-muted/50 rounded-xl p-0.5 border border-border">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <AuctionCardSkeleton key={i} />)}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No hay subastas activas</p>
              <p className="text-xs text-muted-foreground mt-1">Las subastas aparecerán aquí cuando los dealers publiquen vehículos</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} variant="compact" />
                ))}
              </div>
              {viewMode === 'grid' ? (
                <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredVehicles.map((vehicle, index) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="hidden md:flex md:flex-col gap-4">
                  {filteredVehicles.map((vehicle, index) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} variant="compact" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BidModal vehicle={selectedVehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />
      <BottomNav />
    </div>
  );
}
