import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Eye, TrendingUp, Phone, MessageCircle, Calendar, Gauge, Settings2, Fuel, Palette, MapPin, ChevronLeft, ChevronRight, Camera, CheckCircle, FileCheck, Shield, AlertCircle, Timer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";

export default function DetalleSubastaVendedor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const auctionId = urlParams.get('id');
  
  const [auction] = useState({
    id: '1', brand: 'Mazda', model: '3', year: 2022, plate: 'ABC123',
    photos: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/0455a9335_IMG_3553.jpeg'],
    current_bid: 62000000, starting_price: 55000000, bids_count: 24, views: 156,
    transmission: 'Automática', fuel_type: 'Gasolina', color: 'Gris', mileage: 15000, city: 'Bogotá',
    status: 'active', ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), last_bidder: 'Autonal',
    top_bidders: [{ name: 'Autonal', amount: 62000000, time: 'Hace 5 min' }, { name: 'Los Coches', amount: 61500000, time: 'Hace 15 min' }, { name: 'Sanautos', amount: 61000000, time: 'Hace 30 min' }],
    peritaje: {
      realizado_por: 'Autonal', score: 92, reserve_price: 65000000, auto_extended_count: 1,
      items: [
        { name: 'Motor', status: 'good', detail: 'Compresión perfecta, sin manchas' }, { name: 'Transmisión', status: 'good', detail: 'Automática suave, aceite nuevo' },
        { name: 'Suspensión', status: 'good', detail: 'Amortiguadores originales OK' }, { name: 'Frenos', status: 'good', detail: 'Discos y pastillas al 90%' },
        { name: 'Carrocería', status: 'good', detail: 'Pintura original impecable' }, { name: 'Interior', status: 'good', detail: 'Tapicería como nueva' },
        { name: 'Electricidad', status: 'good', detail: 'Sistema completo funcional' }, { name: 'Llantas', status: 'good', detail: 'Michelin nuevas, 95% vida' }
      ],
      documentos: [{ name: 'SOAT', status: 'Vigente hasta Nov 2025' }, { name: 'Técnico-mecánica', status: 'Vigente hasta Abr 2025' }, { name: 'Impuestos', status: 'Al día' }, { name: 'Multas', status: 'Sin multas pendientes' }]
    }
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

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

  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;

  const specs = [
    { icon: Calendar, label: 'Año', value: auction.year }, { icon: Gauge, label: 'Kilometraje', value: `${auction.mileage?.toLocaleString('es-CO')} km` },
    { icon: Settings2, label: 'Transmisión', value: auction.transmission }, { icon: Fuel, label: 'Combustible', value: auction.fuel_type },
    { icon: Palette, label: 'Color', value: auction.color }, { icon: MapPin, label: 'Ciudad', value: auction.city },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="relative">
        <div className="relative h-64 bg-muted overflow-hidden">
          <motion.img key={currentImageIndex} src={auction.photos[currentImageIndex]} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          {auction.photos.length > 1 && (
            <>
              <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? auction.photos.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentImageIndex(prev => prev === auction.photos.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-5 h-5" /></button>
            </>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Camera className="w-3 h-3" />{currentImageIndex + 1}/{auction.photos.length}</div>
          <button onClick={() => navigate(createPageUrl('MisSubastas'))} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">Activa</Badge>
        </div>

        <div className="bg-card px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div><h1 className="text-xl font-bold text-foreground font-serif">{auction.brand} {auction.model}</h1><p className="text-muted-foreground text-sm">{auction.year} · {auction.plate}</p></div>
            <div className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-secondary/10 text-secondary"><Clock className="w-4 h-4" /><span className="font-semibold">{timeLeft}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-3 bg-primary/5 rounded-xl"><p className="text-2xl font-bold text-primary">{formatPrice(auction.current_bid)}</p><p className="text-primary text-xs">Puja actual</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.bids_count}</p><p className="text-secondary text-xs">Pujas</p></div>
            <div className="text-center p-3 bg-secondary/5 rounded-xl"><p className="text-2xl font-bold text-secondary">{auction.views}</p><p className="text-secondary text-xs">Vistas</p></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between"><h2 className="font-bold text-foreground font-serif">Ganancia estimada</h2><TrendingUp className="w-5 h-5 text-primary" /></div>
          <p className="text-2xl font-bold text-primary mb-1">+{formatPrice(auction.current_bid - auction.starting_price)}</p>
          <p className="text-xs text-muted-foreground">Sobre precio inicial de {formatPrice(auction.starting_price)}</p>
          {auction.peritaje?.reserve_price && (
            <div className={`p-3 rounded-xl ${auction.current_bid >= auction.peritaje.reserve_price ? 'bg-primary/5 border border-primary/10' : 'bg-accent border border-accent'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><AlertCircle className={`w-4 h-4 ${auction.current_bid >= auction.peritaje.reserve_price ? 'text-primary' : 'text-accent-foreground'}`} /><span className={`text-sm font-semibold ${auction.current_bid >= auction.peritaje.reserve_price ? 'text-primary' : 'text-accent-foreground'}`}>Precio de Reserva</span></div>
                <span className="text-sm font-bold text-foreground">{formatPrice(auction.peritaje.reserve_price)}</span>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">{auction.current_bid >= auction.peritaje.reserve_price ? '✓ La oferta actual supera tu precio de reserva' : 'La oferta debe alcanzar este monto para aceptar la venta'}</p>
            </div>
          )}
          {auction.peritaje?.auto_extended_count > 0 && (
            <div className="bg-secondary/5 border border-secondary/10 p-3 rounded-xl"><div className="flex items-center gap-2"><Timer className="w-4 h-4 text-secondary" /><span className="text-sm font-semibold text-secondary">Subasta extendida {auction.peritaje.auto_extended_count}x</span></div><p className="text-xs mt-1 text-muted-foreground">Se agregaron +{auction.peritaje.auto_extended_count * 5} minutos por actividad en últimos 2 minutos</p></div>
          )}
        </Card>

        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-serif">Especificaciones</h2>
          <div className="grid grid-cols-2 gap-3">
            {specs.map((spec, i) => (<div key={i} className="flex items-center gap-2"><div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"><spec.icon className="w-4 h-4 text-muted-foreground" /></div><div><p className="text-xs text-muted-foreground">{spec.label}</p><p className="text-sm font-medium text-foreground">{spec.value}</p></div></div>))}
          </div>
        </Card>

        {auction.peritaje && (
          <Card className="p-4 border border-border space-y-3">
            <div className="flex items-center justify-between mb-2"><h3 className="font-bold text-foreground font-serif">Peritaje Mubis</h3><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-secondary" /><span className="text-xs text-muted-foreground">Realizado por {auction.peritaje.realizado_por}</span></div></div>
            <div className="flex items-center justify-center py-4 bg-primary/5 rounded-xl"><div className="text-center"><div className="text-4xl font-bold text-primary">{auction.peritaje.score}</div><div className="text-xs text-primary font-medium">Puntuación General</div></div></div>
            <div className="space-y-2">
              {auction.peritaje.items.map((item, idx) => (<div key={idx} className="flex items-start justify-between py-2 border-b border-border last:border-0"><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" /><div><span className="text-sm font-medium text-foreground">{item.name}</span><p className="text-xs text-muted-foreground">{item.detail}</p></div></div></div>))}
            </div>
            <div className="pt-3 border-t border-border">
              <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2"><FileCheck className="w-4 h-4 text-secondary" />Documentación</h4>
              <div className="space-y-1.5">{auction.peritaje.documentos.map((doc, idx) => (<div key={idx} className="flex items-center justify-between text-xs"><span className="text-foreground">{doc.name}</span><span className="text-primary font-medium">{doc.status}</span></div>))}</div>
            </div>
          </Card>
        )}

        <Card className="p-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-serif">Principales Oferentes</h2>
          <div className="space-y-2">
            {auction.top_bidders.map((bidder, i) => (<div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0"><div><p className="font-medium text-foreground text-sm">{bidder.name}</p><p className="text-xs text-muted-foreground">{bidder.time}</p></div><p className="font-bold text-primary">{formatPrice(bidder.amount)}</p></div>))}
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-sm bg-secondary/5">
          <h3 className="font-bold text-foreground mb-2 text-sm font-serif">Dealer Líder: {auction.last_bidder}</h3>
          <p className="text-xs text-muted-foreground mb-3">Puedes contactarlo cuando finalice la subasta</p>
          <div className="flex gap-2">
            <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 rounded-full"><Phone className="w-4 h-4 mr-2" />Llamar</Button>
            <Button variant="outline" className="flex-1 border-secondary/20 text-secondary hover:bg-secondary/5 h-10 rounded-full"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
          </div>
        </Card>
      </div>
      <BottomNav currentPage="MisSubastas" />
    </div>
  );
}
