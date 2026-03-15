import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Target, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { goalsApi, usersApi } from '@/api/services';
import { toast } from 'sonner';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const PERIOD_LABELS = { MONTHLY: 'Mensual', QUARTERLY: 'Trimestral', ANNUAL: 'Anual' };

const EMPTY_FORM = {
  dealerId: '',
  period: '',
  periodType: 'MONTHLY',
  targetRevenue: '',
  targetCount: '',
  description: '',
};

function GoalForm({ initial, dealers, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.dealerId || !form.period) {
      toast.error('Selecciona un dealer y un periodo');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        dealerId: form.dealerId,
        period: form.period,
        periodType: form.periodType,
        description: form.description || undefined,
        targetRevenue: form.targetRevenue ? Number(form.targetRevenue) : undefined,
        targetCount: form.targetCount ? Number(form.targetCount) : undefined,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm">Dealer</Label>
        <Select value={form.dealerId} onValueChange={(v) => set('dealerId', v)}>
          <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Seleccionar dealer" /></SelectTrigger>
          <SelectContent>
            {dealers.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.nombre || d.name} — {d.company || ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Periodo (YYYY-MM)</Label>
          <Input className="mt-1 rounded-xl" placeholder="2026-03" value={form.period} onChange={(e) => set('period', e.target.value)} />
        </div>
        <div>
          <Label className="text-sm">Tipo de periodo</Label>
          <Select value={form.periodType} onValueChange={(v) => set('periodType', v)}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensual</SelectItem>
              <SelectItem value="QUARTERLY">Trimestral</SelectItem>
              <SelectItem value="ANNUAL">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Revenue objetivo (COP)</Label>
          <Input className="mt-1 rounded-xl" type="number" placeholder="50000000" value={form.targetRevenue} onChange={(e) => set('targetRevenue', e.target.value)} />
        </div>
        <div>
          <Label className="text-sm">Unidades objetivo</Label>
          <Input className="mt-1 rounded-xl" type="number" placeholder="10" value={form.targetCount} onChange={(e) => set('targetCount', e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="text-sm">Descripción</Label>
        <Textarea className="mt-1 rounded-xl resize-none h-20" placeholder="Describe la meta..." value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Guardar
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdminMetas() {
  const [goals, setGoals] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [g, users] = await Promise.all([
        goalsApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setGoals(g || []);
      setDealers((users || []).filter(u => (u.role || '').toUpperCase() === 'DEALER'));
    } catch (err) {
      toast.error('Error al cargar las metas');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload) {
    try {
      if (editing?.id) {
        await goalsApi.update(editing.id, payload);
        toast.success('Meta actualizada');
      } else {
        await goalsApi.create(payload);
        toast.success('Meta creada');
      }
      setDialogOpen(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar');
      throw err;
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta meta?')) return;
    try {
      await goalsApi.remove(id);
      toast.success('Meta eliminada');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar');
    }
  }

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(g) {
    setEditing({
      id: g.id,
      dealerId: g.dealerId || '',
      period: g.period || '',
      periodType: g.periodType || 'MONTHLY',
      targetRevenue: g.targetRevenue ?? '',
      targetCount: g.targetCount ?? '',
      description: g.description || '',
    });
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Metas de ventas" subtitle={`${goals.length} metas`} backTo="/AdminDashboard" />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex justify-end">
          <Button onClick={openCreate} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full">
            <Plus className="w-4 h-4 mr-2" />Nueva meta
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <Target className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay metas creadas aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((g, i) => {
              const rp = g.progress?.revenueProgress;
              const cp = g.progress?.countProgress;
              const dealerName = dealers.find(d => d.id === g.dealerId)?.nombre || g.dealerId;
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="p-4 border border-border rounded-xl shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">{dealerName}</span>
                          <Badge className="bg-muted text-muted-foreground border-0 text-xs font-normal">
                            {PERIOD_LABELS[g.periodType]} {g.period}
                          </Badge>
                        </div>
                        {g.description && <p className="text-xs text-muted-foreground mt-1">{g.description}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(g)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(g.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {g.targetRevenue != null && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Revenue: {formatPrice(g.progress?.actualRevenue || 0)} / {formatPrice(g.targetRevenue)}</span>
                          <span className="font-semibold">{rp !== null ? `${rp}%` : '—'}</span>
                        </div>
                        <Progress value={Math.min(rp ?? 0, 100)} className="h-1.5" />
                      </div>
                    )}
                    {g.targetCount != null && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Unidades: {g.progress?.actualCount || 0} / {g.targetCount}</span>
                          <span className="font-semibold">{cp !== null ? `${cp}%` : '—'}</span>
                        </div>
                        <Progress value={Math.min(cp ?? 0, 100)} className="h-1.5" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar meta' : 'Nueva meta'}</DialogTitle>
          </DialogHeader>
          <GoalForm
            initial={editing}
            dealers={dealers}
            onSave={handleSave}
            onCancel={() => { setDialogOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
