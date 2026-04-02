import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck, UserX, Trash2, Search, Handshake, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { partnersApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const DEALER_ROLES = ['dealer', 'admin_general', 'admin_sucursal'];

export default function Partners() {
  const { user } = useAuth();
  const isDealer = DEALER_ROLES.includes(user?.role);

  const [tab, setTab] = useState('partners');
  const [partners, setPartners] = useState([]);
  const [available, setAvailable] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const myPartners = await partnersApi.getMyPartners().catch(() => []);
      setPartners(myPartners || []);

      if (isDealer) {
        const recompradores = await partnersApi.getRecompradores().catch(() => []);
        setAvailable(recompradores || []);
      } else {
        const invs = await partnersApi.getInvitations().catch(() => []);
        setInvitations(invs || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleInvite = async (recompradorId) => {
    try {
      setActionLoading(recompradorId);
      await partnersApi.invite(recompradorId);
      toast.success('Invitación enviada');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al enviar invitación');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (id) => {
    try {
      setActionLoading(id);
      await partnersApi.acceptInvitation(id);
      toast.success('Partnership aceptado');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al aceptar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await partnersApi.rejectInvitation(id);
      toast.success('Invitación rechazada');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al rechazar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      setActionLoading(id);
      await partnersApi.remove(id);
      toast.success('Partner eliminado');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAvailable = available.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.nombre || r.name || '').toLowerCase().includes(q) ||
           (r.email || '').toLowerCase().includes(q);
  });

  const tabs = isDealer
    ? [
        { key: 'partners', label: 'Mis Partners', count: partners.length },
        { key: 'invite', label: 'Invitar', count: available.length },
      ]
    : [
        { key: 'partners', label: 'Mis Partners', count: partners.length },
        { key: 'invitations', label: 'Invitaciones', count: invitations.length },
      ];

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Partners" subtitle="Gestiona tus conexiones" backTo="/Cuenta" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                tab === t.key
                  ? 'bg-secondary text-secondary-foreground border-secondary'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted/30'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-secondary/10 text-secondary'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : (
          <>
            {/* Tab: Mis Partners */}
            {tab === 'partners' && (
              partners.length === 0 ? (
                <div className="text-center py-16">
                  <Handshake className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Aún no tienes partners</p>
                  {isDealer && (
                    <p className="text-xs text-muted-foreground mt-1">Ve a "Invitar" para conectar con recompradores</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {partners.map((p, i) => {
                    const other = isDealer ? p.recomprador : p.dealer;
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className="p-4 border border-border flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                              <UserCheck className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{other?.nombre || other?.name || '—'}</p>
                              <p className="text-xs text-muted-foreground truncate">{other?.email}</p>
                              <Badge className="bg-secondary/10 text-secondary border-0 text-[10px] mt-0.5">Partner activo</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                            disabled={actionLoading === p.id}
                            onClick={() => handleRemove(p.id)}
                          >
                            {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}

            {/* Tab: Invitar (solo dealer) */}
            {tab === 'invite' && isDealer && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar recomprador por nombre o email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
                {filteredAvailable.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {search ? 'Sin resultados' : 'No hay recompradores disponibles'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailable.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className="p-4 border border-border flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{r.nombre || r.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full h-8 px-3 flex-shrink-0"
                            disabled={actionLoading === r.id}
                            onClick={() => handleInvite(r.id)}
                          >
                            {actionLoading === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab: Invitaciones (solo recomprador) */}
            {tab === 'invitations' && !isDealer && (
              invitations.length === 0 ? (
                <div className="text-center py-16">
                  <Handshake className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No tienes invitaciones pendientes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invitations.map((inv, i) => (
                    <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="p-4 border border-border space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Handshake className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm truncate">{inv.dealer?.nombre || inv.dealer?.name || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate">{inv.dealer?.email}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Quiere ser tu partner</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-full h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                            disabled={actionLoading === inv.id}
                            onClick={() => handleReject(inv.id)}
                          >
                            {actionLoading === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><UserX className="w-3.5 h-3.5 mr-1.5" />Rechazar</>}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 rounded-full h-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                            disabled={actionLoading === inv.id}
                            onClick={() => handleAccept(inv.id)}
                          >
                            {actionLoading === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><UserCheck className="w-3.5 h-3.5 mr-1.5" />Aceptar</>}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
