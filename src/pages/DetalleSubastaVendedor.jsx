import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Clock, Users, Eye, TrendingUp, Phone, MessageCircle,
  Calendar, Gauge, Settings2, Fuel, Palette, MapPin, ChevronLeft,
  ChevronRight, Camera, CheckCircle, FileCheck, Shield, AlertCircle, Timer
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';

export default function DetalleSubastaVendedor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const auctionId = urlParams.get('id');
  
  const [auction] = useState({
    id: '1',
    brand: 'Mazda',
    model: '3',
    year: 2022,
    plate: 'ABC123',
    photos: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/0455a9335_IMG_3553.jpeg'
    ],
    current_bid: 62000000,
    starting_price: 55000000,
    bids_count: 24,
    views: 156,
    transmission: 'Automática',
    fuel_type: 'Gasolina',
    color: 'Gris',
    mileage: 15000,
    city: 'Bogotá',
    status: 'active',
    ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    last_bidder: 'Autonal',
    top_bidders: [
      { name: 'Autonal', amount: 62000000, time: 'Hace 5 min' },
      { name: 'Los Coches', amount: 61500000, time: 'Hace 15 min' },
      { name: 'Sanautos', amount: 61000000, time: 'Hace 30 min' }
    ],
    peritaje: {
      realizado_por: 'Autonal',
      score: 92,
      reserve_price: 65000000,
      auto_extended_count: 1,
      items: [
        { name: 'Motor', status: 'good', detail: 'Compresión perfecta, sin manchas' },
        { name: 'Transmisión', status: 'good', detail: 'Automática suave, aceite nuevo' },
        { name: 'Suspensión', status: 'good', detail: 'Amortiguadores originales OK' },
        { name: 'Frenos', status: 'good', detail: 'Discos y pastillas al 90%' },
        { name: 'Carrocería', status: 'good', detail: 'Pintura original impecable' },
        { name: 'Interior', status: 'good', detail: 'Tapicería como nueva' },
        { name: 'Electricidad', status: 'good', detail: 'Sistema completo funcional' },
        { name: 'Llantas', status: 'good', detail: 'Michelin nuevas, 95% vida' }
      ],
      documentos: [
        { name: 'SOAT', status: 'Vigente hasta Nov 2025' },
        { name: 'Técnico-mecánica', status: 'Vigente hasta Abr 2025' },
        { name: 'Impuestos', status: 'Al día' },
        { name: 'Multas', status: 'Sin multas pendientes' }
      ]
    }
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      if (!auction?.ends_at) return '';
      const end = new Date(auction.ends_at);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) return 'Finalizada';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [auction]);

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const specs = [
    { icon: Calendar, label: 'Año', value: auction.year },
    { icon: Gauge, label: 'Kilometraje', value: `${auction.mileage?.toLocaleString('es-CO')} km` },
    { icon: Settings2, label: 'Transmisión', value: auction.transmission },
    { icon: Fuel, label: 'Combustible', value: auction.fuel_type },
    { icon: Palette, label: 'Color', value: auction.color },
    { icon: MapPin, label: 'Ciudad', value: auction.city },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      {/* Header con imagen */}
      <div className="relative">
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <motion.img
            key={currentImageIndex}
            src={auction.photos[currentImageIndex]}
            alt={`${auction.brand} ${auction.model}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {auction.photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? auction.photos.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === auction.photos.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {currentImageIndex + 1}/{auction.photos.length}
          </div>

          <button
            onClick={() => navigate(createPageUrl('MisSubastas'))}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Badge className="absolute top-4 right-4 bg-green-500 text-white">Activa</Badge>
        </div>

        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {auction.brand} {auction.model}
              </h1>
              <p className="text-gray-500 text-sm">{auction.year} · {auction.plate}</p>
            </div>
            <div className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-violet-100 text-violet-700">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{timeLeft}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{formatPrice(auction.current_bid)}</p>
              <p className="text-green-600 text-xs">Puja actual</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{auction.bids_count}</p>
              <p className="text-blue-600 text-xs">Pujas</p>
            </div>
            <div className="text-center p-3 bg-violet-50 rounded-xl">
              <p className="text-2xl font-bold text-violet-700">{auction.views}</p>
              <p className="text-violet-600 text-xs">Vistas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 border-0 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Ganancia estimada</h2>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">
            +{formatPrice(auction.current_bid - auction.starting_price)}
          </p>
          <p className="text-xs text-gray-500">Sobre precio inicial de {formatPrice(auction.starting_price)}</p>
          
          {auction.peritaje?.reserve_price && (
            <div className={`p-3 rounded-xl ${
              auction.current_bid >= auction.peritaje.reserve_price 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${
                    auction.current_bid >= auction.peritaje.reserve_price 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    auction.current_bid >= auction.peritaje.reserve_price 
                      ? 'text-green-700' 
                      : 'text-amber-700'
                  }`}>
                    Precio de Reserva
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(auction.peritaje.reserve_price)}
                </span>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                {auction.current_bid >= auction.peritaje.reserve_price 
                  ? '✓ La oferta actual supera tu precio de reserva' 
                  : 'La oferta debe alcanzar este monto para aceptar la venta'}
              </p>
            </div>
          )}

          {auction.peritaje?.auto_extended_count > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  Subasta extendida {auction.peritaje.auto_extended_count}x
                </span>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                Se agregaron +{auction.peritaje.auto_extended_count * 5} minutos por actividad en últimos 2 minutos
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Especificaciones</h2>
          <div className="grid grid-cols-2 gap-3">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <spec.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{spec.label}</p>
                  <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {auction.peritaje && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Peritaje Mubis</h3>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-gray-500">Realizado por {auction.peritaje.realizado_por}</span>
              </div>
            </div>
            <div className="flex items-center justify-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-700">{auction.peritaje.score}</div>
                <div className="text-xs text-green-600 font-medium">Puntuación General</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {auction.peritaje.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-violet-600" />
                Documentación
              </h4>
              <div className="space-y-1.5">
                {auction.peritaje.documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{doc.name}</span>
                    <span className="text-green-600 font-medium">{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Principales Oferentes</h2>
          <div className="space-y-2">
            {auction.top_bidders.map((bidder, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{bidder.name}</p>
                  <p className="text-xs text-gray-500">{bidder.time}</p>
                </div>
                <p className="font-bold text-green-600">{formatPrice(bidder.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-sm bg-gradient-to-r from-violet-50 to-blue-50">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Dealer Líder: {auction.last_bidder}</h3>
          <p className="text-xs text-gray-600 mb-3">Puedes contactarlo cuando finalice la subasta</p>
          <div className="flex gap-2">
            <Button className="flex-1 bg-violet-600 hover:bg-violet-700 h-10 rounded-xl">
              <Phone className="w-4 h-4 mr-2" />
              Llamar
            </Button>
            <Button variant="outline" className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50 h-10 rounded-xl">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </Card>
      </div>

      <BottomNav currentPage="MisSubastas" />
    </div>
  );
}