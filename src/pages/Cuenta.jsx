import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Settings, LogOut, ChevronRight, Pencil, HelpCircle, Bell, CheckCheck, Gavel, Car, ClipboardCheck, UserCheck, Bookmark, DollarSign } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, getUserRole, updateUser, getNotificationsByUserId, getUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/lib/mockStore';
import { toast } from 'sonner';

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
  const user = getCurrentUser();
  const role = getUserRole();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.nombre || '');
  const [editPhone, setEditPhone] = useState(user?.telefono || '');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setNotifications(getNotificationsByUserId(user.id).slice(0, 3));
      setUnreadCount(getUnreadCount(user.id));
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error('El nombre es obligatorio'); return; }
    updateUser(user.id, { nombre: editName.trim(), telefono: editPhone.trim() });
    localStorage.setItem('mubis_user_name', editName.trim());
    toast.success('Cambios guardados');
    setEditOpen(false);
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllNotificationsRead(user.id);
      setNotifications(getNotificationsByUserId(user.id).slice(0, 3));
      setUnreadCount(0);
    }
  };

  const handleMarkRead = (id) => {
    markNotificationRead(id);
    if (user) {
      setNotifications(getNotificationsByUserId(user.id).slice(0, 3));
      setUnreadCount(getUnreadCount(user.id));
    }
  };

  const menuItems = [
    { icon: Pencil, label: 'Mi perfil', action: () => { setEditName(user?.nombre || ''); setEditPhone(user?.telefono || ''); setEditOpen(true); } },
    { icon: Settings, label: 'Configuración', action: () => navigate('/Configuracion') },
    { icon: HelpCircle, label: 'Ayuda y soporte', action: () => navigate('/AyudaSoporte') },
  ];

  if (role === 'dealer' || role === 'recomprador') {
    menuItems.splice(1, 0,
      { icon: DollarSign, label: 'Movimientos', action: () => navigate('/Movimientos') },
      { icon: Bookmark, label: 'Guardadas', action: () => navigate('/Guardadas') },
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
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

        {/* Notifications preview */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notificaciones</p>
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0">{unreadCount}</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-secondary hover:underline">
                <CheckCheck className="w-3 h-3" />Marcar leídas
              </button>
            )}
          </div>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
            ) : (
              notifications.map((n, i) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className={`flex items-center gap-3 p-3 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? 'bg-secondary/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-secondary/10' : 'bg-muted'}`}>
                      <Icon className={`w-3.5 h-3.5 ${!n.read ? 'text-secondary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                      <p className="text-[10px] text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </Card>
        </motion.div>

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
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