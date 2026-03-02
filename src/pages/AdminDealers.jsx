import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Shield, MapPin, Phone, Mail, TrendingUp } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';

const dealers = [
  {
    id: '1',
    name: 'Autonal',
    email: 'contacto@autonal.com',
    phone: '3001112233',
    city: 'Bogotá',
    verified: true,
    total_bids: 342,
    won_auctions: 28,
    total_spent: 2450000000,
    nit: '900123456-7',
    verification_date: '2024-11-15'
  },
  {
    id: '2',
    name: 'Los Coches',
    email: 'info@loscoches.com',
    phone: '3159998877',
    city: 'Medellín',
    verified: true,
    total_bids: 289,
    won_auctions: 22,
    total_spent: 1850000000,
    nit: '900234567-8',
    verification_date: '2024-10-20'
  },
  {
    id: '3',
    name: 'Sanautos',
    email: 'ventas@sanautos.com',
    phone: '3207776655',
    city: 'Cali',
    verified: true,
    total_bids: 256,
    won_auctions: 19,
    total_spent: 1620000000,
    nit: '900345678-9',
    verification_date: '2024-12-01'
  },
  {
    id: '4',
    name: 'Casa Toro',
    email: 'info@casatoro.com',
    phone: '3104445566',
    city: 'Barranquilla',
    verified: false,
    total_bids: 145,
    won_auctions: 12,
    total_spent: 980000000,
    nit: '900456789-0',
    verification_date: null
  }
];

export default function AdminDealers() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'admin@mubis.com';
  
  const [displayDealers] = useState(isTestUser ? dealers : []);
  const [search, setSearch] = useState('');

  const formatPrice = (price) => {
    return `$${(price / 1000000).toFixed(0)}M`;
  };

  const filteredDealers = displayDealers.filter(dealer =>
    dealer.name.toLowerCase().includes(search.toLowerCase()) ||
    dealer.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-b from-violet-900 to-violet-800 px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('AdminDashboard'))}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <MubisLogo size="md" variant="light" />
          <div className="w-10"></div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Dealers Registrados</h1>
        <p className="text-violet-200 text-center text-sm">{displayDealers.length} dealers en total</p>
      </div>

      <div className="px-4 -mt-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-0 shadow-md"
          />
        </div>

        {/* Dealers List */}
        <div className="space-y-3">
          {filteredDealers.map(dealer => (
            <Card
              key={dealer.id}
              className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`${createPageUrl('AdminDealerDetalle')}?id=${dealer.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{dealer.name}</h3>
                    {dealer.verified && (
                      <Shield className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    {dealer.city}
                  </div>
                </div>
                <Badge className={dealer.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {dealer.verified ? 'Verificado' : 'Sin verificar'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-1">Pujas totales</p>
                  <p className="text-lg font-bold text-gray-900">{dealer.total_bids}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-1">Ganadas</p>
                  <p className="text-lg font-bold text-green-700">{dealer.won_auctions}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  Total invertido
                </div>
                <span className="font-bold text-violet-700">{formatPrice(dealer.total_spent)}</span>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  {dealer.email}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  {dealer.phone}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav currentPage="AdminDashboard" />
    </div>
  );
}