import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Check, X, Clock, Car, Building2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { interestRequestsApi } from '@/api/services';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';

export default function AdminDeseadosExpirados() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await interestRequestsApi.getExpired();
      setItems(data || []);
    } catch (err) {
      console.error('Error loading expired requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    setActing(true);
    try {
      await interestRequestsApi.accept(id);
      toast.success('Solicitud aceptada manualmente');
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setActing(false);
    }
  }

  async function handleReject(id) {
    setActing(true);
    try {
      await interestRequestsApi.reject(id);
      toast.success('Solicitud rechazada manualmente');
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="bg-card border-b border-border px-4 md:px-8 py-5">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/AdminDashboard')} className="rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-foreground">Solicitudes Expiradas</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Solicitudes de interés que expiraron sin respuesta del dealer — gestión manual
        </p>
      </div>

      <div className="px-4 md:px-8 py-4 space-y-3">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Cargando...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sin solicitudes expiradas</h3>
            <p className="text-muted-foreground text-sm">Todas las solicitudes han sido gestionadas a tiempo</p>
          </div>
        ) : (
          items.map(item => {
            const details = item.vehicleDetails || {};
            return (
              <Card key={item.id} className="p-4 border border-border/60 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground text-sm">{item.vehicleLabel}</h3>
                      <Badge className="bg-amber-100 text-amber-800 text-xs">Expirado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {details.version} · {details.year} · {details.km?.toLocaleString('es-CO')} km
                    </p>
                    {item.branch && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {item.branch.name} — {item.branch.city}
                      </p>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Solicitante: </span>
                        <span className="font-medium text-foreground">{item.requester?.nombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dealer: </span>
                        <span className="font-medium text-foreground">{item.dealer?.nombre || 'Sin asignar'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expiró: {new Date(item.deadline).toLocaleDateString('es-CO')}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleAccept(item.id)} disabled={acting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full h-8 text-xs font-semibold">
                        {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Aceptar</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(item.id)} disabled={acting}
                        className="flex-1 rounded-full h-8 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50">
                        {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><X className="w-3 h-3 mr-1" />Rechazar</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
