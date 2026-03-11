import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, PlusCircle, User, Heart, Wallet, ClipboardCheck, LayoutDashboard, Users, FileText, DollarSign, Trophy } from 'lucide-react';
import { getUserRole } from '@/lib/mockStore';

const NAV_CONFIGS = {
  dealer: [
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Heart, label: 'Vender', path: '/MisSubastas' },
    { icon: Trophy, label: 'Ganados', path: '/Ganados' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  recomprador: [
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Trophy, label: 'Ganados', path: '/Ganados' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  perito: [
    { icon: ClipboardCheck, label: 'Pendientes', path: '/PeritajesPendientes' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/AdminDashboard' },
    { icon: Users, label: 'Dealers', path: '/AdminDealers' },
    { icon: FileText, label: 'Solicitudes', path: '/AdminSolicitudes' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole() || 'dealer';

  const navItems = NAV_CONFIGS[userRole] || NAV_CONFIGS.dealer;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
