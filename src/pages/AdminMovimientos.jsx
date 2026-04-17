import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2, RefreshCw, ReceiptText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { transactionsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revision',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const STATUS_CLASSES = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const COP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

function backPath(role) {
  if (role === 'admin_general') return '/AdminGeneralDashboard';
  if (role === 'admin_sucursal') return '/AdminSucursalDashboard';
  return '/AdminDashboard';
}

export default function AdminMovimientos() {
  const { user } = useAuth();
  const role = user?.role;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  async function fetchTransactions() {
    try {
      setLoading(true);
      const data = await transactionsApi.getAll();
      setTransactions(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return transactions;
    return transactions.filter((tx) => tx.status === statusFilter);
  }, [transactions, statusFilter]);

  const completedTotal = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status === 'COMPLETED')
        .reduce((sum, tx) => sum + Number(tx.finalAmount || 0), 0),
    [transactions],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header
        title="Movimientos"
        subtitle={`${transactions.length} transacciones en tu alcance`}
        backTo={backPath(role)}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 border border-border rounded-xl shadow-sm bg-card">
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-4 border border-border rounded-xl shadow-sm bg-card">
            <p className="text-2xl font-bold text-yellow-700">
              {transactions.filter((tx) => tx.status === 'PENDING').length}
            </p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </Card>
          <Card className="p-4 border border-border rounded-xl shadow-sm bg-card">
            <p className="text-2xl font-bold text-green-700">
              {transactions.filter((tx) => tx.status === 'COMPLETED').length}
            </p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </Card>
          <Card className="p-4 border border-border rounded-xl shadow-sm bg-card">
            <p className="text-lg font-bold text-primary">{COP(completedTotal)}</p>
            <p className="text-xs text-muted-foreground">Valor cerrado</p>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9 rounded-xl bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="IN_REVIEW">En revision</SelectItem>
              <SelectItem value="COMPLETED">Completadas</SelectItem>
              <SelectItem value="CANCELLED">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTransactions} className="h-9 rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{filtered.length} resultados</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ReceiptText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <Card key={tx.id} className="p-4 border border-border rounded-xl shadow-sm bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{tx.vehicleLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(tx.createdAt)}
                      {tx.completedAt ? ` | Cerrada ${formatDate(tx.completedAt)}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Comprador: {tx.buyer?.nombre || tx.buyerId} | Vendedor: {tx.seller?.nombre || tx.sellerId}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">{COP(tx.finalAmount)}</p>
                    <Badge className={`mt-1 border ${STATUS_CLASSES[tx.status] || 'bg-muted text-foreground'}`}>
                      {STATUS_LABELS[tx.status] || tx.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
