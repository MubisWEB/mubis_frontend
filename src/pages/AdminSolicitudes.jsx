import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Phone, MapPin, Building } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { adminApi, usersApi } from '@/api/services';

const ROLE_LABELS = { dealer: 'Dealer', perito: 'Perito', recomprador: 'Recomprador' };

export default function AdminSolicitudes() {
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      const data = await adminApi.getSolicitudes();
      setRequests(data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (user) => {
    try {
      await usersApi.verify(user.id, 'VERIFIED');
      toast.success('Usuario aprobado', { description: `${user.nombre} ahora puede acceder a la plataforma` });
      loadRequests();
    } catch { toast.error('Error al aprobar usuario'); }
  };

  const handleReject = async (user) => {
    try {
      await usersApi.verify(user.id, 'REJECTED');
      toast.error('Solicitud rechazada', { description: `Se ha rechazado la solicitud de ${user.nombre}` });
      loadRequests();
    } catch { toast.error('Error al rechazar usuario'); }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.role === filter);
  const formatDate = (d) => { if (!d) return ''; const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)); if (diff === 0) return 'Hoy'; if (diff === 1) return 'Ayer'; return `Hace ${diff} días`; };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Solicitudes Pendientes" subtitle={`${requests.length} solicitudes por revisar`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[{ key: 'all', label: 'Todos' }, { key: 'dealer', label: 'Dealers' }, { key: 'perito', label: 'Peritos' }, { key: 'recomprador', label: 'Recompradores' }].map(tab => (
            <Button key={tab.key} variant={filter === tab.key ? 'default' : 'outline'} size="sm"
              onClick={() => setFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">
              {tab.label}
              {tab.key === 'all' ? ` (${requests.length})` : ` (${requests.filter(r => r.role === tab.key).length})`}
            </Button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center border border-border shadow-sm">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-foreground mb-2 font-sans">Todo al día</h3>
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes por revisar</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(user => (
              <Card key={user.id} className="p-4 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{user.nombre}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" />{user.ciudad}</div>
                    {user.nit && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building className="w-3 h-3" />NIT: {user.nit}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-secondary/10 text-secondary text-xs">{ROLE_LABELS[user.role] || user.role}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building className="w-3 h-3" />{user.company} · {user.branch}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{user.email}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{user.telefono}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleReject(user)} variant="outline" className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full">
                    <XCircle className="w-4 h-4 mr-1" />Rechazar
                  </Button>
                  <Button onClick={() => handleApprove(user)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-1" />Aprobar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
