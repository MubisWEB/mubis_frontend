import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, Settings, Bell, LogOut, ChevronRight, Shield, Pencil, Lock, Car, Gavel, Eye, ClipboardCheck, Users, TrendingUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, getUserRole, updateUser, getVehicles, getAuctions, getBids, getInspections, getUsers } from '@/lib/mockStore';
import { toast } from 'sonner';

const ROLE_LABELS = { dealer: 'Dealer', recomprador: 'Recomprador', perito: 'Perito', admin: 'Administrador' };
const ROLE_BADGE_CLASS = { dealer: 'bg-secondary/10 text-secondary', recomprador: 'bg-primary/10 text-primary', perito: 'bg-secondary/10 text-secondary', admin: 'bg-destructive/10 text-destructive' };

function useMetrics(user, role) {
  if (!user) return [];
  const id = user.id;

  if (role === 'dealer') {
    const vehicles = getVehicles().filter(v => v.dealerId === id);
    const auctions = getAuctions().filter(a => a.dealerId === id);
    return [
      { label: 'Vehículos creados', value: vehicles.length, icon: Car },
      { label: 'Subastas activas', value: auctions.filter(a => a.status === 'active').length, icon: Gavel },
      { label: 'Subastas finalizadas', value: auctions.filter(a => a.status !== 'active').length, icon: TrendingUp },
    ];
  }
  if (role === 'recomprador') {
    const bids = getBids().filter(b => b.userId === id);
    const wonAuctions = getAuctions().filter(a => a.winnerId === id);
    const participatedAuctions = [...new Set(bids.map(b => b.auctionId))];
    return [
      { label: 'Pujas realizadas', value: bids.length, icon: Gavel },
      { label: 'Subastas ganadas', value: wonAuctions.length, icon: TrendingUp },
      { label: 'Subastas participadas', value: participatedAuctions.length, icon: Eye },
    ];
  }
  if (role === 'perito') {
    const inspections = getInspections().filter(i => i.peritoId === id || i.lockedByPeritoId === id);
    return [
      { label: 'Completados', value: inspections.filter(i => i.status === 'COMPLETED').length, icon: ClipboardCheck },
      { label: 'Rechazados', value: inspections.filter(i => i.status === 'REJECTED').length, icon: ClipboardCheck },
      { label: 'En progreso', value: inspections.filter(i => i.status === 'IN_PROGRESS').length, icon: ClipboardCheck },
    ];
  }
  if (role === 'admin') {
    const users = getUsers().filter(u => u.role !== 'admin');
    const auctions = getAuctions();
    const inspections = getInspections();
    return [
      { label: 'Usuarios verificados', value: users.filter(u => u.verification_status === 'VERIFIED').length, icon: Users },
      { label: 'Subastas activas', value: auctions.filter(a => a.status === 'active').length, icon: Gavel },
      { label: 'Peritajes completados', value: inspections.filter(i => i.status === 'COMPLETED').length, icon: ClipboardCheck },
    ];
  }
  return [];
}

export default function Cuenta() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = getUserRole();
  const metrics = useMetrics(user, role);
  const [editOpen, setEditOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [editName, setEditName] = useState(user?.nombre || '');
  const [editPhone, setEditPhone] = useState(user?.telefono || '');

  const getInitials = (name) => { if (!name) return 'U'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); };
  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error('El nombre es obligatorio'); return; }
    updateUser(user.id, { nombre: editName.trim(), telefono: editPhone.trim() });
    // Update localStorage session
    localStorage.setItem('mubis_user_name', editName.trim());
    toast.success('Perfil actualizado');
    setEditOpen(false);
  };

  const handleChangePassword = () => {
    toast.success('Contraseña actualizada (demo)');
    setPassOpen(false);
  };

  const menuItems = [
    { icon: Settings, label: 'Configuración', action: () => navigate('/Configuracion') },
    { icon: Bell, label: 'Notificaciones', action: () => navigate('/Notificaciones') },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      {/* Profile header */}
      <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Avatar className="w-16 h-16"><AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">{getInitials(user?.nombre)}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground font-sans truncate">{user?.nombre || 'Usuario'}</p>
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
            <p className="text-muted-foreground text-xs">{user?.company} · {user?.branch}</p>
            {user?.telefono && <p className="text-muted-foreground text-xs">{user.telefono}</p>}
            <Badge className={`mt-1 font-medium text-xs ${ROLE_BADGE_CLASS[role] || ''}`}>{ROLE_LABELS[role] || role}</Badge>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Metrics */}
        {metrics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className={`grid gap-3 ${metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Card key={i} className="p-3 border border-border shadow-sm rounded-xl text-center">
                    <Icon className="w-5 h-5 text-secondary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    <p className="text-muted-foreground text-[11px] leading-tight">{m.label}</p>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            <button onClick={() => { setEditName(user?.nombre || ''); setEditPhone(user?.telefono || ''); setEditOpen(true); }} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center"><Pencil className="w-4 h-4 text-muted-foreground" /></div>
                <span className="font-medium text-foreground/80 text-sm">Editar perfil</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setPassOpen(true)} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center"><Lock className="w-4 h-4 text-muted-foreground" /></div>
                <span className="font-medium text-foreground/80 text-sm">Cambiar contraseña</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center"><Icon className="w-4 h-4 text-muted-foreground" /></div>
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
          <DialogHeader><DialogTitle>Editar perfil</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tu nombre completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input id="edit-phone" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="300 000 0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProfile}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passOpen} onOpenChange={setPassOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Cambiar contraseña</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPassOpen(false)}>Cancelar</Button>
            <Button onClick={handleChangePassword}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
