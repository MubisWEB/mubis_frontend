import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion } from 'framer-motion';
import { Clock, Users, Eye, DollarSign, Plus, FileCheck, CheckCircle, AlertTriangle, Trophy, XCircle, Search, SlidersHorizontal, Filter, X, ChevronRight, LayoutGrid, LayoutList, Gavel, Timer, ClipboardX, CheckCheck, Menu } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import PublishFAB from '@/components/PublishFAB';
import { useNavigate } from 'react-router-dom';
import PublicarCarroDialog from '@/components/PublicarCarroDialog';
import { vehiclesApi, auctionsApi, inspectionsApi, publicationsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import Skeleton from 'react-loading-skeleton';

const AuctionRowSkeleton = () => (
  <div className="flex gap-3 p-3 border border-border/60 rounded-xl bg-card">
    <Skeleton width={112} height={80} borderRadius={12} />
    <div style={{ flex: 1 }}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={{ marginTop: 5 }} />
      <Skeleton width={80} height={22} style={{ marginTop: 10 }} />
    </div>
    <Skeleton width={20} height={20} borderRadius={4} />
  </div>
);

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

// ── Filter Panel (desktop sidebar) ──
function SellerFilterPanel({ filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const hasFilters = Object.values(filters).some((v) => v);
  const handleApply = () => setFilters(local);
  const handleReset = () => {const e = { brand: '', yearFrom: '', yearTo: '' };setLocal(e);setFilters(e);};

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-4 self-start">
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-secondary" />
        <h3 className="text-base font-bold text-foreground">Filtros</h3>
        {hasFilters && <span className="ml-auto w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{Object.values(filters).filter((v) => v).length}</span>}
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Marca</Label>
          <Select value={local.brand} onValueChange={(v) => setLocal({ ...local, brand: v })}>
            <SelectTrigger className="rounded-xl border-border h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent>{brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
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
    </div>);

}

function SellerFilterSheet({ filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const [open, setOpen] = useState(false);
  const hasFilters = Object.values(filters).some((v) => v);
  const handleApply = () => {setFilters(local);setOpen(false);};
  const handleReset = () => {const e = { brand: '', yearFrom: '', yearTo: '' };setLocal(e);setFilters(e);};

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full font-medium h-10 px-4 text-sm border-0 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Filter className="w-4 h-4 mr-1" />Filtrar
          {hasFilters && <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">{Object.values(filters).filter((v) => v).length}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
        <SheetHeader className="text-center pb-4"><SheetTitle className="text-xl font-bold font-sans text-foreground">Filtros</SheetTitle></SheetHeader>
        <div className="space-y-5 px-1">
          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 block">Marca</Label>
            <Select value={local.brand} onValueChange={(v) => setLocal({ ...local, brand: v })}>
              <SelectTrigger className="rounded-xl border-border h-11"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>{brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
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
    </Sheet>);

}

// ── Card components ──
function VehicleProcessCard({ v, navigate, inspection }) {
  const getStatusBadge = () => {
    if (v.status === 'INSPECTION_REJECTED' || inspection && inspection.status === 'REJECTED') return <Badge className="bg-red-500 text-black text-xs font-semibold">Rechazado</Badge>;
    // Solo mostrar "En peritaje" para vehículos en proceso (no diferenciar pendiente vs in_progress)
    if (v.status === 'IN_PROGRESS' || v.status === 'PENDING_INSPECTION' || inspection && (inspection.status === 'IN_PROGRESS' || inspection.status === 'PENDING')) return <Badge className="bg-white text-secondary text-xs font-semibold border border-secondary/20">En peritaje</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-xs">{v.status}</Badge>;
  };
  
  // Solo mostrar docs para vehículos activos/completados
  const shouldShowDocs = v.status === 'READY_FOR_AUCTION' || (inspection && inspection.status === 'COMPLETED');
  const docs = v.documentation;
  const soatOk = docs?.soat?.status === 'vigente';
  const tecnoOk = docs?.tecno?.status === 'vigente';
  const multasOk = docs?.multas?.tiene === 'no';
  const docsOk = docs && soatOk && tecnoOk && multasOk;

  return (
    <Card className="overflow-hidden border border-border/60 rounded-xl cursor-pointer active:scale-[0.98]" onClick={() => navigate(`/PeritajeDetalle/${inspection?.id || v.id}`)}>
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
            {shouldShowDocs && docs &&
            <Badge className={`text-[10px] ${docsOk ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
              </Badge>
            }
          </div>
        </div>
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          {getStatusBadge()}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Card>);
}

function VehicleProcessGridCard({ v, navigate, inspection }) {
  const getStatusBadge = () => {
    if (v.status === 'INSPECTION_REJECTED' || inspection && inspection.status === 'REJECTED') return <Badge className="bg-red-500 text-black text-xs font-semibold">Rechazado</Badge>;
    // Solo mostrar "En peritaje" para vehículos en proceso (no diferenciar pendiente vs in_progress)
    if (v.status === 'IN_PROGRESS' || v.status === 'PENDING_INSPECTION' || inspection && (inspection.status === 'IN_PROGRESS' || inspection.status === 'PENDING')) return <Badge className="bg-white text-secondary text-xs font-semibold border border-secondary/20">En peritaje</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-xs">{v.status}</Badge>;
  };
  
  // Solo mostrar docs para vehículos activos/completados
  const shouldShowDocs = v.status === 'READY_FOR_AUCTION' || (inspection && inspection.status === 'COMPLETED');
  const docs = v.documentation;
  const docsOk = docs && docs.soat?.status === 'vigente' && docs.tecno?.status === 'vigente' && docs.multas?.tiene === 'no';
  const defaultImage = '';

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm cursor-pointer" onClick={() => navigate(`/PeritajeDetalle/${inspection?.id || v.id}`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={v.photos?.[0] || defaultImage} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">{getStatusBadge()}</div>
        {shouldShowDocs && docs &&
        <div className="absolute top-2 right-2">
            <Badge className={`text-[10px] backdrop-blur-sm ${docsOk ? 'bg-primary/80 text-primary-foreground' : 'bg-background/80 text-foreground'}`}>
              {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
            </Badge>
          </div>
        }
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{v.brand} {v.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{v.year} · {v.placa}</p>
      </div>
    </Card>);
}

function AuctionCard({ auction, navigate }) {
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  // Para decisión, calcular tiempo restante desde decisionDeadline
  const getDecisionTimeLeft = () => {
    if (!auction.decisionDeadline) return '30min';
    const diff = new Date(auction.decisionDeadline) - new Date();
    if (diff <= 0) return 'Expiró';
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}min`;
  };
  
  const isEnded = auction.status === 'ENDED' || auction.status === 'CLOSED';
  const isPending = auction.status === 'PENDING_DECISION';

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm cursor-pointer rounded-2xl" onClick={() => navigate(`/DetalleSubastaVendedor/${auction.id}`)}>
      <div className="flex p-3 gap-3">
        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
          {auction.photos?.[0] && <img src={auction.photos[0]} alt="" className="w-full h-full object-cover" />}
          {isEnded ? (
            auction.winnerId ? <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 hover:bg-primary z-10"><Trophy className="w-2.5 h-2.5 mr-0.5" />Ganador</Badge> : <Badge className="absolute top-1 left-1 bg-muted text-muted-foreground text-[10px] px-1.5 py-0 hover:bg-muted z-10"><XCircle className="w-2.5 h-2.5 mr-0.5" />Sin ganador</Badge>
          ) : isPending ? (
            <Badge className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0 hover:bg-orange-500 shadow-md z-10"><Clock className="w-2.5 h-2.5 mr-0.5" />Decidir</Badge>
          ) : auction.status === 'ACTIVE' ? (
            <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 hover:bg-primary z-10">{auction.isExtended48h ? 'Ext. 48h' : 'Activa'}</Badge>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">{auction.brand} {auction.model}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg text-foreground">{formatPrice(auction.current_bid)}</span>
            <span className="text-muted-foreground text-xs flex items-center"><Users className="w-3 h-3 mr-0.5" />{auction.bids_count || 0}</span>
            {isPending ? 
              <span className="text-destructive text-xs flex items-center"><Clock className="w-3 h-3 mr-0.5" />{getDecisionTimeLeft()}</span> :
              !isEnded && <span className="text-muted-foreground text-xs flex items-center"><Clock className="w-3 h-3 mr-0.5" />{getTimeLeft(auction.ends_at)}</span>
            }
          </div>
        </div>
      </div>
    </Card>);
}

function AuctionGridCard({ auction, navigate }) {
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  // Para decisión, calcular tiempo restante desde decisionDeadline
  const getDecisionTimeLeft = () => {
    if (!auction.decisionDeadline) return '30min';
    const diff = new Date(auction.decisionDeadline) - new Date();
    if (diff <= 0) return 'Expiró';
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}min`;
  };
  
  const isEnded = auction.status === 'ENDED' || auction.status === 'CLOSED';
  const isPending = auction.status === 'PENDING_DECISION';
  const defaultImage = '';

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm cursor-pointer" onClick={() => navigate(`/DetalleSubastaVendedor/${auction.id}`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={auction.photos?.[0] || defaultImage} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />
        {isEnded ? (
          auction.winnerId ? <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 hover:bg-primary shadow-md z-10"><Trophy className="w-3 h-3 mr-1" />Con ganador</Badge> : <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 hover:bg-muted shadow-md z-10"><XCircle className="w-3 h-3 mr-1" />Sin ganador</Badge>
        ) : isPending ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 hover:bg-orange-500 shadow-lg z-10"><Clock className="w-3 h-3 mr-1" />Decidir</Badge>
        ) : auction.status === 'ACTIVE' ? (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 hover:bg-primary shadow-md z-10">Activa</Badge>
        ) : null}
        {isPending ? 
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-red-500/90 text-white shadow-md z-10">
            <Clock className="w-3 h-3" /><span className="font-semibold">{getDecisionTimeLeft()}</span>
          </div> :
          !isEnded &&
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-background/80 text-foreground z-10">
            <Clock className="w-3 h-3" /><span className="font-semibold">{getTimeLeft(auction.ends_at)}</span>
          </div>
        }
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-foreground">{formatPrice(auction.current_bid)}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{auction.bids_count || 0}</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{auction.views || 0}</span>
          </div>
        </div>
      </div>
    </Card>);
}

// ── Main page ──
export default function MisSubastas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [vehicleInspections, setVehicleInspections] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '' });
  const [activeTab, setActiveTab] = useState('activas');
  const [viewMode, setViewMode] = useState('grid');
  const [pubBalance, setPubBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vehiclesData, auctionsData, balanceData] = await Promise.all([
        vehiclesApi.getMine(),
        auctionsApi.getMine(),
        publicationsApi.getBalance(),
      ]);
      setVehicles(vehiclesData || []);
      setAuctions(auctionsData || []);
      setPubBalance(balanceData?.balance ?? balanceData ?? 0);

      // Load inspections for each vehicle
      const inspMap = {};
      await Promise.all((vehiclesData || []).map(async (v) => {
        try {
          const insp = await inspectionsApi.getByVehicle(v.id);
          if (insp) inspMap[v.id] = Array.isArray(insp) ? insp[0] : insp;
        } catch { /* ignore */ }
      }));
      setVehicleInspections(inspMap);
    } catch (err) {
      console.error('Error loading MisSubastas data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const applyFilters = (list, isBrandField = 'brand') => {
    let filtered = [...list];
    if (search) {const q = search.toLowerCase();filtered = filtered.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(q));}
    if (filters.brand) filtered = filtered.filter((v) => v[isBrandField] === filters.brand);
    if (filters.yearFrom) filtered = filtered.filter((v) => v.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) filtered = filtered.filter((v) => v.year <= parseInt(filters.yearTo));
    return filtered;
  };

  const enProceso = useMemo(() => applyFilters(vehicles.filter((v) => ['PENDING_INSPECTION', 'IN_PROGRESS'].includes(v.status))), [vehicles, search, filters]);
  const rechazados = useMemo(() => applyFilters(vehicles.filter((v) => v.status === 'INSPECTION_REJECTED')), [vehicles, search, filters]);
  const activas = useMemo(() => applyFilters(auctions.filter((a) => a.status === 'ACTIVE')), [auctions, search, filters]);
  const pendienteDecision = useMemo(() => applyFilters(auctions.filter((a) => a.status === 'PENDING_DECISION')), [auctions, search, filters]);
  const finalizadas = useMemo(() => applyFilters(auctions.filter((a) => a.status === 'ENDED' || a.status === 'CLOSED')), [auctions, search, filters]);


  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      {/* Top Bar with Menu + Filter (Mobile) */}
      <div className="bg-background px-4 pt-3 pb-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-white">
                  <Menu className="w-5 h-5 text-black" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-white border-r border-neutral-200 p-0">
                <SheetHeader className="px-6 pt-8 pb-6 border-b border-neutral-100">
                  <SheetTitle className="text-left text-lg font-semibold tracking-tight text-black">Categorias</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col py-2">
                  {[
                    { value: 'activas', label: 'Activas', count: activas.length },
                    { value: 'decision', label: 'Decision', count: pendienteDecision.length },
                    { value: 'proceso', label: 'En proceso', count: enProceso.length },
                    { value: 'rechazados', label: 'Rechazados', count: rechazados.length },
                    { value: 'finalizadas', label: 'Finalizadas', count: finalizadas.length },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => { setActiveTab(item.value); setMobileMenuOpen(false); }}
                      className={`flex items-center justify-between px-6 py-3.5 text-left transition-colors ${
                        activeTab === item.value
                          ? 'bg-neutral-100 text-black font-semibold'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                      }`}
                    >
                      <span className="text-[15px] tracking-wide">{item.label}</span>
                      {item.count > 0 && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          activeTab === item.value
                            ? 'bg-black text-white'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}>{item.count}</span>
                      )}
                    </button>
                  ))}
                </nav>
                <div className="mt-auto px-6 py-6 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Publicaciones</span>
                    <span className="text-lg font-bold text-black">{pubBalance}</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Active tab label */}
            <span className="text-base font-semibold text-foreground">
              {{ activas: 'Activas', decision: 'Decision', proceso: 'En proceso', rechazados: 'Rechazados', finalizadas: 'Finalizadas' }[activeTab]}
            </span>
          </div>

          {/* Filter Button (Mobile) */}
          <SellerFilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Combined bar - Publications left, Tabs centered, Search right (Desktop) */}
      <div className="hidden md:block bg-background px-8 pt-3 pb-3">
        <div className="flex items-center gap-4">
          {/* Publications Available - Left */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Publicaciones disponibles:</span>
            <span className="text-2xl font-bold text-secondary">{pubBalance}</span>
          </div>
          
          {/* Tabs - Screen Center */}
          <div className="flex-1 flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveTab('activas')}
              className={`text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'activas' 
                  ? 'text-foreground border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activas
              {activas.length > 0 && <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${activeTab === 'activas' ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>{activas.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('decision')}
              className={`text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'decision' 
                  ? 'text-foreground border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Decisión
              {pendienteDecision.length > 0 && <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${activeTab === 'decision' ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>{pendienteDecision.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('proceso')}
              className={`text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'proceso' 
                  ? 'text-foreground border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              En proceso
              {enProceso.length > 0 && <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${activeTab === 'proceso' ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>{enProceso.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('rechazados')}
              className={`text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'rechazados' 
                  ? 'text-foreground border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Rechazados
              {rechazados.length > 0 && <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${activeTab === 'rechazados' ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>{rechazados.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab('finalizadas')}
              className={`text-base font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'finalizadas' 
                  ? 'text-foreground border-b-2 border-primary pb-1' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Finalizadas
              {finalizadas.length > 0 && <span className={`text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${activeTab === 'finalizadas' ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>{finalizadas.length}</span>}
            </button>
          </div>

          {/* Search - Right */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-2xl border-border bg-muted/50 text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <SellerFilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-8 pb-4 md:flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <SellerFilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        <div className="flex-1 min-w-0">

          {activeTab === 'proceso' && (
          enProceso.length === 0 ? <EmptyState icon={Timer} title="Sin vehículos en proceso" subtitle="Los vehículos enviados a peritaje aparecerán aquí." /> :
          <>
                {/* Mobile: Always list view */}
                <div className="space-y-2 md:hidden">{enProceso.map((v) => <VehicleProcessCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div>
                
                {/* Desktop: Grid or List based on viewMode */}
                {viewMode === 'grid' ?
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{enProceso.map((v) => <VehicleProcessGridCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div> :
            <div className="hidden md:flex flex-col gap-4">{enProceso.map((v) => <VehicleProcessCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div>
            }
              </>)

          }

          {activeTab === 'rechazados' && (
          rechazados.length === 0 ? <EmptyState icon={ClipboardX} title="Sin peritajes rechazados" subtitle="¡Buena señal! Ningún vehículo ha sido rechazado." /> :
          <>
                {/* Mobile: Always list view */}
                <div className="space-y-2 md:hidden">{rechazados.map((v) => <VehicleProcessCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div>
                
                {/* Desktop: Grid or List based on viewMode */}
                {viewMode === 'grid' ?
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{rechazados.map((v) => <VehicleProcessGridCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div> :
            <div className="hidden md:flex flex-col gap-4">{rechazados.map((v) => <VehicleProcessCard key={v.id} v={v} navigate={navigate} inspection={vehicleInspections[v.id]} />)}</div>
            }
              </>)

          }

          {activeTab === 'activas' && (
          activas.length === 0 ? <EmptyState icon={Gavel} title="Sin subastas activas" subtitle="Publica un vehículo para que aparezca en subasta aquí." /> :
          <>
                {/* Mobile: Always list view */}
                <div className="space-y-3 md:hidden">{activas.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
                
                {/* Desktop: Grid or List based on viewMode */}
                {viewMode === 'grid' ?
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{activas.map((a) => <AuctionGridCard key={a.id} auction={a} navigate={navigate} />)}</div> :
            <div className="hidden md:flex flex-col gap-4">{activas.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
            }
              </>)

          }

          {activeTab === 'decision' && (
          pendienteDecision.length === 0 ? <EmptyState icon={Trophy} title="Sin decisiones pendientes" subtitle="Cuando una subasta finalice con ofertas, la verás aquí para decidir." /> :
          <>
                {/* Mobile: Always list view */}
                <div className="space-y-3 md:hidden">{pendienteDecision.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
                
                {/* Desktop: Grid or List based on viewMode */}
                {viewMode === 'grid' ?
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{pendienteDecision.map((a) => <AuctionGridCard key={a.id} auction={a} navigate={navigate} />)}</div> :
            <div className="hidden md:flex flex-col gap-4">{pendienteDecision.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
            }
              </>)

          }

          {activeTab === 'finalizadas' && (
          finalizadas.length === 0 ? <EmptyState icon={CheckCheck} title="Sin subastas finalizadas" subtitle="El historial de tus subastas cerradas aparecerá aquí." /> :
          <>
                {/* Mobile: Always list view */}
                <div className="space-y-3 md:hidden">{finalizadas.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
                
                {/* Desktop: Grid or List based on viewMode */}
                {viewMode === 'grid' ?
            <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{finalizadas.map((a) => <AuctionGridCard key={a.id} auction={a} navigate={navigate} />)}</div> :
            <div className="hidden md:flex flex-col gap-4">{finalizadas.map((a) => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
            }
              </>)

          }

          {loading && vehicles.length === 0 && auctions.length === 0 &&
          <div className="space-y-2">
            {[1,2,3].map(i => <AuctionRowSkeleton key={i} />)}
          </div>}
          {!loading && vehicles.length === 0 && auctions.length === 0 &&
          <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 font-sans">No tienes publicaciones</h3>
              <p className="text-muted-foreground text-sm">Usa el botón <Plus className="inline w-4 h-4" /> para publicar tu primer vehículo</p>
            </div>
          }
        </div>
      </div>

      {/* Floating Action Button (FAB) - Publicar Carro */}
      <PublishFAB onClick={() => setDialogOpen(true)} />
      <PublicarCarroDialog open={dialogOpen} onOpenChange={setDialogOpen} onPublished={loadData} />
      <BottomNav />
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  const Icon = icon;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
      <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-secondary/40" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 font-sans">{title}</h3>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </motion.div>
  );
}
