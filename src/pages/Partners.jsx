import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Handshake, Loader2, Info } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { partnersApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';

const DEALER_ROLES = ['dealer', 'admin_general', 'admin_sucursal'];

export default function Partners() {
  const { user } = useAuth();
  const isDealer = DEALER_ROLES.includes(user?.role);

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnersApi.getMyPartners()
      .then(data => setPartners(data || []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Partners" subtitle="Tus conexiones activas" backTo="/Cuenta" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-secondary/8 border border-secondary/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-secondary font-medium">
            Los partners son gestionados por el administrador de tu concesionario.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-16">
            <Handshake className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aún no tienes partners asignados</p>
            <p className="text-xs text-muted-foreground mt-1">Contacta a tu administrador para asociar partners</p>
          </div>
        ) : (
          <div className="space-y-2">
            {partners.map((p, i) => {
              const other = isDealer ? p.recomprador : p.dealer;
              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4 border border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{other?.nombre || other?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{other?.email}</p>
                      <Badge className="bg-secondary/10 text-secondary border-0 text-[10px] mt-0.5">Partner activo</Badge>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
