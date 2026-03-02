import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BidModal({ vehicle, open, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentBid = vehicle?.current_bid || vehicle?.starting_price || 0;
  const minBid = currentBid + 500000;

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
    await onSubmit?.(bidAmount);
    setLoading(false);
    setAmount('');
    onClose();
  };

  const suggestedBids = [
    minBid,
    minBid + 1000000,
    minBid + 2000000
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setAmount(parseInt(value).toLocaleString('es-CO'));
    } else {
      setAmount('');
    }
  };

  const selectSuggestedBid = (bid) => {
    setAmount(bid.toLocaleString('es-CO'));
  };

  if (!vehicle) return null;

  const bidAmount = parseInt(amount.replace(/\D/g, '') || '0');
  const isValidBid = bidAmount >= minBid;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          {/* Puja actual */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-gray-500 text-xs">Puja actual</p>
              <p className="text-xl font-bold text-gray-900">
                {formatShortPrice(currentBid)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Users className="w-3 h-3" />
                  <span>{vehicle.bids_count || 0} pujas</span>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>

          {/* Input de oferta */}
          <div>
            <Label className="text-gray-700 font-semibold text-sm mb-2 block">Tu oferta (COP)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <Input
                type="text"
                placeholder={minBid.toLocaleString('es-CO')}
                value={amount}
                onChange={handleAmountChange}
                className="pl-8 rounded-xl h-12 text-lg font-bold text-center border-2 border-violet-200 focus:border-violet-500"
              />
            </div>
            <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Mínimo: {formatPrice(minBid)}
            </p>
          </div>

          {/* Pujas sugeridas */}
          <div>
            <Label className="text-gray-500 text-xs mb-2 block">Pujas rápidas</Label>
            <div className="grid grid-cols-3 gap-2">
              {suggestedBids.map((bid) => (
                <motion.button
                  key={bid}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectSuggestedBid(bid)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    bidAmount === bid 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                  }`}
                >
                  {formatShortPrice(bid)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Botón confirmar */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValidBid}
            className={`w-full font-bold h-12 rounded-xl text-base transition-all ${
              isValidBid 
                ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Enviando...
              </span>
            ) : (
              `Confirmar puja ${isValidBid ? formatShortPrice(bidAmount) : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}