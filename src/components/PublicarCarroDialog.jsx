import React, { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Car, Camera, FileText, ClipboardCheck, ChevronLeft, ChevronRight,
  X, Plus, AlertCircle, Check, Info, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { addVehicle, addInspection, getCurrentUser } from '@/lib/mockStore';

const BRANDS = [
  'Mazda', 'Kia', 'Chevrolet', 'Renault', 'Toyota', 'Nissan', 'Hyundai',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Honda', 'Suzuki',
  'Subaru', 'Jeep', 'Volvo', 'Peugeot', 'Citroën', 'Otro'
];

const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Otra'];
const FUELS = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
const TRACTIONS = ['4x2', '4x4', 'AWD', 'FWD', 'RWD'];
const TRANSMISSIONS = ['Manual', 'Automática', 'CVT'];
const BODY_TYPES = ['Sedán', 'SUV', 'Hatchback', 'Pick-up', 'Coupé'];
const DOORS = ['2', '3', '4', '5'];
const PASSENGERS = ['2', '4', '5', '7'];
const STEERINGS = ['Hidráulica', 'Eléctrica'];
const AC_OPTIONS = ['Sí', 'No'];

const STEPS = [
  { icon: Car, label: 'Vehículo' },
  { icon: Camera, label: 'Fotos' },
  { icon: FileText, label: 'Documentación' },
  { icon: ClipboardCheck, label: 'Solicitar peritaje' },
];

const initialForm = {
  suggested_price: '',
  placa: '', brand: '', model: '', year: '', mileage: '', color: '',
  traction: '', cilindraje: '', fuel_type: '', ubicacion: '',
  transmission: '', body_type: '', doors: '', passengers: '', steering: '', air_conditioning: '',
  cedula: '', nombre_completo: '', email: '', telefono: '',
  tarjeta_propiedad: null,
  photos: [],
  soat_status: '', soat_fecha: '',
  tecno_status: '', tecno_fecha: '',
  tiene_multas: '', multas_descripcion: '',
};

export default function PublicarCarroDialog({ open, onOpenChange, onPublished }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(JSON.parse(JSON.stringify(initialForm)));
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const tpInputRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const formatCOP = (val) => {
    const n = parseInt(val);
    if (isNaN(n)) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.suggested_price || isNaN(form.suggested_price) || +form.suggested_price <= 0) e.suggested_price = 'Precio inválido';
      ['placa','brand','model','year','mileage','color','traction','cilindraje','fuel_type','ubicacion'].forEach(k => {
        if (!form[k]) e[k] = 'Obligatorio';
      });
      if (form.year && (isNaN(form.year) || +form.year < 1990 || +form.year > 2026)) e.year = 'Año inválido';
      if (form.mileage && (isNaN(form.mileage) || +form.mileage < 0)) e.mileage = 'Kilometraje inválido';
      ['cedula','nombre_completo','email','telefono'].forEach(k => { if (!form[k]) e[k] = 'Obligatorio'; });
      if (form.email && !validateEmail(form.email)) e.email = 'Email inválido';
    }
    if (step === 1) {
      if (!form.tarjeta_propiedad) e.tarjeta_propiedad = 'Tarjeta de propiedad obligatoria';
      if (form.photos.length < 5) e.photos = 'Mínimo 5 fotos del vehículo';
    }
    if (step === 2) {
      if (!form.soat_status) e.soat_status = 'Obligatorio';
      if (form.soat_status && !form.soat_fecha) e.soat_fecha = 'Fecha obligatoria';
      if (!form.tecno_status) e.tecno_status = 'Obligatorio';
      if (form.tecno_status && !form.tecno_fecha) e.tecno_fecha = 'Fecha obligatoria';
      if (!form.tiene_multas) e.tiene_multas = 'Obligatorio';
      if (form.tiene_multas === 'si' && !form.multas_descripcion.trim()) e.multas_descripcion = 'Describe las multas';
    }
    // Step 3 (summary) has no validation
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, photos: [...prev.photos, ev.target.result] }));
        setErrors(prev => ({ ...prev, photos: undefined }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleTP = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { set('tarjeta_propiedad', ev.target.result); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  const handleSubmitRequest = () => {
    // Build specs object from form
    const specs = {};
    if (form.transmission) specs.transmission = form.transmission;
    if (form.body_type) specs.body_type = form.body_type;
    if (form.doors) specs.doors = parseInt(form.doors);
    if (form.passengers) specs.passengers = parseInt(form.passengers);
    if (form.steering) specs.steering = form.steering;
    if (form.air_conditioning) specs.air_conditioning = form.air_conditioning === 'Sí';

    // Create vehicle in store
    const vehicle = addVehicle({
      brand: form.brand, model: form.model, year: +form.year,
      city: form.ubicacion, mileage: +form.mileage, color: form.color,
      traction: form.traction, cilindraje: form.cilindraje,
      fuel_type: form.fuel_type, placa: form.placa,
      ubicacion: form.ubicacion,
      specs: Object.keys(specs).length > 0 ? specs : null,
      seller: { cedula: form.cedula, nombre: form.nombre_completo, email: form.email, telefono: form.telefono },
      tarjeta_propiedad: form.tarjeta_propiedad,
      photos: form.photos,
      suggested_price: +form.suggested_price,
      documentation: {
        soat: { status: form.soat_status, fecha: form.soat_fecha },
        tecno: { status: form.tecno_status, fecha: form.tecno_fecha },
        multas: { tiene: form.tiene_multas, descripcion: form.multas_descripcion },
      },
      status: 'PENDING_INSPECTION',
      dealerId: currentUser?.id,
      dealerCompany: currentUser?.company,
      dealerBranch: currentUser?.branch,
    });

    // Create inspection request
    addInspection({
      vehicleId: vehicle.id,
      dealerId: currentUser?.id,
      dealerCompany: currentUser?.company || '',
      dealerBranch: currentUser?.branch || '',
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      lockedByPeritoId: null,
    });

    toast.success('Solicitud de peritaje enviada', {
      description: `${vehicle.brand} ${vehicle.model} · Un perito de tu sucursal realizará la inspección`,
    });

    onPublished?.(vehicle);
    setForm(JSON.parse(JSON.stringify(initialForm)));
    setStep(0);
    onOpenChange(false);
    navigate('/MisSubastas');
  };

  const fieldError = (key) => errors[key] ? (
    <span className="text-destructive text-xs flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors[key]}</span>
  ) : null;

  const SectionTitle = ({ children }) => (
    <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">{children}</p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border/40">
          <DialogTitle className="text-xl font-bold font-sans">Publicar carro</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Paso {step + 1} de 4 — {STEPS[step].label}
          </DialogDescription>
          <div className="flex items-center gap-2 pt-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                    done ? "bg-primary text-primary-foreground" :
                    active ? "bg-secondary text-secondary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 rounded", done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5 space-y-5">
          {/* STEP 0: Vehicle + Price + Seller */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <SectionTitle>Precio</SectionTitle>
                <div>
                  <Label className="text-xs font-medium">Precio sugerido por vendedor (COP) *</Label>
                  <Input className="mt-1 rounded-xl" type="number" placeholder="55000000"
                    value={form.suggested_price} onChange={e => set('suggested_price', e.target.value)} />
                  {form.suggested_price && !isNaN(form.suggested_price) && +form.suggested_price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{formatCOP(form.suggested_price)}</p>
                  )}
                  {fieldError('suggested_price')}
                </div>
              </div>
              <div>
                <SectionTitle>Datos del vehículo</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-medium">Placa *</Label><Input className="mt-1 rounded-xl" placeholder="ABC123" maxLength={7} value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} />{fieldError('placa')}</div>
                  <div><Label className="text-xs font-medium">Marca *</Label><Select value={form.brand} onValueChange={v => set('brand', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>{fieldError('brand')}</div>
                  <div><Label className="text-xs font-medium">Modelo *</Label><Input className="mt-1 rounded-xl" placeholder="Ej: X3, Sportage" value={form.model} onChange={e => set('model', e.target.value)} />{fieldError('model')}</div>
                  <div><Label className="text-xs font-medium">Año *</Label><Input className="mt-1 rounded-xl" type="number" placeholder="2022" value={form.year} onChange={e => set('year', e.target.value)} />{fieldError('year')}</div>
                  <div><Label className="text-xs font-medium">Kilometraje *</Label><Input className="mt-1 rounded-xl" type="number" placeholder="45000" value={form.mileage} onChange={e => set('mileage', e.target.value)} />{fieldError('mileage')}</div>
                  <div><Label className="text-xs font-medium">Color *</Label><Input className="mt-1 rounded-xl" placeholder="Negro" value={form.color} onChange={e => set('color', e.target.value)} />{fieldError('color')}</div>
                  <div><Label className="text-xs font-medium">Tracción *</Label><Select value={form.traction} onValueChange={v => set('traction', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{TRACTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>{fieldError('traction')}</div>
                  <div><Label className="text-xs font-medium">Cilindraje *</Label><Input className="mt-1 rounded-xl" placeholder="Ej: 2000cc" value={form.cilindraje} onChange={e => set('cilindraje', e.target.value)} />{fieldError('cilindraje')}</div>
                  <div><Label className="text-xs font-medium">Combustible *</Label><Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{FUELS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>{fieldError('fuel_type')}</div>
                  <div><Label className="text-xs font-medium">Ubicación / Sucursal *</Label><Select value={form.ubicacion} onValueChange={v => set('ubicacion', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>{fieldError('ubicacion')}</div>
                  <div><Label className="text-xs font-medium">Transmisión</Label><Select value={form.transmission} onValueChange={v => set('transmission', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Tipo de carrocería</Label><Select value={form.body_type} onValueChange={v => set('body_type', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Número de puertas</Label><Select value={form.doors} onValueChange={v => set('doors', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{DOORS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Número de pasajeros</Label><Select value={form.passengers} onValueChange={v => set('passengers', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{PASSENGERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Dirección</Label><Select value={form.steering} onValueChange={v => set('steering', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{STEERINGS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Aire acondicionado</Label><Select value={form.air_conditioning} onValueChange={v => set('air_conditioning', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{AC_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div>
                <SectionTitle>Datos personales del vendedor</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-medium">Cédula (CC) *</Label><Input className="mt-1 rounded-xl" placeholder="1234567890" value={form.cedula} onChange={e => set('cedula', e.target.value)} />{fieldError('cedula')}</div>
                  <div><Label className="text-xs font-medium">Nombre completo *</Label><Input className="mt-1 rounded-xl" placeholder="Juan Pérez" value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)} />{fieldError('nombre_completo')}</div>
                  <div><Label className="text-xs font-medium">Email *</Label><Input className="mt-1 rounded-xl" type="email" placeholder="juan@email.com" value={form.email} onChange={e => set('email', e.target.value)} />{fieldError('email')}</div>
                  <div><Label className="text-xs font-medium">Teléfono *</Label><Input className="mt-1 rounded-xl" type="tel" placeholder="3001234567" value={form.telefono} onChange={e => set('telefono', e.target.value)} />{fieldError('telefono')}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Photos */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <SectionTitle>Tarjeta de propiedad (obligatorio)</SectionTitle>
                <p className="text-xs text-muted-foreground mb-3">Sube una foto clara de la tarjeta de propiedad del vehículo.</p>
                {form.tarjeta_propiedad ? (
                  <div className="relative w-48 h-32 rounded-xl overflow-hidden border border-border/60 group">
                    <img src={form.tarjeta_propiedad} alt="Tarjeta de propiedad" className="w-full h-full object-cover" />
                    <button onClick={() => set('tarjeta_propiedad', null)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive/80 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => tpInputRef.current?.click()}
                    className="w-48 h-32 rounded-xl border-2 border-dashed border-border hover:border-secondary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
                    <Upload className="w-5 h-5" /><span className="text-xs font-medium">Subir tarjeta</span>
                  </button>
                )}
                <input ref={tpInputRef} type="file" accept="image/*" className="hidden" onChange={handleTP} />
                {fieldError('tarjeta_propiedad')}
              </div>
              <div>
                <SectionTitle>Fotos del vehículo (mínimo 5)</SectionTitle>
                <p className="text-xs text-muted-foreground mb-3">La primera foto será la portada de tu publicación.</p>
                <div className="grid grid-cols-4 gap-2">
                  {form.photos.map((src, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/60 group">
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && <Badge className="absolute top-1 left-1 bg-secondary text-secondary-foreground text-[10px]">Portada</Badge>}
                      <button onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive/80 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-secondary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-secondary transition-colors">
                    <Plus className="w-5 h-5" /><span className="text-[10px] font-medium">Agregar</span>
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                <p className="text-xs text-muted-foreground mt-2">{form.photos.length} de 5 mínimo</p>
                {fieldError('photos')}
              </div>
            </div>
          )}

          {/* STEP 2: Documentation */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3 border border-border/40">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">En el futuro esta información podrá ser validada automáticamente mediante integración con RUNT.</p>
              </div>
              <div>
                <SectionTitle>SOAT</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-medium">Estado *</Label><Select value={form.soat_status} onValueChange={v => set('soat_status', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="vigente">Vigente</SelectItem><SelectItem value="no_vigente">No vigente</SelectItem></SelectContent></Select>{fieldError('soat_status')}</div>
                  <div><Label className="text-xs font-medium">Fecha de vencimiento *</Label><Input className="mt-1 rounded-xl" type="date" value={form.soat_fecha} onChange={e => set('soat_fecha', e.target.value)} />{fieldError('soat_fecha')}</div>
                </div>
              </div>
              <div>
                <SectionTitle>Técnico-mecánica</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-medium">Estado *</Label><Select value={form.tecno_status} onValueChange={v => set('tecno_status', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="vigente">Vigente</SelectItem><SelectItem value="no_vigente">No vigente</SelectItem></SelectContent></Select>{fieldError('tecno_status')}</div>
                  <div><Label className="text-xs font-medium">Fecha de vencimiento *</Label><Input className="mt-1 rounded-xl" type="date" value={form.tecno_fecha} onChange={e => set('tecno_fecha', e.target.value)} />{fieldError('tecno_fecha')}</div>
                </div>
              </div>
              <div>
                <SectionTitle>Multas</SectionTitle>
                <div className="space-y-3">
                  <div><Label className="text-xs font-medium">¿Tiene multas? *</Label><Select value={form.tiene_multas} onValueChange={v => set('tiene_multas', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="si">Sí</SelectItem></SelectContent></Select>{fieldError('tiene_multas')}</div>
                  {form.tiene_multas === 'si' && (
                    <div><Label className="text-xs font-medium">Descripción de multas *</Label><Textarea className="mt-1 rounded-xl min-h-[60px]" placeholder="Ej: 1 multa por velocidad $180.000" value={form.multas_descripcion} onChange={e => set('multas_descripcion', e.target.value)} />{fieldError('multas_descripcion')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Summary + Solicitar peritaje */}
          {step === 3 && (
            <div className="space-y-5">
              <Card className="p-4 border border-border/60 rounded-xl">
                <h3 className="font-bold text-foreground mb-3 font-sans">Resumen del vehículo</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Marca:</span> <span className="font-medium text-foreground">{form.brand}</span></div>
                  <div><span className="text-muted-foreground">Modelo:</span> <span className="font-medium text-foreground">{form.model}</span></div>
                  <div><span className="text-muted-foreground">Año:</span> <span className="font-medium text-foreground">{form.year}</span></div>
                  <div><span className="text-muted-foreground">Placa:</span> <span className="font-medium text-foreground">{form.placa}</span></div>
                  <div><span className="text-muted-foreground">Km:</span> <span className="font-medium text-foreground">{Number(form.mileage || 0).toLocaleString('es-CO')}</span></div>
                  <div><span className="text-muted-foreground">Color:</span> <span className="font-medium text-foreground">{form.color}</span></div>
                  <div><span className="text-muted-foreground">Precio:</span> <span className="font-bold text-primary">{formatCOP(form.suggested_price)}</span></div>
                  <div><span className="text-muted-foreground">Fotos:</span> <span className="font-medium text-foreground">{form.photos.length}</span></div>
                </div>
              </Card>

              {form.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {form.photos.slice(0, 6).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0 border border-border/40" />
                  ))}
                </div>
              )}

              <div className="flex items-start gap-3 bg-secondary/5 rounded-xl p-4 border border-secondary/10">
                <ClipboardCheck className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Solicitar peritaje</p>
                  <p className="text-xs text-muted-foreground">
                    Un perito de tu sucursal ({currentUser?.branch || 'N/A'}) realizará la inspección del vehículo.
                    Una vez aprobado el peritaje, el vehículo se publicará automáticamente a subasta.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            {step > 0 ? (
              <Button variant="ghost" onClick={back} className="rounded-xl gap-1"><ChevronLeft className="w-4 h-4" /> Atrás</Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={next} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1">
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmitRequest} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1.5">
                <ClipboardCheck className="w-4 h-4" /> Solicitar peritaje
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
