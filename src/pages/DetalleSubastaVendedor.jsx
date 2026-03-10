import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhotoGallery from '@/components/PhotoGallery';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Eye, TrendingUp, Calendar, Gauge, Settings2, Fuel, Palette, MapPin, ChevronLeft, ChevronRight, Camera, FileCheck, Shield, XCircle, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Car, Wind } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import ActivityTimeline from '@/components/ActivityTimeline';
import { toast } from 'sonner';
import { getAuctionById, updateAuction, getBidsByAuctionId, getInspectionByVehicleId, getVehicleById, getAuditEventsByEntity, getUniqueBidderCountByAuctionId } from '@/lib/mockStore';

export default function DetalleSubastaVendedor() {
  const navigate = useNavigate();
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [auditEvents, setAuditEvents] = useState([]);

  const loadAuditEvents = (a) => {
    const ae = getAuditEventsByEntity('auction', a.id);
    const ve = a.vehicleId ? getAuditEventsByEntity('vehicle', a.vehicleId) : [];
    const merged = [...ae, ...ve].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
    setAuditEvents(merged.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i));
  };

  useEffect(() => {
    if (!auctionId) return;
    const data = getAuctionById(auctionId);
    if (data) { setAuction(data); loadAuditEvents(data); }
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const interval = setInterval(() => {
      const data = getAuctionById(auctionId);
      if (data) { setAuction(data); loadAuditEvents(data); }
    }, 3000);
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    const calculateTime = () => {
      if (!auction?.ends_at) return '';
      const diff = new Date(auction.ends_at) - new Date();
      if (diff <= 0) return 'Finalizada';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const handleCloseAuction = () => {
    if (!auction) return;
    updateAuction(auction.id, { status: 'closed', ends_at: new Date().toISOString() });
    setAuction(prev => ({ ...prev, status: 'closed' }));
    toast.success('Subasta cerrada', { description: `${auction.brand} ${auction.model}` });
  };

  if (!auction) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No se encontró la subasta</p>
          <Button onClick={() => navigate('/MisSubastas')} variant="outline">Volver a Mis Subastas</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;
  const isActive = auction.status === 'active' && new Date(auction.ends_at) > new Date();
  const bids = getBidsByAuctionId(auction.id);
  const uniqueBidders = getUniqueBidderCountByAuctionId(auction.id);
  const photos = auction.photos || [];
  const inspection = auction.vehicleId ? getInspectionByVehicleId(auction.vehicleId) : null;
  const vehData = auction.vehicleId ? getVehicleById(auction.vehicleId) : null;
  const docs = auction.documentation || vehData?.documentation || null;

  const specs = [
    { icon: Calendar, label: 'Año', value: auction.year },
    { icon: Gauge, label: 'Kilometraje', value: `${Number(auction.mileage || auction.km || 0).toLocaleString('es-CO')} km` },
    { icon: Settings2, label: 'Transmisión', value: auction.transmission || auction.traction || '' },
    { icon: Fuel, label: 'Combustible', value: auction.fuel_type || auction.combustible || '' },
    { icon: Palette, label: 'Color', value: auction.color || '' },
    { icon: MapPin, label: 'Ciudad', value: auction.city || '' },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="relative">
          <PhotoGallery
            photos={photos}
            alt={`${auction.brand} ${auction.model}`}
            height="320px"
            overlay={
              <>
                <button onClick={() => navigate('/MisSubastas')} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white z-10"><ArrowLeft className="w-5 h-5" /></button>
                <Badge className={`absolute top-4 right-4 z-10 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}`}>{isActive ? 'Activa' : 'Cerrada'}</Badge>
              </>
            }
          />

        <div className="bg-card px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div><h1 className="text-xl font-bold text-foreground font-sans">{auction.brand} {auction.model}</h1><p className="text-muted-foreground text-sm">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p></div>
            <div className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-secondary/10 text-secondary"><Clock className="w-4 h-4" /><span className="font-semibold">{timeLeft}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-3 bg-primary/5 rounded-xl"><p className="text-2xl font-bold text-primary">{formatPrice(auction.current_bid)}</p><p className="text-primary text-xs">Puja actual</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.bids_count || 0}</p><p className="text-secondary text-xs">Pujas</p><p className="text-[10px] text-muted-foreground">{uniqueBidders} participante{uniqueBidders !== 1 ? 's' : ''}</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.views || 0}</p><p className="text-secondary text-xs">Vistas</p></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 border border-border shadow-sm rounded-xl">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4 text-secondary" />Especificaciones</p>
          <div className="grid grid-cols-2 gap-3">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"><spec.icon className="w-4 h-4 text-muted-foreground" /></div>
                <div><p className="text-xs text-muted-foreground">{spec.label}</p><p className="text-sm font-medium text-foreground">{spec.value}</p></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-sm space-y-3 rounded-xl">
          <div className="flex items-center justify-between"><h2 className="font-bold text-foreground font-sans">Ganancia estimada</h2><TrendingUp className="w-5 h-5 text-primary" /></div>
          <p className="text-2xl font-bold text-primary mb-1">+{formatPrice(auction.current_bid - (auction.starting_price || 0))}</p>
          <p className="text-xs text-muted-foreground">Sobre precio inicial de {formatPrice(auction.starting_price || 0)}</p>
        </Card>

        {inspection && inspection.status === 'COMPLETED' && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-foreground flex items-center gap-2"><FileCheck className="w-4 h-4 text-secondary" />Peritaje Mubis</p>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${inspection.scoreGlobal >= 80 ? 'bg-primary/10 text-primary' : inspection.scoreGlobal >= 50 ? 'bg-purple-100 text-purple-800' : 'bg-destructive/10 text-destructive'}`}>
                {inspection.scoreGlobal}
              </div>
            </div>
            {inspection.scores && (
              <div className="space-y-2">
                {Object.entries(inspection.scores).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      {val >= 70 ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-accent-foreground" />}
                      <span className="text-sm font-medium text-foreground capitalize">{key}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{val}/100</span>
                  </div>
                ))}
              </div>
            )}
            {inspection.comments && <p className="text-xs text-muted-foreground mt-3 italic">"{inspection.comments}"</p>}
            <div className="mt-4 bg-secondary/5 rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-secondary mt-0.5" />
              <p className="text-xs text-muted-foreground">Inspeccionado por un perito certificado de Mubis.</p>
            </div>
          </Card>
        )}

        {docs && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <p className="font-bold text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-secondary" />Documentación</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground font-medium">SOAT</span>
                <div className="text-right">
                  <Badge className={`text-xs ${docs.soat?.status === 'vigente' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{docs.soat?.status === 'vigente' ? 'Vigente' : 'Vencido'}</Badge>
                  {docs.soat?.fecha && <p className="text-[10px] text-muted-foreground mt-0.5">Vence: {docs.soat.fecha}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground font-medium">Tecnomecánica</span>
                <div className="text-right">
                  <Badge className={`text-xs ${docs.tecno?.status === 'vigente' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{docs.tecno?.status === 'vigente' ? 'Vigente' : 'Vencida'}</Badge>
                  {docs.tecno?.fecha && <p className="text-[10px] text-muted-foreground mt-0.5">Vence: {docs.tecno.fecha}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground font-medium">Multas</span>
                <div className="text-right">
                  <Badge className={`text-xs ${docs.multas?.tiene === 'no' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{docs.multas?.tiene === 'no' ? 'Sin multas' : 'Con multas'}</Badge>
                  {docs.multas?.tiene === 'si' && docs.multas?.descripcion && <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] text-right">{docs.multas.descripcion}</p>}
                </div>
              </div>
            </div>
          </Card>
        )}

        {bids.length > 0 && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <h2 className="font-bold text-foreground mb-3 font-sans">Últimas pujas</h2>
            <div className="space-y-2">
              {bids.slice(0, 5).map(bid => (
                <div key={bid.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground">Postor anónimo</span>
                  <span className="font-bold text-foreground">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity Timeline */}
        <ActivityTimeline events={auditEvents} />

        {isActive && (
          <Button onClick={handleCloseAuction} variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl gap-2">
            <XCircle className="w-4 h-4" /> Cerrar subasta
          </Button>
        )}

        {!isActive && (
          <Card className="p-4 border border-border shadow-sm bg-muted/50 text-center rounded-xl">
            <p className="text-sm font-semibold text-muted-foreground">Esta subasta ha sido cerrada</p>
            <p className="text-xs text-muted-foreground mt-1">Puja final: {formatPrice(auction.current_bid)}</p>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
