import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Phone, MapPin, CheckCircle, MessageCircle, Calendar } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';

// Datos demo de subastas ganadas
const demoWonAuctions = [
  {
    id: '1',
    brand: 'Mazda',
    model: '3',
    year: 2022,
    mileage: 15000,
    city: 'Bogotá',
    photos: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/0455a9335_IMG_3553.jpeg'
    ],
    amount: 62000000,
    wonDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    seller: { name: 'Carlos Mendez', phone: '+57 300 123 4567' },
    status: 'pending_contact'
  },
  {
    id: '2',
    brand: 'Kia',
    model: 'Sportage',
    year: 2021,
    mileage: 28000,
    city: 'Medellín',
    photos: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/4185bae35_IMG_3560.jpeg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/e3682a77c_IMG_3561.jpeg'
    ],
    amount: 78000000,
    wonDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    seller: { name: 'María López', phone: '+57 310 987 6543' },
    status: 'in_progress'
  },
  {
    id: '3',
    brand: 'BMW',
    model: 'X3',
    year: 2021,
    mileage: 22000,
    city: 'Cali',
    photos: [
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/faca62892_IMG_3590.jpeg',
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/afe69ab02_IMG_3586.jpeg'
    ],
    amount: 145000000,
    wonDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    seller: { name: 'Andrés García', phone: '+57 315 456 7890' },
    status: 'completed'
  }
];

export default function Ganados() {
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'dealer@test.com';
  
  const [wonAuctions] = useState(isTestUser ? demoWonAuctions : []);

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const formatDate = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      {/* Header */}
      <div className="bg-gradient-brand px-5 pt-8 pb-6 rounded-b-3xl">
        <div className="text-center mb-4">
          <MubisLogo size="xl" variant="light" />
        </div>
        <div className="flex items-center justify-center gap-2 text-white">
          <Trophy className="w-6 h-6" />
          <h1 className="text-xl font-bold">Ganados este mes</h1>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{wonAuctions.length}</p>
            <p className="text-white/60 text-xs">Ganadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              ${(wonAuctions.reduce((a, b) => a + b.amount, 0) / 1000000).toFixed(0)}M
            </p>
            <p className="text-white/60 text-xs">Invertido</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 -mt-3">
        {wonAuctions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aún no has ganado subastas
            </h3>
            <p className="text-gray-500">
              Participa en las subastas activas<br />para ganar vehículos
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {wonAuctions.map((auction, index) => (
              <motion.div
                key={auction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-md rounded-2xl bg-white">
                  <div className="relative h-36">
                    <img
                      src={auction.photos[0]}
                      alt={`${auction.brand} ${auction.model}`}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white font-semibold px-2.5 py-1 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ganado
                    </Badge>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      {formatDate(auction.wonDate)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {auction.brand} {auction.model}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {auction.year} · {auction.mileage?.toLocaleString('es-CO')} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Tu oferta ganadora</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatPrice(auction.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{auction.city}</span>
                      <span className="text-gray-300">•</span>
                      <span>{auction.seller.name}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-xl h-11">
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </Button>
                      <Button variant="outline" className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50 rounded-xl h-11">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPage="Ganados" />
    </div>
  );
}