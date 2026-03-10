import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Clock, Users, Eye, DollarSign, Plus, FileCheck, CheckCircle, AlertTriangle, Trophy, XCircle, Search, SlidersHorizontal, Filter, X, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import PublicarCarroDialog from '@/components/PublicarCarroDialog';
import { getVehicles, getAuctions, getCurrentUser, getInspectionByVehicleId, reconcileAuctionStatuses } from '@/lib/mockStore';

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

// ── Filter Panel (desktop sidebar) ──
function SellerFilterPanel({ filters, setFilters }) {
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
        <Button onClick={handleApply} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-10 rounded-full">Aplicar</Button>
        {hasFilters && <Button variant="ghost" onClick={handleReset} className="w-full text-muted-foreground font-medium text-sm"><X className="w-4 h-4 mr-1" />Limpiar</Button>}
      </div>
    </div>
  );
}

function SellerFilterSheet({ filters, setFilters }) {
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

// ── Card components ──
function VehicleProcessCard({ v, navigate }) {
  const insp = getInspectionByVehicleId(v.id);
  const getStatusBadge = () => {
    if (v.status === 'INSPECTION_REJECTED' || (insp && insp.status === 'REJECTED')) return <Badge className="bg-destructive/10 text-destructive text-xs">Rechazado</Badge>;
    if (v.status === 'IN_PROGRESS' || (insp && insp.status === 'IN_PROGRESS')) return <Badge className="bg-secondary/10 text-secondary text-xs">En peritaje</Badge>;
    if (v.status === 'PENDING_INSPECTION' || (insp && insp.status === 'PENDING')) return <Badge className="bg-purple-100 text-purple-800 text-xs font-semibold">Pendiente</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-xs">{v.status}</Badge>;
  };
  const docs = v.documentation;
  const soatOk = docs?.soat?.status === 'vigente';
  const tecnoOk = docs?.tecno?.status === 'vigente';
  const multasOk = docs?.multas?.tiene === 'no';
  const docsOk = docs && soatOk && tecnoOk && multasOk;

  return (
    <Card className="overflow-hidden border border-border/60 rounded-xl cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate(`/PeritajeDetalle/${insp?.id || v.id}`)}>
      <div className="flex p-3 gap-3">
        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {v.photos?.[0] && <img src={v.photos[0]} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="font-bold text-foreground text-base leading-tight">{v.brand} {v.model}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{v.year} · {v.placa}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {docs && (
              <Badge className={`text-[10px] ${docsOk ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          {getStatusBadge()}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}

function VehicleProcessGridCard({ v }) {
  const insp = getInspectionByVehicleId(v.id);
  const getStatusBadge = () => {
    if (v.status === 'INSPECTION_REJECTED' || (insp && insp.status === 'REJECTED')) return <Badge className="bg-destructive/10 text-destructive text-xs">Rechazado</Badge>;
    if (v.status === 'IN_PROGRESS' || (insp && insp.status === 'IN_PROGRESS')) return <Badge className="bg-secondary/10 text-secondary text-xs">En peritaje</Badge>;
    if (v.status === 'PENDING_INSPECTION' || (insp && insp.status === 'PENDING')) return <Badge className="bg-purple-100 text-purple-800 text-xs font-semibold">Pendiente</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-xs">{v.status}</Badge>;
  };
  const docs = v.documentation;
  const docsOk = docs && docs.soat?.status === 'vigente' && docs.tecno?.status === 'vigente' && docs.multas?.tiene === 'no';
  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={v.photos?.[0] || defaultImage} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2">{getStatusBadge()}</div>
        {docs && (
          <div className="absolute top-2 right-2">
            <Badge className={`text-[10px] backdrop-blur-sm ${docsOk ? 'bg-primary/80 text-primary-foreground' : 'bg-background/80 text-foreground'}`}>
              {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{v.brand} {v.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{v.year} · {v.placa}</p>
      </div>
    </Card>
  );
}

function AuctionCard({ auction, navigate }) {
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const peritajeBadge = (() => {
    const insp = getInspectionByVehicleId(auction.vehicleId);
    if (!insp || insp.status !== 'COMPLETED') return null;
    return <Badge className={`text-[10px] font-semibold ${insp.scoreGlobal >= 80 ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-800'}`}><FileCheck className="w-3 h-3 mr-0.5" />{insp.scoreGlobal}/100</Badge>;
  })();
  const isEnded = auction.status === 'ended' || auction.status === 'closed';

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm cursor-pointer hover:shadow-md transition-shadow rounded-2xl" onClick={() => navigate(`/DetalleSubastaVendedor/${auction.id}`)}>
      <div className="flex p-3 gap-3">
        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
          {auction.photos?.[0] && <img src={auction.photos[0]} alt="" className="w-full h-full object-cover" />}
          {isEnded ? (
            auction.winnerId ? <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0"><Trophy className="w-2.5 h-2.5 mr-0.5" />Ganador</Badge> : <Badge className="absolute top-1 left-1 bg-muted text-muted-foreground text-[10px] px-1.5 py-0"><XCircle className="w-2.5 h-2.5 mr-0.5" />Sin ganador</Badge>
          ) : (
            <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Activa</Badge>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">{auction.brand} {auction.model}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
            <span className="text-muted-foreground text-xs flex items-center"><Users className="w-3 h-3 mr-0.5" />{auction.bids_count || 0}</span>
            {!isEnded && <span className="text-muted-foreground text-xs flex items-center"><Clock className="w-3 h-3 mr-0.5" />{getTimeLeft(auction.ends_at)}</span>}
            {peritajeBadge}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AuctionGridCard({ auction, navigate }) {
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const isEnded = auction.status === 'ended' || auction.status === 'closed';
  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubastaVendedor/${auction.id}`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={auction.photos?.[0] || defaultImage} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {isEnded ? (
          auction.winnerId ? <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5"><Trophy className="w-3 h-3 mr-1" />Con ganador</Badge> : <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground text-xs px-2 py-0.5"><XCircle className="w-3 h-3 mr-1" />Sin ganador</Badge>
        ) : (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">Activa</Badge>
        )}
        {!isEnded && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-background/80 text-foreground">
            <Clock className="w-3 h-3" /><span className="font-semibold">{getTimeLeft(auction.ends_at)}</span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{auction.bids_count || 0}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{auction.views || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ──
export default function MisSubastas() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '' });
  const [activeTab, setActiveTab] = useState('activas');
  const currentUser = getCurrentUser();

  const loadData = useCallback(() => {
    reconcileAuctionStatuses();
    setVehicles(getVehicles().filter(v => v.dealerId === currentUser?.id));
    setAuctions(getAuctions().filter(a => a.dealerId === currentUser?.id));
  }, [currentUser?.id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const applyFilters = (list, isBrandField = 'brand') => {
    let filtered = [...list];
    if (search) { const q = search.toLowerCase(); filtered = filtered.filter(v => (`${v.brand} ${v.model}`).toLowerCase().includes(q)); }
    if (filters.brand) filtered = filtered.filter(v => v[isBrandField] === filters.brand);
    if (filters.yearFrom) filtered = filtered.filter(v => v.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) filtered = filtered.filter(v => v.year <= parseInt(filters.yearTo));
    return filtered;
  };

  const enProceso = useMemo(() => applyFilters(vehicles.filter(v => ['PENDING_INSPECTION', 'IN_PROGRESS'].includes(v.status))), [vehicles, search, filters]);
  const rechazados = useMemo(() => applyFilters(vehicles.filter(v => v.status === 'INSPECTION_REJECTED')), [vehicles, search, filters]);
  const activas = useMemo(() => applyFilters(auctions.filter(a => a.status === 'active')), [auctions, search, filters]);
  const finalizadas = useMemo(() => applyFilters(auctions.filter(a => a.status === 'ended' || a.status === 'closed')), [auctions, search, filters]);

  const tabs = [
    { key: 'proceso', label: 'En proceso', count: enProceso.length },
    { key: 'rechazados', label: 'Rechazados', count: rechazados.length },
    { key: 'activas', label: 'Activas', count: activas.length },
    { key: 'finalizadas', label: 'Finalizadas', count: finalizadas.length },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Mis vehículos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Publicaciones y subastas</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1.5">
            <Plus className="w-4 h-4" /> Publicar carro
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-2 pb-2">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button onClick={() => setActiveTab('activas')} className={`text-center p-3 rounded-xl transition-colors ${activeTab === 'activas' ? 'bg-secondary/20 ring-2 ring-secondary' : 'bg-secondary/10 hover:bg-secondary/15'}`}>
            <p className="text-2xl font-bold text-secondary">{auctions.filter(a => a.status === 'active').length}</p>
            <p className="text-muted-foreground text-xs">En subasta</p>
          </button>
          <button onClick={() => setActiveTab('proceso')} className={`text-center p-3 rounded-xl transition-colors ${activeTab === 'proceso' ? 'bg-accent/20 ring-2 ring-secondary' : 'bg-accent/10 hover:bg-accent/15'}`}>
            <p className="text-2xl font-bold text-secondary">{vehicles.filter(v => ['PENDING_INSPECTION', 'IN_PROGRESS'].includes(v.status)).length}</p>
            <p className="text-muted-foreground text-xs">En proceso</p>
          </button>
          <button onClick={() => setActiveTab('finalizadas')} className={`text-center p-3 rounded-xl transition-colors ${activeTab === 'finalizadas' ? 'bg-primary/20 ring-2 ring-primary' : 'bg-primary/10 hover:bg-primary/15'}`}>
            <p className="text-2xl font-bold text-primary">{auctions.filter(a => a.status === 'ended' || a.status === 'closed').length + vehicles.length}</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-3">
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm" />
        </div>
        <div className="md:hidden">
          <SellerFilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 md:flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <SellerFilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl mb-4">
              {tabs.map(t => (
                <TabsTrigger key={t.key} value={t.key} className="text-[11px] whitespace-nowrap rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-1.5 py-1.5">
                  {t.label} <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">{t.count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="proceso">
              {enProceso.length === 0 ? <EmptyState text="Sin vehículos en proceso" /> : (
                <>
                  <div className="space-y-2 md:hidden">{enProceso.map(v => <VehicleProcessCard key={v.id} v={v} />)}</div>
                  <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">{enProceso.map(v => <VehicleProcessGridCard key={v.id} v={v} />)}</div>
                </>
              )}
            </TabsContent>

            <TabsContent value="rechazados">
              {rechazados.length === 0 ? <EmptyState text="Sin peritajes rechazados" /> : (
                <>
                  <div className="space-y-2 md:hidden">{rechazados.map(v => <VehicleProcessCard key={v.id} v={v} />)}</div>
                  <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">{rechazados.map(v => <VehicleProcessGridCard key={v.id} v={v} />)}</div>
                </>
              )}
            </TabsContent>

            <TabsContent value="activas">
              {activas.length === 0 ? <EmptyState text="Sin subastas activas" /> : (
                <>
                  <div className="space-y-3 md:hidden">{activas.map(a => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
                  <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">{activas.map(a => <AuctionGridCard key={a.id} auction={a} navigate={navigate} />)}</div>
                </>
              )}
            </TabsContent>

            <TabsContent value="finalizadas">
              {finalizadas.length === 0 ? <EmptyState text="Sin subastas finalizadas" /> : (
                <>
                  <div className="space-y-3 md:hidden">{finalizadas.map(a => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
                  <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">{finalizadas.map(a => <AuctionGridCard key={a.id} auction={a} navigate={navigate} />)}</div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {vehicles.length === 0 && auctions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 font-sans">No tienes publicaciones</h3>
              <p className="text-muted-foreground text-sm">Usa el botón "Publicar carro" arriba para iniciar</p>
            </div>
          )}
        </div>
      </div>

      <PublicarCarroDialog open={dialogOpen} onOpenChange={setDialogOpen} onPublished={loadData} />
      <BottomNav />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
