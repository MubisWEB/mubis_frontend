import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Car, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi, publicationsApi } from '@/api/services';

const BRANDS = [
  'Mazda', 'Kia', 'Chevrolet', 'Renault', 'Toyota', 'Nissan', 'Hyundai',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Honda', 'Suzuki',
  'Subaru', 'Jeep', 'Volvo', 'Peugeot', 'Citroën', 'Otro'
];

const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Otra'];
const FUELS = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
const TRANSMISSIONS = ['Manual', 'Automática', 'CVT'];
const BODY_TYPES = ['Sedán', 'SUV', 'Hatchback', 'Pick-up', 'Coupé'];
const DOORS = ['2', '3', '4', '5'];
const PASSENGERS = ['2', '4', '5', '7'];
const STEERINGS = ['Hidráulica', 'Eléctrica'];
const AC_OPTIONS = ['Sí', 'No'];

const STEPS = [
  { icon: Car, label: 'Vehículo' },
];

const initialForm = {
  startingPrice: '',
  placa: '', brand: '', model: '', year: '', km: '', color: '',
  cilindraje: '', combustible: '', city: '',
  transmision: '', body_type: '', doors: '', passengers: '', steering: '', air_conditioning: '',
  cedula: '', nombre_completo: '', email: '', telefono: '',
};



