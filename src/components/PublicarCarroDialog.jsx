import React, { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Car, Camera, FileText, Gavel, ChevronLeft, ChevronRight,
  X, Plus, CalendarIcon, AlertCircle, Check
} from 'lucide-react';
import { toast } from 'sonner';

const BRANDS = [
  'Mazda', 'Kia', 'Chevrolet', 'Renault', 'Toyota', 'Nissan', 'Hyundai',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Honda', 'Suzuki',
  'Subaru', 'Jeep', 'Volvo', 'Peugeot', 'Citroën', 'Otro'
];

const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Otra'];
const TRANSMISSIONS = ['Automática', 'Manual'];
const FUELS = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
const DURATIONS = [
  { label: '30 minutos', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '2 horas', value: 120 },
  { label: '24 horas', value: 1440 },
];

const STEPS = [
  { icon: Car, label: 'Vehículo' },
  { icon: Camera, label: 'Fotos' },
  { icon: FileText, label: 'Documentos' },
  { icon: Gavel, label: 'Subasta' },
];

const initialForm = {
  brand: '', model: '', year: '', city: '', mileage: '', transmission: '',
  fuel_type: '', color: '', peritaje_by: '',
  photos: [],
  description: '',
  soat_status: '', soat_date: null,
  tecno_status: '', tecno_date: null,
  taxes_status: '', taxes_detail: '',
  multas_count: '', multas_detail: '',
  starting_price: '', bid_increment: '500000',
  duration: '60', reserve_price: '',
};

