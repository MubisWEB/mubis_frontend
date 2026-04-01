import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Heart, ClipboardCheck, LayoutDashboard, Users, FileText, Trophy, TrendingUp, Target, Store, History, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_CONFIGS = {
  dealer: [
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Heart, label: 'Vender', path: '/MisSubastas' },
    { icon: Search, label: 'Se Busca', path: '/SeBusca' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  recomprador: [
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Trophy, label: 'Ganados', path: '/Ganados' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  perito: [
    { icon: ClipboardCheck, label: 'Pendientes', path: '/PeritajesPendientes' },
    { icon: History, label: 'Historial', path: '/HistorialPeritajes' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  superadmin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/AdminDashboard' },
    { icon: Users, label: 'Usuarios', path: '/AdminDealers' },
    { icon: FileText, label: 'Solicitudes', path: '/AdminSolicitudes' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const userRole = user?.role || 'dealer';
  const navItems = NAV_CONFIGS[userRole] || NAV_CONFIGS.dealer;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                active ? 'text-secondary' : 'text-muted-foreground hover:text-secondary'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all text-destructive hover:text-red-400"
        >
          <LogOut className="w-6 h-6 stroke-2" />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </div>
  );
}
