import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Calendar, Users, Eye, Clock, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";

const soldCars = [
  { id: '1', brand: 'Toyota', model: 'Corolla', year: 2020, plate: 'ABC123', photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/corolla1.jpg', final_price: 75000000, starting_price: 70000000, reserve_price: 72000000, buyer: 'Autonal', sold_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), auction_history: { total_bids: 28, total_views: 342, duration_hours: 48, auto_extended: 2, top_bidders: [{ name: 'Autonal', final_bid: 75000000 }, { name: 'Los Coches', final_bid: 74500000 }, { name: 'Sanautos', final_bid: 73000000 }] } },
  { id: '2', brand: 'Mazda', model: 'CX-5', year: 2021, plate: 'XYZ789', photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/cx5_1.jpg', final_price: 95000000, starting_price: 85000000, reserve_price: 90000000, buyer: 'Los Coches', sold_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), auction_history: { total_bids: 42, total_views: 518, duration_hours: 72, auto_extended: 3, top_bidders: [{ name: 'Los Coches', final_bid: 95000000 }, { name: 'Derco', final_bid: 94000000 }, { name: 'Autonal', final_bid: 92500000 }] } },
  { id: '3', brand: 'Chevrolet', model: 'Tracker', year: 2022, plate: 'DEF456', photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/tracker1.jpg', final_price: 82000000, starting_price: 75000000, reserve_price: 78000000, buyer: 'Sanautos', sold_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), auction_history: { total_bids: 35, total_views: 289, duration_hours: 48, auto_extended: 1, top_bidders: [{ name: 'Sanautos', final_bid: 82000000 }, { name: 'Autoland', final_bid: 81000000 }, { name: 'Casa Toro', final_bid: 79500000 }] } }
];

export default function CarrosVendidos() {
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'seller@test.com';
  const [cars] = React.useState(isTestUser ? soldCars : []);
  const [expandedCar, setExpandedCar] = React.useState(null);
  const formatPrice = (price) => `$${(price / 1000000).toFixed(1)}M`;
  const formatDate = (date) => { const diffDays = Math.ceil(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24)); if (diffDays === 0) return 'Hoy'; if (diffDays === 1) return 'Ayer'; if (diffDays < 7) return `Hace ${diffDays} días`; if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`; return `Hace ${Math.floor(diffDays / 30)} meses`; };
  const totalRevenue = cars.reduce((sum, car) => sum + car.final_price, 0);

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-5 pt-6 pb-6 rounded-b-3xl">
        <div className="text-center mb-4"><MubisLogo size="xl" variant="light" /></div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-serif">Carros Vendidos</h1>
        <p className="text-white/60 text-center text-sm mb-4">Historial de ventas exitosas</p>
        <div className="flex justify-center gap-6">
          <div className="text-center"><p className="text-2xl font-bold text-white">{cars.length}</p><p className="text-white/60 text-xs">Vendidos</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p><p className="text-white/60 text-xs">Total Recibido</p></div>
        </div>
      </div>

      <div className="px-4 py-5 -mt-3">
        <div className="space-y-3">
          {cars.map((car, index) => (
            <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="overflow-hidden border border-border shadow-sm">
                <div className="flex p-3 gap-3">
                  <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted"><img src={car.photo} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div><h3 className="font-bold text-foreground text-sm">{car.brand} {car.model}</h3><p className="text-muted-foreground text-xs">{car.year} · {car.plate}</p></div>
                      <Badge className="bg-primary/10 text-primary text-xs"><CheckCircle className="w-3 h-3 mr-1" />Vendido</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Precio final:</span><span className="font-bold text-primary text-sm">{formatPrice(car.final_price)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Comprador:</span><span className="text-xs font-medium text-foreground">{car.buyer}</span></div>
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 space-y-2 pt-2 -mt-1">
                  <div className="flex items-center justify-between bg-primary/5 py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-1 text-primary"><TrendingUp className="w-4 h-4" /><span className="text-xs font-semibold">+{formatPrice(car.final_price - car.starting_price)} ganancia</span></div>
                    <span className="text-xs text-muted-foreground">{formatDate(car.sold_date)}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedCar(expandedCar === car.id ? null : car.id)} className="w-full h-8 text-xs text-secondary hover:text-secondary hover:bg-secondary/5">
                    {expandedCar === car.id ? <><ChevronUp className="w-3 h-3 mr-1" />Ocultar detalles</> : <><ChevronDown className="w-3 h-3 mr-1" />Ver detalles de subasta</>}
                  </Button>
                  {expandedCar === car.id && car.auction_history && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2 border-t border-border">
                      <div className="grid grid-cols-2 gap-2">
                        {[['Pujas totales', car.auction_history.total_bids, Users], ['Vistas', car.auction_history.total_views, Eye], ['Duración', `${car.auction_history.duration_hours}h`, Clock], ['Extensiones', `${car.auction_history.auto_extended}x`, Timer]].map(([label, value, Icon]) => (
                          <div key={label} className="bg-muted rounded-lg p-2"><div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Icon className="w-3 h-3" /><span className="text-xs font-medium">{label}</span></div><p className="text-lg font-bold text-foreground">{value}</p></div>
                        ))}
                      </div>
                      {car.reserve_price && <div className="bg-primary/5 border border-primary/10 rounded-lg p-2"><div className="flex items-center justify-between"><span className="text-xs text-primary font-medium">Precio de reserva alcanzado</span><span className="text-xs font-bold text-foreground">{formatPrice(car.reserve_price)}</span></div></div>}
                      <div className="bg-muted rounded-lg p-2"><p className="text-xs font-semibold text-foreground mb-2">Top 3 Oferentes</p><div className="space-y-1">{car.auction_history.top_bidders.map((bidder, i) => (<div key={i} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{i + 1}. {bidder.name}</span><span className="font-semibold text-foreground">{formatPrice(bidder.final_bid)}</span></div>))}</div></div>
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
