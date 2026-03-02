import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  BarChart3,
  Gavel,
  Trophy,
  Settings,
} from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Demo usuario (solo para mostrar UI)
const demoUser = {
  full_name: 'AutoMax Colombia',
  email: 'contacto@automax.co',
  verified: true
};

// ✅ Stats nuevas: solo Mis subastas activas y Mis subastas ganadas
const demoStats = {
  myActiveAuctions: 2,
  myWonAuctions: 12,
};

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

    const userData = {
      full_name: userName || (email ? email.split('@')[0] : 'Usuario'),
      email: email || 'usuario@mubis.co',
      verified: true
    };

    // ✅ Si es test user, dejamos demo. Si es real, ceros.
    const statsData = isTestUser
      ? demoStats
      : { myActiveAuctions: 0, myWonAuctions: 0 };

    setUser(userData);
    setStats(statsData);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // ✅ Cards: solo 2
  const statsCards = useMemo(() => ([
    { icon: Gavel, value: stats.myActiveAuctions || 0, label: 'Mis subastas activas', color: 'bg-violet-100 text-violet-700' },
    { icon: Trophy, value: stats.myWonAuctions || 0, label: 'Mis subastas ganadas', color: 'bg-emerald-100 text-emerald-700' },
  ]), [stats]);

  // ✅ Menú limpio:
  // - Quitar pujas
  // - Quitar mis ganados
  // - Juntar Mi perfil + Datos personales -> "Mi perfil"
  // - Quitar métodos de pago
  // - Quitar historial de pujas
  // - Quitar demo inversionistas
  // - Juntar Noti + Conf -> "Configuración"
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 border-b border-gray-100">
        <div className="text-center mb-6">
          <MubisLogo size="xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-violet-600 text-white text-xl font-bold">
              {getInitials(user?.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-gray-900">
                {user?.full_name || 'Usuario'}
              </p>
              {user?.verified && (
                <Shield className="w-4 h-4 text-blue-500" />
              )}
            </div>

            <p className="text-gray-500 text-sm">{user?.email}</p>

            {userRole === 'dealer' ? (
              <Badge className="mt-1 bg-violet-100 text-violet-700 font-medium text-xs">
                Dealer Verificado
              </Badge>
            ) : userRole === 'admin' ? (
              <Badge className="mt-1 bg-red-100 text-red-700 font-medium text-xs">
                Administrador
              </Badge>
            ) : (
              <Badge className="mt-1 bg-green-100 text-green-700 font-medium text-xs">
                Vendedor Verificado
              </Badge>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats (solo 2) */}
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 border-0 shadow-sm rounded-xl">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </Card>
            );
          })}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => item.page && navigate(createPageUrl(item.page))}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs px-2">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-4"
        >
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-medium"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </motion.div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Mubis v1.0.0 · Colombia 🇨🇴
        </p>
      </div>

      <BottomNav currentPage="Cuenta" />
    </div>
  );
}
