import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Receipt, CreditCard, Building2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { publicationsApi } from '@/api/services';
import Skeleton from 'react-loading-skeleton';

const STATUS_CONFIG = {
  APPROVED:  { label: 'Aprobado',   variant: 'default',     icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
  PENDING:   { label: 'Pendiente',  variant: 'secondary',   icon: Clock,        className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  DECLINED:  { label: 'Declinado',  variant: 'destructive', icon: XCircle,      className: 'bg-red-100 text-red-700 border-red-200' },
  VOIDED:    { label: 'Anulado',    variant: 'destructive', icon: XCircle,      className: 'bg-red-100 text-red-700 border-red-200' },
};

const METHOD_LABELS = {
  CARD:              { label: 'Tarjeta',          icon: CreditCard },
  PSE:               { label: 'PSE',              icon: Building2 },
  NEQUI:             { label: 'Nequi',            icon: CreditCard },
  BANCOLOMBIA_TRANSFER: { label: 'Bancolombia',   icon: Building2 },
};

const RowSkeleton = () => (
  <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
    <Skeleton circle width={36} height={36} />
    <div style={{ flex: 1 }}>
      <Skeleton width="55%" height={14} />
      <Skeleton width="35%" height={11} style={{ marginTop: 5 }} />
    </div>
    <div style={{ textAlign: 'right' }}>
      <Skeleton width={70} height={14} />
      <Skeleton width={55} height={11} style={{ marginTop: 5 }} />
    </div>
  </div>
);

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function MisRecargas() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicationsApi.getMyTransactions()
      .then((data) => setTransactions(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/Cuenta')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <Receipt className="w-5 h-5 text-secondary" />
          <h1 className="text-xl font-bold text-foreground font-sans flex-1">Historial de recargas</h1>
        </div>

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div>{[1, 2, 3, 4].map(i => <RowSkeleton key={i} />)}</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">No tienes recargas registradas</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = status.icon;
              const method = tx.paymentMethod ? METHOD_LABELS[tx.paymentMethod] : null;
              const MethodIcon = method?.icon || CreditCard;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 border-b border-border last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <StatusIcon className={`w-4 h-4 ${tx.status === 'APPROVED' ? 'text-green-600' : tx.status === 'PENDING' ? 'text-yellow-600' : 'text-red-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {tx.quantity} créditos
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-[10px] px-1.5 py-0 border ${status.className}`}>
                        {status.label}
                      </Badge>
                      {method && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MethodIcon className="w-3 h-3" />
                          {method.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(tx.createdAt)}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{formatCOP(tx.amount)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[90px]">
                      {tx.reference?.split('-').slice(-1)[0]}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
