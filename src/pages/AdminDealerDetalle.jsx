import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Mail, Phone, MapPin, Building, CheckCircle, TrendingUp, Trophy } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const dealerData = {
  id: '1',
  name: 'Autonal',
  email: 'contacto@autonal.com',
  phone: '3001112233',
  city: 'Bogotá',
  nit: '900123456-7',
  verified: true,
  verification_date: '2024-11-15',
  total_bids: 342,
  won_auctions: 28,
  total_spent: 2450000000,
  documents: {
    nit_verified: true,
    rut_verified: true,
    chamber_commerce_verified: true
  }
};

const wonAuctions = [
  {
    id: '1',
    vehicle: 'Mazda 3',
    year: 2022,
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg',
    winning_bid: 62000000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    seller: 'María García'
  },
  {
    id: '2',
    vehicle: 'Toyota Corolla',
    year: 2020,
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/corolla1.jpg',
    winning_bid: 75000000,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    seller: 'Juan Pérez'
  },
  {
    id: '3',
    vehicle: 'Kia Sportage',
    year: 2021,
    photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/4185bae35_IMG_3560.jpeg',
    winning_bid: 78000000,
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    seller: 'Carlos López'
  }
];

export default function AdminDealerDetalle() {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(dealerData);

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleToggleVerification = () => {
    setDealer(prev => ({ ...prev, verified: !prev.verified }));
    toast.success(dealer.verified ? 'Verificación removida' : 'Dealer verificado', {
      description: dealer.verified 
        ? `${dealer.name} ya no está verificado`
        : `${dealer.name} ahora está verificado`
    });
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <div className="bg-gradient-brand px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('AdminDealers'))}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <MubisLogo size="md" variant="light" />
          <div className="w-10"></div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">{dealer.name}</h1>
        <div className="flex items-center justify-center gap-2">
          {dealer.verified && (
            <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
              <Shield className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center border-0 shadow-sm">
            <p className="text-xl font-bold text-gray-900">{dealer.total_bids}</p>
            <p className="text-xs text-gray-500">Pujas</p>
          </Card>
          <Card className="p-3 text-center border-0 shadow-sm">
            <p className="text-xl font-bold text-green-700">{dealer.won_auctions}</p>
            <p className="text-xs text-gray-500">Ganadas</p>
          </Card>
          <Card className="p-3 text-center border-0 shadow-sm">
            <p className="text-xl font-bold text-violet-700">{formatPrice(dealer.total_spent)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
        </div>

        {/* Dealer Info */}
        <Card className="p-4 mb-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Información de Contacto</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{dealer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{dealer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{dealer.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">NIT: {dealer.nit}</span>
            </div>
          </div>
        </Card>

        {/* Documents Verification */}
        <Card className="p-4 mb-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Documentos Verificados</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">NIT / Cédula</span>
              {dealer.documents.nit_verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Pendiente</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">RUT</span>
              {dealer.documents.rut_verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Pendiente</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Cámara de Comercio</span>
              {dealer.documents.chamber_commerce_verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Pendiente</Badge>
              )}
            </div>
          </div>
          
          {dealer.verified && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500">Verificado el {dealer.verification_date}</p>
            </div>
          )}

          <Button
            onClick={handleToggleVerification}
            className={`w-full mt-3 ${
              dealer.verified 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {dealer.verified ? 'Remover Verificación' : 'Marcar como Verificado'}
          </Button>
        </Card>

        {/* Won Auctions History */}
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-gray-900">Subastas Ganadas</h2>
          </div>
          <div className="space-y-3">
            {wonAuctions.map(auction => (
              <div key={auction.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={auction.photo}
                    alt={auction.vehicle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900">{auction.vehicle} {auction.year}</h3>
                  <p className="text-xs text-gray-500 mb-1">Vendedor: {auction.seller}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(auction.date)}</span>
                    <span className="font-bold text-green-700 text-sm">{formatPrice(auction.winning_bid)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav currentPage="AdminDashboard" />
    </div>
  );
}