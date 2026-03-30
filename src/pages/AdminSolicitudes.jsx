import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Building, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { adminApi, usersApi } from '@/api/services';

const ROLE_LABELS = { dealer: 'Dealer', perito: 'Perito', recomprador: 'Recomprador' };

const TABS = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'WAITLISTED', label: 'Lista de espera' },
  { key: 'REJECTED', label: 'Rechazadas' },
];

export default function AdminSolicitudes() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [pending, users] = await Promise.all([
        adminApi.getSolicitudes().catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setRequests(pending || []);
      setAllUsers(users || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (user, status) => {
    const labels = {
      VERIFIED: { success: 'Usuario aprobado', desc: `${user.nombre} ahora puede acceder a la plataforma` },
      REJECTED: { success: 'Solicitud rechazada', desc: `Se ha rechazado la solicitud de ${user.nombre}` },
      WAITLISTED: { success: 'En lista de espera', desc: `${user.nombre} fue puesto en lista de espera` },
    };
    try {
      await usersApi.verify(user.id, status);
      const label = labels[status];
      if (status === 'REJECTED') {
        toast.error(label.success, { description: label.desc });
      } else {
        toast.success(label.success, { description: label.desc });
      }
      loadData();
    } catch {
      toast.error('Error al procesar solicitud');
    }
  };

  // Build list based on active tab
  const getFilteredList = () => {
    let list;
    if (activeTab === 'PENDING') {
      list = requests; // solicitudes endpoint returns PENDING users
    } else {
      list = allUsers.filter(u =>
        u.verification_status === activeTab && u.role !== 'superadmin'
      );
    }

    if (roleFilter !== 'all') {
      list = list.filter(r => r.role === roleFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.nombre || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredList = getFilteredList();
  const pendingCount = requests.length;
  const waitlistedCount = allUsers.filter(u => u.verification_status === 'WAITLISTED' && u.role !== 'superadmin').length;
  const rejectedCount = allUsers.filter(u => u.verification_status === 'REJECTED' && u.role !== 'superadmin').length;

  const tabCounts = { PENDING: pendingCount, WAITLISTED: waitlistedCount, REJECTED: rejectedCount };

  const formatDate = (d) => {
    if (!d) return '';
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Solicitudes" subtitle={`${pendingCount} pendientes · ${waitlistedCount} en espera`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-3">
        {/* Status tabs */}
        <div className="grid grid-cols-3 gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-center p-3 rounded-xl border transition-all ${
                activeTab === tab.key
                  ? tab.key === 'PENDING' ? 'bg-secondary/15 border-secondary'
                    : tab.key === 'WAITLISTED' ? 'bg-amber-500/15 border-amber-500'
                    : 'bg-destructive/15 border-destructive'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <p className={`text-2xl font-bold ${
                tab.key === 'PENDING' ? 'text-secondary'
                : tab.key === 'WAITLISTED' ? 'text-amber-600'
                : 'text-destructive'
              }`}>
                {tabCounts[tab.key]}
              </p>
              <p className={`text-[10px] ${activeTab === tab.key ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                {tab.label}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-card border border-border shadow-sm rounded-xl"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-2 overflow-x-auto">
          {[{ key: 'all', label: 'Todos' }, { key: 'dealer', label: 'Dealers' }, { key: 'perito', label: 'Peritos' }, { key: 'recomprador', label: 'Recompradores' }].map(tab => (
            <Button key={tab.key} variant={roleFilter === tab.key ? 'default' : 'outline'} size="sm"
              onClick={() => setRoleFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">
              {tab.label}
            </Button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <Card key={i} className="p-4 border border-border shadow-sm animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <Card className="p-8 text-center border border-border shadow-sm">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-2">
              {activeTab === 'PENDING' ? 'Todo al día' : activeTab === 'WAITLISTED' ? 'Lista de espera vacía' : 'Sin rechazados'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'PENDING' ? 'No hay solicitudes pendientes por revisar'
                : activeTab === 'WAITLISTED' ? 'No hay usuarios en lista de espera'
                : 'No hay solicitudes rechazadas'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredList.map(user => (
              <Card key={user.id} className="p-4 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{user.nombre}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3 h-3" />{user.ciudad}
                    </div>
                    {user.nit && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building className="w-3 h-3" />NIT: {user.nit}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-secondary/10 text-secondary text-xs">
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building className="w-3 h-3" />{user.company} · {user.branch}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />{user.email}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />{user.telefono}
                  </div>
                </div>

                {/* Actions */}
                {activeTab === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction(user, 'REJECTED')} variant="outline" size="sm"
                      className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full">
                      <XCircle className="w-4 h-4 mr-1" />Rechazar
                    </Button>
                    <Button onClick={() => handleAction(user, 'WAITLISTED')} variant="outline" size="sm"
                      className="flex-1 text-amber-600 border-amber-500/20 hover:bg-amber-500/5 rounded-full">
                      <Clock className="w-4 h-4 mr-1" />Espera
                    </Button>
                    <Button onClick={() => handleAction(user, 'VERIFIED')} size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />Aprobar
                    </Button>
                  </div>
                )}

                {activeTab === 'WAITLISTED' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction(user, 'REJECTED')} variant="outline" size="sm"
                      className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full">
                      <XCircle className="w-4 h-4 mr-1" />Rechazar
                    </Button>
                    <Button onClick={() => handleAction(user, 'VERIFIED')} size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />Aprobar
                    </Button>
                  </div>
                )}

                {activeTab === 'REJECTED' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAction(user, 'WAITLISTED')} variant="outline" size="sm"
                      className="flex-1 text-amber-600 border-amber-500/20 hover:bg-amber-500/5 rounded-full">
                      <Clock className="w-4 h-4 mr-1" />Espera
                    </Button>
                    <Button onClick={() => handleAction(user, 'VERIFIED')} size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />Aprobar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
