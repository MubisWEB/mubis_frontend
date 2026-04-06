import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Building2, Handshake, UserPlus, Trash2, Loader2, Users, Calendar, Percent,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { companiesApi, partnersApi } from '@/api/services';

export default function AdminPartners() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [partners, setPartners] = useState([]);
  const [recompradores, setRecompradores] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [config, setConfig] = useState({ trialStart: '', trialEnd: '', brokerageDiscount: '' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [associateOpen, setAssociateOpen] = useState(false);
  const [selectedRecompradorId, setSelectedRecompradorId] = useState('');
  const [associating, setAssociating] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Load companies on mount
  useEffect(() => {
    companiesApi.getAll()
      .then(list => setCompanies((list || []).filter(c => c.active !== false)))
      .catch(() => setCompanies([]));
  }, []);

  // Load partners + config when company changes
  useEffect(() => {
    if (!selectedCompanyId) {
      setPartners([]);
      setConfig({ trialStart: '', trialEnd: '', brokerageDiscount: '' });
      return;
    }
    setLoadingPartners(true);
    Promise.all([
      partnersApi.getAll(selectedCompanyId).catch(() => []),
      partnersApi.getRecompradores().catch(() => []),
      companiesApi.getById(selectedCompanyId).catch(() => null),
    ]).then(([pList, rList, company]) => {
      setPartners(pList || []);
      setRecompradores(rList || []);
      if (company) {
        setConfig({
          trialStart: company.trialStart ? company.trialStart.slice(0, 10) : '',
          trialEnd: company.trialEnd ? company.trialEnd.slice(0, 10) : '',
          brokerageDiscount: company.brokerageDiscount != null ? String(company.brokerageDiscount) : '',
        });
      }
    }).finally(() => setLoadingPartners(false));
  }, [selectedCompanyId]);

  const handleSaveConfig = async () => {
    if (!selectedCompanyId) return;
    try {
      setSavingConfig(true);
      await companiesApi.update(selectedCompanyId, {
        trialStart: config.trialStart || null,
        trialEnd: config.trialEnd || null,
        brokerageDiscount: config.brokerageDiscount !== '' ? Number(config.brokerageDiscount) : null,
      });
      toast.success('Configuración guardada');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAssociate = async () => {
    if (!selectedRecompradorId || !selectedCompanyId) return;
    try {
      setAssociating(true);
      await partnersApi.adminCreate({ companyId: selectedCompanyId, recompradorId: selectedRecompradorId });
      toast.success('Partner asociado');
      setAssociateOpen(false);
      setSelectedRecompradorId('');
      const updated = await partnersApi.getAll(selectedCompanyId).catch(() => []);
      setPartners(updated || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al asociar');
    } finally {
      setAssociating(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      setRemovingId(id);
      await partnersApi.adminRemove(id);
      toast.success('Partner eliminado');
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
    } finally {
      setRemovingId(null);
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Recompradores not yet partnered with this company
  const partnerRecompradorIds = new Set(partners.map(p => p.recompradorId || p.recomprador?.id));
  const availableRecompradores = recompradores.filter(r => !partnerRecompradorIds.has(r.id));

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Gestión de Partners" subtitle="Superadmin" backTo="/AdminDashboard" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Selector de empresa */}
        <Card className="p-4 border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-secondary" />
            <h2 className="text-sm font-bold text-foreground">Seleccionar empresa</h2>
          </div>
          <Select value={selectedCompanyId || 'none'} onValueChange={v => setSelectedCompanyId(v === 'none' ? '' : v)}>
            <SelectTrigger className="rounded-xl border-border h-11">
              <SelectValue placeholder="Elige una empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Elige una empresa —</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedCompanyId && (
          <>
            {/* Configuración de la empresa */}
            <Card className="p-4 border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-secondary" />
                <h2 className="text-base font-bold text-foreground">Configuración de {selectedCompany?.name}</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5 block">
                      <Calendar className="w-3.5 h-3.5" /> Inicio periodo prueba
                    </Label>
                    <input
                      type="date"
                      value={config.trialStart}
                      onChange={e => setConfig(c => ({ ...c, trialStart: e.target.value }))}
                      className="w-full rounded-xl border border-input h-11 px-3 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5 block">
                      <Calendar className="w-3.5 h-3.5" /> Fin periodo prueba
                    </Label>
                    <input
                      type="date"
                      value={config.trialEnd}
                      onChange={e => setConfig(c => ({ ...c, trialEnd: e.target.value }))}
                      className="w-full rounded-xl border border-input h-11 px-3 text-sm bg-background"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-1.5 flex items-center gap-1.5 block">
                    <Percent className="w-3.5 h-3.5" /> Descuento de corretaje (%)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={config.brokerageDiscount}
                    onChange={e => setConfig(c => ({ ...c, brokerageDiscount: e.target.value }))}
                    className="rounded-xl border-border h-11"
                  />
                </div>

                <Button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 rounded-full"
                >
                  {savingConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {savingConfig ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </div>
            </Card>

            {/* Partners de la empresa */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h2 className="text-base font-bold text-foreground">Partners</h2>
                  {partners.length > 0 && (
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{partners.length}</Badge>
                  )}
                </div>

                <Dialog open={associateOpen} onOpenChange={setAssociateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-full h-9 px-4 text-sm flex items-center gap-2">
                      <UserPlus className="w-4 h-4" /> Asociar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Asociar Partner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <p className="text-sm text-muted-foreground">Selecciona un recomprador para asociar a <strong>{selectedCompany?.name}</strong>.</p>
                      <Select value={selectedRecompradorId || 'none'} onValueChange={v => setSelectedRecompradorId(v === 'none' ? '' : v)}>
                        <SelectTrigger className="rounded-xl border-border h-11">
                          <SelectValue placeholder="Seleccionar recomprador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Seleccionar —</SelectItem>
                          {availableRecompradores.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.nombre || r.name} — {r.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableRecompradores.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center">No hay recompradores disponibles para asociar</p>
                      )}
                      <Button
                        onClick={handleAssociate}
                        disabled={!selectedRecompradorId || associating}
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-11 rounded-full"
                      >
                        {associating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {associating ? 'Asociando...' : 'Confirmar asociación'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loadingPartners ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                </div>
              ) : partners.length === 0 ? (
                <Card className="p-8 text-center border border-border rounded-2xl">
                  <Handshake className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Esta empresa no tiene partners aún</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {partners.map((p, i) => {
                    const r = p.recomprador;
                    return (
                      <Card key={p.id} className="p-4 border border-border rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-sm truncate">{r?.nombre || r?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{r?.email}</p>
                          {p.createdAt && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Asociado {new Date(p.createdAt).toLocaleDateString('es-CO')}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                          disabled={removingId === p.id}
                          onClick={() => handleRemove(p.id)}
                        >
                          {removingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedCompanyId && (
          <Card className="p-12 text-center border border-border rounded-2xl">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Selecciona una empresa para gestionar sus partners</p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
