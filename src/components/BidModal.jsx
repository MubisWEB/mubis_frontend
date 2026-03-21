import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Users, Shield, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BidModal({ vehicle, open, onClose, onSubmit }) {
  const [bidType, setBidType] = useState('max'); // 'max' or 'direct'
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentBid = vehicle?.current_bid || vehicle?.starting_price || 0;
  const minBid = currentBid + 200000;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatShortPrice = (price) => {
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const handleSubmit = async () => {
    const bidAmount = parseInt(amount.replace(/\D/g, ''));
    if (bidAmount < minBid) return;
    
    setLoading(true);
    const res = await onSubmit?.(bidAmount);
    setLoading(false);
    setResult(res || null);
    if (res?.success && !res?.outbid) {
      setTimeout(() => {
        setAmount('');
        setResult(null);
        setBidType('max');
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setAmount('');
    setResult(null);
    setBidType('max');
    onClose();
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setAmount(parseInt(value).toLocaleString('es-CO'));
    } else {
      setAmount('');
    }
    setResult(null);
  };

  if (!vehicle) return null;

  const bidAmount = parseInt(amount.replace(/\D/g, '') || '0');
  const isValidBid = bidAmount >= minBid;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">{vehicle.brand} {vehicle.model} — Realizar puja</DialogTitle>
        
        {/* Header con imagen */}
        <div className="relative h-32 bg-gradient-to-br from-violet-600 to-violet-800">
          <img
            src={vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h3 className="font-bold text-white text-xl">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-violet-200 text-sm">
              {vehicle.year} · {vehicle.mileage?.toLocaleString('es-CO')} km
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Puja actual */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-muted-foreground text-xs">Puja actual</p>
              <p className="text-xl font-bold text-foreground">
                {formatShortPrice(currentBid)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Users className="w-3 h-3" />
                  <span>{vehicle.bids_count || 0} pujas</span>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {/* Tipo de puja - Selector */}
          <div>
            <Label className="text-foreground font-semibold text-sm mb-3 block">Tipo de puja</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBidType('max')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  bidType === 'max'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-border hover:border-green-300'
                }`}
              >
                <Shield className={`w-5 h-5 mx-auto mb-1 ${bidType === 'max' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-semibold ${bidType === 'max' ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                  Puja máxima
                </p>
              </button>
              <button
                onClick={() => setBidType('direct')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  bidType === 'direct'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-border hover:border-amber-300'
                }`}
              >
                <Zap className={`w-5 h-5 mx-auto mb-1 ${bidType === 'direct' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-semibold ${bidType === 'direct' ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'}`}>
                  Puja directa
                </p>
              </button>
            </div>
          </div>

          {/* Explicación del tipo seleccionado */}
          <div className={`flex items-start gap-2 p-3 rounded-xl border ${
            bidType === 'max'
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
          }`}>
            <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${bidType === 'max' ? 'text-green-500' : 'text-amber-500'}`} />
            <div>
              {bidType === 'max' ? (
                <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
                  <span className="font-semibold">Puja máxima:</span> El sistema puja automáticamente por ti hasta tu máximo. Solo se muestra lo necesario para liderar.
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                  <span className="font-semibold">Puja directa:</span> Tu monto se muestra públicamente de inmediato. Otros verán exactamente cuánto ofreciste.
                </p>
              )}
            </div>
          </div>

          {/* Input de monto */}
          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 flex items-center gap-1.5">
              {bidType === 'max' ? (
                <Shield className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              )}
              {bidType === 'max' ? 'Tu puja máxima (COP)' : 'Monto a pujar (COP)'}
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input
                type="text"
                placeholder={minBid.toLocaleString('es-CO')}
                value={amount}
                onChange={handleAmountChange}
                className={`pl-8 rounded-xl h-12 text-lg font-bold text-center border-2 ${
                  bidType === 'max'
                    ? 'border-green-200 focus:border-green-500'
                    : 'border-amber-200 focus:border-amber-500'
                }`}
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1.5">
              Mínimo: {formatPrice(minBid)} · Incremento: $200.000
            </p>
          </div>

          {/* Result feedback */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-sm font-medium ${
                result.outbid
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
            >
              {result.outbid ? (
                <>Ya existe una puja máxima superior. Puja visible: {formatShortPrice(result.visibleBid)}</>
              ) : (
                <>Lideras la puja con: {formatShortPrice(result.visibleBid)}</>
              )}
            </motion.div>
          )}

          {/* Botón confirmar */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValidBid}
            className={`w-full font-bold h-12 rounded-xl text-base transition-all ${
              isValidBid 
                ? bidType === 'max'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Procesando...
              </span>
            ) : (
              `${bidType === 'max' ? 'Establecer puja máxima' : 'Pujar directamente'} ${isValidBid ? formatShortPrice(bidAmount) : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
