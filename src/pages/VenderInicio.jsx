import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Clock, Eye, Users, Edit } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TopBar from "@/components/TopBar";

const demoVehicles = [
  { id: '1', brand: 'Mazda', model: '3', year: 2022, plate: 'ABC123', photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/8bac02287_IMG_3552.jpeg', status: 'draft', views: 0, bids: 0 },
  { id: '2', brand: 'Kia', model: 'Sportage', year: 2021, plate: 'XYZ789', photo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931f0ed55d5d84622e39c62/4185bae35_IMG_3560.jpeg', status: 'active', views: 203, bids: 31 }
];

export default function VenderInicio() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'seller@test.com';
  const [vehicles] = useState(isTestUser ? demoVehicles : []);

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-5 pt-6 pb-6 rounded-b-3xl">
        <div className="text-center mb-4"><MubisLogo size="xl" variant="light" /></div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-serif">Mis Vehículos</h1>
        <p className="text-white/60 text-center text-sm">Administra tus publicaciones</p>
      </div>

      <div className="px-4 py-5 -mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => navigate(createPageUrl('PublicarCarro'))} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 rounded-full font-bold text-lg shadow-lg mb-4">
            <Plus className="w-6 h-6 mr-2" />Vender Nuevo Vehículo
          </Button>
        </motion.div>

        {vehicles.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Car className="w-10 h-10 text-secondary/40" /></div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-serif">No tienes vehículos registrados</h3>
            <p className="text-muted-foreground">Comienza publicando tu primer vehículo</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Vehículos Registrados</h2>
            {vehicles.map((vehicle, index) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="overflow-hidden border border-border shadow-sm">
                  <div className="flex p-3 gap-3">
                    <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted"><img src={vehicle.photo} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div><h3 className="font-bold text-foreground text-sm">{vehicle.brand} {vehicle.model}</h3><p className="text-muted-foreground text-xs">{vehicle.year} · {vehicle.plate}</p></div>
                        <Badge className={vehicle.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>{vehicle.status === 'active' ? 'Activa' : 'Borrador'}</Badge>
                      </div>
                      {vehicle.status === 'active' ? (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Eye className="w-3 h-3" />{vehicle.views}</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />{vehicle.bids}</span></div>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Pendiente de completar</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`${createPageUrl('PublicarCarro')}?id=${vehicle.id}`)} className="rounded-full"><Edit className="w-4 h-4 text-muted-foreground" /></Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav currentPage="VenderInicio" />
    </div>
  );
}
