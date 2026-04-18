import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { notificationsApi } from '@/api/services';
import { toast } from 'sonner';

const TYPE_LABELS = {
  NEW_BID: 'Te hicieron una puja en tu subasta',
  OUTBID: 'Te superaron en una puja',
  BID_PLACED: 'Tu puja fue registrada',
  AUCTION_WON: 'Ganaste una subasta',
  PENDING_DECISION: 'Subasta pendiente de tu decisión',
  AUCTION_EXTENDED: 'Subasta extendida 48h',
  AUCTION_ENDED: 'Subasta finalizada',
  WANTED_VEHICLE_MATCH: 'Apareció un carro que buscas',
  INSPECTION_TAKEN: 'Peritaje tomado',
  INSPECTION_COMPLETED: 'Peritaje completado',
  INSPECTION_REJECTED: 'Peritaje rechazado',
  AUCTION_PUBLISHED: 'Nueva subasta publicada',
  AUCTION_AUTO_ACCEPTED: 'Subasta aceptada automáticamente',
  TRANSACTION_CREATED: 'Transacción creada',
  TRANSACTION_COMPLETED: 'Transacción completada',
  PRONTO_PAGO: 'Pronto pago disponible',
  USER_APPROVED: 'Cuenta aprobada',
  SUPPORT_CASE: 'Caso de soporte',
  WHOLESALE_OFFER_RECEIVED: 'Oferta mayorista recibida',
  WHOLESALE_OFFER_REVIEWED: 'Oferta mayorista revisada',
  PARTNER_INVITATION: 'Invitación de partner',
  PARTNER_ACCEPTED: 'Partner aceptó invitación',
  PARTNER_REJECTED: 'Partner rechazó invitación',
  INTEREST_REQUEST_CREATED: 'Solicitud de interés recibida',
  INTEREST_REQUEST_ACCEPTED: 'Solicitud de interés aceptada',
  INTEREST_REQUEST_REJECTED: 'Solicitud de interés rechazada',
  INTEREST_REQUEST_EXPIRED: 'Solicitud de interés expirada',
};

const CATEGORIES = [
  {
    label: 'Compras (como comprador)',
    types: ['OUTBID', 'BID_PLACED', 'AUCTION_WON', 'WANTED_VEHICLE_MATCH'],
  },
  {
    label: 'Ventas (como vendedor)',
    types: ['NEW_BID', 'PENDING_DECISION', 'AUCTION_EXTENDED', 'AUCTION_ENDED', 'AUCTION_AUTO_ACCEPTED'],
  },
  {
    label: 'Transacciones',
    types: ['TRANSACTION_CREATED', 'TRANSACTION_COMPLETED', 'PRONTO_PAGO'],
  },
  {
    label: 'Peritajes',
    types: ['INSPECTION_TAKEN', 'INSPECTION_COMPLETED', 'INSPECTION_REJECTED', 'AUCTION_PUBLISHED'],
  },
  {
    label: 'Sistema',
    types: [
      'USER_APPROVED', 'SUPPORT_CASE',
      'WHOLESALE_OFFER_RECEIVED', 'WHOLESALE_OFFER_REVIEWED',
      'PARTNER_INVITATION', 'PARTNER_ACCEPTED', 'PARTNER_REJECTED',
      'INTEREST_REQUEST_CREATED', 'INTEREST_REQUEST_ACCEPTED',
      'INTEREST_REQUEST_REJECTED', 'INTEREST_REQUEST_EXPIRED',
    ],
  },
];

export default function ConfiguracionNotificaciones() {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    notificationsApi.getPreferences()
      .then((data) => {
        const map = {};
        data.forEach((p) => { map[p.type] = p.enabled; });
        setPrefs(map);
      })
      .catch(() => toast.error('Error al cargar preferencias'))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(type) {
    const newValue = !prefs[type];
    setPrefs((prev) => ({ ...prev, [type]: newValue }));
    setUpdating(type);
    try {
      await notificationsApi.updatePreference(type, newValue);
    } catch {
      setPrefs((prev) => ({ ...prev, [type]: !newValue }));
      toast.error('Error al actualizar preferencia');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Notificaciones" backTo="/Notificaciones" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-5 space-y-5 pb-6">
        <p className="text-sm text-muted-foreground">
          Elige qué notificaciones quieres recibir. Los cambios se aplican de inmediato.
        </p>

        {CATEGORIES.map((cat) => (
          <Card key={cat.label} className="border border-border shadow-sm rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-muted/40 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
            </div>
            <div className="divide-y divide-border">
              {cat.types.map((type) => {
                const enabled = prefs[type] !== false;
                return (
                  <div key={type} className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-sm text-foreground pr-4">
                      {TYPE_LABELS[type] || type}
                    </span>
                    <button
                      onClick={() => toggle(type)}
                      disabled={updating === type}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                        enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                      } ${updating === type ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
