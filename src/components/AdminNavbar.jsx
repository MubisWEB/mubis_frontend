import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Users, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function AdminNavbar({ dashboardPath, usersPath, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto px-4 py-3 sm:max-w-2xl">
        {/* Dashboard Button */}
        <button
          onClick={() => navigate(dashboardPath)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            isActive(dashboardPath)
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        {/* Users Button */}
        <button
          onClick={() => navigate(usersPath)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            isActive(usersPath)
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-xs font-medium">Usuarios</span>
        </button>

        {/* Account Button */}
        <button
          onClick={() => navigate('/Cuenta')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition ${
            isActive('/Cuenta')
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Cuenta</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}