export default function PublicarCarroDialog({ open, onOpenChange, onPublished }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initialForm });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      ['brand','model','year','city','mileage','transmission','fuel_type','color','peritaje_by'].forEach(k => {
        if (!form[k]) e[k] = 'Obligatorio';
      });
      if (form.year && (isNaN(form.year) || +form.year < 1990 || +form.year > 2026)) e.year = 'Año inválido';
      if (form.mileage && isNaN(form.mileage)) e.mileage = 'Solo números';
    }
    if (step === 1) {
      if (form.photos.length < 2) e.photos = 'Mínimo 2 fotos';
    }
    if (step === 2) {
      if (!form.description.trim()) e.description = 'Obligatoria';
      if (form.soat_status === 'vigente' && !form.soat_date) e.soat_date = 'Fecha obligatoria';
      if (form.tecno_status === 'vigente' && !form.tecno_date) e.tecno_date = 'Fecha obligatoria';
    }
    if (step === 3) {
      if (!form.starting_price || isNaN(form.starting_price) || +form.starting_price <= 0) e.starting_price = 'Precio inválido';
      if (!form.bid_increment || isNaN(form.bid_increment) || +form.bid_increment <= 0) e.bid_increment = 'Incremento inválido';
      if (!form.duration) e.duration = 'Selecciona duración';
    }
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
  };

  const removePhoto = (idx) => {
    setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  const publish = () => {
    if (!validateStep()) return;
    const durationMin = +form.duration;
    const endsAt = new Date(Date.now() + durationMin * 60 * 1000).toISOString();

    const auction = {
      id: Date.now().toString(),
      brand: form.brand, model: form.model, year: +form.year,
      city: form.city, mileage: +form.mileage, transmission: form.transmission,
      fuel_type: form.fuel_type, color: form.color, peritaje_by: form.peritaje_by,
      photos: form.photos,
      current_bid: +form.starting_price, starting_price: +form.starting_price,
      bid_increment: +form.bid_increment,
      bids_count: 0, views: 0, status: 'active',
      ends_at: endsAt, last_bidder: null,
      reserve_price: form.reserve_price ? +form.reserve_price : null,
      auto_extended: false,
      description: form.description,
      documentation: {
        soat: { status: form.soat_status, date: form.soat_date?.toISOString() || null },
        tecno: { status: form.tecno_status, date: form.tecno_date?.toISOString() || null },
        taxes: { status: form.taxes_status, detail: form.taxes_detail },
        multas: { count: form.multas_count ? +form.multas_count : 0, detail: form.multas_detail },
      },
      created_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('mubis_my_auctions') || '[]');
    existing.unshift(auction);
    localStorage.setItem('mubis_my_auctions', JSON.stringify(existing));

    toast.success('Subasta publicada', {
      description: `${auction.brand} ${auction.model} · $${(auction.starting_price / 1000000).toFixed(1)}M`,
    });

    onPublished?.(auction);
    setForm({ ...initialForm });
    setStep(0);
    onOpenChange(false);
  };

  const fieldError = (key) => errors[key] ? (
    <span className="text-destructive text-xs flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" />{errors[key]}
    </span>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold font-sans">Publicar carro</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Paso {step + 1} de 4 — {STEPS[step].label}
          </DialogDescription>
          {/* Step indicators */}
          <div className="flex items-center gap-2 pt-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    done ? "bg-primary text-primary-foreground" :
                    active ? "bg-secondary text-secondary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 rounded", done ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* STEP 0: Vehicle Identity */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Marca *</Label>
                  <Select value={form.brand} onValueChange={v => set('brand', v)}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                  {fieldError('brand')}
                </div>
                <div>
                  <Label className="text-xs font-medium">Modelo *</Label>
                  <Input className="mt-1 rounded-xl" placeholder="Ej: X3, 3, Sportage" value={form.model} onChange={e => set('model', e.target.value)} />
                  {fieldError('model')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Año *</Label>
                  <Input className="mt-1 rounded-xl" type="number" placeholder="2022" value={form.year} onChange={e => set('year', e.target.value)} />
                  {fieldError('year')}
                </div>
                <div>
                  <Label className="text-xs font-medium">Ciudad *</Label>
                  <Select value={form.city} onValueChange={v => set('city', v)}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  {fieldError('city')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Kilometraje *</Label>
                  <Input className="mt-1 rounded-xl" type="number" placeholder="45000" value={form.mileage} onChange={e => set('mileage', e.target.value)} />
                  {fieldError('mileage')}
                </div>
                <div>
                  <Label className="text-xs font-medium">Transmisión *</Label>
                  <Select value={form.transmission} onValueChange={v => set('transmission', v)}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  {fieldError('transmission')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Combustible *</Label>
                  <Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>{FUELS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                  {fieldError('fuel_type')}
                </div>
                <div>
                  <Label className="text-xs font-medium">Color *</Label>
                  <Input className="mt-1 rounded-xl" placeholder="Blanco" value={form.color} onChange={e => set('color', e.target.value)} />
                  {fieldError('color')}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Peritaje realizado por *</Label>
                <Input className="mt-1 rounded-xl" placeholder="Ej: Autogermana, Tüv Rheinland" value={form.peritaje_by} onChange={e => set('peritaje_by', e.target.value)} />
                {fieldError('peritaje_by')}
              </div>
            </div>
          )}

          {/* STEP 1: Photos */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Sube mínimo 2 fotos de tu vehículo. La primera será la portada.</p>
              <div className="grid grid-cols-3 gap-2">
                {form.photos.map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/60 group">
                    <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <Badge className="absolute top-1 left-1 bg-secondary text-secondary-foreground text-[10px]">Portada</Badge>}
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-destructive/80 text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-secondary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-secondary transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Agregar</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              {fieldError('photos')}
            </div>
          )}

          {/* STEP 2: Description + Docs */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Descripción del vehículo *</Label>
                <Textarea className="mt-1 rounded-xl min-h-[80px]" placeholder="Describe el estado, accesorios, historial de mantenimiento…"
                  value={form.description} onChange={e => set('description', e.target.value)} />
                {fieldError('description')}
              </div>

              <div className="space-y-3 border-t border-border/60 pt-3">
                <p className="text-xs font-semibold text-foreground">Documentación</p>

                {/* SOAT */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">SOAT</Label>
                    <Select value={form.soat_status} onValueChange={v => set('soat_status', v)}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vigente">Vigente</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.soat_status === 'vigente' && (
                    <div>
                      <Label className="text-xs font-medium">Vigente hasta *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full mt-1 rounded-xl justify-start text-left font-normal", !form.soat_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.soat_date ? format(form.soat_date, "PPP", { locale: es }) : "Seleccionar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.soat_date} onSelect={d => set('soat_date', d)} className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      {fieldError('soat_date')}
                    </div>
                  )}
                </div>

                {/* Tecno-mecánica */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Técnico-mecánica</Label>
                    <Select value={form.tecno_status} onValueChange={v => set('tecno_status', v)}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vigente">Vigente</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.tecno_status === 'vigente' && (
                    <div>
                      <Label className="text-xs font-medium">Vigente hasta *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full mt-1 rounded-xl justify-start text-left font-normal", !form.tecno_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.tecno_date ? format(form.tecno_date, "PPP", { locale: es }) : "Seleccionar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.tecno_date} onSelect={d => set('tecno_date', d)} className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      {fieldError('tecno_date')}
                    </div>
                  )}
                </div>

                {/* Taxes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Impuestos</Label>
                    <Select value={form.taxes_status} onValueChange={v => set('taxes_status', v)}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="al_dia">Al día</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Detalle (opcional)</Label>
                    <Input className="mt-1 rounded-xl" placeholder="Detalles de impuestos" value={form.taxes_detail} onChange={e => set('taxes_detail', e.target.value)} />
                  </div>
                </div>

                {/* Multas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Multas (#)</Label>
                    <Input className="mt-1 rounded-xl" type="number" placeholder="0" value={form.multas_count} onChange={e => set('multas_count', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Detalle multas</Label>
                    <Input className="mt-1 rounded-xl" placeholder="Ej: 1 multa $180.000" value={form.multas_detail} onChange={e => set('multas_detail', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Auction Config */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Precio base (COP) *</Label>
                <Input className="mt-1 rounded-xl" type="number" placeholder="55000000"
                  value={form.starting_price} onChange={e => set('starting_price', e.target.value)} />
                {form.starting_price && !isNaN(form.starting_price) && +form.starting_price > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">${(+form.starting_price / 1000000).toFixed(1)}M COP</p>
                )}
                {fieldError('starting_price')}
              </div>
              <div>
                <Label className="text-xs font-medium">Incremento mínimo de puja *</Label>
                <Input className="mt-1 rounded-xl" type="number" placeholder="500000"
                  value={form.bid_increment} onChange={e => set('bid_increment', e.target.value)} />
                {fieldError('bid_increment')}
              </div>
              <div>
                <Label className="text-xs font-medium">Duración de la subasta *</Label>
                <Select value={form.duration} onValueChange={v => set('duration', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {fieldError('duration')}
              </div>
              <div>
                <Label className="text-xs font-medium">Precio de reserva (opcional)</Label>
                <Input className="mt-1 rounded-xl" type="number" placeholder="65000000"
                  value={form.reserve_price} onChange={e => set('reserve_price', e.target.value)} />
                {form.reserve_price && !isNaN(form.reserve_price) && +form.reserve_price > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">${(+form.reserve_price / 1000000).toFixed(1)}M COP</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            {step > 0 ? (
              <Button variant="ghost" onClick={back} className="rounded-xl gap-1">
                <ChevronLeft className="w-4 h-4" /> Atrás
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={next} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1">
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={publish} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl gap-1">
                <Gavel className="w-4 h-4" /> Publicar subasta
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