export default function PublicarCarroDialog({ open, onOpenChange, onPublished }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(JSON.parse(JSON.stringify(initialForm)));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
    if (!form.startingPrice || isNaN(form.startingPrice) || +form.startingPrice <= 0) e.startingPrice = 'Precio inválido';
    ['placa','brand','model','year','km','color','cilindraje','combustible','city','transmision'].forEach(k => {
      if (!form[k]) e[k] = 'Obligatorio';
    });
    if (form.year && (isNaN(form.year) || +form.year < 2000 || +form.year > 2025)) e.year = 'Año inválido';
    if (form.km && (isNaN(form.km) || +form.km < 0)) e.km = 'Kilometraje inválido';
    ['cedula','nombre_completo','email','telefono'].forEach(k => { if (!form[k]) e[k] = 'Obligatorio'; });
    if (form.email && !validateEmail(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };





  const handleSubmitRequest = async () => {
    if (!validateStep()) return;
    
    setSubmitting(true);
    try {
      const { balance } = await publicationsApi.getBalance();
      if (balance < 1) {
        toast.error('Sin publicaciones disponibles', { description: 'Recarga publicaciones desde tu cuenta para poder publicar.' });
        return;
      }

      // Build specs object
      const specs = {};
      if (form.body_type) specs.body_type = form.body_type;
      if (form.doors) specs.doors = parseInt(form.doors);
      if (form.passengers) specs.passengers = parseInt(form.passengers);
      if (form.steering) specs.steering = form.steering;
      if (form.air_conditioning) specs.air_conditioning = form.air_conditioning === 'Sí';
      // Store seller info in specs for reference
      specs.seller = { 
        cedula: form.cedula, 
        nombre: form.nombre_completo, 
        email: form.email, 
        telefono: form.telefono 
      };

      // Empty documentation and photos - perito will fill these
      const documentation = {};
      const photos = [];

      const vehicle = await vehiclesApi.create({
        brand: form.brand, 
        model: form.model, 
        year: +form.year,
        km: +form.km,
        city: form.city, 
        color: form.color,
        cilindraje: form.cilindraje,
        combustible: form.combustible,
        transmision: form.transmision,
        placa: form.placa,
        photos,
        documentation,
        specs,
        startingPrice: +form.startingPrice,
      });

      toast.success('Vehículo enviado a peritaje', {
        description: `${vehicle.brand} ${vehicle.model} · Año ${vehicle.year}`,
      });

      onPublished?.(vehicle);
      setForm(JSON.parse(JSON.stringify(initialForm)));
      setStep(0);
      onOpenChange(false);
      navigate('/MisSubastas');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al enviar el vehículo');
    } finally {
      setSubmitting(false);
    }
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
          <DialogTitle className="text-xl font-bold font-sans">Enviar vehículo a peritaje</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Completa los datos del vehículo. El perito completará las fotos, documentación y evaluación.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5 space-y-5">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <SectionTitle>Precio sugerido</SectionTitle>
                <div>
                  <Label className="text-xs font-medium">Precio sugerido por el dealer (COP) *</Label>
                  <Input className="mt-1 rounded-xl" type="number" placeholder="55000000"
                    value={form.startingPrice} onChange={e => set('startingPrice', e.target.value)} />
                  {form.startingPrice && !isNaN(form.startingPrice) && +form.startingPrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{formatCOP(form.startingPrice)}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">El perito podrá ajustar este precio durante el peritaje</p>
                  {fieldError('startingPrice')}
                </div>
              </div>
              <div>
                <SectionTitle>Datos del vehículo</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-medium">Placa *</Label><Input className="mt-1 rounded-xl" placeholder="ABC123" maxLength={6} value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} />{fieldError('placa')}</div>
                  <div><Label className="text-xs font-medium">Marca *</Label><Select value={form.brand} onValueChange={v => set('brand', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>{fieldError('brand')}</div>
                  <div><Label className="text-xs font-medium">Modelo *</Label><Input className="mt-1 rounded-xl" placeholder="Ej: X3, Sportage" value={form.model} onChange={e => set('model', e.target.value)} />{fieldError('model')}</div>
                  <div><Label className="text-xs font-medium">Año *</Label><Select value={form.year} onValueChange={v => set('year', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{Array.from({ length: 50 }, (_, i) => 2025 - i).map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>{fieldError('year')}</div>
                  <div><Label className="text-xs font-medium">Kilometraje *</Label><Input className="mt-1 rounded-xl" type="number" placeholder="45000" value={form.km} onChange={e => set('km', e.target.value)} />{fieldError('km')}</div>
                  <div><Label className="text-xs font-medium">Color *</Label><Input className="mt-1 rounded-xl" placeholder="Negro" value={form.color} onChange={e => set('color', e.target.value)} />{fieldError('color')}</div>
                  <div><Label className="text-xs font-medium">Cilindraje *</Label><Input className="mt-1 rounded-xl" placeholder="Ej: 2000cc" value={form.cilindraje} onChange={e => set('cilindraje', e.target.value)} />{fieldError('cilindraje')}</div>
                  <div><Label className="text-xs font-medium">Combustible *</Label><Select value={form.combustible} onValueChange={v => set('combustible', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{FUELS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>{fieldError('combustible')}</div>
                  <div><Label className="text-xs font-medium">Transmisión *</Label><Select value={form.transmision} onValueChange={v => set('transmision', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>{fieldError('transmision')}</div>
                  <div><Label className="text-xs font-medium">Ciudad / Sucursal *</Label><Select value={form.city} onValueChange={v => set('city', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>{fieldError('city')}</div>
                  <div><Label className="text-xs font-medium">Tipo de carrocería</Label><Select value={form.body_type} onValueChange={v => set('body_type', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Número de puertas</Label><Select value={form.doors} onValueChange={v => set('doors', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{DOORS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Número de pasajeros</Label><Select value={form.passengers} onValueChange={v => set('passengers', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{PASSENGERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Dirección</Label><Select value={form.steering} onValueChange={v => set('steering', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{STEERINGS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-xs font-medium">Aire acondicionado</Label><Select value={form.air_conditioning} onValueChange={v => set('air_conditioning', v)}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{AC_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
                </div>
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



          <div className="flex items-center justify-end pt-4 border-t border-border/40">
            <Button onClick={handleSubmitRequest} disabled={submitting} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1.5">
              <Car className="w-4 h-4" /> {submitting ? 'Enviando...' : 'Enviar a peritaje'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
