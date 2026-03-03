import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, DollarSign, Plus, ClipboardCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import PublicarCarroDialog from '@/components/PublicarCarroDialog';
import { getVehicles, getAuctions, getCurrentUser } from '@/lib/mockStore';

export default function MisSubastas() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const currentUser = getCurrentUser();

  const loadData = useCallback(() => {
    const myVehicles = getVehicles().filter(v => v.dealerId === currentUser?.id);
    const myAuctions = getAuctions().filter(a => a.dealerId === currentUser?.id);
    setVehicles(myVehicles);
    setAuctions(myAuctions);
  }, [currentUser?.id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;
  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return 'Finalizada';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_INSPECTION': return <Badge className="bg-accent/10 text-accent-foreground text-xs">Pendiente de peritaje</Badge>;
      case 'IN_PROGRESS': return <Badge className="bg-secondary/10 text-secondary text-xs">En peritaje</Badge>;
      case 'INSPECTION_REJECTED': return <Badge className="bg-destructive/10 text-destructive text-xs">Peritaje rechazado</Badge>;
      case 'READY_FOR_AUCTION': return <Badge className="bg-primary/10 text-primary text-xs">En subasta</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground text-xs">{status}</Badge>;
    }
  };

  const activeAuctions = auctions.filter(a => a.status === 'active');
  const pendingVehicles = vehicles.filter(v => ['PENDING_INSPECTION', 'IN_PROGRESS', 'INSPECTION_REJECTED'].includes(v.status));

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Mis vehículos" subtitle="Publicaciones y subastas activas">
        <Button onClick={() => setDialogOpen(true)} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1.5">
          <Plus className="w-4 h-4" /> Publicar
        </Button>
      </Header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-secondary/10 rounded-xl">
            <p className="text-2xl font-bold text-secondary">{activeAuctions.length}</p>
            <p className="text-muted-foreground text-xs">En subasta</p>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-xl">
            <p className="text-2xl font-bold text-accent-foreground">{pendingVehicles.length}</p>
            <p className="text-muted-foreground text-xs">En proceso</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-xl">
            <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {pendingVehicles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">En proceso</p>
            <div className="space-y-2">
              {pendingVehicles.map(v => (
                <Card key={v.id} className="p-3 border border-border/60 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {v.photos?.[0] && <img src={v.photos[0]} alt="" className="w-14 h-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-bold text-foreground text-sm">{v.brand} {v.model}</p>
                        <p className="text-muted-foreground text-xs">{v.year} · {v.placa}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(v.status)}
                      {v.status === 'INSPECTION_REJECTED' && v.rejectReason && (
                        <span className="text-[10px] text-destructive max-w-[120px] truncate">{v.rejectReason}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeAuctions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">Subastas activas</p>
            <div className="space-y-3">
              {activeAuctions.map(auction => (
                <Card key={auction.id} className="overflow-hidden border border-border/60 shadow-sm cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
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
                        <Badge className="bg-primary/10 text-primary text-xs">Activa</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Puja actual:</span>
                          <p className="font-bold text-primary text-sm">{formatPrice(auction.current_bid)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{auction.bids_count || 0}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{auction.views || 0}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeLeft(auction.ends_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {vehicles.length === 0 && auctions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 font-sans">No tienes publicaciones</h3>
            <p className="text-muted-foreground text-sm">Usa el botón "Publicar" arriba para iniciar</p>
          </div>
        )}
      </div>

      <PublicarCarroDialog open={dialogOpen} onOpenChange={setDialogOpen} onPublished={loadData} />
      <BottomNav />
    </div>
  );
}
