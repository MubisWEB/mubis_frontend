import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image as ImageIcon, Megaphone, Search, Loader2, Car, Calendar, Gauge, MapPin, Phone, Building2, ChevronRight, X, Heart, Send } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { branchInventoryApi, interestRequestsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/roles';
import { ALL_BRANDS, getModelsForBrand } from '@/constants/vehicleData';
import { toast } from 'sonner';

const CURRENT_YEAR = new Date().getFullYear();

const KM_RANGES = [
  { label: 'Cualquiera', min: '', max: '' },
  { label: '0 - 10,000 km', min: 0, max: 10000 },
  { label: '10,000 - 30,000 km', min: 10000, max: 30000 },
  { label: '30,000 - 60,000 km', min: 30000, max: 60000 },
  { label: '60,000 - 100,000 km', min: 60000, max: 100000 },
  { label: 'Más de 100,000 km', min: 100000, max: '' },
];

const YEAR_RANGES = [
  { label: 'Cualquiera', min: '', max: '' },
  { label: `${CURRENT_YEAR} - ${CURRENT_YEAR}`, min: CURRENT_YEAR, max: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 1} - ${CURRENT_YEAR}`, min: CURRENT_YEAR - 1, max: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 3} - ${CURRENT_YEAR}`, min: CURRENT_YEAR - 3, max: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 5} - ${CURRENT_YEAR}`, min: CURRENT_YEAR - 5, max: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 10} - ${CURRENT_YEAR}`, min: CURRENT_YEAR - 10, max: CURRENT_YEAR },
  { label: `Antes de ${CURRENT_YEAR - 10}`, min: '', max: CURRENT_YEAR - 10 },
];

