import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy, CheckCircle, Clock, ChevronRight, CalendarPlus, Search, SlidersHorizontal, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getWonAuctionsByUserId, getCurrentUser, getAuctions, updateAuction } from '@/lib/mockStore';
import ExtensionModal from '@/components/ExtensionModal';

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
  const handleReset = () => { const e = { brand: '', status: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

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
          <Label className="text-foreground font-semibold text-sm mb-2 block">Estado</Label>
          <Select value={local.status} onValueChange={(v) => setLocal({ ...local, status: v })}>
            <SelectTrigger className="rounded-xl border-border h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En proceso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
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
  const handleReset = () => { const e = { brand: '', status: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full font-medium h-10 px-4 text-sm border-0 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Filter className="w-4 h-4 mr-1" />Filtrar
          {hasFilters && <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{Object.values(filters).filter(v => v).length}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
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
            <Label className="text-foreground font-semibold text-sm mb-2 block">Estado</Label>
            <Select value={local.status} onValueChange={(v) => setLocal({ ...local, status: v })}>
              <SelectTrigger className="rounded-xl border-border h-11"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En proceso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
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

function WonAuctionGridCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend }) {
  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={auction.photos?.[0] || defaultImage} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">
          <CheckCircle className="w-3 h-3 mr-1" />Ganado
        </Badge>
        <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm ${isCompleted ? 'bg-primary/80 text-primary-foreground' : canExtend ? 'bg-destructive/80 text-destructive-foreground' : 'bg-background/80 text-foreground'}`}>
          {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span className="font-semibold">{isCompleted ? 'Completado' : formatCountdown(remaining)}</span>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
          {canExtend ? (
            <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-3 h-8 rounded-full text-xs"
              onClick={(e) => { e.stopPropagation(); onExtend(auction); }}>
              <CalendarPlus className="w-3 h-3 mr-1" />Extensión
            </Button>
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Ganados() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [wonAuctions, setWonAuctions] = useState([]);
  const [, setTick] = useState(0);
  const [extensionModal, setExtensionModal] = useState({ open: false, auctionId: null, vehicleName: '' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '' });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!currentUser?.id) return;
    let won = getWonAuctionsByUserId(currentUser.id);
    if (won.length < 5) {
      const allAuctions = getAuctions();
      const endedNotMine = allAuctions.filter(a => a.status === 'ended' && a.winnerId && a.winnerId !== currentUser.id);
      const toAssign = endedNotMine.slice(0, 6 - won.length);
      toAssign.forEach(a => { updateAuction(a.id, { winnerId: currentUser.id }); });
      if (toAssign.length > 0) won = getWonAuctionsByUserId(currentUser.id);
    }
    setWonAuctions(won);
  }, [currentUser?.id]);

  useEffect(() => {
    if (wonAuctions.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, [wonAuctions.length]);

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  const getCompletionWindow = (auction) => COMPLETION_WINDOW_MS + (auction.extensionDays || 0) * ONE_DAY_MS;

  const getAuctionStatus = (auction) => {
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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
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
      </div>

      {/* Search & Sort */}
      <div className="bg-background px-4 md:px-8 pb-3">
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
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price_high">Precio: mayor</SelectItem>
              <SelectItem value="price_low">Precio: menor</SelectItem>
            </SelectContent>
          </Select>
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
            <span className="text-sm text-muted-foreground">{filteredAuctions.length} vehículos</span>
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
              {/* Mobile: compact list */}
              <div className="space-y-3 md:hidden">
                {filteredAuctions.map((auction, index) => {
                  const { remaining, isCompleted, canExtend } = getAuctionStatus(auction);
                  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';
                  return (
                    <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
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
                              <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-2 h-7 rounded-full text-[10px]"
                                onClick={(e) => { e.stopPropagation(); openExtension(auction); }}>
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
              {/* Desktop: grid */}
              <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAuctions.map((auction, index) => {
                  const { remaining, isCompleted, canExtend } = getAuctionStatus(auction);
                  return (
                    <motion.div key={auction.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <WonAuctionGridCard auction={auction} formatPrice={formatPrice} navigate={navigate} isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} onExtend={openExtension} />
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <ExtensionModal open={extensionModal.open} onOpenChange={(open) => setExtensionModal(prev => ({ ...prev, open }))} onConfirm={handleExtensionConfirm} vehicleName={extensionModal.vehicleName} />
      <BottomNav />
    </div>
  );
}
