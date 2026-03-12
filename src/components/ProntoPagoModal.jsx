import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Banknote, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { prontoPagoApi } from '@/api/services';
import { toast } from 'sonner';

const DEFAULT_CONFIG = { maxPercent: 0.10, commission: 0.05 };

export default function ProntoPagoModal({ open, onClose, auction, userId, onComplete }) {
  const config = DEFAULT_CONFIG;
  const maxAmount = (auction?.current_bid || 0) * config.maxPercent;
  const [amount, setAmount] = useState(maxAmount);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (!open || !auction?.id) return;
    const loadExisting = async () => {
      try {
        const data = await prontoPagoApi.getByAuction(auction.id);
        setExisting(data || null);
      } catch {
        setExisting(null);
      }
    };
    loadExisting();
    setAmount((auction?.current_bid || 0) * config.maxPercent);
  }, [open, auction?.id]);

  const commission = amount * config.commission;
  const netAmount = amount - commission;

  const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(price);

  const handleRequest = async () => {
    if (!auction || !userId) return;
    try {
      await prontoPagoApi.request({
        auctionId: auction.id,
        requestedAmount: amount,
        vehicleValue: auction.current_bid || 0,
      });
      toast.success('¡Pronto Pago aprobado! Recibirás el dinero pronto.');
      onComplete?.();
      onClose();
    } catch (err) {
      toast.error('Error al solicitar Pronto Pago');
    }
  };

  if (!auction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-secondary" />
            Pronto Pago
          </DialogTitle>
          <DialogDescription>
            Recibe liquidez inmediata sobre tu subasta ganada.
          </DialogDescription>
        </DialogHeader>

        {existing ? (
          <div className="space-y-4 py-2">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">Pronto Pago ya aprobado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adelanto: {formatPrice(existing.requestedAmount)}<br />
                  Comisión ({(config.commission * 100).toFixed(0)}%): {formatPrice(existing.commission)}<br />
                  <span className="font-semibold text-foreground">Recibes: {formatPrice(existing.netAmount)}</span>
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" className="w-full">Cerrar</Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Vehículo</p>
              <p className="font-bold text-foreground">{auction.brand} {auction.model} {auction.year}</p>
              <p className="text-xs text-muted-foreground mt-1">Valor ganado: {formatPrice(auction.current_bid || 0)}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Monto del adelanto</p>
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-semibold text-sm px-3 py-1">
                  {formatPrice(amount)}
                </Badge>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(v) => setAmount(v[0])}
                min={100000}
                max={maxAmount}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{formatPrice(100000)}</span>
                <span>Máx: {formatPrice(maxAmount)} ({(config.maxPercent * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adelanto solicitado</span>
                <span className="font-medium text-foreground">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión ({(config.commission * 100).toFixed(0)}%)</span>
                <span className="font-medium text-destructive">-{formatPrice(commission)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="font-semibold text-foreground">Recibes</span>
                <span className="font-bold text-primary text-base">{formatPrice(netAmount)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-secondary/5 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                El Pronto Pago te da liquidez inmediata. Mubis cobra una comisión del {(config.commission * 100).toFixed(0)}% sobre el monto adelantado.
              </p>
            </div>

            <Button onClick={handleRequest} className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base rounded-xl">
              <Banknote className="w-5 h-5 mr-2" />
              Solicitar Pronto Pago
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
