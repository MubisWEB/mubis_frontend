import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Gauge, Building, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
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

export default function HistorialPeritajes() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await inspectionsApi.getHistory();
      setInspections(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 15000);
    return () => clearInterval(interval);
  }, []);

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
            <h1 className="text-xl font-bold text-foreground font-sans">Historial de peritajes</h1>
            <p className="text-xs text-muted-foreground">Peritajes completados y rechazados</p>
          </div>
          <Button variant="outline" size="icon" onClick={loadHistory} disabled={loading} className="h-8 w-8 rounded-full">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <InspRowSkeleton key={i} />)}</div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 font-sans">No hay peritajes en historial</h3>
            <p className="text-muted-foreground text-sm">Los peritajes completados o rechazados aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspections.map((insp, index) => (
              <motion.div key={insp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="p-4 border shadow-sm rounded-2xl border-border/60">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{insp.vehicle?.brand} {insp.vehicle?.model}</h3>
                      <p className="text-muted-foreground text-sm">{insp.vehicle?.year} · Placa: {insp.vehicle?.placa}</p>
                    </div>
                    {insp.status === 'COMPLETED'
                      ? <Badge className="bg-emerald-600 text-white text-xs pointer-events-none gap-1"><CheckCircle2 className="w-3 h-3" />Completado</Badge>
                      : <Badge className="bg-destructive text-destructive-foreground text-xs pointer-events-none gap-1"><XCircle className="w-3 h-3" />Rechazado</Badge>
                    }
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{Number(insp.vehicle?.mileage || 0).toLocaleString('es-CO')} km</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{insp.vehicle?.city || insp.vehicle?.ubicacion}</span>
                    <span className="flex items-center gap-1"><Building className="w-3 h-3" />{insp.dealerCompany}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(insp.completedAt)}</span>
                  </div>
                  <Button onClick={() => navigate(`/HistorialPeritajeDetalle/${insp.id}`)} variant="outline" className="w-full rounded-xl">
                    Ver detalle
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
