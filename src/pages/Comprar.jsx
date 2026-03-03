import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Flame, Bell, ArrowUpRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import FilterSheet from '@/components/FilterSheet';
import BidModal from '@/components/BidModal';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";
import { getActiveAuctions, addBid, updateAuction, getCurrentUser } from '@/lib/mockStore';

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
  const [liveActivity, setLiveActivity] = useState([]);

  useEffect(() => {
    const load = () => {
      const storeAuctions = getActiveAuctions().map(a => ({
        ...a,
        auction_end: a.ends_at,
        isLeading: false,
      }));
      setVehicles(storeAuctions);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = async (amount) => {
    if (!selectedVehicle || !currentUser) return;
    // Save bid to store
    addBid({ auctionId: selectedVehicle.id, userId: currentUser.id, amount, userName: 'Postor anónimo' });
    updateAuction(selectedVehicle.id, { current_bid: amount, bids_count: (selectedVehicle.bids_count || 0) + 1 });
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, current_bid: amount, bids_count: (v.bids_count || 0) + 1, isLeading: true } : v));
    setLiveActivity(act => ([{ id: Date.now(), dealer: 'Tú', vehicle: `${selectedVehicle.brand} ${selectedVehicle.model}`, amount, time: new Date(), isYou: true }, ...act]).slice(0, 5));
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

  const topActivity = liveActivity[0];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24">
      <Header />
      <div className="bg-background px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline" className="px-2.5 py-1 text-xs border-border bg-muted/50 text-muted-foreground">
            <Flame className="w-3 h-3 mr-1 text-secondary" />{vehicles.length} activas
          </Badge>
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
          <FilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        {topActivity && (
          <div className="mb-4">
            <AnimatePresence mode="wait">
              <motion.div key={topActivity.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-3 text-sm bg-secondary/5 rounded-xl px-4 py-2.5 border border-secondary/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-secondary shrink-0" />
                  <span className={`font-bold ${topActivity.isYou ? 'text-primary' : 'text-secondary'}`}>{topActivity.dealer}</span>
                  <span className="text-muted-foreground">pujó</span>
                  <span className="font-bold text-secondary">{formatMoneyShort(topActivity.amount)}</span>
                  <span className="text-foreground font-bold truncate">{topActivity.vehicle}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-foreground font-sans">Subastas</p>
          <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehículos</span>
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
          <div className="space-y-3">
            {filteredVehicles.map((vehicle, index) => (<VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} />))}
          </div>
        )}
      </div>

      <BidModal vehicle={selectedVehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />
      <BottomNav />
    </div>
  );
}
