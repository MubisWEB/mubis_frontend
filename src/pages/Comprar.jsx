import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Flame, Bell, Gavel, ArrowUpRight } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import FilterSheet from '@/components/FilterSheet';
import BidModal from '@/components/BidModal';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import { Mail } from "lucide-react";

// ✅ Mock simple y limpio
const mockDataComprar = [
  {
    id: '1', brand: 'Mazda', model: 'CX-30', year: 2022, mileage: 15000, city: 'Bogotá',
    transmission: 'Automática', fuel_type: 'Gasolina', color: 'Gris', peritaje_by: 'Autonal',
    photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200'],
    current_bid: 62000000, bids_count: 24, status: 'active',
    auction_end: new Date(Date.now() + 42 * 60000).toISOString(), isLeading: true,
  },
  {
    id: '2', brand: 'Toyota', model: 'Hilux', year: 2020, mileage: 42000, city: 'Medellín',
    transmission: 'Manual', fuel_type: 'Diesel', color: 'Blanco', peritaje_by: 'Los Coches',
    photos: ['https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200', 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=1200'],
    current_bid: 118000000, bids_count: 35, status: 'active',
    auction_end: new Date(Date.now() + 95 * 60000).toISOString(), isLeading: false,
  },
  {
    id: '3', brand: 'Kia', model: 'Sportage', year: 2021, mileage: 18000, city: 'Cali',
    transmission: 'Automática', fuel_type: 'Gasolina', color: 'Rojo', peritaje_by: 'Sanautos',
    photos: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200', 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1200'],
    current_bid: 78000000, bids_count: 31, status: 'active',
    auction_end: new Date(Date.now() + 160 * 60000).toISOString(), isLeading: false,
  },
  {
    id: '4', brand: 'BMW', model: 'X3', year: 2021, mileage: 22000, city: 'Bogotá',
    transmission: 'Automática', fuel_type: 'Gasolina', color: 'Negro', peritaje_by: 'Autogermana',
    photos: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200', 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200'],
    current_bid: 145000000, bids_count: 42, status: 'active',
    auction_end: new Date(Date.now() + 15 * 60000).toISOString(), isLeading: false,
  },
];

const dealerNames = ['Autonal', 'Los Coches', 'Sanautos', 'Casa Toro', 'Derco', 'Carmax', 'Continautos', 'Andar'];
const formatMoneyShort = (n) => `$${(n / 1000000).toFixed(0)}M`;

