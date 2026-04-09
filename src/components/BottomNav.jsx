import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardCheck,
  FileText,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/roles';

const DEALER_NAV = [
  { icon: Search, label: 'Comprar', path: '/Comprar' },
  { icon: Heart, label: 'Vender', path: '/MisSubastas' },
  { icon: Search, label: 'Se Busca', path: '/SeBusca' },
  { icon: User, label: 'Cuenta', path: '/Cuenta' },
];

const NAV_CONFIGS = {
  dealer: DEALER_NAV,
  recomprador: [
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Search, label: 'Se Busca', path: '/SeBusca' },
    { icon: Heart, label: 'Deseados', path: '/Deseados' },
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
  admin_general: [
    { icon: LayoutDashboard, label: 'Panel', path: '/AdminGeneralDashboard' },
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Heart, label: 'Vender', path: '/MisSubastas' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
  admin_sucursal: [
    { icon: Building2, label: 'Sucursal', path: '/AdminSucursalDashboard' },
    { icon: Search, label: 'Comprar', path: '/Comprar' },
    { icon: Heart, label: 'Vender', path: '/MisSubastas' },
    { icon: User, label: 'Cuenta', path: '/Cuenta' },
  ],
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const userRole = normalizeRole(user?.role);
  const navItems = userRole ? NAV_CONFIGS[userRole] || [] : [];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!navItems.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all ${
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
          className="flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all text-red-600 hover:text-red-500"
        >
          <LogOut className="w-6 h-6 stroke-2" />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </div>
  );
}
