import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Search, Loader2,
  Package2, StickyNote, RefreshCw
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { inventoryApi } from '@/api/services';
import { toast } from 'sonner';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function getStage(record) {
  if (record.delivered) return { label: 'Entregado', color: 'bg-green-100 text-green-800', step: 5 };
  if (record.dispatched) return { label: 'Despachado', color: 'bg-blue-100 text-blue-800', step: 4 };
  if (record.docsReceived) return { label: 'Docs recibidos', color: 'bg-purple-100 text-purple-800', step: 3 };
  if (record.docsRequested) return { label: 'Docs solicitados', color: 'bg-yellow-100 text-yellow-800', step: 2 };
  if (record.paymentConfirmed) return { label: 'Pago confirmado', color: 'bg-orange-100 text-orange-800', step: 1 };
  return { label: 'Pendiente pago', color: 'bg-red-100 text-red-800', step: 0 };
}

const STAGES = [
  { key: 'paymentConfirmed', label: 'Pago confirmado', dateKey: 'paymentConfirmedAt', action: 'Confirmar pago', fn: (id) => inventoryApi.confirmPayment(id, {}) },
  { key: 'docsRequested', label: 'Docs solicitados', dateKey: 'docsRequestedAt', action: 'Solicitar docs', fn: (id) => inventoryApi.requestDocs(id) },
  { key: 'docsReceived', label: 'Docs recibidos', dateKey: 'docsReceivedAt', action: 'Marcar docs recibidos', fn: (id) => inventoryApi.receiveDocs(id) },
  { key: 'dispatched', label: 'Despachado', dateKey: 'dispatchedAt', action: 'Despachar', fn: (id) => inventoryApi.dispatch(id) },
  { key: 'delivered', label: 'Entregado', dateKey: 'deliveredAt', action: 'Confirmar entrega', fn: (id) => inventoryApi.deliver(id) },
];

function InventoryDetail({ record, onClose, onRefresh }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  if (!record) return null;

  async function handleAction(stage) {
    try {
      setActionLoading(stage.key);
      await stage.fn(record.id);
      toast.success(`${stage.label} actualizado`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al actualizar');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    try {
      setSaving(true);
      await inventoryApi.addNote(record.id, { note });
      toast.success('Nota agregada');
      setNote('');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al agregar nota');
    } finally {
      setSaving(false);
    }
  }

  const nextStage = STAGES.find(s => !record[s.key]);

  return (
    <Dialog open={!!record} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold">{record.vehicleLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-xl text-xs">
            <div><p className="text-muted-foreground">Comprador</p><p className="font-medium truncate">{record.buyerId || '—'}</p></div>
            <div><p className="text-muted-foreground">Monto</p><p className="font-bold text-primary">{formatPrice(record.finalAmount)}</p></div>
          </div>

          {/* Etapas */}
          <div>
            <p className="font-semibold text-foreground mb-2">Etapas del proceso</p>
            <div className="space-y-2">
              {STAGES.map((s) => {
                const done = !!record[s.key];
                return (
                  <div key={s.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {done
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <Circle className="w-4 h-4 text-muted-foreground" />}
                      <span className={done ? 'text-foreground font-medium' : 'text-muted-foreground'}>{s.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{done ? formatDate(record[s.dateKey]) : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acción siguiente */}
          {nextStage && (
            <Button
              onClick={() => handleAction(nextStage)}
              disabled={actionLoading === nextStage.key}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {actionLoading === nextStage.key
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : null}
              {nextStage.action}
            </Button>
          )}

          {/* Eventos */}
          {record.events && record.events.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-2">Historial</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {record.events.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs p-2 bg-muted rounded-lg">
                    <span className="text-foreground">{e.type}{e.note ? ` — ${e.note}` : ''}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{formatDate(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nota */}
          <div>
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2"><StickyNote className="w-3.5 h-3.5" />Agregar nota</p>
            <Textarea
              placeholder="Escribe una nota..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-20 text-sm"
            />
            <Button onClick={handleAddNote} disabled={saving || !note.trim()} variant="outline" size="sm" className="mt-2 w-full">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Guardar nota
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: '0', label: 'Pendiente pago' },
  { value: '1', label: 'Pago confirmado' },
  { value: '2', label: 'Docs solicitados' },
  { value: '3', label: 'Docs recibidos' },
  { value: '4', label: 'Despachado' },
  { value: '5', label: 'Entregado' },
];

export default function AdminInventario() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setRecords(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }

  const filtered = records.filter(r => {
    const matchSearch = !search || r.vehicleLabel?.toLowerCase().includes(search.toLowerCase());
    const stage = getStage(r);
    const matchStage = stageFilter === 'all' || String(stage.step) === stageFilter;
    return matchSearch && matchStage;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Inventario" subtitle={`${records.length} registros`} backTo="/AdminDashboard" />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vehículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[170px] h-9 text-sm rounded-xl">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} className="h-9 rounded-xl px-3">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay registros con estos filtros</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => {
              const stage = getStage(r);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className="p-4 border border-border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelected(r)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{r.vehicleLabel}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt || r.updatedAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary text-sm">{formatPrice(r.finalAmount)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${stage.color}`}>
                          {stage.label}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">{filtered.length} de {records.length} registros</p>
      </div>

      <InventoryDetail
        record={selected}
        onClose={() => setSelected(null)}
        onRefresh={fetchData}
      />

      <BottomNav />
    </div>
  );
}
