import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Loader2, ReceiptText, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { transactionsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

function TransactionDetail({ tx, onClose }) {
  if (!tx) return null;
  return (
    <Dialog open={!!tx} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg">{tx.vehicleLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estado</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status]}`}>
              {STATUS_LABELS[tx.status] || tx.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto final</span>
            <span className="font-bold text-foreground">{formatPrice(tx.finalAmount)}</span>
          </div>
          {tx.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pago</span>
              <span className="text-foreground">{tx.paymentMethod}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span className="text-foreground">{formatDate(tx.createdAt)}</span>
          </div>
          {tx.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completado</span>
              <span className="text-foreground">{formatDate(tx.completedAt)}</span>
            </div>
          )}
          {tx.cancelledAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cancelado</span>
              <span className="text-foreground">{formatDate(tx.cancelledAt)}</span>
            </div>
          )}
          {tx.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-muted-foreground mb-1">Notas</p>
              <p className="text-foreground">{tx.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Movimientos() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const data = await transactionsApi.getMine();
      setTransactions(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  }

  const filtered = statusFilter === 'all'
    ? transactions
    : transactions.filter(t => t.status === statusFilter);

  const totalRevenue = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.finalAmount || 0), 0);

  const pending = transactions.filter(t => t.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Movimientos" showBack />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-foreground font-mono">{transactions.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
            <p className="text-2xl font-bold text-yellow-600 font-mono">{pending}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </Card>
          <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
            <p className="text-lg font-bold text-primary font-mono">
              {totalRevenue > 0 ? `$${(totalRevenue / 1000000).toFixed(0)}M` : '$0'}
            </p>
            <p className="text-xs text-muted-foreground">Completado</p>
          </Card>
        </div>

        {/* Filtro */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9 text-sm rounded-xl">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="IN_REVIEW">En revisión</SelectItem>
              <SelectItem value="COMPLETED">Completado</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ReceiptText className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1 font-sans">Sin movimientos</h3>
            <p className="text-muted-foreground text-sm">Cuando realices transacciones, se mostrarán aquí.</p>
          </motion.div>
        ) : (
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card">
            {filtered.map((tx, i) => {
              const isSale = role === 'dealer' && tx.sellerId === user?.id;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelected(tx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSale ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      {isSale
                        ? <ArrowDownLeft className="w-5 h-5 text-primary" />
                        : <ArrowUpRight className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{tx.vehicleLabel}</p>
                      <p className="text-muted-foreground text-xs">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-foreground text-sm">{formatPrice(tx.finalAmount)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[tx.status]}`}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </Card>
        )}
      </div>

      <TransactionDetail tx={selected} onClose={() => setSelected(null)} />
      <BottomNav />
    </div>
  );
}
