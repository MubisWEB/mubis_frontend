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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, AlertCircle, Camera, FileText, ClipboardCheck, ChevronLeft, ChevronRight, Plus, Upload, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { inspectionsApi, mediaApi, vehiclesApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

const PERITO_STEPS = [
  { id: 0, label: 'Fotos', icon: Camera },
  { id: 1, label: 'Documentación', icon: FileText },
  { id: 2, label: 'Evaluación', icon: ClipboardCheck },
  { id: 3, label: 'Finalizar', icon: Check },
];

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

  // Perito step-by-step states
  const [step, setStep] = useState(0);
  const [vehiclePhotos, setVehiclePhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [tarjetaPropiedadPhoto, setTarjetaPropiedadPhoto] = useState(null);
  const [tarjetaPropiedadFile, setTarjetaPropiedadFile] = useState(null);
  const [documentacion, setDocumentacion] = useState({
    soat: { status: '', fechaVencimiento: '' },
    tecnomecanica: { status: '', fechaVencimiento: '' },
    multas: { tiene: '', descripcion: '' },
  });
  const [startingPrice, setStartingPrice] = useState('');
  const photoInputRef = useRef(null);
  const tarjetaInputRef = useRef(null);

  const getDraftKey = () => `peritaje_draft_${vehicleId}`;

  // Check if form has any data entered
  const hasFormData = useCallback(() => {
    return PERITAJE_CATEGORIES.some(c => peritaje[c.key].score !== '' || peritaje[c.key].description.trim() !== '') 
      || rejectReason.trim() !== '' 
      || !!reportPdfFile 
      || vehiclePhotos.length > 0 
      || photoFiles.length > 0
      || !!tarjetaPropiedadFile
      || documentacion.soat.status !== ''
      || documentacion.tecnomecanica.status !== ''
      || documentacion.multas.tiene !== ''
      || startingPrice !== '';
  }, [documentacion, peritaje, photoFiles, rejectReason, reportPdfFile, startingPrice, tarjetaPropiedadFile, vehiclePhotos]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (!vehicleId) return;
    localStorage.setItem(getDraftKey(), JSON.stringify({ 
      peritaje, 
      rejectReason, 
      step, 
      documentacion,
      startingPrice,
      hasPendingFiles: !!reportPdfFile || photoFiles.length > 0 || !!tarjetaPropiedadFile,
    }));
  }, [documentacion, peritaje, photoFiles.length, rejectReason, reportPdfFile, startingPrice, tarjetaPropiedadFile, vehicleId]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!vehicleId) return;
    const saved = localStorage.getItem(getDraftKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.peritaje) setPeritaje(parsed.peritaje);
        if (parsed.rejectReason) setRejectReason(parsed.rejectReason);
        if (parsed.step !== undefined) setStep(parsed.step);
        if (parsed.documentacion) setDocumentacion(parsed.documentacion);
        if (parsed.startingPrice) setStartingPrice(parsed.startingPrice);
        toast.info('Borrador recuperado', { description: parsed.hasPendingFiles ? 'Se restauraron los campos guardados. Debes volver a adjuntar fotos y archivos.' : 'Se cargaron los datos guardados previamente.' });
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

  // Pre-fill startingPrice from dealer's suggested price when vehicle loads
  useEffect(() => {
    if (!vehicle || startingPrice) return; // Don't override if already has a value
    const suggestedPrice = vehicle?.specs?._startingPrice;
    if (suggestedPrice) {
      setStartingPrice(String(suggestedPrice));
    }
  }, [vehicle]);

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
    });
    if (!reportPdfFile && !inspection?.reportPdfUrl) {
      e.reportPdf = 'Debes adjuntar el archivo PDF del peritaje';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Validation for each step
  const validateStep = (stepNum) => {
    const e = {};
    if (stepNum === 0) {
      if (vehiclePhotos.length === 0 && photoFiles.length === 0) {
        e.photos = 'Debes agregar al menos una foto del vehículo';
      }
      if (!tarjetaPropiedadPhoto && !tarjetaPropiedadFile) {
        e.tarjetaPropiedad = 'La foto de la tarjeta de propiedad es obligatoria';
      }
    } else if (stepNum === 1) {
      // Step 2: Documentación
      if (!documentacion.soat.status) e.soatStatus = 'Selecciona el estado del SOAT';
      if (documentacion.soat.status && !documentacion.soat.fechaVencimiento) e.soatFecha = 'Ingresa la fecha de vencimiento';
      if (!documentacion.tecnomecanica.status) e.tecnoStatus = 'Selecciona el estado de la tecnomecánica';
      if (documentacion.tecnomecanica.status && !documentacion.tecnomecanica.fechaVencimiento) e.tecnoFecha = 'Ingresa la fecha de vencimiento';
      if (!documentacion.multas.tiene) e.multasTiene = 'Indica si el vehículo tiene multas';
      if (documentacion.multas.tiene === 'si' && !documentacion.multas.descripcion.trim()) e.multasDesc = 'Describe las multas';
    } else if (stepNum === 2) {
      // Step 3: Evaluación - uses existing validate
      return validate();
    } else if (stepNum === 3) {
      if (!startingPrice || isNaN(startingPrice) || +startingPrice <= 0) {
        e.startingPrice = 'Ingresa un precio recomendado válido';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      saveDraft();
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    saveDraft();
    setStep(prev => Math.max(prev - 1, 0));
  };

  // Photo handling
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setVehiclePhotos(prev => [...prev, ...newPreviews]);
    setPhotoFiles(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, photos: undefined }));
  };

  const handleRemovePhoto = (index) => {
    setVehiclePhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Documentation handlers
  const updateDocumentacion = (section, field, value) => {
    setDocumentacion(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    setErrors(prev => ({ ...prev, [`${section}${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined }));
  };

  const handleFinalize = async () => {
    if (!validateStep(3)) return;
    if (!inspection) return;
    const globalScore = getGlobalScore();
    try {
      setUploadingPdf(true);
      
      // Upload vehicle photos first
      let uploadedPhotoUrls = [];
      const allPhotoFiles = [...photoFiles];
      if (tarjetaPropiedadFile) allPhotoFiles.push(tarjetaPropiedadFile);
      if (allPhotoFiles.length > 0) {
        const photoUploadRes = await mediaApi.upload(allPhotoFiles);
        // Handle both { urls: [...] } and direct [...] response formats
        uploadedPhotoUrls = Array.isArray(photoUploadRes) ? photoUploadRes : (photoUploadRes?.urls || []);
      }

      // Upload PDF if selected
      let reportPdfUrl;
      if (reportPdfFile) {
        const uploadRes = await mediaApi.upload([reportPdfFile]);
        reportPdfUrl = Array.isArray(uploadRes) ? uploadRes[0] : (uploadRes?.urls?.[0]);
      }

      // Build documentation for backend
      const docForBackend = {
        soat: { 
          status: documentacion.soat.status, 
          fecha: documentacion.soat.fechaVencimiento 
        },
        tecno: { 
          status: documentacion.tecnomecanica.status, 
          fecha: documentacion.tecnomecanica.fechaVencimiento 
        },
        multas: { 
          tiene: documentacion.multas.tiene === 'si', 
          descripcion: documentacion.multas.descripcion 
        },
      };

      // Convert scores from 0-100 to 0-10 for backend
      const scoresForBackend = {};
      PERITAJE_CATEGORIES.forEach(cat => {
        const score100 = +peritaje[cat.key].score || 0;
        scoresForBackend[cat.key] = Math.round(score100 / 10); // Convert 0-100 to 0-10
      });

      // Build comments from all descriptions
      const comments = PERITAJE_CATEGORIES
        .map(cat => `${cat.label}: ${peritaje[cat.key].description}`)
        .join(' | ');

      // Complete inspection with all data (including photos and documentation)
      await inspectionsApi.complete(inspection.id, {
        scores: scoresForBackend,
        comments,
        reportPdfUrl,
        startingPrice: +startingPrice,
        vehiclePhotos: uploadedPhotoUrls,
        documentation: docForBackend,
      });
      
      toast.success('Peritaje finalizado', { description: `${vehicle?.brand || ''} ${vehicle?.model || ''} · Score: ${globalScore}/100` });
      localStorage.removeItem(getDraftKey());
      navigate('/PeritajesPendientes');
    } catch (err) {
      console.error('Error al finalizar:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Error desconocido';
      toast.error('Error al finalizar el peritaje', { description: errorMsg });
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
    return (<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Vehículo no encontrado</p></div>);
  }

  // ── Dealer: read-only view ────────────────────────────────────────────────
  if (isDealer) {
    const statusLabel = inspection?.status === 'COMPLETED' ? 'Aprobado'
      : inspection?.status === 'REJECTED' ? 'Rechazado'
      : inspection?.status === 'IN_PROGRESS' ? 'Pendiente de peritaje'
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
              <p className="text-xs text-muted-foreground mb-1">Estado del vehículo</p>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusClass}`}>{statusLabel}</span>
            </div>
            {inspection?.status === 'COMPLETED' && inspection?.scoreGlobal != null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Score global</p>
                <p className={cn('text-3xl font-bold', getScoreColor(inspection.scoreGlobal * 10))}>{Math.round(inspection.scoreGlobal * 10)}<span className="text-sm text-muted-foreground">/100</span></p>
              </div>
            )}
          </Card>

          {inspection?.status === 'COMPLETED' && inspection?.scores && (
            <Card className="p-4 border border-border/60 rounded-2xl space-y-2">
              <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">Resultados por categoría</p>
              {Object.entries(inspection.scores).map(([key, val]) => {
                const score100 = Math.round(val * 10);
                return (
                <div key={key} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                  <span className="text-sm text-foreground capitalize">{key}</span>
                  <span className={cn('text-sm font-bold', getScoreColor(score100))}>{score100}/100</span>
                </div>);
              })}
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

  // ── Perito: full inspection form (3-step process) ─────────────────────────
  
  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {PERITO_STEPS.map((s, idx) => {
        const Icon = s.icon;
        const isCompleted = idx < step;
        const isCurrent = idx === step;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted ? "bg-primary text-primary-foreground" :
                  isCurrent ? "bg-secondary text-secondary-foreground ring-2 ring-secondary ring-offset-2" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "text-xs mt-1.5 font-medium",
                isCurrent ? "text-secondary" : isCompleted ? "text-primary" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
            {idx < PERITO_STEPS.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mb-5",
                idx < step ? "bg-primary" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Step 1: Fotos del vehículo
  const renderStep0 = () => (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">
          Fotos del vehículo
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Toma o selecciona fotos del vehículo desde diferentes ángulos. Mínimo 1 foto requerida.
        </p>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3">
        {vehiclePhotos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border/40 group">
            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Add photo button */}
        <div 
          onClick={() => photoInputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all"
        >
          <Plus className="w-6 h-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mt-1">Agregar</span>
        </div>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* Existing vehicle photos */}
      {vehicle.photos?.length > 0 && (
        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-2">Fotos existentes del vehículo:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {vehicle.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0 border border-border/40 opacity-60" />
            ))}
          </div>
        </div>
      )}

      {errors.photos && (
        <span className="text-destructive text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{errors.photos}
        </span>
      )}

      {/* Tarjeta de propiedad */}
      <div className="pt-4 border-t border-border/40">
        <p className="text-sm font-semibold text-foreground mb-1">Tarjeta de propiedad *</p>
        <p className="text-xs text-muted-foreground mb-3">
          Toma o selecciona una foto clara de la tarjeta de propiedad del vehículo.
        </p>
        {tarjetaPropiedadPhoto ? (
          <div className="relative w-full max-w-xs aspect-[3/2] rounded-xl overflow-hidden border border-border/40 group">
            <img src={tarjetaPropiedadPhoto} alt="Tarjeta de propiedad" className="w-full h-full object-cover" />
            <button
              onClick={() => { setTarjetaPropiedadPhoto(null); setTarjetaPropiedadFile(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => tarjetaInputRef.current?.click()}
            className={cn(
              "w-full max-w-xs aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-secondary hover:bg-secondary/5",
              errors.tarjetaPropiedad ? "border-destructive/60" : "border-muted-foreground/40"
            )}
          >
            <Camera className="w-8 h-8 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">Foto tarjeta de propiedad</span>
          </div>
        )}
        <input
          ref={tarjetaInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setTarjetaPropiedadPhoto(URL.createObjectURL(file));
              setTarjetaPropiedadFile(file);
              setErrors(prev => ({ ...prev, tarjetaPropiedad: undefined }));
            }
          }}
        />
        {errors.tarjetaPropiedad && (
          <span className="text-destructive text-xs flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3" />{errors.tarjetaPropiedad}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleNextStep} 
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Documentación
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">
          Documentación del vehículo
        </p>
      </div>

      {/* SOAT */}
      <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">SOAT</Label>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Estado *</Label>
            <Select 
              value={documentacion.soat.status} 
              onValueChange={(val) => updateDocumentacion('soat', 'status', val)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            {errors.soatStatus && (
              <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.soatStatus}
              </span>
            )}
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Fecha de vencimiento *</Label>
            <div className="relative">
              <Input
                type="date"
                value={documentacion.soat.fechaVencimiento}
                onChange={(e) => updateDocumentacion('soat', 'fechaVencimiento', e.target.value)}
                className="rounded-xl"
              />
            </div>
            {errors.soatFecha && (
              <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.soatFecha}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Tecnomecánica */}
      <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Tecnomecánica</Label>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Estado *</Label>
            <Select 
              value={documentacion.tecnomecanica.status} 
              onValueChange={(val) => updateDocumentacion('tecnomecanica', 'status', val)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
              </SelectContent>
            </Select>
            {errors.tecnoStatus && (
              <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.tecnoStatus}
              </span>
            )}
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Fecha de vencimiento *</Label>
            <Input
              type="date"
              value={documentacion.tecnomecanica.fechaVencimiento}
              onChange={(e) => updateDocumentacion('tecnomecanica', 'fechaVencimiento', e.target.value)}
              className="rounded-xl"
            />
            {errors.tecnoFecha && (
              <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.tecnoFecha}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Multas */}
      <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Multas</Label>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">¿Tiene multas? *</Label>
            <Select 
              value={documentacion.multas.tiene} 
              onValueChange={(val) => updateDocumentacion('multas', 'tiene', val)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="si">Sí</SelectItem>
              </SelectContent>
            </Select>
            {errors.multasTiene && (
              <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.multasTiene}
              </span>
            )}
          </div>
          
          {documentacion.multas.tiene === 'si' && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Descripción de multas *</Label>
              <Textarea
                value={documentacion.multas.descripcion}
                onChange={(e) => updateDocumentacion('multas', 'descripcion', e.target.value)}
                placeholder="Describe las multas del vehículo..."
                className="rounded-xl"
              />
              {errors.multasDesc && (
                <span className="text-destructive text-xs flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />{errors.multasDesc}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevStep} 
          className="flex-1 rounded-xl gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button 
          onClick={handleNextStep} 
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Evaluación (PDF arriba + puntajes con comentarios opcionales)
  const renderStep2 = () => (
    <div className="space-y-5">
      {/* PDF Upload - arriba */}
      <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
        <Label className="text-sm font-semibold">Archivo PDF del peritaje *</Label>
        <p className="text-xs text-muted-foreground">
          Adjunta el PDF con el informe completo del peritaje antes de evaluar.
        </p>
        <div className="relative group cursor-pointer">
          <div className={cn(
            "border-2 border-dashed rounded-2xl p-5 text-center transition-all group-hover:border-secondary group-hover:bg-secondary/5",
            errors.reportPdf ? "border-destructive/60" : "border-muted-foreground/40"
          )}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-2xl"
              onChange={(e) => { setReportPdfFile(e.target.files?.[0] || null); setErrors(prev => ({ ...prev, reportPdf: undefined })); }}
              disabled={isReadonly}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-all">
                <Upload className="w-5 h-5 text-secondary" />
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
        {errors.reportPdf && (
          <span className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.reportPdf}
          </span>
        )}
        {inspection?.reportPdfUrl && !reportPdfFile && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-xs text-emerald-900 font-medium">Archivo guardado</span>
            <a href={inspection.reportPdfUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 hover:underline font-medium">Ver</a>
          </div>
        )}
      </Card>

      {/* Puntaje global */}
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
              <Input className="rounded-xl text-xs" placeholder={`Comentario sobre ${cat.label.toLowerCase()} (opcional)`} value={val.description} onChange={e => setScore(cat.key, 'description', e.target.value)} />
              {errors[cat.key] && <span className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[cat.key]}</span>}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="flex-1 rounded-xl gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button
          onClick={handleNextStep}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Step 4: Finalizar - PDF, precio de salida y confirmación
  const renderStep3 = () => {
    const suggestedPrice = vehicle?.specs?._startingPrice;
    
    return (
    <div className="space-y-5">
      <Card className="p-4 border border-border/60 text-center rounded-2xl">
        <p className="text-xs text-muted-foreground mb-1">Puntaje global</p>
        <p className={cn("text-4xl font-bold", getScoreColor(getGlobalScore()))}>{getGlobalScore()}<span className="text-lg text-muted-foreground">/100</span></p>
        <p className="text-xs text-muted-foreground mt-1">Promedio de todas las categorías</p>
      </Card>

      {/* Precio recomendado */}
      <Card className="p-4 border border-border/60 rounded-2xl space-y-3">
        <Label className="text-sm font-semibold">Precio recomendado *</Label>
        {suggestedPrice && (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              Precio sugerido por el dealer: ${Number(suggestedPrice).toLocaleString('es-CO')} COP
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Puedes mantener este precio o ajustarlo según tu evaluación.
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Define el precio recomendado en COP después de tu revisión. La subasta iniciará en $0.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            min={0}
            placeholder="50.000.000"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            className="pl-7 rounded-xl"
            disabled={isReadonly}
          />
        </div>
        {errors.startingPrice && (
          <span className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.startingPrice}
          </span>
        )}
        {startingPrice && +startingPrice > 0 && (
          <p className="text-xs text-muted-foreground">
            Precio formateado: ${Number(startingPrice).toLocaleString('es-CO')} COP
          </p>
        )}
      </Card>

      {/* PDF status indicator */}
      {reportPdfFile && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <FileText className="w-4 h-4 text-emerald-700" />
          <span className="text-xs text-emerald-900 font-medium flex-1">PDF adjuntado: {reportPdfFile.name}</span>
        </div>
      )}

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

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button 
          variant="outline" 
          onClick={handlePrevStep} 
          className="rounded-xl gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowReject(true)} 
          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl gap-1"
        >
          <X className="w-4 h-4" /> Rechazar
        </Button>
        <Button 
          onClick={handleFinalize} 
          disabled={uploadingPdf} 
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1"
        >
          <Check className="w-4 h-4" /> {uploadingPdf ? 'Subiendo...' : 'Finalizar'}
        </Button>
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title={`${vehicle.brand} ${vehicle.model}`} subtitle={`${vehicle.year} · Placa: ${vehicle.placa}`} onBack={handleBack} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step indicator */}
        <StepIndicator />

        {/* Step content */}
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
