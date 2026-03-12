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
import { Settings, LogOut, ChevronRight, Pencil, HelpCircle, Bell, Gavel, Car, ClipboardCheck, UserCheck, Bookmark, DollarSign, MessageCircle, Package } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { notificationsApi, publicationsApi, usersApi } from '@/api/services';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';

const ROLE_LABELS = { dealer: 'Dealer', recomprador: 'Recomprador', perito: 'Perito', admin: 'Administrador' };
const ROLE_BADGE_CLASS = { dealer: 'bg-secondary/10 text-secondary', recomprador: 'bg-primary/10 text-primary', perito: 'bg-secondary/10 text-secondary', admin: 'bg-destructive/10 text-destructive' };

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
  const [editPhone, setEditPhone] = useState(user?.telefono || '');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pubBalance, setPubBalance] = useState(0);
  const [rechargeQty, setRechargeQty] = useState(10);
  const [rechargeOpen, setRechargeOpen] = useState(false);

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

  const handleSaveProfile = async () => {
    if (!editName.trim()) { toast.error('El nombre es obligatorio'); return; }
    try {
      await usersApi.update(user.id, { nombre: editName.trim(), telefono: editPhone.trim() });
      await refreshUser();
      toast.success('Cambios guardados');
      setEditOpen(false);
    } catch (err) {
      toast.error('Error al guardar cambios');
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
      const result = await publicationsApi.recharge(user.id, rechargeQty);
      const newBalance = result?.balance ?? (pubBalance + rechargeQty);
      setPubBalance(newBalance);
      toast.success(`¡Recarga exitosa!`, { description: `${rechargeQty} publicaciones añadidas. Balance: ${newBalance}` });
      setRechargeOpen(false);
      setRechargeQty(10);
    } catch (err) {
      toast.error('Error al recargar publicaciones');
    }
  };

  const PUBLICATION_PRICE_PER_UNIT = 15000;
  const getPublicationPrice = (qty) => qty * PUBLICATION_PRICE_PER_UNIT;

  const menuItems = [
    { icon: Bell, label: 'Notificaciones', action: () => navigate('/Notificaciones'), badge: unreadCount > 0 ? unreadCount : null },
    { icon: Pencil, label: 'Mi perfil', action: () => { setEditName(user?.nombre || ''); setEditPhone(user?.telefono || ''); setEditOpen(true); } },
    { icon: Settings, label: 'Configuración', action: () => navigate('/Configuracion') },
    { icon: HelpCircle, label: 'Ayuda y soporte', action: () => navigate('/AyudaSoporte') },
  ];

  if (role === 'dealer' || role === 'recomprador') {
    menuItems.splice(1, 0,
      { icon: DollarSign, label: 'Movimientos', action: () => navigate('/Movimientos') },
      { icon: Bookmark, label: 'Guardadas', action: () => navigate('/Guardadas') },
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
            <Badge className={`mt-1 font-medium text-xs ${ROLE_BADGE_CLASS[role] || ''}`}>{ROLE_LABELS[role] || role}</Badge>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Recharge Publications (dealer only) */}
        {(role === 'dealer') && (
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
                      min={10}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>10</span><span>500</span>
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
          <Button variant="outline" className="w-full h-11 rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 font-medium" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Cerrar sesión
          </Button>
        </motion.div>
        <p className="text-center text-muted-foreground text-xs mt-2">Mubis v1.0.0 · Colombia 🇨🇴</p>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Mi perfil</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tu nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input id="edit-phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="300 000 0000" />
            </div>
            <div className="space-y-2 opacity-60">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2 opacity-60">
              <Label>Empresa / Sucursal</Label>
              <Input value={`${user?.company || ''} · ${user?.branch || ''}`} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProfile}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
