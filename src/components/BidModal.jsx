import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BidModal({ vehicle, open, onClose, onSubmit }) {
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
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setAmount('');
    setResult(null);
    onClose();
  };

  const suggestedBids = [
    minBid,
    minBid + 500000,
    minBid + 1000000
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setAmount(parseInt(value).toLocaleString('es-CO'));
    } else {
      setAmount('');
    }
    setResult(null);
  };

  const selectSuggestedBid = (bid) => {
    setAmount(bid.toLocaleString('es-CO'));
    setResult(null);
  };

  if (!vehicle) return null;

  const bidAmount = parseInt(amount.replace(/\D/g, '') || '0');
  const isValidBid = bidAmount >= minBid;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[380px] rounded-3xl p-0 overflow-hidden">
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
          {/* Puja actual visible */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-muted-foreground text-xs">Puja visible actual</p>
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

          {/* Explicación proxy bidding */}
          <div className="flex items-start gap-2 p-2.5 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-800">
            <EyeOff className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Puja automática</p>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 leading-relaxed">
                Introduce tu máximo. El sistema solo sube la puja lo necesario para que lideres. Tu máximo es privado.
              </p>
            </div>
          </div>

          {/* Input de oferta máxima */}
          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-violet-500" />
              Tu puja máxima (COP)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input
                type="text"
                placeholder={minBid.toLocaleString('es-CO')}
                value={amount}
                onChange={handleAmountChange}
                className="pl-8 rounded-xl h-12 text-lg font-bold text-center border-2 border-violet-200 focus:border-violet-500"
              />
            </div>
            <p className="text-muted-foreground text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Mínimo: {formatPrice(minBid)} · Incremento: $200.000
            </p>
          </div>

          {/* Pujas sugeridas */}
          <div>
            <Label className="text-muted-foreground text-xs mb-2 block">Pujas rápidas</Label>
            <div className="grid grid-cols-3 gap-2">
              {suggestedBids.map((bid) => (
                <motion.button
                  key={bid}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectSuggestedBid(bid)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    bidAmount === bid 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50'
                  }`}
                >
                  {formatShortPrice(bid)}
                </motion.button>
              ))}
            </div>
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
                <>⚠️ Ya existe una puja máxima superior. Puja visible: {formatShortPrice(result.visibleBid)}</>
              ) : (
                <>✅ ¡Lideras! Puja visible: {formatShortPrice(result.visibleBid)}</>
              )}
            </motion.div>
          )}

          {/* Botón confirmar */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValidBid}
            className={`w-full font-bold h-12 rounded-xl text-base transition-all ${
              isValidBid 
                ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Calculando...
              </span>
            ) : (
              `Establecer máximo ${isValidBid ? formatShortPrice(bidAmount) : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
