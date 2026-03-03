import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Car, MapPin, Calendar, Gauge, Building } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getInspections, updateInspection, getVehicleById, getCurrentUser } from '@/lib/mockStore';

export default function PeritajesPendientes() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadInspections();
    const interval = setInterval(loadInspections, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadInspections = () => {
    const all = getInspections();
    // Filter: same branch as perito and PENDING status
    const pending = all.filter(i =>
      i.status === 'PENDING' &&
      i.dealerBranch === currentUser?.branch
    );
    // Enrich with vehicle data
    const enriched = pending.map(i => {
      const vehicle = getVehicleById(i.vehicleId);
      return { ...i, vehicle };
    }).filter(i => i.vehicle);
    setInspections(enriched);
  };

  const handleTakeInspection = (inspection) => {
    updateInspection(inspection.id, {
      status: 'IN_PROGRESS',
      lockedByPeritoId: currentUser?.id,
      lockedAt: new Date().toISOString(),
    });
    toast.success('Peritaje tomado', { description: `${inspection.vehicle.brand} ${inspection.vehicle.model}` });
    navigate(`/PeritajeDetalle/${inspection.vehicleId}`);
  };

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60));
    if (diff < 1) return 'Hace minutos';
    if (diff < 24) return `Hace ${diff}h`;
    return `Hace ${Math.floor(diff / 24)} días`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="lg" />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans">Peritajes pendientes</h1>
            <p className="text-muted-foreground text-sm">Sucursal: {currentUser?.branch || 'N/A'}</p>
          </div>
          <Badge className="bg-secondary/10 text-secondary">{inspections.length} pendientes</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {inspections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 font-sans">No hay peritajes pendientes</h3>
            <p className="text-muted-foreground text-sm">Los peritajes de tu sucursal aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((insp, index) => (
              <motion.div key={insp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="p-4 border border-border/60 shadow-sm rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{insp.vehicle.brand} {insp.vehicle.model}</h3>
                      <p className="text-muted-foreground text-sm">{insp.vehicle.year} · Placa: {insp.vehicle.placa}</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent-foreground text-xs">Pendiente</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{Number(insp.vehicle.mileage || 0).toLocaleString('es-CO')} km</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{insp.vehicle.city || insp.vehicle.ubicacion}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" />{insp.dealerCompany}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(insp.requestedAt)}</span>
                  </div>

                  <Button onClick={() => handleTakeInspection(insp)}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Tomar peritaje
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