export default function Comprar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '' });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const [onlineDealers, setOnlineDealers] = useState(127);
  const [myBids, setMyBids] = useState(() => {
    const saved = localStorage.getItem('mubis_my_bids');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => { setVehicles(mockDataComprar); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => {
        if (!prev.length) return prev;
        const vehicle = prev[Math.floor(Math.random() * prev.length)];
        const inc = (Math.floor(Math.random() * 3) + 1) * 500000;
        const newBid = (vehicle.current_bid || 0) + inc;
        const dealer = dealerNames[Math.floor(Math.random() * dealerNames.length)];
        setLiveActivity(act => ([{ id: Date.now(), dealer, vehicle: `${vehicle.brand} ${vehicle.model}`, amount: newBid, time: new Date() }, ...act]).slice(0, 5));
        return prev.map(v => v.id === vehicle.id ? { ...v, current_bid: newBid, bids_count: (v.bids_count || 0) + 1, isLeading: false } : v);
      });
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { setOnlineDealers(prev => Math.max(40, prev + Math.floor(Math.random() * 5) - 2)); }, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = async (amount) => {
    if (!selectedVehicle) return;
    setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, current_bid: amount, bids_count: (v.bids_count || 0) + 1, isLeading: true } : v));
    setMyBids(prev => { const next = { ...prev, [selectedVehicle.id]: amount }; localStorage.setItem('mubis_my_bids', JSON.stringify(next)); return next; });
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
    if (sortBy === 'my_bids') list = list.filter(v => myBids[v.id] != null);
    if (sortBy === 'ending_soon' || sortBy === 'my_bids') list.sort((a, b) => new Date(a.auction_end) - new Date(b.auction_end));
    else if (sortBy === 'price_low') list.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0));
    else if (sortBy === 'price_high') list.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0));
    else if (sortBy === 'most_bids') list.sort((a, b) => (b.bids_count || 0) - (a.bids_count || 0));
    return list;
  }, [vehicles, search, filters, sortBy, myBids]);

  const topActivity = liveActivity[0];

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <span className="text-2xl font-black tracking-tight text-foreground">mubis</span>
        </div>
      </nav>
      {/* Header */}
      <div className="bg-gradient-brand px-4 pt-6 pb-4">
        <div className="text-center mb-4">
          <MubisLogo size="xl" variant="light" />
        </div>

        <div className="flex justify-center gap-3 mb-4">
          <Badge variant="outline" className="px-3 py-1 backdrop-blur-sm" style={{ backgroundColor: 'rgba(57, 255, 20, 0.10)', color: '#39FF14', borderColor: 'rgba(57, 255, 20, 0.25)' }}>
            <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: '#39FF14' }} />
            {onlineDealers} dealers en línea
          </Badge>
          <Badge variant="outline" className="bg-white/10 text-white/85 border-white/20 px-3 py-1 backdrop-blur-sm">
            <Flame className="w-3 h-3 mr-1" />
            {vehicles.length} subastas activas
          </Badge>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl border-0 bg-white/10 backdrop-blur-lg text-white placeholder:text-white/50 text-sm" />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 rounded-2xl border-0 bg-white/10 backdrop-blur-lg text-white font-semibold h-10 text-sm">
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="ending_soon">Por terminar</SelectItem>
              <SelectItem value="most_bids">Más populares</SelectItem>
              <SelectItem value="price_low">Precio: menor</SelectItem>
              <SelectItem value="price_high">Precio: mayor</SelectItem>
              <SelectItem value="my_bids">Mis pujas</SelectItem>
            </SelectContent>
          </Select>
          <FilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-t-[2rem] px-4 pt-4 pb-4">
        <div className="mb-4 pt-1">
          <AnimatePresence mode="wait">
            {topActivity && (
              <motion.div key={topActivity.id} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-3 text-sm cursor-pointer bg-secondary/5 rounded-xl px-4 py-2.5 hover:bg-secondary/10 transition-colors border border-secondary/10"
                onClick={() => { const v = vehicles.find(x => `${x.brand} ${x.model}` === topActivity.vehicle); if (v) handleBid(v); }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 text-secondary shrink-0" />
                  <span className={`font-bold ${topActivity.isYou ? 'text-primary' : 'text-secondary'}`}>{topActivity.dealer}</span>
                  <span className="text-muted-foreground">pujó</span>
                  <span className="font-bold text-secondary">{formatMoneyShort(topActivity.amount)}</span>
                  <span className="text-muted-foreground">en</span>
                  <span className="text-foreground font-bold truncate">{topActivity.vehicle}</span>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-secondary font-bold">
                  <span className="text-xs">Pujar</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-foreground font-serif">{sortBy === 'my_bids' ? 'Mis pujas' : 'Subastas'}</p>
          <span className="text-sm text-muted-foreground">{filteredVehicles.length} vehículos</span>
        </div>

        <div className="space-y-3">
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} index={index} />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-foreground">No hay resultados</p>
            <p className="text-xs text-muted-foreground mt-1">Prueba quitando filtros o buscando diferente.</p>
          </div>
        )}
      </div>

      <BidModal vehicle={selectedVehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />

      <footer className="bg-footer text-footer-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-secondary" />
          <span>contacto@mubis.com</span>
        </div>
      </footer>

      <BottomNav currentPage="Comprar" />
    </div>
  );
}
