import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';

const stats = {
  total_dealers: 127,
  verified_dealers: 98,
  pending_requests: 12,
  total_auctions: 342,
  active_auctions: 45
};

const pendingDealers = [
  {
    id: '1',
    name: 'AutoMundo',
    email: 'contacto@automundo.com',
    phone: '3001234567',
    city: 'Bogotá',
    requested_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    documents_uploaded: true
  },
  {
    id: '2',
    name: 'Carros Premium',
    email: 'info@carrospremium.com',
    phone: '3159876543',
    city: 'Medellín',
    requested_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    documents_uploaded: true
  },
  {
    id: '3',
    name: 'Motor Sales',
    email: 'ventas@motorsales.com',
    phone: '3204567890',
    city: 'Cali',
    requested_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    documents_uploaded: false
  }
];

const recentActivity = [
  { action: 'Dealer aprobado', dealer: 'Autonal', time: 'Hace 2h' },
  { action: 'Documentos verificados', dealer: 'Los Coches', time: 'Hace 5h' },
  { action: 'Nueva solicitud', dealer: 'AutoMundo', time: 'Hace 2 días' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'admin@mubis.com';
  
  const [displayStats, setDisplayStats] = useState(isTestUser ? stats : {
    total_dealers: 0,
    verified_dealers: 0,
    pending_requests: 0,
    total_auctions: 0,
    active_auctions: 0
  });
  
  const [displayPendingDealers, setDisplayPendingDealers] = useState(isTestUser ? pendingDealers : []);
  const [displayRecentActivity, setDisplayRecentActivity] = useState(isTestUser ? recentActivity : []);

  useEffect(() => {
    const userRole = localStorage.getItem('mubis_user_role');
    if (userRole !== 'admin') {
      navigate(createPageUrl('login'));
    }
  }, [navigate]);

  const formatDate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-b from-violet-900 to-violet-800 px-4 pt-8 pb-6">
        <div className="text-center mb-4">
          <MubisLogo size="xl" variant="light" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Panel Admin</h1>
        <p className="text-violet-200 text-center text-sm">Gestión de dealers y subastas</p>
      </div>

      <div className="px-4 pt-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 text-center border-0 shadow-md">
            <Users className="w-6 h-6 text-violet-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{displayStats.total_dealers}</p>
            <p className="text-xs text-gray-500">Total Dealers</p>
          </Card>
          <Card className="p-4 text-center border-0 shadow-md">
            <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{displayStats.verified_dealers}</p>
            <p className="text-xs text-gray-500">Verificados</p>
          </Card>
          <Card className="p-4 text-center border-0 shadow-md">
            <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{displayStats.pending_requests}</p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </Card>
          <Card className="p-4 text-center border-0 shadow-md">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{displayStats.active_auctions}</p>
            <p className="text-xs text-gray-500">Subastas Activas</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-4 mb-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Acciones Rápidas</h2>
          <div className="space-y-2">
            <Button
              onClick={() => navigate(createPageUrl('AdminDealers'))}
              className="w-full bg-violet-600 hover:bg-violet-700 justify-between"
            >
              <span>Ver Todos los Dealers</span>
              <Users className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('AdminSolicitudes'))}
              variant="outline"
              className="w-full justify-between"
            >
              <span>Solicitudes Pendientes</span>
              <Badge className="bg-amber-100 text-amber-700">{displayStats.pending_requests}</Badge>
            </Button>
          </div>
        </Card>

        {/* Pending Dealers Preview */}
        <Card className="p-4 mb-4 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Solicitudes Recientes</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('AdminSolicitudes'))}
              className="text-violet-600 text-xs"
            >
              Ver todas
            </Button>
          </div>
          <div className="space-y-2">
            {displayPendingDealers.slice(0, 3).map(dealer => (
              <div key={dealer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{dealer.name}</p>
                  <p className="text-xs text-gray-500">{dealer.city} · {formatDate(dealer.requested_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {dealer.documents_uploaded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 border-0 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Actividad Reciente</h2>
          <div className="space-y-2">
            {displayRecentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.dealer}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BottomNav currentPage="AdminDashboard" />
    </div>
  );
}