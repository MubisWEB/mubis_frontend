import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Eye, TrendingUp, DollarSign, Bell, Shield, AlertCircle, Timer } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const dealerNames = [
  'Autonal', 'Los Coches', 'Sanautos', 'Casa Toro', 'Vardí Autos Usados', 'Carmax Colombia',
  'Autoland', 'Autoamérica', 'Colautos', 'Derco', 'Autogermana', 'Continautos', 'Andar',
  'AutoStar', 'Automercol', 'Autoelite', 'Quality Motors', 'AutoCapital'
];

const initialAuctions = [
  {
    id: '1',
    brand: 'Mazda',
    model: '3',
    year: 2022,
    plate: 'ABC123',
    photos: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg'],
    current_bid: 62000000,
    starting_price: 55000000,
    bids_count: 24,
    views: 156,
    status: 'active',
    ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    last_bidder: 'Autonal',
    peritaje_score: 92,
    reserve_price: 65000000,
    auto_extended: false
  },
  {
    id: '2',
    brand: 'Kia',
    model: 'Sportage',
    year: 2021,
    plate: 'XYZ789',
    photos: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/4185bae35_IMG_3560.jpeg'],
    current_bid: 78000000,
    starting_price: 70000000,
    bids_count: 31,
    views: 203,
    status: 'active',
    ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    last_bidder: 'Los Coches',
    peritaje_score: 88,
    reserve_price: 80000000,
    auto_extended: true
  }
];

export default function MisSubastas() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'seller@test.com';
  
  const [auctions, setAuctions] = useState(isTestUser ? initialAuctions : []);
  const [liveActivity, setLiveActivity] = useState([]);

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Simular pujas automáticas cada 8-15 segundos
  useEffect(() => {
    if (!isTestUser) return; // No simular para usuarios reales
    
    const interval = setInterval(() => {
      setAuctions(prev => {
        if (prev.length === 0) return prev;
        const randomIndex = Math.floor(Math.random() * prev.length);
        const auction = prev[randomIndex];
        const bidIncrement = Math.floor(Math.random() * 3 + 1) * 500000;
        const newBid = auction.current_bid + bidIncrement;
        const dealerName = dealerNames[Math.floor(Math.random() * dealerNames.length)];
        
        // Agregar actividad
        setLiveActivity(act => [{
          id: Date.now(),
          dealer: dealerName,
          vehicle: `${auction.brand} ${auction.model}`,
          amount: newBid,
          time: new Date()
        }, ...act].slice(0, 5));

        return prev.map((a, i) => 
          i === randomIndex 
            ? { ...a, current_bid: newBid, bids_count: a.bids_count + 1, last_bidder: dealerName, views: a.views + Math.floor(Math.random() * 3) }
            : a
        );
      });
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, []);

  const activeAuctions = auctions.filter(a => a.status === 'active');
  const totalBids = activeAuctions.reduce((sum, a) => sum + a.bids_count, 0);
  const totalViews = activeAuctions.reduce((sum, a) => sum + a.views, 0);

  return (
    <div className="min-h-screen bg-gradient-brand pb-24">
  <div className="px-4 pt-8 pb-4">
    <div className="text-center mb-4">
      <MubisLogo size="xl" variant="light" />
    </div>

    <h1 className="text-2xl font-bold text-white mb-2 text-center">
      Mis Subastas
    </h1>
    <p className="text-violet-200 text-center text-sm mb-6">
      Carros en subasta activa
    </p>

    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="text-center p-3 bg-white/10 backdrop-blur-lg rounded-xl">
        <p className="text-2xl font-bold text-white">{activeAuctions.length}</p>
        <p className="text-violet-200 text-xs">Activas</p>
      </div>
      <div className="text-center p-3 bg-white/10 backdrop-blur-lg rounded-xl">
        <p className="text-2xl font-bold text-white">{totalBids}</p>
        <p className="text-violet-200 text-xs">Pujas</p>
      </div>
      <div className="text-center p-3 bg-white/10 backdrop-blur-lg rounded-xl">
        <p className="text-2xl font-bold text-white">{totalViews}</p>
        <p className="text-violet-200 text-xs">Vistas</p>
      </div>
    </div>
  </div>


      <div className="bg-white rounded-t-[2rem] px-4 pt-4 pb-4">
        {/* Actividad en vivo */}
        <div className="mb-4 pt-2">
          <AnimatePresence mode="wait">
            {liveActivity.length > 0 && (
              <motion.div
                key={liveActivity[0]?.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-2 text-sm bg-green-50/80 rounded-xl px-4 py-2.5 border border-green-100"
              >
                <Bell className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span className="font-bold text-green-700">
                  {liveActivity[0]?.dealer}
                </span>
                <span className="text-gray-600">pujó</span>
                <span className="font-bold text-green-700">
                  ${((liveActivity[0]?.amount || 0) / 1000000).toFixed(1)}M
                </span>
                <span className="text-gray-600">en tu</span>
                <span className="text-gray-900 font-bold truncate max-w-[80px]">{liveActivity[0]?.vehicle}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeAuctions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tienes subastas activas</h3>
            <p className="text-gray-500 text-sm mb-4">Publica tu primer carro y empieza a recibir ofertas</p>
            <Button 
              onClick={() => navigate(createPageUrl('VenderCarro'))}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Publicar mi carro
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAuctions.map((auction) => (
              <Card 
                key={auction.id} 
                className="overflow-hidden border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`${createPageUrl('DetalleSubastaVendedor')}?id=${auction.id}`)}
              >
                <div className="flex p-3 gap-3">
                  <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={auction.photos[0]}
                      alt={`${auction.brand} ${auction.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{auction.brand} {auction.model}</h3>
                        <p className="text-gray-500 text-xs">{auction.year} · {auction.plate}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">Activa</Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Última puja:</span>
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-sm">{formatPrice(auction.current_bid)}</p>
                          <p className="text-[10px] text-gray-500">{auction.last_bidder}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {auction.bids_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {auction.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeLeft(auction.ends_at)}
                        </span>
                        {auction.peritaje_score && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <Shield className="w-3 h-3" />
                            {auction.peritaje_score}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 space-y-2 pt-2 -mt-1">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-1 text-green-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">
                        +{formatPrice(auction.current_bid - auction.starting_price)} sobre precio inicial
                      </span>
                    </div>
                  </div>
                  {auction.reserve_price && (
                    <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      auction.current_bid >= auction.reserve_price 
                        ? 'bg-green-50' 
                        : 'bg-amber-50'
                    }`}>
                      <div className="flex items-center gap-1">
                        <AlertCircle className={`w-3 h-3 ${
                          auction.current_bid >= auction.reserve_price 
                            ? 'text-green-600' 
                            : 'text-amber-600'
                        }`} />
                        <span className={`text-xs font-semibold ${
                          auction.current_bid >= auction.reserve_price 
                            ? 'text-green-700' 
                            : 'text-amber-700'
                        }`}>
                          {auction.current_bid >= auction.reserve_price 
                            ? 'Reserva alcanzada' 
                            : 'Por debajo de reserva'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">{formatPrice(auction.reserve_price)}</span>
                    </div>
                  )}
                  {auction.auto_extended && (
                    <div className="flex items-center gap-1 text-blue-700 bg-blue-50 py-1.5 px-3 rounded-lg">
                      <Timer className="w-3 h-3" />
                      <span className="text-xs font-medium">Subasta extendida +5min</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPage="MisSubastas" />
    </div>
  );
}