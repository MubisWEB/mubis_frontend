import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Store, ShoppingCart, CheckSquare, Square, Loader2, Car } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { b2bApi } from '@/api/services';
import VehicleThumbnail from '@/components/VehicleThumbnail';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function B2BCatalogo() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { auctionId: proposedAmount }
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  async function fetchCatalog() {
    try {
      setLoading(true);
      const data = await b2bApi.getCatalog();
      setCatalog(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(auction) {
    setSelected(prev => {
      const next = { ...prev };
      if (next[auction.id] !== undefined) {
        delete next[auction.id];
      } else {
        next[auction.id] = auction.current_bid || 0;
      }
      return next;
    });
  }

  function setAmount(auctionId, value) {
    setSelected(prev => ({ ...prev, [auctionId]: Number(value) || 0 }));
  }

  const selectedItems = catalog.filter(a => selected[a.id] !== undefined);
  const totalAmount = selectedItems.reduce((sum, a) => sum + (selected[a.id] || 0), 0);

  async function handleSubmitOffer() {
    if (selectedItems.length === 0) return;
    try {
      setSubmitting(true);
      const items = selectedItems.map(a => ({
        auctionId: a.id,
        proposedAmount: selected[a.id],
      }));
      await b2bApi.createOffer({ items, notes: notes || undefined });
      toast.success('Oferta enviada exitosamente');
      setConfirmOpen(false);
      setSelected({});
      setNotes('');
      navigate('/MisOfertas');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al enviar la oferta');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Catálogo B2B" showBack />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{catalog.length} vehículos disponibles</p>
          {selectedItems.length > 0 && (
            <Button
              onClick={() => setConfirmOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Enviar oferta ({selectedItems.length})
            </Button>
          )}
        </div>

        {catalog.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-secondary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Catálogo vacío</h3>
            <p className="text-muted-foreground text-sm">No hay vehículos disponibles para oferta mayorista en este momento.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {catalog.map((auction, i) => {
              const isSelected = selected[auction.id] !== undefined;
              return (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={`border rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer ${
                      isSelected ? 'border-secondary shadow-md ring-1 ring-secondary/30' : 'border-border hover:shadow-md'
                    }`}
                    onClick={() => toggleItem(auction)}
                  >
                    {/* Imagen */}
                    <VehicleThumbnail src={auction.photos?.[0]} alt={`${auction.brand} ${auction.model}`} className="h-40 w-full">
                      {!auction.photos?.[0] && <Car className="absolute inset-0 m-auto w-12 h-12 text-muted-foreground/30" />}
                      <div className="absolute top-2 right-2">
                        {isSelected
                          ? <CheckSquare className="w-6 h-6 text-secondary drop-shadow" />
                          : <Square className="w-6 h-6 text-white/80 drop-shadow" />}
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-secondary/90 text-white text-[10px] border-0">Oferta mayorista</Badge>
                      </div>
                    </VehicleThumbnail>

                    <div className="p-3">
                      <p className="font-bold text-foreground">{auction.brand} {auction.model}</p>
                      <p className="text-xs text-muted-foreground">{auction.year} · {(auction.km || 0).toLocaleString()} km</p>
                      <p className="font-semibold text-primary mt-2">{formatPrice(auction.current_bid || 0)}</p>
                      <p className="text-[10px] text-muted-foreground">Puja actual</p>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                          <Label className="text-xs text-muted-foreground">Tu precio de oferta</Label>
                          <Input
                            type="number"
                            className="mt-1 h-8 text-sm rounded-lg"
                            value={selected[auction.id] || ''}
                            onChange={(e) => setAmount(auction.id, e.target.value)}
                            placeholder="Monto en COP"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flotante de resumen */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4">
          <div className="max-w-md mx-auto bg-secondary text-secondary-foreground rounded-2xl p-3 shadow-lg flex items-center justify-between">
            <div>
              <p className="font-bold">{selectedItems.length} vehículo{selectedItems.length !== 1 ? 's' : ''}</p>
              <p className="text-xs opacity-80">Total: {formatPrice(totalAmount)}</p>
            </div>
            <Button
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="bg-white text-secondary hover:bg-white/90 font-bold rounded-xl"
            >
              Enviar oferta
            </Button>
          </div>
        </div>
      )}

      {/* Dialog confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar oferta mayorista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedItems.map(a => (
                <div key={a.id} className="flex justify-between text-sm p-2 bg-muted rounded-lg">
                  <span className="font-medium">{a.brand} {a.model} {a.year}</span>
                  <span className="font-bold text-secondary">{formatPrice(selected[a.id])}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
              <span>Total oferta</span>
              <span className="text-secondary">{formatPrice(totalAmount)}</span>
            </div>
            <div>
              <Label className="text-sm">Notas (opcional)</Label>
              <Textarea
                className="mt-1 resize-none h-20 text-sm"
                placeholder="Cualquier comentario sobre la oferta..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmitOffer}
              disabled={submitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar oferta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
