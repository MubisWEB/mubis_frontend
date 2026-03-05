import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, MapPin, Calendar, Gauge, Fuel, Settings2, Palette, FileCheck, Shield, Camera, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Trophy, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import BidModal from '@/components/BidModal';
import TopBar from "@/components/TopBar";
import ActivityTimeline from '@/components/ActivityTimeline';
import { getAuctionById, updateAuction, addBid, getCurrentUser, getBidsByAuctionId, getInspectionByVehicleId, getVehicleById, reconcileAuctionStatuses, getAuditEventsByEntity, getUniqueBidderCountByAuctionId } from '@/lib/mockStore';

export default function DetalleSubasta() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [vehicle, setVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);

  useEffect(() => {
    if (!auctionId) return;
    reconcileAuctionStatuses();
    const auction = getAuctionById(auctionId);
    if (auction) {
      setVehicle(auction);
      // Merge audit events from both auction and vehicle
      const auctionEvents = getAuditEventsByEntity('auction', auctionId);
      const vehicleEvents = auction.vehicleId ? getAuditEventsByEntity('vehicle', auction.vehicleId) : [];
      const merged = [...auctionEvents, ...vehicleEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const unique = merged.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
      setAuditEvents(unique);
    }
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const interval = setInterval(() => {
      const a = getAuctionById(auctionId);
      if (a) setVehicle(a);
      const ae = getAuditEventsByEntity('auction', auctionId);
      const ve = a?.vehicleId ? getAuditEventsByEntity('vehicle', a.vehicleId) : [];
      const merged = [...ae, ...ve].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
      setAuditEvents(merged.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i));
    }, 3000);
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    if (!vehicle?.ends_at) return;
    const calculateTime = () => {
      const diff = new Date(vehicle.ends_at) - new Date();
      if (diff <= 0) return 'Finalizada';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setIsUrgent(hours === 0 && minutes < 30);
      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
      return `${minutes}m ${seconds}s`;
    };
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [vehicle?.ends_at]);

  const handleSubmitBid = (amount) => {
    if (!vehicle || !currentUser) return;
    addBid({ auctionId: vehicle.id, userId: currentUser.id, amount, userName: 'Postor anónimo' });
    updateAuction(vehicle.id, { current_bid: amount, bids_count: (vehicle.bids_count || 0) + 1 });
    setVehicle(prev => ({ ...prev, current_bid: amount, bids_count: (prev.bids_count || 0) + 1, isLeading: true }));
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Subasta no encontrada</p>
          <Button onClick={() => navigate('/Comprar')} variant="outline">Volver a subastas</Button>
        </div>
      </div>
    );
  }

  const images = vehicle.photos || [];
  const specs = [
    { icon: Calendar, label: 'Año', value: vehicle.year },
    { icon: Gauge, label: 'Kilometraje', value: `${Number(vehicle.mileage || vehicle.km || 0).toLocaleString('es-CO')} km` },
    { icon: Settings2, label: 'Transmisión', value: vehicle.transmission || vehicle.traction || '' },
    { icon: Fuel, label: 'Combustible', value: vehicle.fuel_type || vehicle.combustible || '' },
    { icon: Palette, label: 'Color', value: vehicle.color || '' },
    { icon: MapPin, label: 'Ciudad', value: vehicle.city || '' },
  ];

  const inspection = vehicle.vehicleId ? getInspectionByVehicleId(vehicle.vehicleId) : null;
  const bids = getBidsByAuctionId(vehicle.id);
  const vehData = vehicle.vehicleId ? getVehicleById(vehicle.vehicleId) : null;
  const docs = vehicle.documentation || vehData?.documentation || null;

  return (
    <div className="min-h-screen bg-muted pb-32">
      <TopBar />
      <div className="relative">
        <div className="relative h-64 bg-muted overflow-hidden">
          {images.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img key={currentImageIndex} src={images[currentImageIndex]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center"><p className="text-muted-foreground">Sin fotos</p></div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />))}
          </div>
          {images.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Camera className="w-3 h-3" />{currentImageIndex + 1}/{images.length}</div>
          )}
          <button onClick={() => navigate('/Comprar')} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
          {vehicle.isLeading && (
            <div className="absolute top-4 right-4"><Badge className="bg-primary text-primary-foreground font-bold px-3 py-1"><Trophy className="w-3 h-3 mr-1" />¡Vas liderando!</Badge></div>
          )}
        </div>

        <div className="bg-card px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground font-sans">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="w-3 h-3" />{vehicle.city} · {vehicle.year}</p>
            </div>
            <div className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
              <Clock className="w-4 h-4" /><span className="font-semibold">{timeLeft}</span>
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 mt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Puja actual</p>
                <p className="text-2xl font-bold text-secondary">{formatPrice(vehicle.current_bid || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs mb-1">Pujas</p>
                <p className="text-lg font-semibold text-foreground flex items-center justify-end gap-1"><Users className="w-4 h-4" />{vehicle.bids_count || 0}</p>
              </div>
            </div>
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
            <p className="font-bold text-foreground mb-3">Últimas pujas</p>
            <div className="space-y-2">
              {bids.slice(0, 5).map(bid => (
                <div key={bid.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{bid.userName || 'Postor anónimo'}</span>
                  <span className="font-bold text-foreground">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity Timeline */}
        <ActivityTimeline events={auditEvents} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-muted via-muted pt-4">
        <Button onClick={() => setBidModalOpen(true)} className="w-full h-14 rounded-xl font-bold text-lg shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90">
          {vehicle.isLeading ? (<><Trophy className="w-5 h-5 mr-2" />Aumentar puja</>) : 'Pujar ahora'}
        </Button>
      </div>

      <BidModal vehicle={vehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />
      <BottomNav />
    </div>
  );
}
