import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Heart, Wallet } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function BottomNav({ currentPage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('mubis_user_role');

  const getNavItems = () => {
    if (userRole === 'seller') {
      return [
        { icon: Home, label: 'Inicio', page: 'Home' },
        { icon: Search, label: 'Subastas', page: 'MisSubastas' },
        { icon: Wallet, label: 'Wallet', page: 'Wallet' },
        { icon: User, label: 'Cuenta', page: 'Cuenta' }
      ];
    }
    
    if (userRole === 'admin') {
      return [
        { icon: Home, label: 'Dashboard', page: 'AdminDashboard' },
        { icon: Search, label: 'Dealers', page: 'AdminDealers' },
        { icon: PlusCircle, label: 'Solicitudes', page: 'AdminSolicitudes' },
        { icon: User, label: 'Cuenta', page: 'Cuenta' }
      ];
    }
    
    // Dealer - tiene acceso a comprar Y vender
    return [
      { icon: Search, label: 'Comprar', page: 'Comprar' },
      { icon: Heart, label: 'Mis Subastas', page: 'MisSubastas' },
      { icon: Wallet, label: 'Movimientos', page: 'Movimientos' },
      { icon: User, label: 'Cuenta', page: 'Cuenta' }
    ];
  };

  const navItems = getNavItems();

  const isActive = (page) => {
    if (currentPage) {
      return currentPage === page;
    }
    return location.pathname.includes(page);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.page);
          
          return (
            <button
              key={item.page}
              onClick={() => navigate(createPageUrl(item.page))}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                active 
                  ? 'text-secondary' 
                  : 'text-muted-foreground hover:text-secondary'
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
