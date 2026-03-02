import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Clock, Users, MapPin, Calendar, Gauge, Fuel, 
  Settings2, Palette, FileCheck, Shield, Camera, ChevronLeft,
  ChevronRight, AlertTriangle, CheckCircle, Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import BidModal from '@/components/BidModal';

export default function DetalleSubasta() {
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleData = urlParams.get('data') ? JSON.parse(decodeURIComponent(urlParams.get('data'))) : null;
  
  const [vehicle, setVehicle] = useState(vehicleData);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!vehicle?.auction_end) return;
    
    const calculateTime = () => {
      const end = new Date(vehicle.auction_end);
      const now = new Date();
      const diff = end - now;
      
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
  }, [vehicle?.auction_end]);

  const handleSubmitBid = (amount) => {
    setVehicle(prev => ({
      ...prev,
      current_bid: amount,
      bids_count: (prev.bids_count || 0) + 1,
      isLeading: true
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const images = vehicle.photos || [];
  const specs = [
    { icon: Calendar, label: 'Año', value: vehicle.year },
    { icon: Gauge, label: 'Kilometraje', value: `${vehicle.mileage?.toLocaleString('es-CO')} km` },
    { icon: Settings2, label: 'Transmisión', value: vehicle.transmission || 'Automática' },
    { icon: Fuel, label: 'Combustible', value: vehicle.fuel_type || 'Gasolina' },
    { icon: Palette, label: 'Color', value: vehicle.color || 'Blanco' },
    { icon: MapPin, label: 'Ciudad', value: vehicle.city },
  ];

  // Peritajes únicos por vehículo usando el ID
  const peritajesPorVehiculo = {
    '1': { score: 92, items: [
      { name: 'Motor', status: 'good', detail: 'Compresión perfecta, sin consumo' },
      { name: 'Transmisión', status: 'good', detail: 'Automática suave, aceite nuevo' },
      { name: 'Suspensión', status: 'good', detail: 'Amortiguadores originales OK' },
      { name: 'Frenos', status: 'good', detail: 'Discos y pastillas al 85%' },
      { name: 'Carrocería', status: 'good', detail: 'Pintura original impecable' },
      { name: 'Interior', status: 'good', detail: 'Tapicería como nueva' },
      { name: 'Electricidad', status: 'good', detail: 'Sistema completo funcional' },
      { name: 'Llantas', status: 'good', detail: 'Michelin nuevas, 95% vida' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Nov 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Abr 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '2': { score: 87, items: [
      { name: 'Motor', status: 'good', detail: 'Funcionamiento óptimo' },
      { name: 'Transmisión', status: 'good', detail: 'Cambios precisos' },
      { name: 'Suspensión', status: 'warning', detail: 'Bujes con leve desgaste' },
      { name: 'Frenos', status: 'good', detail: 'Pastillas al 70%' },
      { name: 'Carrocería', status: 'good', detail: 'Rayón menor en bumper' },
      { name: 'Interior', status: 'good', detail: 'Cuero bien conservado' },
      { name: 'Electricidad', status: 'good', detail: 'Todo funcionando' },
      { name: 'Llantas', status: 'good', detail: 'Continental al 65%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Ene 2026' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Jul 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '3': { score: 94, items: [
      { name: 'Motor', status: 'good', detail: 'Excelente rendimiento' },
      { name: 'Transmisión', status: 'good', detail: 'CVT perfecta' },
      { name: 'Suspensión', status: 'good', detail: 'Como de fábrica' },
      { name: 'Frenos', status: 'good', detail: 'Sistema ABS al 90%' },
      { name: 'Carrocería', status: 'good', detail: 'Cero abolladuras' },
      { name: 'Interior', status: 'good', detail: 'Impecable, sin manchas' },
      { name: 'Electricidad', status: 'good', detail: 'Garantía vigente' },
      { name: 'Llantas', status: 'good', detail: 'Originales al 80%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Mar 2026' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Sep 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '4': { score: 79, items: [
      { name: 'Motor', status: 'good', detail: 'Diesel turbo potente' },
      { name: 'Transmisión', status: 'warning', detail: 'Aceite próximo a cambiar' },
      { name: 'Suspensión', status: 'good', detail: 'Reforzada para carga' },
      { name: 'Frenos', status: 'warning', detail: 'Pastillas al 45%' },
      { name: 'Carrocería', status: 'warning', detail: 'Rayones de uso en platón' },
      { name: 'Interior', status: 'good', detail: 'Funcional, limpio' },
      { name: 'Electricidad', status: 'good', detail: 'Luces LED OK' },
      { name: 'Llantas', status: 'good', detail: 'Todo terreno al 60%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Feb 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta May 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: '1 multa por velocidad ($180.000)' },
    ]},
    '5': { score: 96, items: [
      { name: 'Motor', status: 'good', detail: 'Prácticamente nuevo' },
      { name: 'Transmisión', status: 'good', detail: 'Xtronic CVT perfecta' },
      { name: 'Suspensión', status: 'good', detail: 'Sin uso aparente' },
      { name: 'Frenos', status: 'good', detail: 'Al 95%, casi nuevos' },
      { name: 'Carrocería', status: 'good', detail: 'Cero detalles' },
      { name: 'Interior', status: 'good', detail: 'Olor a nuevo' },
      { name: 'Electricidad', status: 'good', detail: 'Todo de fábrica' },
      { name: 'Llantas', status: 'good', detail: 'Originales al 90%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Dic 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Dic 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '6': { score: 89, items: [
      { name: 'Motor', status: 'good', detail: 'TwinPower Turbo excelente' },
      { name: 'Transmisión', status: 'good', detail: 'Steptronic 8 vel OK' },
      { name: 'Suspensión', status: 'good', detail: 'M Sport deportiva' },
      { name: 'Frenos', status: 'warning', detail: 'Discos al 55%' },
      { name: 'Carrocería', status: 'good', detail: 'Protección cerámica' },
      { name: 'Interior', status: 'good', detail: 'Dakota leather perfecto' },
      { name: 'Electricidad', status: 'good', detail: 'iDrive funcional' },
      { name: 'Llantas', status: 'good', detail: 'Run-flat al 70%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Oct 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Jun 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '7': { score: 95, items: [
      { name: 'Motor', status: 'good', detail: '2.0L turbo impecable' },
      { name: 'Transmisión', status: 'good', detail: '9G-TRONIC perfecta' },
      { name: 'Suspensión', status: 'good', detail: 'AIRMATIC como nueva' },
      { name: 'Frenos', status: 'good', detail: 'Sistema al 88%' },
      { name: 'Carrocería', status: 'good', detail: 'AMG Line impecable' },
      { name: 'Interior', status: 'good', detail: 'ARTICO/microfibra A+' },
      { name: 'Electricidad', status: 'good', detail: 'MBUX actualizado' },
      { name: 'Llantas', status: 'good', detail: 'AMG 19" al 82%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Ago 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Ago 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '8': { score: 81, items: [
      { name: 'Motor', status: 'good', detail: 'Skyactiv-G eficiente' },
      { name: 'Transmisión', status: 'good', detail: 'Manual 6 vel precisa' },
      { name: 'Suspensión', status: 'good', detail: 'Deportiva, firme' },
      { name: 'Frenos', status: 'warning', detail: 'Pastillas al 40%' },
      { name: 'Carrocería', status: 'warning', detail: 'Chip de pintura en capó' },
      { name: 'Interior', status: 'good', detail: 'Desgaste leve en volante' },
      { name: 'Electricidad', status: 'good', detail: 'Todo operativo' },
      { name: 'Llantas', status: 'warning', detail: 'Bridgestone al 45%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Ene 2025' },
      { name: 'Técnico-mecánica', status: 'Vence Feb 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '9': { score: 76, items: [
      { name: 'Motor', status: 'good', detail: 'GDI funcionando bien' },
      { name: 'Transmisión', status: 'good', detail: 'Automática suave' },
      { name: 'Suspensión', status: 'warning', detail: 'Amortiguadores al 55%' },
      { name: 'Frenos', status: 'warning', detail: 'Discos con desgaste' },
      { name: 'Carrocería', status: 'good', detail: 'Buen estado general' },
      { name: 'Interior', status: 'warning', detail: 'Manchas en asiento trasero' },
      { name: 'Electricidad', status: 'good', detail: 'Batería 1 año' },
      { name: 'Llantas', status: 'good', detail: 'Hankook al 58%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Mar 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Mar 2025' },
      { name: 'Impuestos', status: 'Pendiente 2024' },
      { name: 'Multas', status: '2 comparendos ($320.000)' },
    ]},
    '10': { score: 83, items: [
      { name: 'Motor', status: 'good', detail: '2.0 MPI confiable' },
      { name: 'Transmisión', status: 'good', detail: 'Cambios suaves' },
      { name: 'Suspensión', status: 'good', detail: 'Confortable' },
      { name: 'Frenos', status: 'good', detail: 'Al 62%' },
      { name: 'Carrocería', status: 'warning', detail: 'Retoque en guardafango' },
      { name: 'Interior', status: 'good', detail: 'Bien mantenido' },
      { name: 'Electricidad', status: 'warning', detail: 'Sensor de luz intermitente' },
      { name: 'Llantas', status: 'good', detail: 'Kumho al 65%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Jul 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Nov 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '11': { score: 74, items: [
      { name: 'Motor', status: 'warning', detail: 'Diesel requiere revisión inyectores' },
      { name: 'Transmisión', status: 'good', detail: 'Manual robusta' },
      { name: 'Suspensión', status: 'warning', detail: 'Trabajo pesado, revisar' },
      { name: 'Frenos', status: 'warning', detail: 'Pastillas al 35%' },
      { name: 'Carrocería', status: 'warning', detail: 'Golpes en platón' },
      { name: 'Interior', status: 'good', detail: 'Uso normal, funcional' },
      { name: 'Electricidad', status: 'good', detail: 'Operativo' },
      { name: 'Llantas', status: 'warning', detail: 'BF Goodrich al 40%' },
    ], docs: [
      { name: 'SOAT', status: 'Vence Ene 2025' },
      { name: 'Técnico-mecánica', status: 'Vence Ene 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
    '12': { score: 91, items: [
      { name: 'Motor', status: 'good', detail: 'HR16DE eficiente' },
      { name: 'Transmisión', status: 'good', detail: 'CVT sin detalles' },
      { name: 'Suspensión', status: 'good', detail: 'Confort urbano A+' },
      { name: 'Frenos', status: 'good', detail: 'Al 78%' },
      { name: 'Carrocería', status: 'good', detail: 'Excelente estado' },
      { name: 'Interior', status: 'good', detail: 'Muy bien cuidado' },
      { name: 'Electricidad', status: 'good', detail: 'Pantalla táctil OK' },
      { name: 'Llantas', status: 'warning', detail: 'Yokohama al 52%' },
    ], docs: [
      { name: 'SOAT', status: 'Vigente hasta Oct 2025' },
      { name: 'Técnico-mecánica', status: 'Vigente hasta Oct 2025' },
      { name: 'Impuestos', status: 'Al día' },
      { name: 'Multas', status: 'Sin multas pendientes' },
    ]},
  };

  // Default para vehículos nuevos
  const defaultPeritaje = { score: 85, items: [
    { name: 'Motor', status: 'good', detail: 'Buen funcionamiento' },
    { name: 'Transmisión', status: 'good', detail: 'Sin detalles' },
    { name: 'Suspensión', status: 'good', detail: 'Estado correcto' },
    { name: 'Frenos', status: 'warning', detail: 'Pastillas al 50%' },
    { name: 'Carrocería', status: 'good', detail: 'Buen estado' },
    { name: 'Interior', status: 'good', detail: 'Limpio' },
    { name: 'Electricidad', status: 'good', detail: 'Funcional' },
    { name: 'Llantas', status: 'good', detail: 'Al 60%' },
  ], docs: [
    { name: 'SOAT', status: 'Vigente' },
    { name: 'Técnico-mecánica', status: 'Vigente' },
    { name: 'Impuestos', status: 'Al día' },
    { name: 'Multas', status: 'Sin multas' },
  ]};

  const peritaje = peritajesPorVehiculo[vehicle.id] || defaultPeritaje;

  return (
    <div className="min-h-screen bg-muted pb-32">
      {/* Header con imagen */}
      <div className="relative">
        {/* Galería de imágenes */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </AnimatePresence>
          
          {/* Navegación de imágenes */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicadores */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Contador de fotos */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {currentImageIndex + 1}/{images.length}
          </div>

          {/* Botón volver */}
          <Link
            to={createPageUrl('Comprar')}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Badge liderando */}
          {vehicle.isLeading && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                <Trophy className="w-3 h-3 mr-1" />
                ¡Vas liderando!
              </Badge>
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="bg-white px-4 py-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {vehicle.city} · {vehicle.year}
              </p>
            </div>
            <div className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full ${
              isUrgent ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{timeLeft}</span>
            </div>
          </div>

          {/* Puja actual */}
          <div className="bg-gray-50 rounded-xl p-4 mt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs mb-1">Puja actual</p>
                <p className="text-2xl font-bold text-violet-700">
                  {formatPrice(vehicle.current_bid || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs mb-1">Participantes</p>
                <p className="text-lg font-semibold text-gray-700 flex items-center justify-end gap-1">
                  <Users className="w-4 h-4" />
                  {vehicle.bids_count || 0}
                </p>
              </div>
            </div>
            {vehicle.isLeading && (
              <div className="mt-3 bg-green-100 text-green-700 rounded-lg p-2 text-center text-sm font-medium">
                <Trophy className="w-4 h-4 inline mr-1" />
                ¡Tienes la puja más alta!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 py-4 space-y-4">
        {/* Especificaciones */}
        <Card className="p-4 border-0 shadow-sm rounded-xl">
          <p className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-violet-600" />
            Especificaciones
          </p>
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

        {/* Descripción */}
        <Card className="p-4 border-0 shadow-sm rounded-xl">
          <p className="font-bold text-gray-900 mb-2">Descripción</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            {vehicle.description || `Excelente ${vehicle.brand} ${vehicle.model} ${vehicle.year} en muy buen estado. Único dueño, siempre mantenido en concesionario autorizado. Todos los papeles al día, SOAT y revisión técnico-mecánica vigentes. Listo para transferir.`}
          </p>
        </Card>

        {/* Peritaje */}
        <Card className="p-4 border-0 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-violet-600" />
                Peritaje Mubis
              </p>
              {vehicle.peritaje_by && (
                <p className="text-xs text-gray-500 mt-0.5">Realizado por {vehicle.peritaje_by}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                peritaje.score >= 80 ? 'bg-green-100 text-green-700' :
                peritaje.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {peritaje.score}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {peritaje.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  {item.status === 'good' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <span className="text-xs text-gray-500 max-w-[50%] text-right">{item.detail}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-violet-50 rounded-lg p-3 flex items-start gap-2">
            <Shield className="w-4 h-4 text-violet-600 mt-0.5" />
            <p className="text-xs text-violet-700">
              Este vehículo fue inspeccionado por un perito certificado de Mubis
              {vehicle.peritaje_by ? ` en alianza con ${vehicle.peritaje_by}` : ''}. 
              Garantizamos la veracidad de la información.
            </p>
          </div>
        </Card>

        {/* Documentación */}
        <Card className="p-4 border-0 shadow-sm rounded-xl">
          <p className="font-bold text-gray-900 mb-3">Documentación</p>
          <div className="space-y-2">
            {peritaje.docs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{doc.name}</span>
                <Badge className={`text-xs ${
                  doc.status.includes('Vence') || doc.status.includes('Pendiente') || doc.status.includes('comparendo') || doc.status.includes('multa')
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>{doc.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Botón flotante de pujar */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-gray-50 via-gray-50 pt-4">
        <Button 
          onClick={() => setBidModalOpen(true)}
          className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg ${
            vehicle.isLeading 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-violet-600 hover:bg-violet-700'
          }`}
        >
          {vehicle.isLeading ? (
            <>
              <Trophy className="w-5 h-5 mr-2" />
              Aumentar puja
            </>
          ) : (
            <>Pujar ahora</>
          )}
        </Button>
      </div>

      <BidModal
        vehicle={vehicle}
        open={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        onSubmit={handleSubmitBid}
      />

      <BottomNav currentPage="Subastas" />
    </div>
  );
}