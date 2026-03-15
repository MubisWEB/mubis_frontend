import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, MapPin, Calendar, Gauge, Building } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { inspectionsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import Skeleton from 'react-loading-skeleton';

const InspRowSkeleton = () => (
  <div className="p-4 border border-border/60 rounded-2xl bg-card">
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <div style={{ flex: 1 }}>
        <Skeleton width="55%" height={18} />
        <Skeleton width="35%" height={13} style={{ marginTop: 5 }} />
      </div>
      <Skeleton width={70} height={22} borderRadius={999} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
      <Skeleton height={12} /><Skeleton height={12} />
      <Skeleton height={12} /><Skeleton height={12} />
    </div>
    <Skeleton height={38} borderRadius={12} />
  </div>
);

export default function PeritajesPendientes() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionsApi.getPending();
      setInspections(data || []);
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
    const interval = setInterval(loadInspections, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeInspection = async (inspection) => {
    try {
      await inspectionsApi.take(inspection.id);
      toast.success('Peritaje tomado', { description: `${inspection.vehicle?.brand || ''} ${inspection.vehicle?.model || ''}` });
      navigate(`/PeritajeDetalle/${inspection.id}`);
    } catch (err) {
      toast.error('Error al tomar el peritaje');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60));
    if (diff < 1) return 'Hace minutos';
    if (diff < 24) return `Hace ${diff}h`;
    return `Hace ${Math.floor(diff / 24)} días`;
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Peritajes pendientes</h1>
            <p className="text-xs text-muted-foreground">Sucursal: {currentUser?.branch || 'N/A'}</p>
          </div>
          <Badge className="bg-secondary/10 text-secondary">{inspections.length} pendientes</Badge>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <InspRowSkeleton key={i} />)}</div>
        ) : inspections.length === 0 ? (
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
                      <h3 className="font-bold text-foreground text-base">{insp.vehicle?.brand} {insp.vehicle?.model}</h3>
                      <p className="text-muted-foreground text-sm">{insp.vehicle?.year} · Placa: {insp.vehicle?.placa}</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent-foreground text-xs">Pendiente</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{Number(insp.vehicle?.mileage || 0).toLocaleString('es-CO')} km</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{insp.vehicle?.city || insp.vehicle?.ubicacion}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" />{insp.dealerCompany}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(insp.requestedAt)}</span>
                  </div>
                  <Button onClick={() => handleTakeInspection(insp)} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-2">
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
