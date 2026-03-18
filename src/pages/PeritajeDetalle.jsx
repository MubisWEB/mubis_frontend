import React, { useState, useEffect, useCallback, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { inspectionsApi, mediaApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

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

const initialPeritaje = Object.fromEntries(PERITAJE_CATEGORIES.map(c => [c.key, { score: '', description: '' }]));

export default function PeritajeDetalle() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isDealer = currentUser?.role === 'dealer';
  const backTo = isDealer ? '/MisSubastas' : '/PeritajesPendientes';
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [peritaje, setPeritaje] = useState({ ...initialPeritaje });
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [errors, setErrors] = useState({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [reportPdfFile, setReportPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const hasChangesRef = useRef(false);

  const getDraftKey = () => `peritaje_draft_${vehicleId}`;

  // Check if form has any data entered
  const hasFormData = useCallback(() => {
    return PERITAJE_CATEGORIES.some(c => peritaje[c.key].score !== '' || peritaje[c.key].description.trim() !== '') || rejectReason.trim() !== '' || !!reportPdfFile;
  }, [peritaje, rejectReason, reportPdfFile]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (!vehicleId) return;
    localStorage.setItem(getDraftKey(), JSON.stringify({ peritaje, rejectReason }));
  }, [vehicleId, peritaje, rejectReason]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!vehicleId) return;
    const saved = localStorage.getItem(getDraftKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.peritaje) setPeritaje(parsed.peritaje);
        if (parsed.rejectReason) setRejectReason(parsed.rejectReason);
        toast.info('Borrador recuperado', { description: 'Se cargaron los datos guardados previamente.' });
      } catch { /* ignore corrupt data */ }
    }
  }, [vehicleId]);

  // Track changes
  useEffect(() => {
    hasChangesRef.current = hasFormData();
  }, [hasFormData]);

  // Warn on browser back/close
  useEffect(() => {
    const handler = (e) => {
      if (!isDealer && inspection?.status === 'IN_PROGRESS') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDealer, inspection]);

  const handleBack = () => {
    if (!isDealer && inspection?.status === 'IN_PROGRESS') {
      setShowExitDialog(true);
    } else {
      navigate(backTo);
    }
  };

  const handleSaveDraftAndExit = () => {
    saveDraft();
    toast.success('Borrador guardado', { description: 'Podrás continuar donde lo dejaste.' });
    setShowExitDialog(false);
    navigate(backTo);
  };

  const handleDiscardAndExit = () => {
    localStorage.removeItem(getDraftKey());
    setShowExitDialog(false);
    navigate(backTo);
  };

  const handleReleaseAndExit = async () => {
    if (!inspection) return;
    try {
      await inspectionsApi.release(inspection.id);
      localStorage.removeItem(getDraftKey());
      toast.info('Peritaje liberado', { description: 'El peritaje volvió a estar disponible.' });
      setShowExitDialog(false);
      navigate(backTo);
    } catch {
      toast.error('Error al liberar el peritaje');
    }
  };

  useEffect(() => {
    if (!vehicleId) return;
    const load = async () => {
      try {
        // vehicleId param may actually be the inspectionId depending on routing
        const insp = await inspectionsApi.getById(vehicleId);
        if (insp) {
          setInspection(insp);
          setVehicle(insp.vehicle || null);
        }
      } catch (err) {
        // Try treating as vehicleId
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

  // Check if this is viewing a completed/rejected inspection (readonly mode)
  const isReadonly = inspection?.status === 'COMPLETED' || inspection?.status === 'REJECTED';

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

  const handleFinalize = async () => {
    if (!validate()) return;
    if (!inspection) return;
    const globalScore = getGlobalScore();
    try {
      let reportPdfUrl;
      if (reportPdfFile) {
        setUploadingPdf(true);
        const uploadRes = await mediaApi.upload([reportPdfFile]);
        reportPdfUrl = uploadRes?.urls?.[0];
      }
      await inspectionsApi.complete(inspection.id, {
        peritaje,
        scoreGlobal: globalScore,
        reportPdfUrl,
      });
      toast.success('Peritaje finalizado', { description: `${vehicle?.brand || ''} ${vehicle?.model || ''} · Score: ${globalScore}/100` });
      localStorage.removeItem(getDraftKey());
      navigate('/PeritajesPendientes');
    } catch (err) {
      toast.error('Error al finalizar el peritaje');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Debes indicar la razón del rechazo'); return; }
    if (!inspection) return;
    try {
      await inspectionsApi.reject(inspection.id, { rejectReason });
      toast.error('Peritaje rechazado', { description: `${vehicle?.brand || ''} ${vehicle?.model || ''}` });
      localStorage.removeItem(getDraftKey());
      navigate('/PeritajesPendientes');
    } catch (err) {
      toast.error('Error al rechazar el peritaje');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <Header title="Peritaje" backTo={backTo} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
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
    return (<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Vehículo no encontrado</p></div>);
  }

  // ── Dealer: read-only view ────────────────────────────────────────────────
  if (isDealer) {
    const statusLabel = inspection?.status === 'COMPLETED' ? 'Peritaje completado'
      : inspection?.status === 'REJECTED' ? 'Peritaje rechazado'
      : inspection?.status === 'IN_PROGRESS' ? 'En peritaje'
      : 'Pendiente de peritaje';
    const statusClass = inspection?.status === 'COMPLETED' ? 'bg-primary/10 text-primary'
      : inspection?.status === 'REJECTED' ? 'bg-destructive/10 text-destructive'
      : 'bg-secondary/10 text-secondary';

    return (
      <div className="min-h-screen bg-background pb-28">
        <Header title={`${vehicle.brand} ${vehicle.model}`} subtitle={`${vehicle.year} · ${vehicle.placa}`} backTo={backTo} />
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
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusClass}`}>{statusLabel}</span>
            </div>
            {inspection?.status === 'COMPLETED' && inspection?.scoreGlobal != null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Score global</p>
                <p className={cn('text-3xl font-bold', getScoreColor(inspection.scoreGlobal))}>{inspection.scoreGlobal}<span className="text-sm text-muted-foreground">/100</span></p>
              </div>
            )}
          </Card>

          {inspection?.status === 'COMPLETED' && inspection?.scores && (
            <Card className="p-4 border border-border/60 rounded-2xl space-y-2">
              <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">Resultados por categoría</p>
              {Object.entries(inspection.scores).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <span className="text-sm text-foreground capitalize">{key}</span>
                  <span className={cn('text-sm font-bold', getScoreColor(val))}>{val}/100</span>
                </div>
              ))}
              {inspection.comments && <p className="text-xs text-muted-foreground mt-3 italic border-t border-border/20 pt-3">"{inspection.comments}"</p>}
              {inspection.reportPdfUrl && (
                <a
                  href={inspection.reportPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs text-primary hover:underline mt-2"
                >
                  Ver archivo adjunto del peritaje
                </a>
              )}
            </Card>
          )}

          {inspection?.status === 'REJECTED' && inspection?.rejectReason && (
            <Card className="p-4 border border-destructive/30 rounded-2xl bg-destructive/5">
              <p className="text-sm font-semibold text-destructive mb-1">Razón del rechazo</p>
              <p className="text-sm text-foreground">{inspection.rejectReason}</p>
            </Card>
          )}

          <Card className="p-4 border border-border/60 rounded-2xl space-y-2">
            <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">Datos del vehículo</p>
            {[
              ['Marca', vehicle.brand], ['Modelo', vehicle.model], ['Año', vehicle.year],
              ['Placa', vehicle.placa], ['Color', vehicle.color],
              ['Kilometraje', vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString('es-CO')} km` : null],
              ['Combustible', vehicle.fuel_type], ['Tracción', vehicle.traction],
              ['Cilindraje', vehicle.cilindraje], ['Ciudad', vehicle.city || vehicle.ubicacion],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Perito: full inspection form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title={`${vehicle.brand} ${vehicle.model}`} subtitle={`${vehicle.year} · Placa: ${vehicle.placa}`} onBack={handleBack} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {vehicle.photos?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {vehicle.photos.slice(0, 4).map((p, i) => (<img key={i} src={p} alt="" className="w-24 h-18 rounded-xl object-cover flex-shrink-0" />))}
          </div>
        )}

        <Card className="p-4 border border-border/60 text-center rounded-2xl">
          <p className="text-xs text-muted-foreground mb-1">Puntaje global</p>
          <p className={cn("text-4xl font-bold", getScoreColor(getGlobalScore()))}>{getGlobalScore()}<span className="text-lg text-muted-foreground">/100</span></p>
          <p className="text-xs text-muted-foreground mt-1">Promedio de todas las categorías</p>
        </Card>

        <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2">Evaluación por categoría (0–100)</p>
        <div className="space-y-4">
          {PERITAJE_CATEGORIES.map(cat => {
            const val = peritaje[cat.key];
            const score = val.score === '' ? 0 : +val.score;
            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">{cat.label} *</Label>
                  <span className={cn("text-sm font-bold tabular-nums", val.score !== '' ? getScoreColor(score) : 'text-muted-foreground')}>{val.score !== '' ? score : '—'}/100</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider min={0} max={100} step={1} value={[val.score === '' ? 0 : +val.score]} onValueChange={([v]) => setScore(cat.key, 'score', String(v))} className="flex-1" />
                  <Input className="w-16 rounded-xl text-center text-sm" type="number" min={0} max={100} placeholder="0" value={val.score} onChange={e => { let v = e.target.value; if (v !== '' && +v > 100) v = '100'; if (v !== '' && +v < 0) v = '0'; setScore(cat.key, 'score', v); }} />
                </div>
                <Input className="rounded-xl text-xs" placeholder={`Comentario sobre ${cat.label.toLowerCase()} (obligatorio)`} value={val.description} onChange={e => setScore(cat.key, 'description', e.target.value)} />
                {errors[cat.key] && <span className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[cat.key]}</span>}
                {errors[`${cat.key}_desc`] && <span className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[`${cat.key}_desc`]}</span>}
              </div>
            );
          })}
        </div>

        <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
          <Label className="text-xs font-medium">Archivo adjunto del peritaje</Label>
          <div className="relative group cursor-pointer">
            <div className="border-2 border-dashed border-muted-foreground/40 rounded-2xl p-6 text-center transition-all group-hover:border-secondary group-hover:bg-secondary/5">
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-2xl"
                onChange={(e) => setReportPdfFile(e.target.files?.[0] || null)}
                disabled={isReadonly}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-all">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {reportPdfFile ? 'Archivo listo' : 'Seleccionar PDF'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reportPdfFile ? reportPdfFile.name : 'o arrastra aquí'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {inspection?.reportPdfUrl && !reportPdfFile && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-900 font-medium">Archivo guardado</span>
              <a
                href={inspection.reportPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                Ver
              </a>
            </div>
          )}
        </Card>

        {showReject && (
          <Card className="p-4 border border-destructive/30 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-destructive">Razón del rechazo *</p>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Describe por qué rechazas este peritaje..." className="rounded-xl" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)} className="flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={handleReject} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl gap-1"><X className="w-4 h-4" /> Confirmar rechazo</Button>
            </div>
          </Card>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowReject(true)} className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl gap-1"><X className="w-4 h-4" /> Rechazar</Button>
          <Button onClick={handleFinalize} disabled={uploadingPdf} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1">
            <Check className="w-4 h-4" /> {uploadingPdf ? 'Subiendo...' : 'Finalizar'}
          </Button>
        </div>
      </div>
      <BottomNav />

      {/* Unsaved changes dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del peritaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Este peritaje está en progreso. Puedes guardar un borrador para continuar después, liberar el peritaje para que otro perito lo tome, o seguir trabajando.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>Seguir editando</AlertDialogCancel>
            <Button variant="outline" onClick={handleReleaseAndExit} className="border-destructive/30 text-destructive">Liberar peritaje</Button>
            <AlertDialogAction onClick={handleSaveDraftAndExit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Guardar y salir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
