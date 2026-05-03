import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Shield, TrendingUp, Users, Zap } from 'lucide-react';

export default function BidModal({ vehicle, open, onClose, onSubmit }) {
  const [bidType, setBidType] = useState('max');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentBid = vehicle?.current_bid || vehicle?.starting_price || 0;
  const hasExistingBids = (vehicle?.bids_count || 0) > 0;
  const minBid = hasExistingBids ? currentBid + 200000 : currentBid;
  const hasActiveMax = Boolean(vehicle?.hasActiveBidStrategy);
  const myMaxBid = Number(vehicle?.myMaxBid || 0);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    if (hasActiveMax && myMaxBid > 0) {
      setBidType('max');
      setAmount(myMaxBid.toLocaleString('es-CO'));
    } else {
      setBidType('max');
      setAmount('');
    }
  }, [open, vehicle?.id, hasActiveMax, myMaxBid]);

  const numericAmount = amount.replace(/\D/g, '');
  const bidAmount = numericAmount ? parseInt(numericAmount, 10) : 0;
  const isValidBid = bidAmount > 0 && bidAmount >= minBid;
  const directWillDisableMax = bidType === 'direct' && hasActiveMax;

  const headerTitle = hasActiveMax ? 'Mi puja maxima actual' : 'Configura tu puja';
  const submitLabel = useMemo(() => {
    if (loading) return 'Procesando...';
    const suffix = isValidBid ? ` $${(bidAmount / 1000000).toFixed(1)}M` : '';
    if (bidType === 'direct') return `Pujar directamente${suffix}`;
    return `${hasActiveMax ? 'Actualizar puja maxima' : 'Establecer puja maxima'}${suffix}`;
  }, [bidAmount, bidType, hasActiveMax, isValidBid, loading]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handleAmountChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    setAmount(value ? parseInt(value, 10).toLocaleString('es-CO') : '');
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!isValidBid) return;
    setLoading(true);
    const response = await onSubmit?.(bidAmount, bidType === 'direct');
    setLoading(false);
    setResult(response || null);
    if (response?.success) {
      setTimeout(() => {
        onClose?.();
      }, 1200);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{vehicle.brand} {vehicle.model} - puja</DialogTitle>

        <div className="relative h-32 bg-gradient-to-br from-violet-600 to-violet-800">
          <img
            src={vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h3 className="font-bold text-white text-xl">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-violet-200 text-sm">{vehicle.year} · {vehicle.mileage?.toLocaleString('es-CO') || vehicle.km?.toLocaleString('es-CO')} km</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-muted-foreground text-xs">Puja actual</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(currentBid)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Users className="w-3 h-3" />
                  <span>{vehicle.bids_count || 0} pujas</span>
                </div>
                {vehicle.isLeading && <p className="text-[11px] font-semibold text-emerald-600 mt-1">Vas liderando</p>}
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {hasActiveMax && myMaxBid > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="text-sm font-semibold text-violet-800">{headerTitle}</p>
              <p className="text-xs text-violet-600 mt-1">Tienes una puja maxima activa por {formatPrice(myMaxBid)}.</p>
            </div>
          )}

          <div>
            <Label className="text-foreground font-semibold text-sm mb-3 block">Tipo de puja</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBidType('max')}
                className={`p-3 rounded-xl border-2 transition-all ${bidType === 'max' ? 'border-green-500 bg-green-50' : 'border-border hover:border-green-300'}`}
              >
                <Shield className={`w-5 h-5 mx-auto mb-1 ${bidType === 'max' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-semibold ${bidType === 'max' ? 'text-green-700' : 'text-foreground'}`}>Puja maxima</p>
              </button>
              <button
                onClick={() => setBidType('direct')}
                className={`p-3 rounded-xl border-2 transition-all ${bidType === 'direct' ? 'border-amber-500 bg-amber-50' : 'border-border hover:border-amber-300'}`}
              >
                <Zap className={`w-5 h-5 mx-auto mb-1 ${bidType === 'direct' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-semibold ${bidType === 'direct' ? 'text-amber-700' : 'text-foreground'}`}>Puja directa</p>
              </button>
            </div>
          </div>

          <div className={`flex items-start gap-2 p-3 rounded-xl border ${bidType === 'max' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${bidType === 'max' ? 'text-green-500' : 'text-amber-500'}`} />
            <div className="space-y-1">
              {bidType === 'max' ? (
                <p className="text-xs text-green-700 leading-relaxed">
                  <span className="font-semibold">Puja maxima:</span> el sistema puede responder automaticamente en el siguiente ciclo si otra persona te supera antes.
                </p>
              ) : (
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-semibold">Puja directa:</span> tu monto queda visible de inmediato y puedes liderar temporalmente aunque exista otra puja maxima oculta.
                </p>
              )}
              {directWillDisableMax && (
                <p className="text-xs font-semibold text-destructive">
                  Tienes una puja maxima activa. Si continuas con puja directa, esa puja maxima se desactivara.
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 block">
              {bidType === 'max' ? (hasActiveMax ? 'Actualizar puja maxima (COP)' : 'Tu puja maxima (COP)') : 'Monto a pujar (COP)'}
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input
                type="text"
                placeholder={minBid.toLocaleString('es-CO')}
                value={amount}
                onChange={handleAmountChange}
                className={`pl-8 rounded-xl h-12 text-lg font-bold text-center border-2 ${bidType === 'max' ? 'border-green-200 focus:border-green-500' : 'border-amber-200 focus:border-amber-500'}`}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1.5">Minimo: {formatPrice(minBid)} · Incremento: $200.000</p>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-sm font-medium ${result.success === false ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
            >
              {result.success === false ? (
                <>{result.error || result.message || 'No se pudo registrar la puja'}</>
              ) : result.scheduledResponseAt ? (
                <>Lideras temporalmente con {formatPrice(result.visibleBid)}. Una respuesta automatica puede ocurrir en el siguiente ciclo.</>
              ) : (
                <>Tu puja fue registrada y quedaste liderando con {formatPrice(result.visibleBid)}.</>
              )}
            </motion.div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !isValidBid}
            className={`w-full font-bold h-12 rounded-xl text-base ${isValidBid ? bidType === 'max' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
