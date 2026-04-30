import { useState } from 'react';
import { Search, CheckCircle2, Car, TrendingUp, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { vehiclesApi } from '@/api/services';

const CONFIDENCE_LABEL = { high: 'Alta confianza', medium: 'Confianza media', low: 'Estimación básica' };
const CONFIDENCE_COLOR = { high: 'bg-primary/10 text-primary border-primary/20', medium: 'bg-secondary/10 text-secondary border-secondary/20', low: 'bg-muted text-muted-foreground border-border' };

const formatCOP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

export default function MarketPlacaSearch({ onAdvance }) {
  const [placa, setPlaca] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);
  const [result, setResult] = useState(null); // { vehicleData, marketData }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!placa.trim() || !cedula.trim()) return;

    setLoading(true);
    setFound(false);
    setResult(null);

    try {
      const vehicleData = await vehiclesApi.lookupPlate(placa.trim(), 'CC', cedula.trim());
      if (!vehicleData) {
        toast.warning('Placa no encontrada', { description: 'Verifica que la placa y cédula sean correctas.' });
        setLoading(false);
        return;
      }

      let marketData = null;
      if (vehicleData.brand && vehicleData.model && vehicleData.year) {
        try {
          marketData = await vehiclesApi.getMarketEstimate(
            vehicleData.brand,
            vehicleData.model,
            vehicleData.year,
            undefined,
            vehicleData.transmision,
            vehicleData.combustible,
            placa.trim(),
            vehicleData.bodyType,
          );
        } catch { /* sin precio de mercado — ok */ }
      }

      setResult({ vehicleData, marketData, placa: placa.trim(), cedula: cedula.trim() });
      setFound(true);
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 'VERIFIK_NO_CREDITS') {
        toast.warning('Consulta de placa no disponible', { description: 'Completa los datos manualmente al publicar.' });
      } else {
        toast.error('Error al consultar la placa');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = () => {
    if (!result) return;
    onAdvance?.({
      placa: result.placa,
      cedula: result.cedula,
      brand: result.vehicleData.brand,
      model: result.vehicleData.model,
      year: result.vehicleData.year ? String(result.vehicleData.year) : '',
      color: result.vehicleData.color ?? '',
      km: '',
      combustible: result.vehicleData.combustible ?? '',
      bodyType: result.vehicleData.bodyType ?? '',
      passengers: result.vehicleData.passengers ?? null,
      motor: '',
      cilindraje: result.vehicleData.cilindraje ?? '',
      power: result.vehicleData.power ?? '',
      transmision: result.vehicleData.transmision ?? '',
      doors: result.vehicleData.doors ?? null,
      airConditioning: result.vehicleData.airConditioning ?? null,
      steering: result.vehicleData.steering ?? '',
      marketEstimate: result.marketData ?? null,
    });
  };

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full bg-secondary" />
        <h2 className="text-base md:text-lg font-bold text-foreground">
          Conoce el precio de mercado de tu carro
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-3">
        Ingresa la placa y tu cédula — te decimos cuánto vale en el mercado actual.
      </p>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Placa</label>
          <Input
            placeholder="Ej. ABC123"
            value={placa}
            onChange={(e) => {
              setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
              setFound(false);
              setResult(null);
            }}
            className="rounded-xl h-12 font-mono uppercase tracking-widest text-lg font-bold"
            maxLength={6}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wide">Cédula del propietario</label>
          <Input
            placeholder="Ej. 1234567890"
            value={cedula}
            onChange={(e) => {
              setCedula(e.target.value.replace(/\D/g, ''));
              setFound(false);
              setResult(null);
            }}
            className="rounded-xl h-12 text-lg font-bold"
            inputMode="numeric"
            maxLength={12}
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={loading || !placa.trim() || !cedula.trim()}
            className="h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-5 gap-2 w-full sm:w-auto"
          >
            {loading
              ? <span className="animate-spin w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full" />
              : found
                ? <CheckCircle2 className="w-4 h-4" />
                : <Search className="w-4 h-4" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          {/* Car info */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {result.vehicleData.brand} {result.vehicleData.model} {result.vehicleData.year}
              </p>
              <p className="text-xs text-muted-foreground">
                {[result.vehicleData.color, result.vehicleData.combustible, result.vehicleData.bodyType]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>
            <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20">
              Encontrado
            </Badge>
          </div>

          {/* Market price */}
          {result.marketData?.marketPrice ? (
            <div className="rounded-xl bg-card border border-border/60 p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <p className="text-xs font-semibold text-foreground">Precio estimado de mercado</p>
                <Badge className={`ml-auto text-[10px] ${CONFIDENCE_COLOR[result.marketData.confidence] ?? CONFIDENCE_COLOR.low}`}>
                  {CONFIDENCE_LABEL[result.marketData.confidence] ?? 'Estimación'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-foreground">{formatCOP(result.marketData.marketPrice)}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Rango: {formatCOP(result.marketData.minPrice)} – {formatCOP(result.marketData.maxPrice)}
                {result.marketData.comparablesCount > 0 && ` · ${result.marketData.comparablesCount} comparables`}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic px-1">
              No encontramos referencias de precio para este modelo — podrás publicarlo igualmente.
            </p>
          )}

          {/* CTA */}
          <Button
            onClick={handleAdvance}
            className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold gap-2"
          >
            ¿Quieres avanzar? Publica tu carro
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
