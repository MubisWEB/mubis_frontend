import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Calendar, Users, Eye, Clock, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';

const soldCars = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: 'ABC123',
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/corolla1.jpg',
    final_price: 75000000,
    starting_price: 70000000,
    reserve_price: 72000000,
    buyer: 'Autonal',
    sold_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    auction_history: {
      total_bids: 28,
      total_views: 342,
      duration_hours: 48,
      auto_extended: 2,
      top_bidders: [
        { name: 'Autonal', final_bid: 75000000 },
        { name: 'Los Coches', final_bid: 74500000 },
        { name: 'Sanautos', final_bid: 73000000 }
      ]
    }
  },
  {
    id: '2',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2021,
    plate: 'XYZ789',
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/cx5_1.jpg',
    final_price: 95000000,
    starting_price: 85000000,
    reserve_price: 90000000,
    buyer: 'Los Coches',
    sold_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    auction_history: {
      total_bids: 42,
      total_views: 518,
      duration_hours: 72,
      auto_extended: 3,
      top_bidders: [
        { name: 'Los Coches', final_bid: 95000000 },
        { name: 'Derco', final_bid: 94000000 },
        { name: 'Autonal', final_bid: 92500000 }
      ]
    }
  },
  {
    id: '3',
    brand: 'Chevrolet',
    model: 'Tracker',
    year: 2022,
    plate: 'DEF456',
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/tracker1.jpg',
    final_price: 82000000,
    starting_price: 75000000,
    reserve_price: 78000000,
    buyer: 'Sanautos',
    sold_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    auction_history: {
      total_bids: 35,
      total_views: 289,
      duration_hours: 48,
      auto_extended: 1,
      top_bidders: [
        { name: 'Sanautos', final_bid: 82000000 },
        { name: 'Autoland', final_bid: 81000000 },
        { name: 'Casa Toro', final_bid: 79500000 }
      ]
    }
  }
];

export default function CarrosVendidos() {
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'seller@test.com';
  
  const [cars] = React.useState(isTestUser ? soldCars : []);
  const [expandedCar, setExpandedCar] = React.useState(null);

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const totalRevenue = cars.reduce((sum, car) => sum + car.final_price, 0);

  return (
    <div className="min-h-screen bg-muted pb-24">
      <div className="bg-gradient-brand px-5 pt-8 pb-6 rounded-b-3xl">
        <div className="text-center mb-4">
          <MubisLogo size="xl" variant="light" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Carros Vendidos</h1>
        <p className="text-white/60 text-center text-sm mb-4">Historial de ventas exitosas</p>

        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{cars.length}</p>
            <p className="text-white/60 text-xs">Vendidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
            <p className="text-white/60 text-xs">Total Recibido</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 -mt-3">
        <div className="space-y-3">
          {cars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-sm">
                <div className="flex p-3 gap-3">
                  <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={car.photo}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-gray-500 text-xs">{car.year} · {car.plate}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vendido
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Precio final:</span>
                        <span className="font-bold text-green-700 text-sm">
                          {formatPrice(car.final_price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Comprador:</span>
                        <span className="text-xs font-medium text-gray-900">{car.buyer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-2 pt-2 -mt-1">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-1 text-green-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        +{formatPrice(car.final_price - car.starting_price)} ganancia
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(car.sold_date)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedCar(expandedCar === car.id ? null : car.id)}
                    className="w-full h-8 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                  >
                    {expandedCar === car.id ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Ocultar detalles
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        Ver detalles de subasta
                      </>
                    )}
                  </Button>

                  {expandedCar === car.id && car.auction_history && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                            <Users className="w-3 h-3" />
                            <span className="text-xs font-medium">Pujas totales</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{car.auction_history.total_bids}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                            <Eye className="w-3 h-3" />
                            <span className="text-xs font-medium">Vistas</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{car.auction_history.total_views}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">Duración</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{car.auction_history.duration_hours}h</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
                            <Timer className="w-3 h-3" />
                            <span className="text-xs font-medium">Extensiones</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{car.auction_history.auto_extended}x</p>
                        </div>
                      </div>

                      {car.reserve_price && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-green-700 font-medium">Precio de reserva alcanzado</span>
                            <span className="text-xs font-bold text-green-900">{formatPrice(car.reserve_price)}</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Top 3 Oferentes</p>
                        <div className="space-y-1">
                          {car.auction_history.top_bidders.map((bidder, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{i + 1}. {bidder.name}</span>
                              <span className="font-semibold text-gray-900">{formatPrice(bidder.final_bid)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav currentPage="CarrosVendidos" />
    </div>
  );
}