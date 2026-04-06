import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { inspectionsApi } from '@/api/services';

const PERITAJE_CATEGORIES = [
  { key: 'motor', label: 'Motor' },
  { key: 'transmision', label: 'Transmisión' },
  { key: 'suspension', label: 'Suspensión' },
  { key: 'frenos', label: 'Frenos' },
  { key: 'carroceria', label: 'Carrocería' },
  { key: 'interior', label: 'Interior' },
  { key: 'electrica', label: 'Parte eléctrica' },
  { key: 'llantas', label: 'Llantas' },
];

export default function HistorialPeritajeDetalle() {
  const { vehicleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    if (!vehicleId) return;
    const load = async () => {
      try {
        const insp = await inspectionsApi.getById(vehicleId);
        if (insp) {
          setInspection(insp);
          setVehicle(insp.vehicle || null);
        }
      } catch (err) {
        try {
          const inspByVehicle = await inspectionsApi.getByVehicle(vehicleId);
          const insp = Array.isArray(inspByVehicle) ? inspByVehicle[0] : inspByVehicle;
          if (insp) {
            setInspection(insp);
            setVehicle(insp.vehicle || null);
          }
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vehicleId]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-primary';
    if (score >= 50) return 'text-yellow-600';
    return 'text-destructive';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <Header title="Detalle del peritaje" backTo="/HistorialPeritajes" />
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-6 space-y-5">
          <Skeleton height={96} borderRadius={16} />
          <div className="rounded-2xl border border-border bg-card p-4">
            <Skeleton width="50%" height={13} />
            <Skeleton width="40%" height={32} style={{ marginTop: 8 }} />
          </div>
          <Skeleton height={14} count={4} style={{ marginBottom: 8 }} />
          <Skeleton height={48} borderRadius={12} style={{ marginTop: 24 }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!loading && !vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Peritaje no encontrado</p>
      </div>
    );
  }

  const statusLabel = inspection?.status === 'COMPLETED' ? 'Peritaje completado'
    : inspection?.status === 'REJECTED' ? 'Peritaje rechazado'
    : '—';
  const statusClass = inspection?.status === 'COMPLETED' ? 'bg-emerald-600 text-white'
    : inspection?.status === 'REJECTED' ? 'bg-destructive text-destructive-foreground'
    : 'bg-muted text-muted-foreground';

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title={`${vehicle.brand} ${vehicle.model}`} subtitle={`${vehicle.year} · ${vehicle.placa}`} backTo="/HistorialPeritajes" />
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {vehicle.photos?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {vehicle.photos.slice(0, 6).map((p, i) => (
              <img key={i} src={p} alt="" className="w-28 h-20 rounded-xl object-cover flex-shrink-0 border border-border/40" />
            ))}
          </div>
        )}

        <Card className="p-4 border border-border/60 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estado del peritaje</p>
            <Badge className={`text-sm px-3 py-1.5 rounded-full ${statusClass}`}>
              {inspection?.status === 'COMPLETED' ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" />{statusLabel}</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" />{statusLabel}</>
              )}
            </Badge>
          </div>
          {inspection?.status === 'COMPLETED' && inspection?.scoreGlobal != null && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Score global</p>
              <p className={cn('text-3xl font-bold', getScoreColor(inspection.scoreGlobal * 10))}>{Math.round(inspection.scoreGlobal * 10)}<span className="text-sm text-muted-foreground">/100</span></p>
            </div>
          )}
        </Card>

        {inspection?.status === 'COMPLETED' && inspection?.scores && (
          <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">Resultados por categoría</p>
            {Object.entries(inspection.scores).map(([key, val]) => {
              const score100 = Math.round(val * 10); // Convert 0-10 to 0-100
              return (
                <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                  <span className="text-sm text-foreground capitalize font-medium">{key}</span>
                  <span className={cn('text-sm font-bold tabular-nums', getScoreColor(score100))}>{score100}/100</span>
                </div>
              );
            })}
            {inspection.comments && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-xs font-medium text-muted-foreground mb-2">Comentarios</p>
                <p className="text-sm text-foreground">{inspection.comments}</p>
              </div>
            )}
          </Card>
        )}

        {inspection?.status === 'REJECTED' && (
          <Card className="p-4 border border-destructive/30 rounded-2xl bg-destructive/5 space-y-2">
            <p className="text-sm font-semibold text-destructive">Razón del rechazo</p>
            <p className="text-sm text-foreground">{inspection?.comments || 'Sin motivo registrado'}</p>
          </Card>
        )}

        {inspection?.reportPdfUrl && (
          <Card className="p-4 border border-emerald-200 rounded-2xl bg-emerald-50 space-y-3">
            <p className="text-sm font-semibold text-emerald-900">Archivo adjunto del peritaje</p>
            <a
              href={inspection.reportPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </a>
          </Card>
        )}

        <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
          <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">Información del vehículo</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Marca', vehicle.brand],
              ['Modelo', vehicle.model],
              ['Año', vehicle.year],
              ['Placa', vehicle.placa],
              ['Color', vehicle.color],
              ['Kilometraje', vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString('es-CO')} km` : '—'],
              ['Combustible', vehicle.combustible],
              ['Cilindraje', vehicle.cilindraje],
              ['Ciudad', vehicle.city || vehicle.ubicacion],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 border border-border/60 rounded-2xl space-y-2">
          <p className="text-xs text-muted-foreground">Fechas importantes</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Creado</span>
              <span className="text-sm font-medium text-foreground">{formatDate(inspection?.createdAt)}</span>
            </div>
            {inspection?.completedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Finalizado</span>
                <span className="text-sm font-medium text-foreground">{formatDate(inspection.completedAt)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
