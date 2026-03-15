import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronUp, Loader2, Trophy, Store } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { b2bApi } from '@/api/services';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

const OFFER_STATUS = {
  PENDING:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprobada',   color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazada',  color: 'bg-red-100 text-red-800' },
  PARTIAL:  { label: 'Parcial',    color: 'bg-blue-100 text-blue-800' },
};

const ITEM_STATUS = {
  PENDING:  { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Aceptado',  color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
};

function OfferCard({ offer, index }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const status = OFFER_STATUS[offer.status] || { label: offer.status, color: 'bg-muted text-muted-foreground' };
  const hasAccepted = (offer.items || []).some(it => it.status === 'ACCEPTED');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
      <Card className="border border-border rounded-xl shadow-sm overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(offer.createdAt)}</span>
              </div>
              <p className="font-bold text-foreground mt-1">{formatPrice(offer.totalAmount || 0)}</p>
              <p className="text-xs text-muted-foreground">{(offer.items || []).length} vehículo{offer.items?.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasAccepted && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs rounded-full border-primary text-primary"
                  onClick={(e) => { e.stopPropagation(); navigate('/Ganados'); }}
                >
                  <Trophy className="w-3 h-3 mr-1" />Ver compras
                </Button>
              )}
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>

          {offer.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">"{offer.notes}"</p>
          )}
          {offer.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">Motivo de rechazo: {offer.rejectionReason}</p>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ítems de la oferta</p>
                {(offer.items || []).map((item, i) => {
                  const itemStatus = ITEM_STATUS[item.status] || { label: item.status, color: 'bg-muted text-muted-foreground' };
                  const auction = item.auction;
                  return (
                    <div key={item.id || i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {auction ? `${auction.brand} ${auction.model} ${auction.year}` : `Subasta #${item.auctionId}`}
                        </p>
                        {auction?.current_bid && (
                          <p className="text-muted-foreground">Puja: {formatPrice(auction.current_bid)}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-bold text-secondary">{formatPrice(item.proposedAmount)}</p>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${itemStatus.color}`}>
                          {itemStatus.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function MisOfertas() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      setLoading(true);
      const data = await b2bApi.getMyOffers();
      setOffers(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pending = offers.filter(o => o.status === 'PENDING').length;
  const approved = offers.filter(o => o.status === 'APPROVED' || o.status === 'PARTIAL').length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Mis Ofertas B2B" showBack />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Resumen */}
        {offers.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold font-mono text-foreground">{offers.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </Card>
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold font-mono text-yellow-600">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </Card>
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold font-mono text-green-600">{approved}</p>
              <p className="text-xs text-muted-foreground">Aprobadas</p>
            </Card>
          </div>
        )}

        {/* Botón al catálogo */}
        <Button
          variant="outline"
          className="w-full rounded-full border-secondary text-secondary hover:bg-secondary/5"
          onClick={() => navigate('/B2BCatalogo')}
        >
          <Store className="w-4 h-4 mr-2" />Ver catálogo y crear nueva oferta
        </Button>

        {/* Lista */}
        {offers.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-secondary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Sin ofertas aún</h3>
            <p className="text-muted-foreground text-sm mb-4">Explora el catálogo mayorista y envía tu primera oferta.</p>
            <Button onClick={() => navigate('/B2BCatalogo')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
              Ir al catálogo
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {offers.map((o, i) => (
              <OfferCard key={o.id} offer={o} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
