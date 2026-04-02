import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users, Car, DollarSign, Clock, AlertTriangle,
  CheckCircle, BarChart3, UserCheck,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { analyticsApi, auctionsApi, usersApi } from '@/api/services';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

// ── Modal: Aprobar precio ─────────────────────────────────────────────────────
function ApprovePriceModal({ vehicle, open, onClose, onApproved }) {
  const [price, setPrice] = useState(vehicle?.suggestedPrice ? String(vehicle.suggestedPrice) : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle?.suggestedPrice) setPrice(String(vehicle.suggestedPrice));
  }, [vehicle]);

  const handleSubmit = async () => {
    const parsed = Number(price.replace(/\D/g, ''));
    if (!parsed || parsed < 1) { toast.error('Ingresa un precio válido'); return; }
    try {
      setLoading(true);
      await auctionsApi.approvePrice(vehicle.id, parsed);
      toast.success('Precio aprobado', { description: 'La subasta fue publicada exitosamente.' });
      onClose();
      onApproved();
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error('Error al aprobar precio', { description: msg || 'Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Aprobar precio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="font-semibold text-foreground">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
            {vehicle.suggestedPrice && (
              <p className="text-sm text-muted-foreground mt-1">
                Precio sugerido por el perito: <span className="font-semibold text-secondary">{COP(vehicle.suggestedPrice)}</span>
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Precio aprobado (COP)</Label>
            <Input
              type="number"
              placeholder="Ej. 45000000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-xl border-border h-11"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-full"
          >
            {loading ? 'Publicando...' : 'Aprobar y publicar subasta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'text-secondary', alert }) {
  return (
    <Card className={`p-4 border shadow-sm rounded-2xl ${alert ? 'border-amber-300 bg-amber-50' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${alert ? 'bg-amber-100' : 'bg-secondary/10'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : color}`} />
        </div>
        {alert && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1" />}
      </div>
      <p className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

export default function AdminSucursalDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [dash, users] = await Promise.all([
        analyticsApi.branchDashboard(branchId).catch(() => null),
        usersApi.getPending().catch(() => []),
      ]);
      setDashboard(dash);
      setPendingUsers(users || []);
      // pendingVehicles: si el dashboard trae lista, usarla; si no, se maneja por count
      setPendingVehicles(dash?.pendingVehiclesList || []);
    } catch (err) {
      console.error('Error loading branch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 30000);
    return () => clearInterval(iv);
  }, []);

  const byStatus = dashboard?.auctions?.byStatus || {};
  const team = dashboard?.team || {};

  const handleApproveClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Panel de Sucursal" subtitle="Vista de tu sucursal" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Alertas de acciones pendientes */}
        {(dashboard?.pendingPriceApproval > 0 || pendingUsers.length > 0) && (
          <div className="space-y-2">
            {dashboard?.pendingPriceApproval > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-amber-800 flex-1">
                  {dashboard.pendingPriceApproval} vehículo{dashboard.pendingPriceApproval !== 1 ? 's' : ''} esperando aprobación de precio
                </p>
                <Badge className="bg-amber-500 text-white text-xs font-bold">{dashboard.pendingPriceApproval}</Badge>
              </div>
            )}
            {pendingUsers.length > 0 && (
              <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3">
                <Users className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-sm font-semibold text-secondary flex-1">
                  {pendingUsers.length} usuario{pendingUsers.length !== 1 ? 's' : ''} pendiente{pendingUsers.length !== 1 ? 's' : ''} de verificación
                </p>
                <button
                  onClick={() => navigate('/AdminSolicitudes')}
                  className="text-xs font-semibold text-secondary underline underline-offset-2 flex-shrink-0"
                >
                  Ver
                </button>
              </div>
            )}
          </div>
        )}

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-4 border border-border rounded-2xl animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-7 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={Users} label="Equipo" value={NUM((team.dealers || 0) + (team.peritos || 0))} sub={`${team.dealers || 0} dealers · ${team.peritos || 0} peritos`} />
            <KpiCard icon={Car} label="Subastas activas" value={NUM(byStatus.ACTIVE)} sub={`${NUM(byStatus.ENDED || 0)} finalizadas`} />
            <KpiCard icon={DollarSign} label="Ingresos sucursal" value={COP(dashboard?.revenue?.total)} color="text-primary" sub={`${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`} />
            <KpiCard icon={Clock} label="Pendiente aprobación" value={NUM(dashboard?.pendingPriceApproval)} alert={dashboard?.pendingPriceApproval > 0} />
          </div>
        )}

        {/* Cola de aprobación de precios */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-bold text-foreground">Aprobación de precios</h2>
          {dashboard?.pendingPriceApproval > 0 && (
            <Badge className="bg-amber-500 text-white text-xs font-bold">{dashboard.pendingPriceApproval} pendiente{dashboard.pendingPriceApproval !== 1 ? 's' : ''}</Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <Card key={i} className="p-4 border border-border rounded-2xl animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </Card>
            ))}
          </div>
        ) : pendingVehicles.length === 0 ? (
          <Card className="p-6 text-center border border-border rounded-2xl bg-card">
            <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Sin precios pendientes</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboard?.pendingPriceApproval > 0
                ? 'Los vehículos se cargarán en la próxima actualización.'
                : 'No hay vehículos esperando aprobación de precio.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingVehicles.map((v) => (
              <Card key={v.id} className="p-4 border border-amber-200 bg-amber-50 rounded-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{v.brand} {v.model} {v.year}</p>
                    {v.suggestedPrice && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Precio sugerido: <span className="font-semibold text-secondary">{COP(v.suggestedPrice)}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{v.dealerName || 'Dealer'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApproveClick(v)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full text-xs h-8 px-3 flex-shrink-0"
                  >
                    Aprobar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-foreground pt-1">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Solicitudes', sub: `${pendingUsers.length} pendientes`, path: '/AdminSolicitudes', icon: UserCheck, alert: pendingUsers.length > 0 },
            { label: 'Subastas', sub: `${NUM(byStatus.ACTIVE || 0)} activas`, path: '/AdminSubastas', icon: Car },
            { label: 'Movimientos', sub: `${NUM(dashboard?.revenue?.completedTransactions || 0)} transacciones`, path: '/AdminMovimientos', icon: DollarSign },
            { label: 'Analíticas', sub: 'Ver métricas', path: '/AdminAnaliticas', icon: BarChart3 },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-colors ${item.alert ? 'bg-amber-50 border-amber-200' : 'bg-card border-border hover:bg-muted/30'}`}
            >
              <item.icon className={`w-5 h-5 mb-2 ${item.alert ? 'text-amber-600' : 'text-secondary'}`} />
              <p className={`text-sm font-semibold ${item.alert ? 'text-amber-800' : 'text-foreground'}`}>{item.label}</p>
              <p className={`text-xs mt-0.5 ${item.alert ? 'text-amber-600' : 'text-muted-foreground'}`}>{item.sub}</p>
            </button>
          ))}
        </div>

      </div>

      {/* Modal de aprobación */}
      <ApprovePriceModal
        vehicle={selectedVehicle}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApproved={loadData}
      />

      <BottomNav />
    </div>
  );
}
