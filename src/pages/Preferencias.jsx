import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, X, Search, Upload, Loader2, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { ALL_BRANDS, getModelsForBrand } from '@/constants/vehicleData';
import { preferencesApi } from '@/api/services';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export default function Preferencias() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchPreferences(); }, []);

  async function fetchPreferences() {
    try {
      const data = await preferencesApi.getAll();
      setPreferences(data || []);
    } catch {
      toast.error('Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  }

  function handleBrandChange(val) {
    setSelectedBrand(val);
    setSelectedModel('');
    setAvailableModels(val ? getModelsForBrand(val) : []);
  }

  async function handleAdd() {
    if (!selectedBrand) { toast.error('Selecciona una marca'); return; }
    setAdding(true);
    try {
      const pref = await preferencesApi.create({
        brand: selectedBrand,
        model: selectedModel || undefined,
      });
      setPreferences((prev) => [{ ...pref, activeMatchesCount: 0 }, ...prev]);
      setSelectedBrand('');
      setSelectedModel('');
      toast.success('Preferencia agregada');
      fetchPreferences(); // refresca para traer el contador real
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al agregar preferencia');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id) {
    try {
      await preferencesApi.remove(id);
      setPreferences((prev) => prev.filter((p) => p.id !== id));
      toast.success('Preferencia eliminada');
    } catch {
      toast.error('Error al eliminar preferencia');
    }
  }

  function handleClickPref(pref) {
    const params = new URLSearchParams({ brand: pref.brand });
    if (pref.model) params.set('model', pref.model);
    navigate(`/Comprar?${params.toString()}`);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        const valid = rows
          .filter((r) => r.Marca && ALL_BRANDS.includes(r.Marca.trim()))
          .map((r) => ({ brand: r.Marca.trim(), model: r.Modelo?.trim() || undefined }));
        const invalid = rows.length - valid.length;

        if (valid.length === 0) {
          toast.error('No se encontraron filas válidas en el CSV. Usa columnas: Marca, Modelo');
          return;
        }

        try {
          const { created, skipped } = await preferencesApi.bulkCreate(valid);
          toast.success(`${created} preferencias agregadas${skipped ? `, ${skipped} omitidas` : ''}`);
          fetchPreferences();
        } catch {
          toast.error('Error al cargar preferencias del CSV');
        }
      },
      error: () => toast.error('Error al leer el archivo CSV'),
    });
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Preferencias" backTo="/Cuenta" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-5 space-y-6 pb-6">

        {/* Add form */}
        <Card className="border border-border shadow-sm rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Agregar Preferencia</h3>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl gap-1.5 text-xs border-secondary/30 text-secondary hover:bg-secondary/10"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />Cargar CSV
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            El CSV debe tener columnas <strong>Marca</strong> y <strong>Modelo</strong>.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Marca *</label>
              <Select value={selectedBrand} onValueChange={handleBrandChange}>
                <SelectTrigger className="rounded-xl border-border h-11">
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBrand && availableModels.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Modelo <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Select value={selectedModel || '_all_'} onValueChange={(v) => setSelectedModel(v === '_all_' ? '' : v)}>
                  <SelectTrigger className="rounded-xl border-border h-11">
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

            <Button
              onClick={handleAdd}
              disabled={!selectedBrand || adding}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-full"
            >
              {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Agregar a mi Lista
            </Button>
          </div>
        </Card>

        {/* List */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">
            Mis Preferencias ({preferences.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : preferences.length === 0 ? (
            <Card className="border border-dashed border-border shadow-sm rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Sin preferencias aún</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega marcas y modelos para recibir notificaciones cuando estén en subasta
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {preferences.map((pref) => (
                <Card
                  key={pref.id}
                  className="border border-border shadow-sm rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleClickPref(pref)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {pref.brand}{pref.model ? ` ${pref.model}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {pref.model ? 'Modelo específico' : 'Todos los modelos'}
                          </Badge>
                          {pref.activeMatchesCount > 0 && (
                            <Badge className="text-xs bg-green-100 text-green-800 border-0">
                              {pref.activeMatchesCount} disponible{pref.activeMatchesCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleRemove(pref.id); }}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 p-1.5 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="border border-border/50 bg-muted/30 shadow-sm rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            Haz clic en una preferencia para ver los carros disponibles. Recibirás notificaciones cuando aparezcan nuevos vehículos que coincidan.
          </p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
