import React, { useState, useEffect } from 'react';
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
  Car, AlertCircle, ArrowLeft, Search, CheckCircle2, Sparkles, TrendingUp, RefreshCw
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

const initialForm = {
  placa: '', brand: '', model: '', year: '', km: '', color: '',
  cilindraje: '', combustible: '', city: '',
  transmision: '', body_type: '', doors: '', passengers: '', steering: '', air_conditioning: '',
  cedula: '', nombre_completo: '', email: '', telefono: '',
};

function matchFromList(value, list) {
  if (!value) return '';
  const lower = value.toLowerCase();
  return list.find(item => item.toLowerCase() === lower) ?? '';
}

export default function PublicarCarroDialog({ open, onOpenChange, onPublished, initialPrefill }) {
  const [form, setForm] = useState(JSON.parse(JSON.stringify(initialForm)));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lookingUpPlate, setLookingUpPlate] = useState(false);
  const [plateFound, setPlateFound] = useState(false);
  const [marketPrice, setMarketPrice] = useState(null);
  const [marketPriceMin, setMarketPriceMin] = useState(null);
  const [marketPriceMax, setMarketPriceMax] = useState(null);
  const [marketPriceComparables, setMarketPriceComparables] = useState(0);
  const [loadingMarketPrice, setLoadingMarketPrice] = useState(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // When dialog opens with prefill data (from MarketPlacaSearch), populate the form directly
  useEffect(() => {
    if (!open || !initialPrefill) return;
    const updates = {};
    if (initialPrefill.placa) updates.placa = initialPrefill.placa;
    if (initialPrefill.cedula) updates.cedula = initialPrefill.cedula;
    if (initialPrefill.brand) {
      const matched = matchFromList(initialPrefill.brand, BRANDS);
      updates.brand = matched || initialPrefill.brand;
    }
    if (initialPrefill.model) updates.model = initialPrefill.model;
    if (initialPrefill.year) updates.year = String(initialPrefill.year);
    if (initialPrefill.color) updates.color = initialPrefill.color;
    if (initialPrefill.combustible) {
      const matched = matchFromList(initialPrefill.combustible, FUELS);
      if (matched) updates.combustible = matched;
    }
    if (initialPrefill.bodyType) {
      const matched = matchFromList(initialPrefill.bodyType, BODY_TYPES);
      if (matched) updates.body_type = matched;
    }
    if (initialPrefill.passengers) {
      const passengers = String(initialPrefill.passengers);
      if (PASSENGERS.includes(passengers)) updates.passengers = passengers;
    }
    if (initialPrefill.transmision) {
      const matched = matchFromList(initialPrefill.transmision, TRANSMISSIONS);
      if (matched) updates.transmision = matched;
    }
    if (initialPrefill.doors) {
      const d = String(initialPrefill.doors);
      if (DOORS.includes(d)) updates.doors = d;
    }
    if (initialPrefill.airConditioning !== null && initialPrefill.airConditioning !== undefined) {
      updates.air_conditioning = initialPrefill.airConditioning ? 'Sí' : 'No';
    }
    if (initialPrefill.steering) {
      const matched = matchFromList(initialPrefill.steering, STEERINGS);
      if (matched) updates.steering = matched;
    }
    if (initialPrefill.cilindraje) updates.cilindraje = initialPrefill.cilindraje;
    setForm(JSON.parse(JSON.stringify({ ...initialForm, ...updates })));
    setErrors({});
    setPlateFound(true);
    if (updates.brand && updates.model && updates.year) {
      fetchMarketPrice(updates.brand, updates.model, updates.year, '', '', '', initialPrefill?.placa);
    }
  }, [open, initialPrefill]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => onOpenChange(false);

  const fetchMarketPrice = (brand, model, year, km, transmision, combustible, plate) => {
    if (!brand || !model || !year) return;
    setLoadingMarketPrice(true);
    setMarketPrice(null);
    vehiclesApi.getMarketEstimate(brand, model, parseInt(year, 10), km || undefined, transmision || undefined, combustible || undefined, plate || undefined)
      .then(res => {
        setMarketPrice(res?.marketPrice ?? null);
        setMarketPriceMin(res?.minPrice ?? null);
        setMarketPriceMax(res?.maxPrice ?? null);
        setMarketPriceComparables(res?.comparablesCount ?? 0);
      })
      .catch(() => setMarketPrice(null))
      .finally(() => setLoadingMarketPrice(false));
  };

  const PRICE_RELEVANT_FIELDS = ['brand', 'model', 'year', 'km', 'transmision', 'combustible'];

  // Auto-refresh market price when relevant fields change (debounced 900ms)
  useEffect(() => {
    if (!plateFound || !form.brand || !form.model || !form.year) return;
    const timer = setTimeout(() => {
      fetchMarketPrice(form.brand, form.model, form.year, form.km, form.transmision, form.combustible, form.placa);
    }, 900);
    return () => clearTimeout(timer);
  }, [form.brand, form.model, form.year, form.km, form.transmision, form.combustible, plateFound]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
    if (key === 'placa') { setPlateFound(false); setMarketPrice(null); }
  };

  const handleLookupPlate = async () => {
    if (!form.placa || form.placa.length < 5) {
      toast.error('Ingresa una placa válida antes de buscar');
      return;
    }
    if (!form.cedula) {
      toast.error('Ingresa tu cédula antes de buscar');
      return;
    }

    setLookingUpPlate(true);
    setPlateFound(false);
    try {
      const data = await vehiclesApi.lookupPlate(form.placa, 'CC', form.cedula);
      if (!data) {
        toast.warning('Placa no encontrada', {
          description: 'Completa los datos del vehículo manualmente.',
        });
        return;
      }

      const updates = {};
      if (data.brand) {
        const matched = matchFromList(data.brand, BRANDS);
        updates.brand = matched || data.brand;
      }
      if (data.model) updates.model = data.model;
      if (data.year) updates.year = String(data.year);
      if (data.cilindraje) updates.cilindraje = data.cilindraje;
      if (data.combustible) {
        const matched = matchFromList(data.combustible, FUELS);
        if (matched) updates.combustible = matched;
      }
      if (data.color) updates.color = data.color;
      if (data.bodyType) {
        const matched = matchFromList(data.bodyType, BODY_TYPES);
        if (matched) updates.body_type = matched;
      }
      if (data.passengers) {
        const p = String(data.passengers);
        if (PASSENGERS.includes(p)) updates.passengers = p;
      }
      if (data.transmision) {
        const matched = matchFromList(data.transmision, TRANSMISSIONS);
        if (matched) updates.transmision = matched;
      }
      if (data.doors) {
        const d = String(data.doors);
        if (DOORS.includes(d)) updates.doors = d;
      }
      if (data.airConditioning !== null && data.airConditioning !== undefined) {
        updates.air_conditioning = data.airConditioning ? 'Sí' : 'No';
      }
      if (data.steering) {
        const matched = matchFromList(data.steering, STEERINGS);
        if (matched) updates.steering = matched;
      }

      setForm(prev => ({ ...prev, ...updates }));
      setPlateFound(true);
      toast.success('Datos encontrados', {
        description: `${data.brand ?? ''} ${data.model ?? ''} ${data.year ?? ''}`.trim(),
      });

      const brand = updates.brand ?? data.brand;
      const model = updates.model ?? data.model;
      const year = updates.year ?? (data.year ? String(data.year) : null);
      fetchMarketPrice(brand, model, year, form.km, form.transmision, form.combustible, form.placa);
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 'VERIFIK_NO_CREDITS') {
        toast.warning('Servicio de consulta de placa no disponible', {
          description: 'Completa los datos del vehículo manualmente.',
        });
      } else {
        toast.error('Error al consultar la placa', {
          description: 'Completa los datos manualmente.',
        });
      }
    } finally {
      setLookingUpPlate(false);
    }
  };

  const formatCOP = (val) => {
    const n = parseInt(val);
    if (isNaN(n)) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = () => {
    const e = {};
    ['placa', 'brand', 'model', 'year', 'km', 'color', 'cilindraje', 'combustible', 'city', 'transmision'].forEach(k => {
      if (!form[k]) e[k] = 'Obligatorio';
    });
    if (form.year && (isNaN(form.year) || +form.year < 1980 || +form.year > currentYear + 1)) e.year = 'Año inválido';
    if (form.km && (isNaN(form.km) || +form.km < 0)) e.km = 'Kilometraje inválido';
    ['cedula', 'nombre_completo', 'email', 'telefono'].forEach(k => { if (!form[k]) e[k] = 'Obligatorio'; });
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

      const specs = {};
      if (form.body_type) specs.body_type = form.body_type;
      if (form.doors) specs.doors = parseInt(form.doors);
      if (form.passengers) specs.passengers = parseInt(form.passengers);
      if (form.steering) specs.steering = form.steering;
      if (form.air_conditioning) specs.air_conditioning = form.air_conditioning === 'Sí';
      specs.seller = {
        cedula: form.cedula,
        nombre: form.nombre_completo,
        email: form.email,
        telefono: form.telefono
      };

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
        photos: [],
        documentation: {},
        specs,
        startingPrice: 0,
      });

      toast.success('Vehículo enviado a peritaje', {
        description: `${vehicle.brand} ${vehicle.model} · Año ${vehicle.year}`,
      });

      onPublished?.(vehicle);
      setForm(JSON.parse(JSON.stringify(initialForm)));
      setPlateFound(false);
      setMarketPrice(null);
      setMarketPriceMin(null);
      setMarketPriceMax(null);
      setMarketPriceComparables(0);
      onOpenChange(false);
      navigate('/MisSubastas');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al enviar el vehículo');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key) => errors[key] ? (
    <span className="text-destructive text-xs flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" />{errors[key]}
    </span>
  ) : null;

  const SectionTitle = ({ children }) => (
    <p className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-3">{children}</p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleBack}
              aria-label="Volver"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <DialogTitle className="text-xl font-bold font-sans">Enviar vehículo a peritaje</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Completa los datos del vehículo. El perito completará las fotos, documentación y evaluación.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5 space-y-5">

          {/* ── Sección autocompletar ── */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <p className="text-sm font-semibold">Autocompletar datos del vehículo</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresa la placa y tu cédula para cargar automáticamente marca, modelo, año y más datos desde el RUNT.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1">
                <Label className="text-xs font-medium">Placa *</Label>
                <Input
                  className="mt-1 rounded-xl"
                  placeholder="ABC123"
                  maxLength={6}
                  value={form.placa}
                  onChange={e => set('placa', e.target.value.toUpperCase())}
                />
                {fieldError('placa')}
              </div>
              <div className="flex-1">
                <Label className="text-xs font-medium">Cédula del vendedor (CC) *</Label>
                <Input
                  className="mt-1 rounded-xl"
                  placeholder="1234567890"
                  value={form.cedula}
                  onChange={e => set('cedula', e.target.value)}
                />
                {fieldError('cedula')}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-xl shrink-0 h-10 w-10"
                onClick={handleLookupPlate}
                disabled={lookingUpPlate}
                title="Buscar datos del vehículo"
              >
                {lookingUpPlate
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : plateFound
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Search className="w-4 h-4" />
                }
              </Button>
            </div>
            {plateFound && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Datos cargados — revisa y ajusta si es necesario
              </p>
            )}
          </div>

          {/* ── Precio de mercado ── */}
          <div>
            <SectionTitle>Precio de mercado</SectionTitle>
            {loadingMarketPrice ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Consultando fuentes de mercado...
              </div>
            ) : marketPrice ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-secondary shrink-0" />
                <div className="flex-1">
                  <p className="text-2xl font-bold tracking-tight">{formatCOP(marketPrice)}</p>
                  {marketPriceMin && marketPriceMax && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rango: {formatCOP(marketPriceMin)} – {formatCOP(marketPriceMax)}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 shrink-0"
                  onClick={() => fetchMarketPrice(form.brand, form.model, form.year, form.km, form.transmision, form.combustible, form.placa)}
                  title="Recalcular precio"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">
                  {plateFound ? 'No se encontró precio.' : 'Se calcula automáticamente al autocompletar con la placa.'}
                </p>
                {form.brand && form.model && form.year && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs shrink-0"
                    onClick={() => fetchMarketPrice(form.brand, form.model, form.year, form.km, form.transmision, form.combustible, form.placa)}
                  >
                    Buscar precio
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ── Datos del vehículo ── */}
          <div>
            <SectionTitle>Datos del vehículo</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Marca *</Label>
                <datalist id="brands-list">
                  {BRANDS.map(b => <option key={b} value={b} />)}
                </datalist>
                <Input
                  className="mt-1 rounded-xl"
                  placeholder="Ej: Toyota, Renault"
                  list="brands-list"
                  value={form.brand}
                  onChange={e => set('brand', e.target.value)}
                />
                {fieldError('brand')}
              </div>
              <div>
                <Label className="text-xs font-medium">Modelo *</Label>
                <Input className="mt-1 rounded-xl" placeholder="Ej: X3, Sportage" value={form.model} onChange={e => set('model', e.target.value)} />
                {fieldError('model')}
              </div>
              <div>
                <Label className="text-xs font-medium">Año *</Label>
                <Input
                  className="mt-1 rounded-xl"
                  type="number"
                  placeholder={String(currentYear)}
                  min="1980"
                  max={String(currentYear + 1)}
                  value={form.year}
                  onChange={e => set('year', e.target.value)}
                />
                {fieldError('year')}
              </div>
              <div>
                <Label className="text-xs font-medium">Kilometraje *</Label>
                <Input className="mt-1 rounded-xl" type="number" placeholder="45000" value={form.km} onChange={e => set('km', e.target.value)} />
                {fieldError('km')}
              </div>
              <div>
                <Label className="text-xs font-medium">Color *</Label>
                <Input className="mt-1 rounded-xl" placeholder="Negro" value={form.color} onChange={e => set('color', e.target.value)} />
                {fieldError('color')}
              </div>
              <div>
                <Label className="text-xs font-medium">Cilindraje *</Label>
                <Input className="mt-1 rounded-xl" placeholder="Ej: 2000cc" value={form.cilindraje} onChange={e => set('cilindraje', e.target.value)} />
                {fieldError('cilindraje')}
              </div>
              <div>
                <Label className="text-xs font-medium">Combustible *</Label>
                <Select value={form.combustible} onValueChange={v => set('combustible', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{FUELS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                {fieldError('combustible')}
              </div>
              <div>
                <Label className="text-xs font-medium">Transmisión *</Label>
                <Select value={form.transmision} onValueChange={v => set('transmision', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
                {fieldError('transmision')}
              </div>
              <div>
                <Label className="text-xs font-medium">Ciudad / Sucursal *</Label>
                <Select value={form.city} onValueChange={v => set('city', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {fieldError('city')}
              </div>
              <div>
                <Label className="text-xs font-medium">Tipo de carrocería</Label>
                <Select value={form.body_type} onValueChange={v => set('body_type', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Número de puertas</Label>
                <Select value={form.doors} onValueChange={v => set('doors', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{DOORS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Número de pasajeros</Label>
                <Select value={form.passengers} onValueChange={v => set('passengers', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{PASSENGERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Dirección</Label>
                <Select value={form.steering} onValueChange={v => set('steering', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{STEERINGS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Aire acondicionado</Label>
                <Select value={form.air_conditioning} onValueChange={v => set('air_conditioning', v)}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{AC_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Datos personales del vendedor ── */}
          <div>
            <SectionTitle>Datos personales del vendedor</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Nombre completo *</Label>
                <Input className="mt-1 rounded-xl" placeholder="Juan Pérez" value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)} />
                {fieldError('nombre_completo')}
              </div>
              <div>
                <Label className="text-xs font-medium">Email *</Label>
                <Input className="mt-1 rounded-xl" type="email" placeholder="juan@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                {fieldError('email')}
              </div>
              <div>
                <Label className="text-xs font-medium">Teléfono *</Label>
                <Input className="mt-1 rounded-xl" type="tel" placeholder="3001234567" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
                {fieldError('telefono')}
              </div>
            </div>
          </div>

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
