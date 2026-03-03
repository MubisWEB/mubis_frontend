import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Check, X, AlertCircle, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import { toast } from 'sonner';
import {
  getVehicleById, updateVehicle,
  getInspectionByVehicleId, updateInspection,
  addAuction, getCurrentUser
} from '@/lib/mockStore';

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

const initialPeritaje = Object.fromEntries(
  PERITAJE_CATEGORIES.map(c => [c.key, { score: '', description: '' }])
);

export default function PeritajeDetalle() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [vehicle, setVehicle] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [peritaje, setPeritaje] = useState({ ...initialPeritaje });
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const v = getVehicleById(vehicleId);
    const insp = getInspectionByVehicleId(vehicleId);
    setVehicle(v);
    setInspection(insp);
  }, [vehicleId]);

  const setScore = (cat, field, val) => {
    setPeritaje(prev => ({ ...prev, [cat]: { ...prev[cat], [field]: val } }));
    setErrors(prev => ({ ...prev, [cat]: undefined }));
  };

  const getGlobalScore = () => {
    const scores = PERITAJE_CATEGORIES.map(c => +peritaje[c.key].score).filter(s => !isNaN(s) && s >= 0);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-primary';
    if (score >= 50) return 'text-yellow-600';
    return 'text-destructive';
  };

  const validate = () => {
    const e = {};
    PERITAJE_CATEGORIES.forEach(c => {
      const s = peritaje[c.key].score;
      if (s === '' || isNaN(s) || +s < 0 || +s > 100) e[c.key] = 'Score 0-100';
      if (!peritaje[c.key].description.trim()) e[`${c.key}_desc`] = 'Comentario obligatorio';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalize = () => {
    if (!validate()) return;
    if (!inspection || !vehicle) return;

    const globalScore = getGlobalScore();

    // Update inspection
    updateInspection(inspection.id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      peritoId: currentUser?.id,
      peritaje,
      scoreGlobal: globalScore,
    });

    // Update vehicle
    updateVehicle(vehicle.id, {
      status: 'READY_FOR_AUCTION',
      peritaje,
      peritaje_global: globalScore,
      peritoId: currentUser?.id,
    });

    // Auto-create auction
    addAuction({
      vehicleId: vehicle.id,
      dealerId: vehicle.dealerId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      city: vehicle.city || vehicle.ubicacion,
      mileage: vehicle.mileage,
      color: vehicle.color,
      fuel_type: vehicle.fuel_type,
      traction: vehicle.traction,
      placa: vehicle.placa,
      photos: vehicle.photos || [],
      current_bid: vehicle.suggested_price || 0,
      starting_price: vehicle.suggested_price || 0,
      bids_count: 0,
      views: 0,
      status: 'active',
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      peritaje,
      peritaje_global: globalScore,
      documentation: vehicle.documentation,
    });

    toast.success('Peritaje finalizado', { description: `${vehicle.brand} ${vehicle.model} · Score: ${globalScore}/100` });
    navigate('/PeritajesPendientes');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Debes indicar la razón del rechazo');
      return;
    }
    if (!inspection || !vehicle) return;

    updateInspection(inspection.id, {
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectReason,
      peritoId: currentUser?.id,
    });

    updateVehicle(vehicle.id, {
      status: 'INSPECTION_REJECTED',
      rejectReason,
    });

    toast.error('Peritaje rechazado', { description: vehicle.brand + ' ' + vehicle.model });
    navigate('/PeritajesPendientes');
  };

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Vehículo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3">
          <button onClick={() => navigate('/PeritajesPendientes')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <MubisLogo size="lg" />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Vehicle info */}
        <Card className="p-4 border border-border/60 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground font-sans">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-muted-foreground text-sm">{vehicle.year} · Placa: {vehicle.placa} · {Number(vehicle.mileage || 0).toLocaleString('es-CO')} km</p>
            </div>
            <Badge className="bg-secondary/10 text-secondary">En peritaje</Badge>
          </div>
          {vehicle.photos?.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {vehicle.photos.slice(0, 4).map((p, i) => (
                <img key={i} src={p} alt="" className="w-24 h-18 rounded-xl object-cover flex-shrink-0" />
              ))}
            </div>
          )}
        </Card>

        {/* Global score */}
        <Card className="p-4 border border-border/60 text-center rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Puntaje global</p>
          <p className={cn("text-4xl font-bold", getScoreColor(getGlobalScore()))}>
            {getGlobalScore()}<span className="text-lg text-muted-foreground">/100</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Promedio de todas las categorías</p>
        </Card>

        {/* Categories */}
        <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2">Evaluación por categoría (0–100)</p>
        <div className="space-y-4">
          {PERITAJE_CATEGORIES.map(cat => {
            const val = peritaje[cat.key];
            const score = val.score === '' ? 0 : +val.score;
            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{cat.label} *</Label>
                  <span className={cn("text-sm font-bold tabular-nums", val.score !== '' ? getScoreColor(score) : 'text-muted-foreground')}>
                    {val.score !== '' ? score : '—'}/100
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider min={0} max={100} step={1} value={[val.score === '' ? 0 : +val.score]}
                    onValueChange={([v]) => setScore(cat.key, 'score', String(v))} className="flex-1" />
                  <Input className="w-16 rounded-xl text-center text-sm" type="number" min={0} max={100} placeholder="0"
                    value={val.score} onChange={e => {
                      let v = e.target.value;
                      if (v !== '' && +v > 100) v = '100';
                      if (v !== '' && +v < 0) v = '0';
                      setScore(cat.key, 'score', v);
                    }} />
                </div>
                <Input className="rounded-xl text-xs" placeholder={`Comentario sobre ${cat.label.toLowerCase()} (obligatorio)`}
                  value={val.description} onChange={e => setScore(cat.key, 'description', e.target.value)} />
                {errors[cat.key] && <span className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[cat.key]}</span>}
                {errors[`${cat.key}_desc`] && <span className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[`${cat.key}_desc`]}</span>}
              </div>
            );
          })}
        </div>

        {/* Reject section */}
        {showReject && (
          <Card className="p-4 border border-destructive/30 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-destructive">Razón del rechazo *</p>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Describe por qué rechazas este peritaje..." className="rounded-xl" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)} className="flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={handleReject} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl gap-1">
                <X className="w-4 h-4" /> Confirmar rechazo
              </Button>
            </div>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowReject(true)}
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl gap-1">
            <X className="w-4 h-4" /> Rechazar peritaje
          </Button>
          <Button onClick={handleFinalize}
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1">
            <Check className="w-4 h-4" /> Finalizar peritaje
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
