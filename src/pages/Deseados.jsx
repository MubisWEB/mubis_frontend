import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Clock, Check, X, Car, MapPin, Calendar, Gauge, Building2, Loader2, User as UserIcon } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { interestRequestsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/roles';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import SubscriptionGate from '../components/SubscriptionGate';

const REQUESTER_TABS = [
  { key: 'en_negociacion', label: 'En negociación' },
  { key: 'finalizados', label: 'Finalizados' },
];

const INCOMING_TABS = [
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'resueltos', label: 'Resueltos' },
];

function formatCountdown(deadline) {
  const remaining = new Date(deadline).getTime() - Date.now();
  if (remaining <= 0) return 'Expirado';
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function StatusBadge({ status }) {
  if (status === 'ACEPTADO') return <Badge className="bg-green-100 text-green-800 text-xs">Aceptado</Badge>;
  if (status === 'RECHAZADO') return <Badge className="bg-red-100 text-red-800 text-xs">Rechazado</Badge>;
  if (status === 'EXPIRADO') return <Badge className="bg-orange-100 text-orange-800 text-xs">Expirado</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 text-xs">En negociación</Badge>;
}

function RequestCard({ item, isIncoming, onAccept, onReject, acting }) {
  const details = item.vehicleDetails || {};
  return (
    <Card className="overflow-hidden border border-border/60 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Car className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-sm break-words min-w-0">{item.vehicleLabel}</h3>
            <div className="flex-shrink-0">
              <StatusBadge status={item.status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
            {details.year && <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{details.year}</span>}
            {details.km && <span className="flex items-center gap-0.5"><Gauge className="w-3 h-3" />{details.km?.toLocaleString('es-CO')} km</span>}
            {details.branchCity && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{details.branchCity}</span>}
            {details.version && <span>{details.version}</span>}
          </div>

          {item.branch && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 break-words">
              <Building2 className="w-3 h-3" /> {item.branch.name}
            </p>
          )}

          {/* Requester info — visible para dealer/admin */}
          {isIncoming && item.requester && (
            <div className="mt-2 text-xs text-foreground flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{item.requester.nombre}</span>
              {item.requester.telefono && <span className="text-muted-foreground ml-1">· {item.requester.telefono}</span>}
            </div>
          )}

          {/* Dealer info — visible para recomprador */}
          {!isIncoming && item.dealer && (
            <p className="mt-1 text-xs text-muted-foreground">
              Dealer: {item.dealer.nombre}
            </p>
          )}

          {/* Timer */}
          {item.status === 'EN_NEGOCIACION' && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
              <Clock className="w-3 h-3" />
              <span>Expira en {formatCountdown(item.deadline)}</span>
            </div>
          )}

          {/* Accept/Reject buttons — solo para incoming */}
          {isIncoming && item.status === 'EN_NEGOCIACION' && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onAccept(item.id)}
                disabled={acting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full h-8 text-xs font-semibold"
              >
                {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Aceptar</>}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(item.id)}
                disabled={acting}
                className="flex-1 rounded-full h-8 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50"
              >
                {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3 mr-1" />Rechazar</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const CardSkeleton = () => (
  <div className="rounded-xl border border-border overflow-hidden bg-card p-4">
    <div className="flex gap-3">
      <Skeleton width={40} height={40} borderRadius={8} />
      <div className="flex-1">
        <Skeleton width="55%" height={16} />
        <Skeleton width="70%" height={12} style={{ marginTop: 4 }} />
        <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
      </div>
    </div>
  </div>
);

export default function Deseados() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isRecomprador = role === 'recomprador';
  const isIncoming = !isRecomprador; // dealer / admin

  const tabs = isRecomprador ? REQUESTER_TABS : INCOMING_TABS;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = isRecomprador
        ? await interestRequestsApi.getMine()
        : await interestRequestsApi.getIncoming();
      setItems(data || []);
    } catch (err) {
      console.error('Error loading deseados:', err);
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    if (isRecomprador) {
      const en_negociacion = items.filter(i => i.status === 'EN_NEGOCIACION');
      const finalizados = items.filter(i => ['ACEPTADO', 'RECHAZADO', 'EXPIRADO'].includes(i.status));
      return { en_negociacion, finalizados };
    } else {
      // Incoming: pendientes = EN_NEGOCIACION, resueltos = rest
      const pendientes = items.filter(i => i.status === 'EN_NEGOCIACION');
      const resueltos = items.filter(i => i.status !== 'EN_NEGOCIACION');
      return { pendientes, resueltos };
    }
  }, [items, isRecomprador]);

  const currentList = grouped[activeTab] || [];

  async function handleAccept(id) {
    setActing(true);
    try {
      await interestRequestsApi.accept(id);
      toast.success('Solicitud aceptada');
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al aceptar');
    } finally {
      setActing(false);
    }
  }

  async function handleReject(id) {
    setActing(true);
    try {
      await interestRequestsApi.reject(id);
      toast.success('Solicitud rechazada');
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al rechazar');
    } finally {
      setActing(false);
    }
  }

  const emptyMessages = isRecomprador
    ? {
        en_negociacion: { title: 'Sin solicitudes en negociación', subtitle: 'Cuando contactes un vehículo desde Se Busca, aparecerá aquí' },
        finalizados: { title: 'Sin solicitudes finalizadas', subtitle: 'Las solicitudes aceptadas o rechazadas aparecerán aquí' },
      }
    : {
        pendientes: { title: 'Sin solicitudes pendientes', subtitle: 'Las solicitudes de interés de compradores aparecerán aquí' },
        resueltos: { title: 'Sin solicitudes resueltas', subtitle: 'El historial de solicitudes gestionadas aparecerá aquí' },
      };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="bg-card border-b border-border px-4 md:px-8 py-5">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(isRecomprador ? '/SeBusca' : '/MisSubastas')}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h1 className="text-2xl font-bold text-foreground">Deseados</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? 'No hay solicitudes de interés'
            : `${items.length} ${items.length === 1 ? 'solicitud' : 'solicitudes'} de interés`}
        </p>
      </div>

      <SubscriptionGate>
      {/* Tabs */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = grouped[tab.key]?.length || 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {emptyMessages[activeTab]?.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {emptyMessages[activeTab]?.subtitle}
            </p>
            {isRecomprador && activeTab === 'en_negociacion' && (
              <Button
                onClick={() => navigate('/SeBusca')}
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Buscar vehículos
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {currentList.map(item => (
              <RequestCard
                key={item.id}
                item={item}
                isIncoming={isIncoming}
                onAccept={handleAccept}
                onReject={handleReject}
                acting={acting}
              />
            ))}
          </motion.div>
        )}
      </div>

      </SubscriptionGate>

      <BottomNav />
    </div>
  );
}
