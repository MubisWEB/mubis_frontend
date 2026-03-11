import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy, CheckCircle, Clock, ChevronRight, CalendarPlus, Search, SlidersHorizontal, Filter, X, LayoutGrid, LayoutList, Route } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getWonAuctionsByUserId, getCurrentUser, updateAuction, addAuction, getAuctionById } from '@/lib/mockStore';
import ExtensionModal from '@/components/ExtensionModal';
import { WonAuctionGridCard, WonAuctionListCard, WonAuctionMobileCard } from '@/components/WonAuctionCard';
import RouteAssistant from '@/components/RouteAssistant';

const COMPLETION_WINDOW_MS = 96 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function formatCountdown(ms) {
  if (ms <= 0) return 'Completado';
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

function GanadosFilterPanel({ filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const hasFilters = Object.values(filters).some(v => v);
  const handleApply = () => setFilters(local);
  const handleReset = () => { const e = { brand: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-secondary" />
        <h3 className="text-base font-bold text-foreground">Filtros</h3>
        {hasFilters && <span className="ml-auto w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{Object.values(filters).filter(v => v).length}</span>}
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Marca</Label>
          <Select value={local.brand} onValueChange={(v) => setLocal({ ...local, brand: v })}>
            <SelectTrigger className="rounded-xl border-border h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Año</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Desde" value={local.yearFrom} onChange={(e) => setLocal({ ...local, yearFrom: e.target.value })} className="rounded-xl border-border h-10" />
            <Input type="number" placeholder="Hasta" value={local.yearTo} onChange={(e) => setLocal({ ...local, yearTo: e.target.value })} className="rounded-xl border-border h-10" />
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-2 border-t border-border mt-5">
        <Button onClick={handleApply} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-10 rounded-full">Aplicar filtros</Button>
        {hasFilters && <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground font-medium text-sm"><X className="w-4 h-4 mr-1" />Limpiar filtros</Button>}
      </div>
    </div>
  );
}

function GanadosFilterSheet({ filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const [open, setOpen] = useState(false);
  const hasFilters = Object.values(filters).some(v => v);
  const handleApply = () => { setFilters(local); setOpen(false); };
  const handleReset = () => { const e = { brand: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full font-medium h-10 px-4 text-sm border-0 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Filter className="w-4 h-4 mr-1" />Filtrar
          {hasFilters && <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{Object.values(filters).filter(v => v).length}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
        <SheetHeader className="text-center pb-4"><SheetTitle className="text-xl font-bold font-sans text-foreground">Filtros</SheetTitle></SheetHeader>
        <div className="space-y-5 px-1">
          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 block">Marca</Label>
            <Select value={local.brand} onValueChange={(v) => setLocal({ ...local, brand: v })}>
              <SelectTrigger className="rounded-xl border-border h-11"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 block">Año</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Desde" value={local.yearFrom} onChange={(e) => setLocal({ ...local, yearFrom: e.target.value })} className="rounded-xl border-border h-11" />
              <Input type="number" placeholder="Hasta" value={local.yearTo} onChange={(e) => setLocal({ ...local, yearTo: e.target.value })} className="rounded-xl border-border h-11" />
            </div>
          </div>
        </div>
        <div className="pt-4 space-y-2 border-t border-border mt-4">
          <Button onClick={handleApply} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-12 rounded-full">Aplicar filtros</Button>
          {hasFilters && <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground font-medium"><X className="w-4 h-4 mr-1" />Limpiar filtros</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Card components extracted to WonAuctionCard.jsx

export default function Ganados() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const currentRole = (currentUser?.role || localStorage.getItem('mubis_user_role') || '').toLowerCase().trim();
  const canUseRouteAssistant = currentRole === 'recomprador';
  const [wonAuctions, setWonAuctions] = useState([]);
  const [, setTick] = useState(0);
  const [extensionModal, setExtensionModal] = useState({ open: false, auctionId: null, vehicleName: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '' });
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [routeOpen, setRouteOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    const supportsWonStates = ['recomprador', 'dealer'].includes(currentUser.role);
    const targetStatuses = supportsWonStates
      ? [
          'proceso', 'proceso', 'proceso', 'proceso', 'proceso',
          'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado',
          'completado', 'completado', 'completado', 'completado', 'completado', 'completado', 'completado',
          'cancelado', 'cancelado', 'cancelado', 'cancelado', 'cancelado', 'cancelado',
        ]
      : [];
    const getAssignedStatus = (index) => targetStatuses[index] || targetStatuses[targetStatuses.length - 1] || 'proceso';

    let won = getWonAuctionsByUserId(currentUser.id).map((auction, index) => {
      if (!supportsWonStates) return auction;

      const assignedStatus = getAssignedStatus(index);
      if (auction.mockWonStatus !== assignedStatus) {
        updateAuction(auction.id, { mockWonStatus: assignedStatus });
      }

      return {
        ...auction,
        extensionDays: auction.extensionDays || 0,
        ends_at: auction.ends_at || new Date().toISOString(),
        mockWonStatus: assignedStatus,
      };
    });

    if (['recomprador', 'dealer'].includes(currentUser.role) && won.length < targetStatuses.length) {
      const mockCars = [
        { brand: 'Toyota', model: 'Corolla', year: 2022, city: 'Bogotá', mileage: 18000, current_bid: 72000000 },
        { brand: 'Mazda', model: 'CX-5', year: 2023, city: 'Bogotá', mileage: 12000, current_bid: 98000000 },
        { brand: 'Chevrolet', model: 'Tracker', year: 2021, city: 'Bogotá', mileage: 35000, current_bid: 65000000 },
        { brand: 'Renault', model: 'Duster', year: 2020, city: 'Bogotá', mileage: 42000, current_bid: 52000000 },
        { brand: 'Kia', model: 'Sportage', year: 2023, city: 'Bogotá', mileage: 8000, current_bid: 105000000 },
        { brand: 'Hyundai', model: 'Tucson', year: 2022, city: 'Bogotá', mileage: 22000, current_bid: 88000000 },
        { brand: 'BMW', model: 'X3', year: 2021, city: 'Bogotá', mileage: 30000, current_bid: 145000000 },
        { brand: 'Volkswagen', model: 'Tiguan', year: 2022, city: 'Bogotá', mileage: 19000, current_bid: 92000000 },
        { brand: 'Ford', model: 'Escape', year: 2020, city: 'Bogotá', mileage: 48000, current_bid: 58000000 },
        { brand: 'Nissan', model: 'Qashqai', year: 2023, city: 'Bogotá', mileage: 5000, current_bid: 112000000 },
        { brand: 'Audi', model: 'Q5', year: 2021, city: 'Bogotá', mileage: 28000, current_bid: 165000000 },
        { brand: 'Mercedes-Benz', model: 'GLC', year: 2022, city: 'Bogotá', mileage: 15000, current_bid: 195000000 },
        { brand: 'Toyota', model: 'RAV4', year: 2023, city: 'Bogotá', mileage: 9000, current_bid: 118000000 },
        { brand: 'Mazda', model: '3', year: 2022, city: 'Bogotá', mileage: 20000, current_bid: 68000000 },
        { brand: 'Kia', model: 'Seltos', year: 2023, city: 'Bogotá', mileage: 11000, current_bid: 82000000 },
        { brand: 'Hyundai', model: 'Creta', year: 2022, city: 'Bogotá', mileage: 16000, current_bid: 76000000 },
        { brand: 'Chevrolet', model: 'Onix', year: 2023, city: 'Bogotá', mileage: 7000, current_bid: 55000000 },
        { brand: 'Renault', model: 'Koleos', year: 2021, city: 'Bogotá', mileage: 32000, current_bid: 95000000 },
        { brand: 'Toyota', model: 'Hilux', year: 2022, city: 'Bogotá', mileage: 25000, current_bid: 135000000 },
        { brand: 'Ford', model: 'Bronco Sport', year: 2023, city: 'Bogotá', mileage: 6000, current_bid: 142000000 },
        { brand: 'Nissan', model: 'Kicks', year: 2022, city: 'Bogotá', mileage: 18000, current_bid: 72000000 },
      ];

      const photos = [
        'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
      ];

      const needed = targetStatuses.length - won.length;
      for (let i = 0; i < needed; i++) {
        const nextIndex = won.length;
        const car = mockCars[nextIndex % mockCars.length];
        const mockId = `won-mock-${nextIndex}`;
        // Persist in store if not already there
        const existing = getAuctionById(mockId);
        if (!existing) {
          addAuction({
            id: mockId,
            ...car,
            status: 'ended',
            winnerId: currentUser.id,
            sellerId: 'u-dealer-1',
            photos: [photos[nextIndex % photos.length]],
            ends_at: new Date().toISOString(),
            bids_count: Math.floor(Math.random() * 15) + 3,
            mileage: car.mileage,
          });
        } else if (existing.city !== car.city) {
          updateAuction(mockId, { city: car.city });
        }
        won.push({
          id: mockId,
          ...car,
          status: 'ended',
          winnerId: currentUser.id,
          sellerId: 'u-dealer-1',
          photos: [photos[nextIndex % photos.length]],
          ends_at: new Date().toISOString(),
          extensionDays: 0,
          mockWonStatus: getAssignedStatus(nextIndex),
        });
      }
    }

    setWonAuctions(supportsWonStates ? won.slice(0, targetStatuses.length) : won);
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (wonAuctions.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [wonAuctions.length]);

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  const getCompletionWindow = (auction) => COMPLETION_WINDOW_MS + (auction.extensionDays || 0) * ONE_DAY_MS;

  const getAuctionStatus = (auction) => {
    if (auction.mockWonStatus === 'completado') {
      return { remaining: 0, isCompleted: true, canExtend: false };
    }

    if (auction.mockWonStatus === 'cancelado') {
      return { remaining: 12 * 60 * 60 * 1000, isCompleted: false, canExtend: true };
    }

    if (auction.mockWonStatus === 'proceso') {
      return { remaining: 48 * 60 * 60 * 1000, isCompleted: false, canExtend: false };
    }

    const endTime = new Date(auction.ends_at).getTime();
    const remaining = getCompletionWindow(auction) - (Date.now() - endTime);
    return { remaining, isCompleted: remaining <= 0, canExtend: remaining > 0 && remaining < ONE_DAY_MS };
  };

  const statusCounts = useMemo(() => {
    const counts = { proceso: 0, completado: 0, cancelado: 0 };
    wonAuctions.forEach(a => {
      const { isCompleted, canExtend } = getAuctionStatus(a);
      if (isCompleted) counts.completado++;
      else if (canExtend) counts.cancelado++;
      else counts.proceso++;
    });
    return counts;
  }, [wonAuctions]);

  const inProcessAuctions = useMemo(() => {
    return wonAuctions.filter(a => {
      const { isCompleted, canExtend } = getAuctionStatus(a);
      return !isCompleted && !canExtend;
    });
  }, [wonAuctions]);

  const filteredAuctions = useMemo(() => {
    let list = [...wonAuctions];
    if (search) { const q = search.toLowerCase(); list = list.filter(a => (`${a.brand} ${a.model}`).toLowerCase().includes(q)); }
    if (filters.brand) list = list.filter(a => a.brand === filters.brand);
    if (filters.yearFrom) list = list.filter(a => a.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) list = list.filter(a => a.year <= parseInt(filters.yearTo));
    if (activeTab === 'proceso') list = list.filter(a => { const s = getAuctionStatus(a); return !s.isCompleted && !s.canExtend; });
    if (activeTab === 'completado') list = list.filter(a => getAuctionStatus(a).isCompleted);
    if (activeTab === 'cancelado') list = list.filter(a => { const s = getAuctionStatus(a); return s.canExtend; });
    if (sortBy === 'price_high') list.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0));
    else if (sortBy === 'price_low') list.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0));
    return list;
  }, [wonAuctions, search, filters, sortBy, activeTab]);

  const handleExtensionConfirm = ({ days, reason }) => {
    const { auctionId } = extensionModal;
    const auction = wonAuctions.find(a => a.id === auctionId);
    const currentExtension = auction?.extensionDays || 0;
    updateAuction(auctionId, { extensionDays: currentExtension + days, extensionReason: reason });
    setWonAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, extensionDays: currentExtension + days, extensionReason: reason } : a));
  };

  const openExtension = (auction) => {
    setExtensionModal({ open: true, auctionId: auction.id, vehicleName: `${auction.brand} ${auction.model}` });
  };

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-12">
      <Header title="Mis Ganados" subtitle={wonAuctions.length > 0 ? `${wonAuctions.length} subastas ganadas` : undefined} />

      {/* Status filter cards */}
      <div className="px-4 md:px-8 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { key: 'proceso', label: 'En proceso', count: statusCounts.proceso, colorClass: 'text-secondary', activeBg: 'bg-secondary/15 border-secondary' },
            { key: 'completado', label: 'Completado', count: statusCounts.completado, colorClass: 'text-primary', activeBg: 'bg-primary/15 border-primary' },
            { key: 'cancelado', label: 'Cancelado', count: statusCounts.cancelado, colorClass: 'text-destructive', activeBg: 'bg-destructive/15 border-destructive' },
          ].map(stat => (
            <button key={stat.key} onClick={() => setActiveTab(activeTab === stat.key ? 'all' : stat.key)}
              className={`text-center p-3 rounded-xl border transition-all ${activeTab === stat.key ? stat.activeBg : 'border-border bg-card hover:bg-muted/30'}`}>
              <p className={`text-2xl font-bold ${stat.colorClass}`}>{stat.count}</p>
              <p className={`text-[10px] ${activeTab === stat.key ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Route Assistant button */}
        {canUseRouteAssistant && (
          <div className="mt-3">
            <Button
              onClick={() => setRouteOpen(true)}
              disabled={inProcessAuctions.length === 0}
              className="w-full rounded-xl h-11 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              <Route className="w-4 h-4 mr-2" />
              Asistente de ruta
              {inProcessAuctions.length > 0 && (
                <Badge className="ml-2 bg-secondary-foreground/20 text-secondary-foreground text-[10px]">{inProcessAuctions.length}</Badge>
              )}
            </Button>
            {inProcessAuctions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center mt-1">No hay vehículos en proceso para planificar ruta</p>
            )}
          </div>
        )}
      </div>

      {/* Search & Sort */}
      <div className="bg-background px-4 md:px-8 pb-3">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        <div className="flex gap-2">
          <div className="md:hidden">
            <GanadosFilterSheet filters={filters} setFilters={setFilters} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-8 pt-2 pb-4 md:flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <GanadosFilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-foreground font-sans">Ganados</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filteredAuctions.length} vehículos</span>
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

          {filteredAuctions.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-secondary/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-sans">Aún no has ganado subastas</h3>
              <p className="text-muted-foreground">Participa en las subastas activas<br />para ganar vehículos</p>
            </motion.div>
          ) : (
            <>
              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {filteredAuctions.map((auction, index) => {
                  const { remaining, isCompleted, canExtend } = getAuctionStatus(auction);
                  const isCancelled = auction.mockWonStatus === 'cancelado';
                  return (
                    <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <WonAuctionMobileCard auction={auction} formatPrice={formatPrice} navigate={navigate} isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} onExtend={openExtension} isCancelled={isCancelled} index={index} />
                    </motion.div>
                  );
                })}
              </div>
              {/* Desktop: grid or list */}
              {viewMode === 'grid' ? (
                <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAuctions.map((auction, index) => {
                    const { remaining, isCompleted, canExtend } = getAuctionStatus(auction);
                    const isCancelled = auction.mockWonStatus === 'cancelado';
                    return (
                      <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <WonAuctionGridCard auction={auction} formatPrice={formatPrice} navigate={navigate} isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} onExtend={openExtension} isCancelled={isCancelled} index={index} />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="hidden md:flex md:flex-col gap-4">
                  {filteredAuctions.map((auction, index) => {
                    const { remaining, isCompleted, canExtend } = getAuctionStatus(auction);
                    const isCancelled = auction.mockWonStatus === 'cancelado';
                    return (
                      <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <WonAuctionListCard auction={auction} formatPrice={formatPrice} navigate={navigate} isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} onExtend={openExtension} isCancelled={isCancelled} index={index} />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ExtensionModal open={extensionModal.open} onOpenChange={(open) => setExtensionModal(prev => ({ ...prev, open }))} onConfirm={handleExtensionConfirm} vehicleName={extensionModal.vehicleName} />
      <RouteAssistant open={routeOpen} onOpenChange={setRouteOpen} inProcessAuctions={inProcessAuctions} />
      <BottomNav />
    </div>
  );
}
