import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Bell, HelpCircle, LogOut, ChevronRight, Shield, BarChart3, Gavel, Trophy, Settings } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TopBar from "@/components/TopBar";

const demoUser = { full_name: 'AutoMax Colombia', email: 'contacto@automax.co', verified: true };
const demoStats = { myActiveAuctions: 2, myWonAuctions: 12 };

export default function Cuenta() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('dealer');
  const [user, setUser] = useState(demoUser);
  const [stats, setStats] = useState(demoStats);

  useEffect(() => {
    const role = localStorage.getItem('mubis_user_role') || 'dealer';
    const email = localStorage.getItem('mubis_user_email') || '';
    const userName = localStorage.getItem('mubis_user_name') || '';
    const isTestUser = ['dealer@test.com', 'seller@test.com', 'admin@mubis.com'].includes(email);
    setUserRole(role);
    setUser({ full_name: userName || (email ? email.split('@')[0] : 'Usuario'), email: email || 'usuario@mubis.co', verified: true });
    setStats(isTestUser ? demoStats : { myActiveAuctions: 0, myWonAuctions: 0 });
  }, []);

  const getInitials = (name) => { if (!name) return 'U'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); };

  const statsCards = useMemo(() => ([
    { icon: Gavel, value: stats.myActiveAuctions || 0, label: 'Mis subastas activas', color: 'bg-secondary/10 text-secondary' },
    { icon: Trophy, value: stats.myWonAuctions || 0, label: 'Mis subastas ganadas', color: 'bg-primary/10 text-primary' },
  ]), [stats]);

  const menuItems = useMemo(() => ([
    { icon: User, label: 'Mi perfil', badge: null, page: 'PerfilDealer' },
    { icon: Settings, label: 'Configuración', badge: '3', page: 'Configuracion' },
    { icon: HelpCircle, label: 'Ayuda y soporte', badge: null, page: 'Ayuda' },
  ]), []);

  const handleLogout = () => {
    localStorage.removeItem('mubis_user_role');
    localStorage.removeItem('mubis_authenticated');
    localStorage.removeItem('mubis_user_email');
    localStorage.removeItem('mubis_user_name');
    navigate(createPageUrl('login'));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="lg" />
        </div>
      </nav>
      <div className="bg-card px-5 pt-6 pb-5 border-b border-border">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">{getInitials(user?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground font-sans">{user?.full_name || 'Usuario'}</p>
              {user?.verified && <Shield className="w-4 h-4 text-secondary" />}
            </div>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {userRole === 'dealer' ? (
              <Badge className="mt-1 bg-secondary/10 text-secondary font-medium text-xs">Dealer Verificado</Badge>
            ) : userRole === 'admin' ? (
              <Badge className="mt-1 bg-destructive/10 text-destructive font-medium text-xs">Administrador</Badge>
            ) : (
              <Badge className="mt-1 bg-primary/10 text-primary font-medium text-xs">Compraventero Verificado</Badge>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 mb-4">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 border border-border shadow-sm rounded-xl">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-2`}><Icon className="w-5 h-5" /></div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </Card>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} onClick={() => item.page && navigate(createPageUrl(item.page))}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-muted transition-colors border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center"><Icon className="w-4 h-4 text-muted-foreground" /></div>
                    <span className="font-medium text-foreground/80 text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && <Badge className="bg-secondary/10 text-secondary text-xs px-2">{item.badge}</Badge>}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
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
      <BottomNav currentPage="Cuenta" />
    </div>
  );
}
