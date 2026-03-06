import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, Users, Eye, DollarSign, Plus, FileCheck, CheckCircle, AlertTriangle, Trophy, XCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import PublicarCarroDialog from '@/components/PublicarCarroDialog';
import { getVehicles, getAuctions, getCurrentUser, getInspectionByVehicleId, reconcileAuctionStatuses } from '@/lib/mockStore';

function VehicleProcessCard({ v }) {
  const insp = getInspectionByVehicleId(v.id);
  const getStatusBadge = () => {
    if (v.status === 'INSPECTION_REJECTED' || (insp && insp.status === 'REJECTED')) return <Badge className="bg-destructive/10 text-destructive text-xs">Rechazado</Badge>;
    if (v.status === 'IN_PROGRESS' || (insp && insp.status === 'IN_PROGRESS')) return <Badge className="bg-secondary/10 text-secondary text-xs">En peritaje</Badge>;
    if (v.status === 'PENDING_INSPECTION' || (insp && insp.status === 'PENDING')) return <Badge className="bg-purple-100 text-purple-800 text-xs font-semibold">Pendiente de peritaje</Badge>;
    return <Badge className="bg-muted text-muted-foreground text-xs">{v.status}</Badge>;
  };
  const docs = v.documentation;
  const soatOk = docs?.soat?.status === 'vigente';
  const tecnoOk = docs?.tecno?.status === 'vigente';
  const multasOk = docs?.multas?.tiene === 'no';
  const docsOk = docs && soatOk && tecnoOk && multasOk;

  return (
    <Card className="p-3 border border-border/60 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {v.photos?.[0] && <img src={v.photos[0]} alt="" className="w-14 h-10 rounded-lg object-cover" />}
          <div>
            <p className="font-bold text-foreground text-sm">{v.brand} {v.model}</p>
            <p className="text-muted-foreground text-xs">{v.year} · {v.placa}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          {docs && (
            <Badge className={`text-[10px] ${docsOk ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
              {docsOk ? <><CheckCircle className="w-3 h-3 mr-0.5" />Docs OK</> : <><AlertTriangle className="w-3 h-3 mr-0.5" />Docs incompletos</>}
            </Badge>
          )}
        </div>
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
    return (
      <Badge className={`text-[10px] font-semibold ${insp.scoreGlobal >= 80 ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-800'}`}>
        <FileCheck className="w-3 h-3 mr-0.5" />{insp.scoreGlobal}/100
      </Badge>
    );
  })();
  const isEnded = auction.status === 'ended' || auction.status === 'closed';

  return (
    <Card className="overflow-hidden border border-border/60 shadow-sm cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
      onClick={() => navigate(`/DetalleSubastaVendedor/${auction.id}`)}>
      <div className="flex p-3 gap-3">
        <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {auction.photos?.[0] && <img src={auction.photos[0]} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-foreground text-sm">{auction.brand} {auction.model}</h3>
              <p className="text-muted-foreground text-xs">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {isEnded ? (
                auction.winnerId
                  ? <Badge className="bg-primary/10 text-primary text-xs"><Trophy className="w-3 h-3 mr-0.5" />Con ganador</Badge>
                  : <Badge className="bg-muted text-muted-foreground text-xs"><XCircle className="w-3 h-3 mr-0.5" />Sin ganador</Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary text-xs">Activa</Badge>
              )}
              {peritajeBadge}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Puja actual:</span>
              <p className="font-bold text-primary text-sm">{formatPrice(auction.current_bid)}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{auction.bids_count || 0}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{auction.views || 0}</span>
              {!isEnded && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeLeft(auction.ends_at)}</span>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MisSubastas() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [auctions, setAuctions] = useState([]);
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

  const enProceso = vehicles.filter(v => ['PENDING_INSPECTION', 'IN_PROGRESS'].includes(v.status));
  const rechazados = vehicles.filter(v => v.status === 'INSPECTION_REJECTED');
  const activas = auctions.filter(a => a.status === 'active');
  const finalizadas = auctions.filter(a => a.status === 'ended' || a.status === 'closed');

  const tabs = [
    { key: 'proceso', label: 'En proceso', count: enProceso.length },
    { key: 'rechazados', label: 'Rechazados', count: rechazados.length },
    { key: 'activas', label: 'Activas', count: activas.length },
    { key: 'finalizadas', label: 'Finalizadas', count: finalizadas.length },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-secondary/10 rounded-xl">
            <p className="text-2xl font-bold text-secondary">{activas.length}</p>
            <p className="text-muted-foreground text-xs">En subasta</p>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-xl">
            <p className="text-2xl font-bold text-secondary">{enProceso.length}</p>
            <p className="text-muted-foreground text-xs">En proceso</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-xl">
            <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <Tabs defaultValue="proceso" className="w-full">
          <TabsList className="w-full flex overflow-x-auto gap-1 bg-muted/50 p-1 rounded-xl mb-4">
            {tabs.map(t => (
              <TabsTrigger key={t.key} value={t.key} className="flex-1 min-w-0 text-xs whitespace-nowrap rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 py-1.5">
                {t.label} <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{t.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="proceso">
            {enProceso.length === 0 ? <EmptyState text="Sin vehículos en proceso" /> : (
              <div className="space-y-2">{enProceso.map(v => <VehicleProcessCard key={v.id} v={v} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="rechazados">
            {rechazados.length === 0 ? <EmptyState text="Sin peritajes rechazados" /> : (
              <div className="space-y-2">{rechazados.map(v => <VehicleProcessCard key={v.id} v={v} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="activas">
            {activas.length === 0 ? <EmptyState text="Sin subastas activas" /> : (
              <div className="space-y-3">{activas.map(a => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="con_ganador">
            {finConGanador.length === 0 ? <EmptyState text="Sin subastas finalizadas con ganador" /> : (
              <div className="space-y-3">{finConGanador.map(a => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="sin_ganador">
            {finSinGanador.length === 0 ? <EmptyState text="Sin subastas finalizadas sin ganador" /> : (
              <div className="space-y-3">{finSinGanador.map(a => <AuctionCard key={a.id} auction={a} navigate={navigate} />)}</div>
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