export default function SeBusca() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isRecomprador = role === 'recomprador';

  // Search form
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [kmRange, setKmRange] = useState('0'); // index into KM_RANGES
  const [yearRange, setYearRange] = useState('0');
  const [availableModels, setAvailableModels] = useState([]);

  // Results
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Detail dialog
  const [selected, setSelected] = useState(null);
  const [contacting, setContacting] = useState(false);

  async function handleContactar(vehicleId) {
    setContacting(true);
    try {
      await interestRequestsApi.create(vehicleId);
      toast.success('Solicitud de interés enviada');
      setSelected(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al enviar solicitud';
      toast.error(msg);
    } finally {
      setContacting(false);
    }
  }

  function handleBrandChange(val) {
    setBrand(val);
    setModel('');
    if (val) {
      setAvailableModels(getModelsForBrand(val));
    } else {
      setAvailableModels([]);
    }
  }

  async function handleSearch() {
    if (!brand) {
      toast.error('Selecciona al menos una marca');
      return;
    }

    setSearching(true);
    try {
      const km = KM_RANGES[Number(kmRange)];
      const yr = YEAR_RANGES[Number(yearRange)];

      const filters = {
        brand,
        model: model || undefined,
        version: version || undefined,
        kmMin: km.min !== '' ? km.min : undefined,
        kmMax: km.max !== '' ? km.max : undefined,
        yearMin: yr.min !== '' ? yr.min : undefined,
        yearMax: yr.max !== '' ? yr.max : undefined,
      };

      const data = await branchInventoryApi.search(filters);
      setResults(data || []);
    } catch (err) {
      toast.error('Error al buscar en inventario');
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setBrand('');
    setModel('');
    setVersion('');
    setKmRange('0');
    setYearRange('0');
    setAvailableModels([]);
    setResults(null);
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-6 h-6 text-secondary" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Se Busca</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Busca vehículos en inventario y gestiona anuncios</p>
          </div>
          <Button
            onClick={() => navigate('/Deseados')}
            variant="outline"
            className="rounded-full font-semibold h-9 px-4 border-secondary/30 text-secondary hover:bg-secondary/10"
          >
            <Heart className="w-4 h-4 mr-1" />
            Deseados
          </Button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 space-y-6 pb-6">

        {/* Banner Management */}
        <Card className="border border-border shadow-sm rounded-2xl p-5 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground mb-1">Gestionar Anuncios</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sube y administra tus banners publicitarios en la página principal
              </p>
              <Button
                onClick={() => navigate('/AdminBanners')}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-full h-9"
              >
                Ir a Gestión de Banners
              </Button>
            </div>
          </div>
        </Card>

        {/* Search Form */}
        <Card className="border border-border shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Buscar en Inventario</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Marca *</Label>
              <Select value={brand} onValueChange={handleBrandChange}>
                <SelectTrigger className="rounded-xl border-border h-11 mt-1">
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {brand && availableModels.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Modelo</Label>
                <Select value={model || '_all_'} onValueChange={(val) => setModel(val === '_all_' ? '' : val)}>
                  <SelectTrigger className="rounded-xl border-border h-11 mt-1">
                    <SelectValue placeholder="Todos los modelos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all_">Todos los modelos</SelectItem>
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold">Versión / Motor</Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ej: 2.0 Turbo"
                className="rounded-xl h-11 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Rango de Años</Label>
                <Select value={yearRange} onValueChange={setYearRange}>
                  <SelectTrigger className="rounded-xl border-border h-11 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_RANGES.map((r, i) => (
                      <SelectItem key={i} value={String(i)}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Kilometraje</Label>
                <Select value={kmRange} onValueChange={setKmRange}>
                  <SelectTrigger className="rounded-xl border-border h-11 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KM_RANGES.map((r, i) => (
                      <SelectItem key={i} value={String(i)}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={!brand || searching}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-full"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Buscar
              </Button>
              {results !== null && (
                <Button variant="outline" onClick={handleClear} className="h-11 rounded-full px-4">
                  <X className="w-4 h-4 mr-1" /> Limpiar
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results */}
        {results !== null && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              {results.length === 0
                ? 'Sin resultados'
                : `${results.length} ${results.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}`}
            </h3>

            {results.length === 0 ? (
              <Card className="border border-dashed border-border shadow-sm rounded-2xl p-8">
                <div className="text-center">
                  <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron vehículos con esos criterios. Intenta con filtros más amplios.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.map((v) => (
                  <Card
                    key={v.id}
                    className="border border-border shadow-sm rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.99]"
                    onClick={() => setSelected(v)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-muted-foreground">{v.version}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {v.year}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" /> {v.km.toLocaleString('es-CO')} km
                          </span>
                          {v.branch && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {v.branch.city}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del vehículo</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Vehicle info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-foreground">{selected.brand} {selected.model}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{selected.version}</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Año</p>
                    <p className="font-semibold text-foreground">{selected.year}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Kilometraje</p>
                    <p className="font-semibold text-foreground">{selected.km.toLocaleString('es-CO')} km</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-muted-foreground">Días en inventario</p>
                    <p className="font-semibold text-foreground">{selected.daysInInventory} días</p>
                  </div>
                </div>
              </div>

              {/* Branch / Contact info */}
              {selected.branch && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-secondary" />
                    <h4 className="font-bold text-foreground">Información de contacto</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{selected.branch.name}</p>
                        {selected.branch.company && (
                          <p className="text-muted-foreground text-xs">{selected.branch.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-foreground">{selected.branch.city}</p>
                        {selected.branch.address && (
                          <p className="text-muted-foreground text-xs">{selected.branch.address}</p>
                        )}
                      </div>
                    </div>
                    {selected.branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${selected.branch.phone}`} className="text-primary font-medium hover:underline">
                          {selected.branch.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botón Contactar — solo recompradores */}
              {isRecomprador && (
                <div className="border-t border-border pt-4">
                  <Button
                    onClick={() => handleContactar(selected.id)}
                    disabled={contacting}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 rounded-full"
                  >
                    {contacting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Contactar
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Enviarás una solicitud de interés al dealer
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
