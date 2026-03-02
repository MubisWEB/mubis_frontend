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
import TopBar from "@/components/TopBar";

const dealerData = { id: '1', name: 'Autonal', email: 'contacto@autonal.com', phone: '3001112233', city: 'Bogotá', nit: '900123456-7', verified: true, verification_date: '2024-11-15', total_bids: 342, won_auctions: 28, total_spent: 2450000000, documents: { nit_verified: true, rut_verified: true, chamber_commerce_verified: true } };
const wonAuctions = [
  { id: '1', vehicle: 'Mazda 3', year: 2022, photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg', winning_bid: 62000000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), seller: 'María García' },
  { id: '2', vehicle: 'Toyota Corolla', year: 2020, photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/corolla1.jpg', winning_bid: 75000000, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), seller: 'Juan Pérez' },
  { id: '3', vehicle: 'Kia Sportage', year: 2021, photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/4185bae35_IMG_3560.jpeg', winning_bid: 78000000, date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), seller: 'Carlos López' }
];

export default function AdminDealerDetalle() {
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(dealerData);
  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;
  const formatDate = (date) => date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const handleToggleVerification = () => {
    setDealer(prev => ({ ...prev, verified: !prev.verified }));
    toast.success(dealer.verified ? 'Verificación removida' : 'Dealer verificado', { description: dealer.verified ? `${dealer.name} ya no está verificado` : `${dealer.name} ahora está verificado` });
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminDealers'))} className="text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
          <MubisLogo size="md" variant="light" />
          <div className="w-10"></div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-serif">{dealer.name}</h1>
        <div className="flex items-center justify-center gap-2">
          {dealer.verified && <Badge className="bg-primary/20 text-white border-primary/30"><Shield className="w-3 h-3 mr-1" />Verificado</Badge>}
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center border border-border shadow-sm"><p className="text-xl font-bold text-foreground">{dealer.total_bids}</p><p className="text-xs text-muted-foreground">Pujas</p></Card>
          <Card className="p-3 text-center border border-border shadow-sm"><p className="text-xl font-bold text-primary">{dealer.won_auctions}</p><p className="text-xs text-muted-foreground">Ganadas</p></Card>
          <Card className="p-3 text-center border border-border shadow-sm"><p className="text-xl font-bold text-secondary">{formatPrice(dealer.total_spent)}</p><p className="text-xs text-muted-foreground">Total</p></Card>
        </div>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-serif">Información de Contacto</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{dealer.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{dealer.phone}</span></div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{dealer.city}</span></div>
            <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">NIT: {dealer.nit}</span></div>
          </div>
        </Card>

        <Card className="p-4 mb-4 border border-border shadow-sm">
          <h2 className="font-bold text-foreground mb-3 font-serif">Documentos Verificados</h2>
          <div className="space-y-2">
            {[['NIT / Cédula', dealer.documents.nit_verified], ['RUT', dealer.documents.rut_verified], ['Cámara de Comercio', dealer.documents.chamber_commerce_verified]].map(([name, verified]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{name}</span>
                {verified ? <CheckCircle className="w-5 h-5 text-primary" /> : <Badge className="bg-accent text-accent-foreground text-xs">Pendiente</Badge>}
              </div>
            ))}
          </div>
          {dealer.verified && <div className="mt-3 pt-3 border-t border-border"><p className="text-xs text-muted-foreground">Verificado el {dealer.verification_date}</p></div>}
          <Button onClick={handleToggleVerification} className={`w-full mt-3 rounded-full ${dealer.verified ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
            {dealer.verified ? 'Remover Verificación' : 'Marcar como Verificado'}
          </Button>
        </Card>

        <Card className="p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3"><Trophy className="w-5 h-5 text-secondary" /><h2 className="font-bold text-foreground font-serif">Subastas Ganadas</h2></div>
          <div className="space-y-3">
            {wonAuctions.map(auction => (
              <div key={auction.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted"><img src={auction.photo} alt={auction.vehicle} className="w-full h-full object-cover" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{auction.vehicle} {auction.year}</h3>
                  <p className="text-xs text-muted-foreground mb-1">Vendedor: {auction.seller}</p>
                  <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{formatDate(auction.date)}</span><span className="font-bold text-primary text-sm">{formatPrice(auction.winning_bid)}</span></div>
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
