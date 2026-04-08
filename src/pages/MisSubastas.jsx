import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion } from 'framer-motion';
import { Clock, Users, Eye, Plus, FileCheck, CheckCircle, AlertTriangle, Trophy, XCircle, Search, Filter, X, ChevronRight, Gavel, Timer, ClipboardX, CheckCheck, Menu, Car } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import PublishFAB from '@/components/PublishFAB';
import { useNavigate } from 'react-router-dom';
import PublicarCarroDialog from '@/components/PublicarCarroDialog';
import { auctionsApi, publicationsApi, usersApi, branchesApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/roles';
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
  const handleReset = () => { const e = { brand: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

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
    </div>
  );
}

function SellerFilterSheet({ filters, setFilters }) {
  const [local, setLocal] = useState(filters);
  const [open, setOpen] = useState(false);
  const hasFilters = Object.values(filters).some((v) => v);
  const handleApply = () => { setFilters(local); setOpen(false); };
  const handleReset = () => { const e = { brand: '', yearFrom: '', yearTo: '' }; setLocal(e); setFilters(e); };

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
    </Sheet>
  );
}

// ── Card components ──
function VehicleProcessCard({ item, navigate }) {
  const getStatusBadge = () => {
    if (item.pipelineStatus === 'rejected') return <Badge className="bg-red-500 text-white text-xs font-semibold">Rechazado</Badge>;
    return <Badge className="bg-white text-secondary text-xs font-semibold border border-secondary/20">En peritaje</Badge>;
  };

  const docs = item.documentation;
  const shouldShowDocs = !!docs;
  const docsOk = docs && docs.soat?.status === 'vigente' && docs.tecno?.status === 'vigente' && docs.multas?.tiene === 'no';

  return (
    <Card className="overflow-hidden border border-border/60 rounded-xl cursor-pointer active:scale-[0.98]" onClick={() => navigate(`/PeritajeDetalle/${item.inspectionId || item.vehicleId}`)}>
      <div className="flex p-3 gap-3">
        {item.photos?.[0] && (
          <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="font-bold text-foreground text-base leading-tight">{item.brand} {item.model}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{item.year} · {item.placa}</p>
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
    </Card>
  );
}

function VehicleProcessGridCard({ item, navigate }) {
  const getStatusBadge = () => {
    if (item.pipelineStatus === 'rejected') return <Badge className="bg-red-500 text-white text-xs font-semibold">Rechazado</Badge>;
    return <Badge className="bg-white text-secondary text-xs font-semibold border border-secondary/20">En peritaje</Badge>;
  };

  const docs = item.documentation;
  const shouldShowDocs = !!docs;
  const docsOk = docs && docs.soat?.status === 'vigente' && docs.tecno?.status === 'vigente' && docs.multas?.tiene === 'no';

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm cursor-pointer" onClick={() => navigate(`/PeritajeDetalle/${item.inspectionId || item.vehicleId}`)}>
      {item.photos?.[0] && (
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <img src={item.photos[0]} alt={`${item.brand} ${item.model}`} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2">{getStatusBadge()}</div>
          {shouldShowDocs && docs &&
            <div className="absolute top-2 right-2">
              <Badge className={`text-[10px] backdrop-blur-sm ${docsOk ? 'bg-primary/80 text-primary-foreground' : 'bg-background/80 text-foreground'}`}>
                {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
              </Badge>
            </div>
          }
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm leading-tight truncate">{item.brand} {item.model}</h3>
          {!item.photos?.[0] && getStatusBadge()}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5">{item.year} · {item.placa}</p>
        {!item.photos?.[0] && shouldShowDocs && docs && (
          <Badge className={`text-[10px] mt-2 ${docsOk ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
            {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs</>}
          </Badge>
        )}
      </div>
    </Card>
  );
}

function AuctionCard({ item, navigate }) {
  const formatPrice = (p) => `$${((p || 0) / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    if (!endDate) return '';
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const getDecisionTimeLeft = () => {
    if (!item.decisionDeadline) return '30min';
    const diff = new Date(item.decisionDeadline) - new Date();
    if (diff <= 0) return 'Expiró';
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}min`;
  };

  const isFinalized = item.pipelineStatus === 'finalized';
  const isPending = item.pipelineStatus === 'decision';
  const isActive = item.pipelineStatus === 'active';
  const currentBid = item.currentBid ?? item.current_bid;
  const bidsCount = item.bidsCount ?? item.bids_count ?? 0;
  const endsAt = item.endsAt ?? item.ends_at;
  const destId = item.auctionId || item.id;

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm cursor-pointer rounded-2xl" onClick={() => navigate(`/DetalleSubastaVendedor/${destId}`)}>
      <div className="flex p-3 gap-3">
        <div className="w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative flex items-center justify-center">
          {item.photos?.[0] ? <img src={item.photos[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-8 h-8 text-muted-foreground/40" />}
          {isFinalized ? (
            item.hasWinner ? <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 hover:bg-primary z-10"><Trophy className="w-2.5 h-2.5 mr-0.5" />Ganador</Badge> : <Badge className="absolute top-1 left-1 bg-muted text-muted-foreground text-[10px] px-1.5 py-0 hover:bg-muted z-10"><XCircle className="w-2.5 h-2.5 mr-0.5" />Sin ganador</Badge>
          ) : isPending ? (
            <Badge className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0 hover:bg-orange-500 shadow-md z-10"><Clock className="w-2.5 h-2.5 mr-0.5" />Decidir</Badge>
          ) : isActive ? (
            <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0 hover:bg-primary z-10">{item.isExtended48h ? 'Ext. 48h' : 'Activa'}</Badge>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">{item.brand} {item.model}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{item.year}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg text-foreground">{formatPrice(currentBid)}</span>
            <span className="text-muted-foreground text-xs flex items-center"><Users className="w-3 h-3 mr-0.5" />{bidsCount}</span>
            {isPending ?
              <span className="text-destructive text-xs flex items-center"><Clock className="w-3 h-3 mr-0.5" />{getDecisionTimeLeft()}</span> :
              !isFinalized && <span className="text-muted-foreground text-xs flex items-center"><Clock className="w-3 h-3 mr-0.5" />{getTimeLeft(endsAt)}</span>
            }
          </div>
        </div>
      </div>
    </Card>
  );
}

function AuctionGridCard({ item, navigate }) {
  const formatPrice = (p) => `$${((p || 0) / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    if (!endDate) return '';
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const getDecisionTimeLeft = () => {
    if (!item.decisionDeadline) return '30min';
    const diff = new Date(item.decisionDeadline) - new Date();
    if (diff <= 0) return 'Expiró';
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}min`;
  };

  const isFinalized = item.pipelineStatus === 'finalized';
  const isPending = item.pipelineStatus === 'decision';
  const isActive = item.pipelineStatus === 'active';
  const currentBid = item.currentBid ?? item.current_bid;
  const bidsCount = item.bidsCount ?? item.bids_count ?? 0;
  const endsAt = item.endsAt ?? item.ends_at;
  const destId = item.auctionId || item.id;

  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm cursor-pointer" onClick={() => navigate(`/DetalleSubastaVendedor/${destId}`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={`${item.brand} ${item.model}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Car className="w-12 h-12 text-muted-foreground/30" /></div>
        )}
        {isFinalized ? (
          item.hasWinner ? <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 hover:bg-primary shadow-md z-10"><Trophy className="w-3 h-3 mr-1" />Con ganador</Badge> : <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 hover:bg-muted shadow-md z-10"><XCircle className="w-3 h-3 mr-1" />Sin ganador</Badge>
        ) : isPending ? (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 hover:bg-orange-500 shadow-lg z-10"><Clock className="w-3 h-3 mr-1" />Decidir</Badge>
        ) : isActive ? (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 hover:bg-primary shadow-md z-10">Activa</Badge>
        ) : null}
        {isPending ?
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-red-500/90 text-white shadow-md z-10">
            <Clock className="w-3 h-3" /><span className="font-semibold">{getDecisionTimeLeft()}</span>
          </div> :
          !isFinalized &&
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-background/80 text-foreground z-10">
            <Clock className="w-3 h-3" /><span className="font-semibold">{getTimeLeft(endsAt)}</span>
          </div>
        }
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{item.brand} {item.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{item.year}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-foreground">{formatPrice(currentBid)}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{bidsCount}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ──
export default function MisSubastas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isAdminRole = role === 'admin_general' || role === 'admin_sucursal';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ brand: '', yearFrom: '', yearTo: '' });
  const [activeTab, setActiveTab] = useState('activas');
  const [viewMode] = useState('grid');
  const [pubBalance, setPubBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin-only filters
  const [dealerFilter, setDealerFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [dealers, setDealers] = useState([]);
  const [branches, setBranches] = useState([]);

  // Load branches/dealers for admin roles
  useEffect(() => {
    if (!isAdminRole) return;
    if (role === 'admin_general') {
      branchesApi.getAll().then(b => setBranches(b || [])).catch(() => {});
    }
    usersApi.getAll({ role: 'dealer' }).then(d => setDealers(d || [])).catch(() => {});
  }, [role, isAdminRole]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (dealerFilter) params.dealerId = dealerFilter;
      if (branchFilter) params.branchId = branchFilter;
      const [pipelineData, balanceData] = await Promise.all([
        auctionsApi.getMine(params),
        publicationsApi.getBalance(),
      ]);
      setItems(pipelineData || []);
      setPubBalance(balanceData?.balance ?? balanceData ?? 0);
    } catch (err) {
      console.error('Error loading MisSubastas data:', err);
    } finally {
      setLoading(false);
    }
  }, [dealerFilter, branchFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const applyFilters = (list) => {
    let filtered = [...list];
    if (search) { const q = search.toLowerCase(); filtered = filtered.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(q)); }
    if (filters.brand) filtered = filtered.filter((v) => v.brand === filters.brand);
    if (filters.yearFrom) filtered = filtered.filter((v) => v.year >= parseInt(filters.yearFrom));
    if (filters.yearTo) filtered = filtered.filter((v) => v.year <= parseInt(filters.yearTo));
    return filtered;
  };

  const enProceso = useMemo(() => applyFilters(items.filter(i => i.pipelineStatus === 'in_process')), [items, search, filters]);
  const rechazados = useMemo(() => applyFilters(items.filter(i => i.pipelineStatus === 'rejected')), [items, search, filters]);
  const activas = useMemo(() => applyFilters(items.filter(i => i.pipelineStatus === 'active')), [items, search, filters]);
  const pendienteDecision = useMemo(() => applyFilters(items.filter(i => i.pipelineStatus === 'decision')), [items, search, filters]);
  const finalizadas = useMemo(() => applyFilters(items.filter(i => i.pipelineStatus === 'finalized')), [items, search, filters]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Top Bar with Menu + Filter (Mobile) */}
      <div className="bg-background px-4 pt-3 pb-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                    { value: 'decision', label: 'Decisión', count: pendienteDecision.length },
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
                          activeTab === item.value ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
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

            <span className="text-base font-semibold text-foreground">
              {{ activas: 'Activas', decision: 'Decisión', proceso: 'En proceso', rechazados: 'Rechazados', finalizadas: 'Finalizadas' }[activeTab]}
            </span>
          </div>
          <SellerFilterSheet filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Admin role filters (branch / dealer) */}
      {isAdminRole && (
        <div className="bg-background px-4 md:px-8 pb-2 flex items-center gap-2 flex-wrap">
          {role === 'admin_general' && branches.length > 0 && (
            <Select value={branchFilter || '_all_'} onValueChange={(v) => setBranchFilter(v === '_all_' ? '' : v)}>
              <SelectTrigger className="h-9 text-sm rounded-xl w-48"><SelectValue placeholder="Sucursal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Todas las sucursales</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {dealers.length > 0 && (
            <Select value={dealerFilter || '_all_'} onValueChange={(v) => setDealerFilter(v === '_all_' ? '' : v)}>
              <SelectTrigger className="h-9 text-sm rounded-xl w-48"><SelectValue placeholder="Dealer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Todos los dealers</SelectItem>
                {dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.nombre || d.name || d.email}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Combined bar - Publications left, Tabs centered, Search right (Desktop) */}
      <div className="hidden md:block bg-background px-8 pt-3 pb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Publicaciones disponibles:</span>
            <span className="text-2xl font-bold text-secondary">{pubBalance}</span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-6">
            {[
              { value: 'activas', label: 'Activas', count: activas.length },
              { value: 'decision', label: 'Decisión', count: pendienteDecision.length },
              { value: 'proceso', label: 'En proceso', count: enProceso.length },
              { value: 'rechazados', label: 'Rechazados', count: rechazados.length },
              { value: 'finalizadas', label: 'Finalizadas', count: finalizadas.length },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`text-base font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'text-foreground border-b-2 border-primary pb-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && <span className="ml-1 text-xs text-muted-foreground">({tab.count})</span>}
              </button>
            ))}
          </div>

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
              <div className="space-y-2 md:hidden">{enProceso.map((item) => <VehicleProcessCard key={item.id} item={item} navigate={navigate} />)}</div>
              {viewMode === 'grid' ?
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{enProceso.map((item) => <VehicleProcessGridCard key={item.id} item={item} navigate={navigate} />)}</div> :
                <div className="hidden md:flex flex-col gap-4">{enProceso.map((item) => <VehicleProcessCard key={item.id} item={item} navigate={navigate} />)}</div>
              }
            </>
          )}

          {activeTab === 'rechazados' && (
            rechazados.length === 0 ? <EmptyState icon={ClipboardX} title="Sin peritajes rechazados" subtitle="¡Buena señal! Ningún vehículo ha sido rechazado." /> :
            <>
              <div className="space-y-2 md:hidden">{rechazados.map((item) => <VehicleProcessCard key={item.id} item={item} navigate={navigate} />)}</div>
              {viewMode === 'grid' ?
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{rechazados.map((item) => <VehicleProcessGridCard key={item.id} item={item} navigate={navigate} />)}</div> :
                <div className="hidden md:flex flex-col gap-4">{rechazados.map((item) => <VehicleProcessCard key={item.id} item={item} navigate={navigate} />)}</div>
              }
            </>
          )}

          {activeTab === 'activas' && (
            activas.length === 0 ? <EmptyState icon={Gavel} title="Sin subastas activas" subtitle="Publica un vehículo para que aparezca en subasta aquí." /> :
            <>
              <div className="space-y-3 md:hidden">{activas.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              {viewMode === 'grid' ?
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{activas.map((item) => <AuctionGridCard key={item.id} item={item} navigate={navigate} />)}</div> :
                <div className="hidden md:flex flex-col gap-4">{activas.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              }
            </>
          )}

          {activeTab === 'decision' && (
            pendienteDecision.length === 0 ? <EmptyState icon={Trophy} title="Sin decisiones pendientes" subtitle="Cuando una subasta finalice con ofertas, la verás aquí para decidir." /> :
            <>
              <div className="space-y-3 md:hidden">{pendienteDecision.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              {viewMode === 'grid' ?
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{pendienteDecision.map((item) => <AuctionGridCard key={item.id} item={item} navigate={navigate} />)}</div> :
                <div className="hidden md:flex flex-col gap-4">{pendienteDecision.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              }
            </>
          )}

          {activeTab === 'finalizadas' && (
            finalizadas.length === 0 ? <EmptyState icon={CheckCheck} title="Sin subastas finalizadas" subtitle="El historial de tus subastas cerradas aparecerá aquí." /> :
            <>
              <div className="space-y-3 md:hidden">{finalizadas.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              {viewMode === 'grid' ?
                <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-4">{finalizadas.map((item) => <AuctionGridCard key={item.id} item={item} navigate={navigate} />)}</div> :
                <div className="hidden md:flex flex-col gap-4">{finalizadas.map((item) => <AuctionCard key={item.id} item={item} navigate={navigate} />)}</div>
              }
            </>
          )}

          {loading && items.length === 0 &&
            <div className="space-y-2">
              {[1, 2, 3].map(i => <AuctionRowSkeleton key={i} />)}
            </div>
          }
        </div>
      </div>

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
