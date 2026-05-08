import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings, LogOut, ChevronRight, Pencil, HelpCircle, Bell, Gavel, Car, ClipboardCheck, UserCheck, Bookmark, DollarSign, MessageCircle, Package, Trophy, TrendingUp, Target, LayoutDashboard, Building2, ImagePlus, Users, FileText, Handshake, Warehouse, SlidersHorizontal, Heart, Receipt } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_BADGE_CLASS, ROLE_LABELS } from '@/lib/roles';
import { notificationsApi, publicationsApi, authApi } from '@/api/services';
import { subscriptionsApi } from '../lib/subscriptionsApi';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { CreditCard, CalendarDays, RefreshCw, XCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

// ─── Subscription management component ───────────────────────────────────────

const PLAN_LABELS   = { MONTHLY: '1 mes', BIANNUAL: '6 meses', ANNUAL: '12 meses' };
const PLAN_PRICES   = { MONTHLY: 1_000_000, BIANNUAL: 5_700_000, ANNUAL: 10_560_000 };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function StatusBadge({ status, cancelAtPeriodEnd }) {
  if (status === 'ACTIVE' && cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
        <Clock className="w-3 h-3" /> Activa · se cancela al vencer
      </span>
    );
  }
  const map = {
    ACTIVE:       { cls: 'bg-green-100 text-green-700',  Icon: CheckCircle2, label: 'Activa'            },
    GRACE_PERIOD: { cls: 'bg-amber-100 text-amber-700',  Icon: AlertTriangle, label: 'Período de gracia' },
    EXPIRED:      { cls: 'bg-red-100 text-red-600',      Icon: XCircle,      label: 'Vencida'            },
    CANCELLED:    { cls: 'bg-gray-100 text-gray-500',    Icon: XCircle,      label: 'Cancelada'          },
    PAYMENT_FAILED:{ cls: 'bg-red-100 text-red-600',    Icon: XCircle,      label: 'Pago fallido'       },
  };
  const cfg = map[status] ?? { cls: 'bg-gray-100 text-gray-500', Icon: Clock, label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function SubscriptionManagement({ subInfo, setSubInfo, user, navigate, refreshUser }) {
  const [cancelDialogOpen, setCancelDialogOpen]     = React.useState(false);
  const [cancelling, setCancelling]                 = React.useState(false);
  const [reactivating, setReactivating]             = React.useState(false);

  const status            = subInfo?.status;
  const cancelAtPeriodEnd = user?.subscriptionCancelAtPeriodEnd ?? subInfo?.cancelAtPeriodEnd ?? false;
  const isActive          = status === 'ACTIVE';
  const isExpiredOrGone   = status === 'EXPIRED' || status === 'GRACE_PERIOD' || status === 'CANCELLED';
  const hasNoSub          = !status || status === 'PAYMENT_FAILED';

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await subscriptionsApi.cancel();
      toast.success('Suscripción cancelada', {
        description: `Tu acceso continúa activo hasta el ${fmtDate(res.accessUntil)}.`,
      });
      setCancelDialogOpen(false);
      await refreshUser();
      const fresh = await subscriptionsApi.getMySubscription().catch(() => null);
      if (fresh) setSubInfo(fresh);
    } catch (e) {
      toast.error(e.message ?? 'Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  }

  async function handleReactivate() {
    setReactivating(true);
    try {
      await subscriptionsApi.reactivate();
      toast.success('Suscripción reactivada', { description: 'Tu acceso continúa normalmente.' });
      await refreshUser();
      const fresh = await subscriptionsApi.getMySubscription().catch(() => null);
      if (fresh) setSubInfo(fresh);
    } catch (e) {
      toast.error(e.message ?? 'Error al reactivar la suscripción');
    } finally {
      setReactivating(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--gradient-purple)' }}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-white/80" />
            <span className="text-sm font-semibold text-white">Administrar Suscripción</span>
          </div>
          {status && <StatusBadge status={status} cancelAtPeriodEnd={cancelAtPeriodEnd} />}
        </div>

        <div className="p-5 space-y-4">

          {/* ── No subscription ── */}
          {hasNoSub && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                No tienes una suscripción activa. Activa tu plan para operar en Mubis.
              </p>
              <Button
                onClick={() => navigate('/Suscripcion')}
                className="w-full text-white font-semibold rounded-xl"
                style={{ background: 'var(--gradient-purple)' }}
              >
                Ver planes y suscribirme
              </Button>
            </div>
          )}

          {/* ── Active subscription ── */}
          {isActive && (
            <>
              {/* Plan + dates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-semibold text-foreground">
                    {PLAN_LABELS[subInfo.plan] ?? subInfo.plan}
                    {subInfo.plan && (
                      <span className="ml-2 text-muted-foreground font-normal">
                        · {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(PLAN_PRICES[subInfo.plan] ?? 0)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {cancelAtPeriodEnd ? 'Acceso activo hasta' : 'Renueva el'}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {fmtDate(subInfo.endAt)}
                  </span>
                </div>
              </div>

              {/* Cancellation notice */}
              {cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Tu suscripción <strong>no se renovará</strong>. El acceso permanece activo hasta el{' '}
                    <strong>{fmtDate(subInfo.endAt)}</strong>, fecha en que se cancelará automáticamente.
                  </p>
                </div>
              )}

              {/* Grace period notice */}
              {subInfo.gracePeriodEndsAt && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Tienes un negocio abierto. Renueva antes del{' '}
                    <strong>{fmtDate(subInfo.gracePeriodEndsAt)}</strong> para evitar el cierre automático.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {/* Change plan */}
                <Button
                  variant="outline"
                  onClick={() => navigate('/Suscripcion')}
                  className="w-full rounded-xl text-secondary border-secondary hover:bg-secondary/5 font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cambiar de plan
                </Button>

                {/* Cancel / Reactivate */}
                {cancelAtPeriodEnd ? (
                  <Button
                    variant="outline"
                    onClick={handleReactivate}
                    disabled={reactivating}
                    className="w-full rounded-xl font-semibold border-primary text-primary hover:bg-primary/5"
                  >
                    {reactivating ? 'Reactivando...' : '↩ Mantener suscripción'}
                  </Button>
                ) : (
                  <button
                    onClick={() => setCancelDialogOpen(true)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors text-center py-1"
                  >
                    Cancelar suscripción
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Expired / grace / cancelled ── */}
          {isExpiredOrGone && (
            <div className="space-y-3">
              {subInfo.endAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Venció el</span>
                  <span className="text-sm text-foreground">{fmtDate(subInfo.endAt)}</span>
                </div>
              )}
              {subInfo.gracePeriodEndsAt && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Tienes un negocio abierto en riesgo. Renueva antes del{' '}
                    <strong>{fmtDate(subInfo.gracePeriodEndsAt)}</strong>.
                  </p>
                </div>
              )}
              <Button
                onClick={() => navigate('/Suscripcion')}
                className="w-full text-white font-semibold rounded-xl"
                style={{ background: 'var(--gradient-purple)' }}
              >
                Renovar suscripción
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Cancel confirmation dialog ── */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Cancelar suscripción
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Al cancelar, <strong>mantienes el acceso completo hasta el{' '}
              {fmtDate(subInfo?.endAt)}</strong>. Después de esa fecha tu cuenta quedará inactiva y no se hará ningún cobro adicional.
            </p>
            <div className="p-3 bg-muted rounded-xl space-y-1">
              <p className="text-xs text-muted-foreground">✓ Acceso activo hasta el {fmtDate(subInfo?.endAt)}</p>
              <p className="text-xs text-muted-foreground">✓ Sin cobros adicionales</p>
              <p className="text-xs text-muted-foreground">✓ Puedes reactivar antes de esa fecha</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="flex-1 rounded-xl">
              Mantener plan
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ─── End subscription management ─────────────────────────────────────────────

const TYPE_ICONS = {
  auction_published: Car,
  new_bid: Gavel,
  bid_surpassed: Gavel,
  inspection_taken: ClipboardCheck,
  inspection_completed: ClipboardCheck,
  user_approved: UserCheck,
};

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

export default function Cuenta() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, isLoadingAuth } = useAuth();
  const role = user?.role;
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.nombre || '');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState(user?.telefono || '');
  const [phoneStep, setPhoneStep] = useState('idle'); // 'idle' | 'codeSent' | 'verified'
  const [smsCode, setSmsCode] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pubBalance, setPubBalance] = useState(0);
  const [rechargeQty, setRechargeQty] = useState(50);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const canManagePublications = ['dealer', 'admin_general', 'admin_sucursal'].includes(role);
  const isRecomprador = user?.role === 'recomprador';
  const [subInfo, setSubInfo] = useState(null);

  useEffect(() => {
    if (isRecomprador) {
      subscriptionsApi.getMySubscription().then(setSubInfo).catch(() => {});
    }
  }, [isRecomprador]);

  useEffect(() => {
    if (user) {
      const load = async () => {
        try {
          const [notifs, balanceData] = await Promise.all([
            notificationsApi.getAll().catch(() => []),
            publicationsApi.getBalance().catch(() => null),
          ]);
          const notifList = notifs || [];
          setNotifications(notifList.slice(0, 3));
          setUnreadCount(notifList.filter(n => !n.read).length);
          setPubBalance(balanceData?.balance ?? balanceData ?? 0);
        } catch { /* ignore */ }
      };
      load();
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (!editName.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!editPassword) { toast.error('Debes ingresar tu contraseña actual'); return; }
    setSavingName(true);
    try {
      await authApi.updateProfile(editName.trim(), editPassword);
      await refreshUser();
      toast.success('Nombre actualizado');
      setEditPassword('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar nombre';
      toast.error(typeof msg === 'string' ? msg : msg[0] || 'Error');
    } finally {
      setSavingName(false);
    }
  };

  const handleRequestPhoneCode = async () => {
    if (!editPhone.trim()) { toast.error('Ingresa un número de teléfono'); return; }
    setSavingPhone(true);
    try {
      await authApi.requestPhoneVerification(editPhone.trim());
      setPhoneStep('codeSent');
      toast.info('Código enviado', { description: `Se envió un SMS a ${editPhone}` });
    } catch (err) {
      toast.error('Error al enviar código');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!smsCode.trim()) { toast.error('Ingresa el código de verificación'); return; }
    setSavingPhone(true);
    try {
      await authApi.verifyPhone(editPhone.trim(), smsCode.trim());
      await refreshUser();
      toast.success('Teléfono actualizado');
      setPhoneStep('idle');
      setSmsCode('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Código incorrecto';
      toast.error(typeof msg === 'string' ? msg : msg[0] || 'Error');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      const notifs = await notificationsApi.getAll();
      setNotifications((notifs || []).slice(0, 3));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      const notifs = await notificationsApi.getAll();
      const notifList = notifs || [];
      setNotifications(notifList.slice(0, 3));
      setUnreadCount(notifList.filter(n => !n.read).length);
    } catch { /* ignore */ }
  };

  const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const handleRecharge = async () => {
    if (!user) return;
    try {
      // Create checkout session with Wompi
      const checkout = await publicationsApi.createCheckout(rechargeQty);
      
      // Show success message
      toast.success('Abriendo pasarela de pago...', { 
        description: `Total: ${formatCOP(checkout.amount)}` 
      });

      // Open Wompi checkout in new window/tab
      const paymentWindow = window.open(
        checkout.checkoutUrl, 
        'wompi_checkout',
        'width=600,height=800,left=200,top=100'
      );

      // Check if popup was blocked
      if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
        toast.error('Por favor habilita los popups para continuar con el pago');
        return;
      }

      // Monitor payment window closure
      const checkWindowClosed = setInterval(async () => {
        if (paymentWindow.closed) {
          clearInterval(checkWindowClosed);
          
          // Reload balance after payment window closes
          try {
            const balanceData = await publicationsApi.getBalance();
            setPubBalance(balanceData?.balance ?? balanceData ?? 0);
            toast.success('Balance actualizado');
            setRechargeOpen(false);
            setRechargeQty(10);
          } catch (err) {
            console.error('Error reloading balance:', err);
          }
        }
      }, 500);
    } catch (err) {
      console.error('Error creating checkout:', err);
      toast.error('Error al crear la sesión de pago');
    }
  };

  const PUBLICATION_PRICE_PER_UNIT = 1000;
  const getPublicationPrice = (qty) => qty * PUBLICATION_PRICE_PER_UNIT;

  const menuItems = [
    { icon: Bell, label: 'Notificaciones', action: () => navigate('/Notificaciones'), badge: unreadCount > 0 ? unreadCount : null },
    { icon: Pencil, label: 'Mi perfil', action: () => { setEditName(user?.nombre || ''); setEditPhone(user?.telefono || ''); setEditPassword(''); setPhoneStep('idle'); setSmsCode(''); setEditOpen(true); } },
    { icon: Settings, label: 'Configuración', action: () => navigate('/Configuracion') },
    { icon: HelpCircle, label: 'Ayuda y soporte', action: () => navigate('/AyudaSoporte') },
  ];

  if (role === 'dealer' || role === 'recomprador') {
    menuItems.splice(1, 0,
      { icon: SlidersHorizontal, label: 'Preferencias', action: () => navigate('/Preferencias') },
      { icon: DollarSign, label: 'Mis Movimientos', action: () => navigate('/Movimientos') },
      ...(role === 'dealer' ? [{ icon: Receipt, label: 'Historial de recargas', action: () => navigate('/MisRecargas') }] : []),
      { icon: Trophy, label: 'Ganadas', action: () => navigate('/Ganados') },
      { icon: TrendingUp, label: 'Analítica', action: () => navigate('/MiRendimiento') },
      { icon: Target, label: 'Mis Metas', action: () => navigate('/MisMetas') },
      { icon: Heart, label: 'Deseados', action: () => navigate('/Deseados') },
      { icon: MessageCircle, label: 'Mubis Soporte - Casos', action: () => navigate('/SoporteCasos') },
    );
  }

  if (role === 'superadmin') {
    menuItems.splice(0, 0,
      { icon: ImagePlus, label: 'Gestionar Banners', action: () => navigate('/AdminBanners') },
      { icon: Users, label: 'Gestionar Aliados', action: () => navigate('/AdminAliados') },
      { icon: Handshake, label: 'Gestión de Partners', action: () => navigate('/AdminPartners') },
    );
  }
  if (role === 'admin_general') {
    menuItems.splice(0, 0, { icon: LayoutDashboard, label: 'Panel General', action: () => navigate('/AdminGeneralDashboard') });
    menuItems.splice(1, 0,
      { icon: FileText, label: 'Solicitudes', action: () => navigate('/AdminSolicitudes') },
      { icon: DollarSign, label: 'Mis Movimientos', action: () => navigate('/Movimientos') },
      { icon: Trophy, label: 'Ganadas', action: () => navigate('/Ganados') },
      { icon: Heart, label: 'Deseados', action: () => navigate('/Deseados') },
      { icon: MessageCircle, label: 'Mubis Soporte - Casos', action: () => navigate('/SoporteCasos') },
    );
  }
  if (role === 'admin_sucursal') {
    menuItems.splice(0, 0, { icon: Building2, label: 'Panel de Sucursal', action: () => navigate('/AdminSucursalDashboard') });
    menuItems.splice(1, 0,
      { icon: Warehouse, label: 'Inventario', action: () => navigate('/AdminInventarioSucursal') },
      { icon: FileText, label: 'Solicitudes', action: () => navigate('/AdminSolicitudes') },
      { icon: DollarSign, label: 'Mis Movimientos', action: () => navigate('/Movimientos') },
      { icon: Trophy, label: 'Ganadas', action: () => navigate('/Ganados') },
      { icon: Heart, label: 'Deseados', action: () => navigate('/Deseados') },
      { icon: MessageCircle, label: 'Mubis Soporte - Casos', action: () => navigate('/SoporteCasos') },
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Skeleton circle width={64} height={64} />
            <div style={{ flex: 1 }}>
              <Skeleton width="55%" height={20} />
              <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
              <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
              <Skeleton width={80} height={20} borderRadius={999} style={{ marginTop: 6 }} />
            </div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <Skeleton circle width={36} height={36} />
                <Skeleton width="50%" height={14} />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Profile header */}
      <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">{getInitials(user?.nombre)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-foreground font-sans truncate">{user?.nombre || 'Usuario'}</p>
            <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
            <p className="text-muted-foreground text-xs">{user?.company} · {user?.branch}</p>
            {user?.telefono && <p className="text-muted-foreground text-xs">{user.telefono}</p>}
            <Badge className={`mt-1 font-medium text-xs hover:bg-opacity-100 ${ROLE_BADGE_CLASS[role] || ''}`}>{ROLE_LABELS[role] || role}</Badge>
          </div>
        </motion.div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-4 space-y-4">

        {/* Recharge Publications */}
        {canManagePublications && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Package className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recargar publicaciones</p>
            </div>
            <Card className="border border-border shadow-sm rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Disponibles:</p>
                <p className="text-2xl font-bold text-secondary">{pubBalance}</p>
              </div>
              {!rechargeOpen ? (
                <Button onClick={() => setRechargeOpen(true)} className="w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  Comprar publicaciones
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Cantidad</Label>
                      <span className="text-lg font-bold text-foreground">{rechargeQty}</span>
                    </div>
                    <Slider
                      value={[rechargeQty]}
                      onValueChange={([v]) => setRechargeQty(v)}
                      min={50}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>50</span><span>1.000</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total a pagar</p>
                    <p className="text-xl font-bold text-foreground">{formatCOP(getPublicationPrice(rechargeQty))}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setRechargeOpen(false)} className="rounded-xl">Cancelar</Button>
                    <Button onClick={handleRecharge} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Pagar</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* ── Administrar Suscripción — recompradores only ── */}
        {isRecomprador && (
          <SubscriptionManagement
            subInfo={subInfo}
            setSubInfo={setSubInfo}
            user={user}
            navigate={navigate}
            refreshUser={refreshUser}
          />
        )}

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-foreground/80 text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Button variant="outline" className="w-full h-11 rounded-full border-destructive text-destructive hover:bg-red-600 hover:text-black hover:border-red-600 font-medium" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Cerrar sesión
          </Button>
        </motion.div>
        <p className="text-center text-muted-foreground text-xs mt-2">Mubis v1.0.0 · Colombia 🇨🇴</p>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Mi perfil</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name section */}
            <Card className="p-4 border border-border/60 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-foreground">Cambiar nombre</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-xs">Nombre</Label>
                  <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tu nombre completo" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-password" className="text-xs">Contraseña actual</Label>
                  <Input id="edit-password" type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Tu contraseña" />
                </div>
              </div>
              <Button onClick={handleSaveName} disabled={savingName || !editName.trim() || !editPassword} className="w-full rounded-xl" size="sm">
                {savingName ? 'Guardando...' : 'Actualizar nombre'}
              </Button>
            </Card>

            {/* Phone section */}
            <Card className="p-4 border border-border/60 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-foreground">Cambiar teléfono</p>
              {phoneStep === 'idle' ? (
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="edit-phone" className="text-xs">Nuevo teléfono</Label>
                    <Input id="edit-phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="300 000 0000" />
                  </div>
                  <Button onClick={handleRequestPhoneCode} disabled={savingPhone || !editPhone.trim()} variant="outline" className="rounded-xl whitespace-nowrap" size="sm">
                    {savingPhone ? 'Enviando...' : 'Enviar código'}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Teléfono</Label>
                    <Input value={editPhone} disabled className="w-28" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="sms-code" className="text-xs">Código SMS</Label>
                    <Input id="sms-code" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="1234" maxLength={4} className="text-center tracking-widest" />
                  </div>
                  <Button variant="ghost" onClick={() => { setPhoneStep('idle'); setSmsCode(''); }} className="rounded-xl px-2" size="sm">Cambiar</Button>
                  <Button onClick={handleVerifyPhone} disabled={savingPhone || !smsCode.trim()} className="rounded-xl whitespace-nowrap" size="sm">
                    {savingPhone ? '...' : 'Verificar'}
                  </Button>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-2 gap-3 opacity-60">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Empresa / Sucursal</Label>
                <Input value={`${user?.company || ''} · ${user?.branch || ''}`} disabled />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
