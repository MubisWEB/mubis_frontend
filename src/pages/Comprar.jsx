import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Flame, Radio, Bookmark, LayoutGrid, LayoutList } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import FilterSheet from '@/components/FilterSheet';
import FilterPanel from '@/components/FilterPanel';
import BidModal from '@/components/BidModal';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import { getActiveAuctions, addBid, updateAuction, getCurrentUser, getRecentAuctionActivity } from '@/lib/mockStore';

const formatMoneyShort = (n) => `$${(n / 1000000).toFixed(0)}M`;

export default function Comprar() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '' });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [activityItems, setActivityItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activityIdx, setActivityIdx] = useState(0);

  const loadActivity = useCallback(() => {
    setActivityItems(getRecentAuctionActivity(10));
  }, []);

  useEffect(() => {
    const load = () => {
      const storeAuctions = getActiveAuctions().map(a => ({
        ...a,
        auction_end: a.ends_at,
        isLeading: false,
      }));
      setVehicles(storeAuctions);
      loadActivity();
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [loadActivity]);

  useEffect(() => {
    if (activityItems.length <= 1) return;
    const timer = setInterval(() => {
      setActivityIdx(prev => (prev + 1) % activityItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activityItems.length]);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = async (amount) => {
    if (!selectedVehicle || !currentUser) return;
    addBid({ auctionId: selectedVehicle.id, userId: currentUser.id, amount, userName: 'Postor anónimo' });
    updateAuction(selectedVehicle.id, { current_bid: amount, bids_count: (selectedVehicle.bids_count || 0) + 1 });
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, current_bid: amount, bids_count: (v.bids_count || 0) + 1, isLeading: true } : v));
    loadActivity();
    toast.success('Listo. Tu puja quedó registrada.', { description: `Puja: ${formatMoneyShort(amount)} · ${selectedVehicle.brand} ${selectedVehicle.model}` });
  };

  const filteredVehicles = useMemo(() => {
    let list = [...vehicles];
    if (search) { const q = search.toLowerCase(); list = list.filter(v => (`${v.brand} ${v.model}`).toLowerCase().includes(q)); }
    if (filters.brand) list = list.filter(v => v.brand === filters.brand);
    if (filters.yearFrom) list = list.filter(v => v.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) list = list.filter(v => v.year <= parseInt(filters.yearTo));
    if (filters.mileageMax) list = list.filter(v => v.mileage <= parseInt(filters.mileageMax));
    if (sortBy === 'ending_soon') list.sort((a, b) => new Date(a.auction_end || a.ends_at) - new Date(b.auction_end || b.ends_at));
    else if (sortBy === 'price_low') list.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0));
    else if (sortBy === 'price_high') list.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0));
    else if (sortBy === 'most_bids') list.sort((a, b) => (b.bids_count || 0) - (a.bids_count || 0));
    return list;
  }, [vehicles, search, filters, sortBy]);

  const currentActivity = activityItems[activityIdx];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24 md:pb-8">
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
                  <motion.p
                    key={currentActivity.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-foreground truncate"
                  >
                    {currentActivity.message}
                  </motion.p>
                ) : (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
                    Sin actividad reciente
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {activityItems.length > 1 && (
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground flex-shrink-0">
                {activityIdx + 1}/{activityItems.length}
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Search & Sort bar */}
      <div className="bg-background px-4 md:px-8 pt-3 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline" className="px-2.5 py-1 text-xs border-border bg-muted/50 text-muted-foreground">
            <Flame className="w-3 h-3 mr-1 text-secondary" />{vehicles.length} activas
          </Badge>
          <button onClick={() => navigate('/Guardadas')} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-secondary transition-colors">
            <Bookmark className="w-3.5 h-3.5" />Guardadas
          </button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 rounded-2xl border-border bg-muted/50 text-foreground font-semibold h-10 text-sm">
              <SlidersHorizontal className="w-4 h-4 mr-1 text-muted-foreground" /><SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="ending_soon">Por terminar</SelectItem>
              <SelectItem value="most_bids">Más populares</SelectItem>
              <SelectItem value="price_low">Precio: menor</SelectItem>
              <SelectItem value="price_high">Precio: mayor</SelectItem>
            </SelectContent>
          </Select>
          {/* Mobile: sheet filter */}
          <div className="md:hidden">
            <FilterSheet filters={filters} setFilters={setFilters} />
          </div>
        </div>
      </div>

      {/* Main content: sidebar filter (desktop) + grid */}
      <div className="px-4 md:px-8 pt-2 pb-4 md:flex gap-6">
        {/* Desktop sidebar filter */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        {/* Auction listings */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-foreground font-sans">Subastas</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehículos</span>
              <div className="flex items-center bg-muted/50 rounded-xl p-0.5 border border-border">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {filteredVehicles.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No hay subastas activas</p>
              <p className="text-xs text-muted-foreground mt-1">Las subastas aparecerán aquí cuando los dealers publiquen vehículos</p>
            </div>
          ) : (
            <>
              {/* Mobile: compact list */}
              <div className="space-y-3 md:hidden">
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} variant="compact" />
                ))}
              </div>
              {/* Desktop: grid or list */}
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
