import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Eye, TrendingUp, Calendar, Gauge, Settings2, Fuel, Palette, MapPin, ChevronLeft, ChevronRight, Camera, FileCheck, Shield, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import { toast } from 'sonner';
import { getAuctionById, updateAuction, getBidsByAuctionId } from '@/lib/mockStore';

export default function DetalleSubastaVendedor() {
  const navigate = useNavigate();
  const { auctionId } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!auctionId) return;
    const data = getAuctionById(auctionId);
    if (data) setAuction(data);
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;
    const interval = setInterval(() => {
      const data = getAuctionById(auctionId);
      if (data) setAuction(data);
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
  const photos = auction.photos || [];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="relative">
        <div className="relative h-64 bg-muted overflow-hidden">
          {photos.length > 0 ? (
            <motion.img key={currentImageIndex} src={photos[currentImageIndex]} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted"><p className="text-muted-foreground">Sin fotos</p></div>
          )}
          {photos.length > 1 && (
            <>
              <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentImageIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
          {photos.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Camera className="w-3 h-3" />{currentImageIndex + 1}/{photos.length}</div>
          )}
          <button onClick={() => navigate('/MisSubastas')} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
          <Badge className={`absolute top-4 right-4 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}`}>{isActive ? 'Activa' : 'Cerrada'}</Badge>
        </div>

        <div className="bg-card px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div><h1 className="text-xl font-bold text-foreground font-sans">{auction.brand} {auction.model}</h1><p className="text-muted-foreground text-sm">{auction.year}{auction.city ? ` · ${auction.city}` : ''}</p></div>
            <div className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-secondary/10 text-secondary"><Clock className="w-4 h-4" /><span className="font-semibold">{timeLeft}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-3 bg-primary/5 rounded-xl"><p className="text-2xl font-bold text-primary">{formatPrice(auction.current_bid)}</p><p className="text-primary text-xs">Puja actual</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.bids_count || 0}</p><p className="text-secondary text-xs">Pujas</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.views || 0}</p><p className="text-secondary text-xs">Vistas</p></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold text-foreground font-sans">Ganancia estimada</h2><TrendingUp className="w-5 h-5 text-primary" /></div>
          <p className="text-2xl font-bold text-primary mb-1">+{formatPrice(auction.current_bid - (auction.starting_price || 0))}</p>
          <p className="text-xs text-muted-foreground">Sobre precio inicial de {formatPrice(auction.starting_price || 0)}</p>
        </Card>

        {/* Recent bids */}
        {bids.length > 0 && (
          <Card className="p-4 border border-border shadow-sm">
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

        {isActive && (
          <Button onClick={handleCloseAuction} variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl gap-2">
            <XCircle className="w-4 h-4" /> Cerrar subasta
          </Button>
        )}

        {!isActive && (
          <Card className="p-4 border border-border shadow-sm bg-muted/50 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Esta subasta ha sido cerrada</p>
            <p className="text-xs text-muted-foreground mt-1">Puja final: {formatPrice(auction.current_bid)}</p>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
