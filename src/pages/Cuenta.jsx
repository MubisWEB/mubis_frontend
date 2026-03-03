import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, HelpCircle, LogOut, ChevronRight, Shield, Settings } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, getUserRole } from '@/lib/mockStore';

const ROLE_LABELS = { dealer: 'Dealer', recomprador: 'Recomprador', perito: 'Perito', admin: 'Administrador' };
const ROLE_BADGE_CLASS = { dealer: 'bg-secondary/10 text-secondary', recomprador: 'bg-primary/10 text-primary', perito: 'bg-accent/10 text-accent-foreground', admin: 'bg-destructive/10 text-destructive' };

export default function Cuenta() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const role = getUserRole();
  const getInitials = (name) => { if (!name) return 'U'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Avatar className="w-16 h-16"><AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">{getInitials(user?.nombre)}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground font-sans">{user?.nombre || 'Usuario'}</p>
              {user?.verification_status === 'VERIFIED' && <Shield className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <p className="text-muted-foreground text-xs">{user?.company} · {user?.branch}</p>
            <Badge className={`mt-1 font-medium text-xs ${ROLE_BADGE_CLASS[role] || ''}`}>{ROLE_LABELS[role] || role}</Badge>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {[{ icon: User, label: 'Mi perfil' }, { icon: Settings, label: 'Configuración' }, { icon: HelpCircle, label: 'Ayuda y soporte' }].map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border last:border-0">
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

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-4">
          <Button variant="outline" className="w-full h-11 rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 font-medium" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Cerrar sesión
          </Button>
        </motion.div>
        <p className="text-center text-muted-foreground text-xs mt-6">Mubis v1.0.0 · Colombia 🇨🇴</p>
      </div>
      <BottomNav />
    </div>
  );
}
