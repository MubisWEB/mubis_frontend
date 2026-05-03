import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoGallery from '@/components/PhotoGallery';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, MapPin, Calendar, Gauge, Fuel, Settings2, Palette, FileCheck, Shield, Camera, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Trophy, FileText, Phone, Mail, Building2, Zap, CalendarPlus, Flag, MessageCircle, ChevronDown, ChevronUp, Car, Wind } from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import BidModal from '@/components/BidModal';
import ProntoPagoModal from '@/components/ProntoPagoModal';
import TopBar from "@/components/TopBar";
import ActivityTimeline from '@/components/ActivityTimeline';
import ExtensionModal from '@/components/ExtensionModal';
import { auctionsApi, bidsApi, watchlistApi, casesApi, auditApi, prontoPagoApi } from '@/api/services';
import socket, { joinAuction, leaveAuction } from '@/api/socket';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { formatCompactCOP } from '@/lib/formatters';
import SubscriptionGate from '../components/SubscriptionGate';

export default function DetalleSubasta() {
  const { auctionId } = useParams();
  const [searchParams] = useSearchParams();
  const fromGanados = searchParams.get('from') === 'ganados';
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [prontoPagoModalOpen, setProntoPagoModalOpen] = useState(false);
  const [prontoPagoRefresh, setProntoPagoRefresh] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [bids, setBids] = useState([]);
  const [existingPP, setExistingPP] = useState(null);
  const [existingCase, setExistingCase] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (!auctionId) return;
    const load = async () => {
      try {
        const auction = await auctionsApi.getById(auctionId);
        if (auction) {
          setVehicle(auction);
          auctionsApi.incrementView(auctionId).catch(() => {});
        }
        const [auctionEvents, vehicleEvents] = await Promise.all([
          auditApi.getByEntity('auction', auctionId).catch(() => []),
          auction?.vehicleId ? auditApi.getByEntity('vehicle', auction.vehicleId).catch(() => []) : Promise.resolve([]),
        ]);
        const merged = [...(auctionEvents || []), ...(vehicleEvents || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const unique = merged.filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i);
        setAuditEvents(unique);
      } catch (err) {
        console.error('Error loading auction:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    joinAuction(auctionId);

    const handleNewBid = ({ auctionId: id, currentBid, bidsCount, leaderId, userName }) => {
      if (id !== auctionId) return;
      setVehicle(prev => prev ? { ...prev, current_bid: currentBid, bids_count: bidsCount, leaderId } : prev);
      setBids(prev => [{ id: `ws-${Date.now()}`, userName: userName || 'Postor', amount: currentBid, createdAt: new Date().toISOString() }, ...prev].slice(0, 20));
    };

    const handleStatusChanged = ({ auctionId: id, status }) => {
      if (id !== auctionId) return;
      setVehicle(prev => prev ? { ...prev, status } : prev);
    };

    const handleAuctionEnded = ({ auctionId: id, winnerId, finalBid }) => {
      if (id !== auctionId) return;
      setVehicle(prev => {
        if (!prev) return prev;
        if (winnerId === currentUser?.id) {
          toast.success('🎉 ¡Ganaste la subasta!', {
            description: `${prev.brand} ${prev.model} ${prev.year} — ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(finalBid)}`,
            duration: 10000,
          });
        }
        return { ...prev, status: 'ENDED', winnerId, current_bid: finalBid };
      });
    };

    socket.on('new_bid', handleNewBid);
    socket.on('auction_status_changed', handleStatusChanged);
    socket.on('auction_ended', handleAuctionEnded);

    return () => {
      leaveAuction(auctionId);
      socket.off('new_bid', handleNewBid);
      socket.off('auction_status_changed', handleStatusChanged);
      socket.off('auction_ended', handleAuctionEnded);
    };
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const loadBids = async () => {
      try {
        const data = await bidsApi.getByAuction(auctionId);
        setBids(data || []);
      } catch { /* ignore */ }
    };
    loadBids();
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId || !currentUser) return;
    const loadPP = async () => {
      try {
        const data = await prontoPagoApi.getByAuction(auctionId);
        setExistingPP(data || null);
      } catch { setExistingPP(null); }
    };
    const loadCase = async () => {
      try {
        const cases = await casesApi.getMine();
        const found = (cases || []).find(c => c.auctionId === auctionId);
        setExistingCase(found || null);
      } catch { setExistingCase(null); }
    };
    const loadWatchlist = async () => {
      try {
        const data = await watchlistApi.check(auctionId);
        setIsInWatchlist(data?.inWatchlist ?? false);
      } catch { setIsInWatchlist(false); }
    };
    loadPP();
    loadCase();
    loadWatchlist();
  }, [auctionId, currentUser, prontoPagoRefresh]);

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

  const handleSubmitBid = async (maxAmount, isDirect = false) => {
    if (!vehicle || !currentUser) return;
    try {
      const result = await bidsApi.place(auctionId, maxAmount, isDirect);
      if (result) {
        setVehicle(prev => ({
          ...prev,
          current_bid: result.visibleBid ?? result.current_bid ?? prev.current_bid,
          bids_count: result.bidsCount ?? result.bids_count ?? prev.bids_count,
          leaderId: result.leaderId ?? prev.leaderId,
          myMaxBid: maxAmount,
          myBidMode: result.myBidMode,
          hasActiveBidStrategy: result.hasActiveBidStrategy,
          isLeading: result.leaderId === currentUser.id,
        }));
      }
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Error al pujar';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const formatPrice = (price) => formatCompactCOP(price);
  const formatCountdown48 = (ms) => {
    if (ms <= 0) return 'Completado';
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  // 96h (4 days) auto-completion countdown (must be before early return)
  const COMPLETION_WINDOW_MS = 96 * 60 * 60 * 1000;
  const extensionMs = (vehicle?.extensionDays || 0) * 24 * 60 * 60 * 1000;
  const totalWindowMs = COMPLETION_WINDOW_MS + extensionMs;
  const endTime = vehicle?.ends_at ? new Date(vehicle.ends_at).getTime() : 0;
  const isWonByMe = Boolean(
    currentUser?.id &&
    vehicle?.winnerId === currentUser.id &&
    ['ENDED', 'ended', 'CLOSED', 'closed'].includes(vehicle?.status)
  );

  // Respect mockWonStatus for mock data
  const mockStatus = vehicle?.mockWonStatus;
  const isMockCompleted = mockStatus === 'completado';
  const isMockCancelled = mockStatus === 'cancelado';
  const isInProcess = !isMockCompleted && !isMockCancelled;

  const [completionRemaining, setCompletionRemaining] = useState(isWonByMe ? totalWindowMs - (Date.now() - endTime) : 0);
  const completionExpired = isMockCompleted || isMockCancelled || completionRemaining <= 0;

  useEffect(() => {
    if (!isWonByMe || !endTime) return;
    const tick = () => setCompletionRemaining(totalWindowMs - (Date.now() - endTime));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isWonByMe, endTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted pb-40">
        <TopBar />
        <div className="mt-3">
          <Skeleton height={280} borderRadius={0} />
          <div className="bg-card px-4 py-4 shadow-sm">
            <Skeleton width="70%" height={28} />
            <Skeleton width="45%" height={16} style={{ marginTop: 8 }} />
            <Skeleton width="55%" height={36} style={{ marginTop: 16 }} />
          </div>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton height={14} count={3} style={{ marginBottom: 8 }} />
          </div>
          <Skeleton height={48} borderRadius={12} style={{ marginTop: 8 }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!loading && !vehicle) {
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
  const inspection = vehicle.inspection || null;
  const myMaxBid = Number(vehicle?.myMaxBid || 0);
  const isLeading = vehicle?.leaderId === currentUser?.id;
  const vStatus = (vehicle?.status || '').toUpperCase();
  const isVehicleActive = vStatus === 'ACTIVE';
  const isVehiclePending = vStatus === 'PENDING_DECISION';
  const isVehicleEnded = ['ENDED', 'CLOSED'].includes(vStatus);
  const docs = vehicle.documentation || null;
  const vehSpecs = vehicle.specs || {};
  const transmissionLabel = vehicle.transmision || vehicle.transmission || vehSpecs.transmission || '';
  const bodyTypeLabel = vehSpecs.body_type || vehicle.bodyType || '';
  const motorLabel = String(vehSpecs.motor_label || '').replace(/Â·/g, '·').trim()
    || [vehicle.model, vehicle.cilindraje, vehSpecs.power, vehicle.combustible].filter(Boolean).join(' · ');

  // Build full specs list — first 6 always visible, rest behind "Ver más"
  const allSpecs = [
    // Top 6 (always visible)
    { icon: Car, label: 'Marca', value: vehicle.brand },
    { icon: Car, label: 'Modelo', value: vehicle.model },
    { icon: Calendar, label: 'Año', value: vehicle.year },
    { icon: Gauge, label: 'Kilometraje', value: `${Number(vehicle.mileage || vehicle.km || 0).toLocaleString('es-CO')} km` },
    { icon: Fuel, label: 'Combustible', value: vehicle.fuel_type || vehicle.combustible || '' },
    { icon: Settings2, label: 'Transmisión', value: vehSpecs.transmission || '' },
    // Extended (shown on "Ver más") — all remaining from Publicar carro step 1
    { icon: Palette, label: 'Color', value: vehicle.color || '' },
    { icon: Settings2, label: 'Cilindraje', value: vehicle.cilindraje || '' },
    { icon: Settings2, label: 'Tracción', value: vehicle.traction || '' },
    { icon: Car, label: 'Carrocería', value: vehSpecs.body_type || '' },
    { icon: Settings2, label: 'Puertas', value: vehSpecs.doors || '' },
    { icon: Users, label: 'Pasajeros', value: vehSpecs.passengers || '' },
    { icon: Settings2, label: 'Dirección', value: vehSpecs.steering || '' },
    { icon: Wind, label: 'Aire acondicionado', value: vehSpecs.air_conditioning != null ? (vehSpecs.air_conditioning ? 'Sí' : 'No') : '' },
    { icon: FileText, label: 'Placa', value: vehicle.placa || '' },
    { icon: MapPin, label: 'Ubicación', value: vehicle.city || vehicle.ubicacion || vehicle.dealerBranch || '' },
  ].filter(s => s.value); // Only show specs that have values

  const normalizeSpecLabel = (label) => String(label)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const takeSpec = (matcher) => allSpecs.find((spec) => matcher(normalizeSpecLabel(spec.label)));
  const specKey = (spec) => `${normalizeSpecLabel(spec.label)}:${String(spec.value)}`;
  const prioritizedSpecs = [
    takeSpec((label) => label === 'marca'),
    takeSpec((label) => label === 'modelo'),
    takeSpec((label) => label === 'ano'),
    takeSpec((label) => label === 'kilometraje'),
    takeSpec((label) => label === 'combustible'),
    transmissionLabel ? { icon: Settings2, label: 'Transmisión', value: transmissionLabel } : takeSpec((label) => label.includes('transmision')),
    motorLabel ? { icon: Settings2, label: 'Motor', value: motorLabel } : null,
    bodyTypeLabel ? { icon: Car, label: 'Carrocería', value: bodyTypeLabel } : takeSpec((label) => label.includes('carroceria')),
    vehSpecs.doors ? { icon: Settings2, label: 'Puertas', value: vehSpecs.doors } : takeSpec((label) => label === 'puertas'),
    vehSpecs.passengers ? { icon: Users, label: 'Pasajeros', value: vehSpecs.passengers } : takeSpec((label) => label === 'pasajeros'),
    vehSpecs.steering ? { icon: Settings2, label: 'Dirección', value: vehSpecs.steering } : takeSpec((label) => label.includes('direccion')),
    vehSpecs.air_conditioning != null
      ? { icon: Wind, label: 'Aire acondicionado', value: vehSpecs.air_conditioning ? 'Sí' : 'No' }
      : takeSpec((label) => label.includes('aire acondicionado')),
  ].filter(Boolean);
  const prioritizedKeys = new Set(prioritizedSpecs.map(specKey));
  const orderedSpecs = [
    ...prioritizedSpecs,
    ...allSpecs.filter((spec) => !prioritizedKeys.has(specKey(spec))),
  ];

  const INITIAL_SPECS_COUNT = 8;
  const visibleSpecs = showAllSpecs ? orderedSpecs : orderedSpecs.slice(0, INITIAL_SPECS_COUNT);
  const hasMoreSpecs = orderedSpecs.length > INITIAL_SPECS_COUNT;

  const seller = isWonByMe ? (vehicle.dealer || vehicle.seller || null) : null;
  const uniqueBidders = vehicle.uniqueBidders || bids.length || 0;

  return (
    <div className={`min-h-screen bg-muted ${isWonByMe ? 'pb-28' : 'pb-40'}`}>
      <TopBar />
      <SubscriptionGate>
      <div className="relative mt-3 md:mt-5">
          <PhotoGallery
            photos={images}
            alt={`${vehicle.brand} ${vehicle.model}`}
            height="320px"
            overlay={
              <>
                <button onClick={() => navigate(fromGanados ? '/Ganados' : '/Comprar')} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white z-10"><ArrowLeft className="w-5 h-5" /></button>
                {isWonByMe && (
                  <div className="absolute top-4 right-4 z-10"><Badge className="bg-primary text-primary-foreground font-bold px-3 py-1"><Trophy className="w-3 h-3 mr-1" />¡Ganado!</Badge></div>
                )}
                {!isWonByMe && isLeading && (
                  <div className="absolute top-4 right-4 z-10"><Badge className="bg-green-600 text-white font-bold px-3 py-1"><Trophy className="w-3 h-3 mr-1" />¡Vas liderando!</Badge></div>
                )}
              </>
            }
          />

        <div className="bg-card px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-bold text-foreground font-sans">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="w-3 h-3" />{vehicle.city} · {vehicle.year}</p>
            </div>
            {isWonByMe ? (
              isMockCancelled
                ? <Badge className="bg-destructive/10 text-destructive font-semibold px-3 py-1.5 rounded-full text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Cancelado</Badge>
                : isMockCompleted
                  ? <Badge className="bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full text-xs"><CheckCircle className="w-3 h-3 mr-1" />Completado</Badge>
                  : <Badge className="bg-secondary/10 text-secondary font-semibold px-3 py-1.5 rounded-full text-xs"><Clock className="w-3 h-3 mr-1" />Cierre automático</Badge>
            ) : (
              <div className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
                <Clock className="w-4 h-4" /><span className="font-semibold">{timeLeft}</span>
              </div>
            )}
          </div>
          <div className="bg-muted rounded-xl p-4 mt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-xs mb-1">{isWonByMe ? 'Precio final' : 'Puja actual'}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-tight break-all">{formatPrice(vehicle.current_bid || 0)}</p>
              </div>
              {!isWonByMe && (
                <div className="text-right space-y-1">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Pujas</p>
                    <p className="text-lg font-semibold text-foreground flex items-center justify-end gap-1"><Users className="w-4 h-4" />{vehicle.bids_count || 0}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{uniqueBidders} participante{uniqueBidders !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
            {/* Mi puja - solo visible para el usuario que ha pujado */}
            {!isWonByMe && myMaxBid > 0 && (
              <div className={`mt-3 border-t border-border pt-3 flex items-center justify-between rounded-lg`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isLeading ? 'bg-green-100 dark:bg-green-950/40' : 'bg-destructive/10'}`}>
                    <Trophy className={`w-4 h-4 ${isLeading ? 'text-green-600' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isLeading ? 'Vas liderando' : 'Te han superado'}</p>
                    <p className="text-sm font-bold text-foreground">Mi máximo: {formatPrice(myMaxBid)}</p>
                  </div>
                </div>
                {!isLeading && (
                  <Button onClick={() => setBidModalOpen(true)} size="sm" variant="outline" className="text-xs font-semibold rounded-full border-destructive/30 text-destructive hover:bg-destructive/10">
                    Subir puja
                  </Button>
                )}
              </div>
            )}
            {/* Pronto Pago inside price card */}
            {isWonByMe && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <p className="text-sm font-bold text-foreground">Pronto Pago</p>
                </div>
                {existingPP ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Solicitud aprobada</p>
                      <p className="text-xs text-muted-foreground">Recibes: {formatPrice(existingPP.netAmount)}</p>
                    </div>
                    <Badge className="ml-auto bg-primary/10 text-primary text-xs font-semibold">{existingPP.status}</Badge>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">Adelanto de hasta el 10% del valor. Comisión: 5%.</p>
                    <Button onClick={(e) => { e.stopPropagation(); setProntoPagoModalOpen(true); }} variant="outline" className="w-full h-9 rounded-xl border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold text-sm">
                      <Zap className="w-4 h-4 mr-2" />Solicitar — Hasta {formatPrice((vehicle.current_bid || 0) * 0.10)}
                    </Button>
                  </>
                )}
              </div>
            )}
            {/* 96h auto-completion countdown */}
            {isWonByMe && !completionExpired && (
              <div className={`mt-3 rounded-lg p-3 flex items-center gap-2 ${completionRemaining < 24 * 60 * 60 * 1000 ? 'bg-destructive/10' : 'bg-secondary/10'}`}>
                <Clock className={`w-4 h-4 ${completionRemaining < 24 * 60 * 60 * 1000 ? 'text-destructive' : 'text-secondary'}`} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Cierre automático del trato</p>
                  <p className="text-xs text-muted-foreground">Mubis completará esta transacción en {formatCountdown48(completionRemaining)}</p>
                </div>
              </div>
            )}
            {isWonByMe && !completionExpired && completionRemaining < 24 * 60 * 60 * 1000 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 rounded-xl border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold text-xs"
                onClick={(e) => { e.stopPropagation(); setExtensionModalOpen(true); }}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />Solicitar extensión de plazo
              </Button>
            )}
            {isWonByMe && isMockCompleted && (
              <div className="mt-3 bg-primary/10 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">Trato completado por Mubis</p>
              </div>
            )}
            {isWonByMe && isMockCancelled && (
              <div className="mt-3 bg-destructive/10 rounded-lg p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-xs font-semibold text-foreground">Transacción cancelada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-4 space-y-4">
        <Card className="p-4 border border-border shadow-sm rounded-xl">
          <p className="font-bold text-foreground mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4 text-secondary" />Especificaciones</p>
          <div className="grid grid-cols-2 gap-3">
            {visibleSpecs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"><spec.icon className="w-4 h-4 text-muted-foreground" /></div>
                <div><p className="text-xs text-muted-foreground">{spec.label}</p><p className="text-sm font-medium text-foreground">{spec.value}</p></div>
              </div>
            ))}
          </div>
          {hasMoreSpecs && (
            <button
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-secondary/80 mt-3 transition-colors"
            >
              {showAllSpecs ? <><ChevronUp className="w-4 h-4" />Ver menos</> : <><ChevronDown className="w-4 h-4" />Ver más</>}
            </button>
          )}
        </Card>

        {inspection && inspection.status === 'COMPLETED' && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-foreground flex items-center gap-2"><FileCheck className="w-4 h-4 text-secondary" />Peritaje Mubis</p>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${(inspection.scoreGlobal * 10) >= 80 ? 'bg-primary/10 text-primary' : (inspection.scoreGlobal * 10) >= 50 ? 'bg-purple-100 text-purple-800' : 'bg-destructive/10 text-destructive'}`}>
                {Math.round(inspection.scoreGlobal * 10)}
              </div>
            </div>
            {inspection.scores && (
              <div className="space-y-2">
                {Object.entries(inspection.scores).map(([key, val]) => {
                  const score100 = Math.round(val * 10);
                  return (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      {score100 >= 70 ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertTriangle className="w-4 h-4 text-accent-foreground" />}
                      <span className="text-sm font-medium text-foreground capitalize">{key}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{score100}/100</span>
                  </div>);
                })}
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
            <div className="divide-y divide-border">
              {/* SOAT */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground font-medium">SOAT</span>
                <div className="text-right">
                  <Badge className={`text-xs ${docs.soat?.status === 'vigente' ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                    {docs.soat?.status === 'vigente' ? 'Vigente' : 'Vencido'}
                  </Badge>
                  {(docs.soat?.fecha || docs.soat?.fechaVigencia) && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vence: {docs.soat.fechaVigencia ?? docs.soat.fecha}</p>
                  )}
                </div>
              </div>
              {/* Tecnomecánica */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-foreground font-medium">Tecnomecánica</span>
                <div className="text-right">
                  <Badge className={`text-xs ${docs.tecno?.status === 'vigente' ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>
                    {docs.tecno?.status === 'vigente' ? 'Vigente' : 'Vencida'}
                  </Badge>
                  {(docs.tecno?.fecha || docs.tecno?.fechaVigencia) && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vence: {docs.tecno.fechaVigencia ?? docs.tecno.fecha}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}


        {/* Seller Contact — only for won auctions */}
        {isWonByMe && seller && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <p className="font-bold text-foreground mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" />Datos del vendedor</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{seller.nombre}</p>
                  <p className="text-xs text-muted-foreground">{seller.company}{seller.branch ? ` · ${seller.branch}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${seller.email}`} className="text-secondary hover:underline">{seller.email}</a>
              </div>
              {seller.telefono && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${seller.telefono}`} className="text-secondary hover:underline">{seller.telefono}</a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{vehicle.city}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Chat con vendedor — coordinación de entrega y pago */}
        {isWonByMe && isInProcess && (
          <Card className="p-4 border border-secondary/20 shadow-sm rounded-xl bg-secondary/5">
            <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-secondary" />Chat con el vendedor
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Coordina entrega, método de pago y detalles del negocio directamente con el vendedor.
            </p>
            <Button
              className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
              onClick={() => navigate(`/Chat/${vehicle.auctionId || vehicle.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />Abrir chat
            </Button>
          </Card>
        )}
        {/* Case button: "Ir al caso" for cancelled */}
        {isWonByMe && isMockCancelled && existingCase && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-secondary" />Caso de soporte abierto
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Revisa el estado de tu caso de soporte para este vehículo.
            </p>
            <Button
              className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
              onClick={() => navigate(`/SoporteCasos/${existingCase.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />Ir al caso
            </Button>
          </Card>
        )}
        {isWonByMe && isInProcess && !existingCase && (
          <Card className="p-4 border border-destructive/20 shadow-sm rounded-xl bg-destructive/5">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4 text-destructive" />¿Problema con este vehículo?
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Si encontraste un problema con el vehículo, puedes abrir un caso de soporte. Mubis mediará entre comprador y vendedor.
            </p>
            <Button
              variant="outline"
              className="w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 font-medium"
              onClick={() => setReportOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />Abrir caso
            </Button>
          </Card>
        )}
        {isWonByMe && isInProcess && existingCase && (
          <Card className="p-4 border border-border shadow-sm rounded-xl">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-secondary" />Caso de soporte abierto
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Ya tienes un caso abierto para este vehículo.
            </p>
            <Button
              className="w-full rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
              onClick={() => navigate(`/SoporteCasos/${existingCase.id}`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />Ir al caso
            </Button>
          </Card>
        )}

        {/* Activity Timeline — only for active auctions */}
        {!isWonByMe && <ActivityTimeline events={auditEvents} />}
      </div>

      {/* Bottom action bar — adapts to auction status */}
      {isVehicleActive && !isWonByMe && (
        <div className="fixed bottom-20 left-0 right-0 z-50 bg-gradient-to-t from-muted via-muted pt-4 pb-4 md:static md:bg-transparent md:pt-0 md:pb-0">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10">
            <Button onClick={() => setBidModalOpen(true)} className="w-full h-14 rounded-xl font-bold text-lg shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {isLeading ? (<><Trophy className="w-5 h-5 mr-2" />Aumentar puja</>) : 'Pujar ahora'}
            </Button>
          </div>
        </div>
      )}
      {isVehiclePending && isLeading && (
        <div className="fixed bottom-20 left-0 right-0 z-50 bg-gradient-to-t from-muted via-muted pt-4 pb-4 md:static md:bg-transparent md:pt-0 md:pb-0">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10">
            <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Trophy className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-800">¡Eres el líder!</p>
                  <p className="text-xs text-emerald-600 truncate">Esperando decisión del vendedor.</p>
                </div>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex-shrink-0" onClick={() => navigate('/Ganados')}>
                Ver en Ganadas
              </Button>
            </div>
          </div>
        </div>
      )}
      {isVehicleEnded && isWonByMe && (
        <div className="fixed bottom-20 left-0 right-0 z-50 bg-gradient-to-t from-muted via-muted pt-4 pb-4 md:static md:bg-transparent md:pt-0 md:pb-0">
          <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10">
            <div className="w-full p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-bold text-emerald-800">¡Ganaste esta subasta!</p>
              </div>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex-shrink-0" onClick={() => navigate('/Ganados')}>
                Ver detalles
              </Button>
            </div>
          </div>
        </div>
      )}

      </SubscriptionGate>

      <BidModal vehicle={vehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />
      <ProntoPagoModal open={prontoPagoModalOpen} onClose={() => setProntoPagoModalOpen(false)} auction={vehicle} userId={currentUser?.id} onComplete={() => { setProntoPagoRefresh(k => k + 1); setProntoPagoModalOpen(false); }} />
      <ExtensionModal
        open={extensionModalOpen}
        onOpenChange={setExtensionModalOpen}
        onConfirm={({ days, reason }) => {
          const currentExt = vehicle?.extensionDays || 0;
          setVehicle(prev => ({ ...prev, extensionDays: currentExt + days, extensionReason: reason }));
        }}
        vehicleName={vehicle ? `${vehicle.brand} ${vehicle.model}` : ''}
      />

      {/* Report Problem Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reportar problema
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Describe el problema encontrado con el <span className="font-semibold text-foreground">{vehicle?.brand} {vehicle?.model} {vehicle?.year}</span>. Se abrirá un caso entre tú, el vendedor y Mubis como mediador.
            </p>
            <Textarea
              placeholder="Describe el problema con detalle..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-[10px] text-muted-foreground text-right">{reportText.length}/1000</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReportOpen(false); setReportText(''); }}>Cancelar</Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={!reportText.trim()}
              onClick={async () => {
                if (!reportText.trim() || !currentUser || !vehicle) return;
                try {
                  const createdCase = await casesApi.create({
                    auctionId: vehicle.auctionId || vehicle.id,
                    vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
                    initialMessage: reportText.trim(),
                  });
                  setExistingCase(createdCase || null);
                  setReportOpen(false);
                  setReportText('');
                  toast.success('Caso abierto exitosamente', { description: 'Puedes verlo en Mubis Soporte - Casos' });
                  if (createdCase?.id) {
                    navigate(`/SoporteCasos/${createdCase.id}`);
                  }
                } catch (err) {
                  toast.error('Error al abrir el caso');
                }
              }}
            >
              Abrir caso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
