import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Users, UserMinus, UserPlus, Loader2, MapPin, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { branchesApi, usersApi, companiesApi } from '@/api/services';
import { toast } from 'sonner';

const EMPTY_FORM = { name: '', company: '', city: '', address: '', phone: '' };

function BranchForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.company) {
      toast.error('Nombre y empresa son requeridos');
      return;
    }
    try {
      setSaving(true);
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-sm">Nombre de sucursal</Label>
          <Input className="mt-1 rounded-xl" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Sucursal Norte" />
        </div>
        <div className="col-span-2">
          <Label className="text-sm">Empresa</Label>
          <Input className="mt-1 rounded-xl" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Nombre de la empresa" />
        </div>
        <div>
          <Label className="text-sm">Ciudad</Label>
          <Input className="mt-1 rounded-xl" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Bogotá" />
        </div>
        <div>
          <Label className="text-sm">Teléfono</Label>
          <Input className="mt-1 rounded-xl" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="601 234 5678" />
        </div>
        <div className="col-span-2">
          <Label className="text-sm">Dirección</Label>
          <Input className="mt-1 rounded-xl" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle 100 #15-20" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Guardar
        </Button>
      </DialogFooter>
    </form>
  );
}

function BranchDetail({ branch, allUsers, onClose, onRefresh }) {
  const [assignId, setAssignId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!branch) return null;

  const assignedIds = (branch.users || []).map(u => u.id);
  const available = allUsers.filter(u => !assignedIds.includes(u.id));

  async function handleAssign() {
    if (!assignId) return;
    try {
      setLoading(true);
      await branchesApi.assignUser(branch.id, assignId);
      toast.success('Usuario asignado');
      setAssignId('');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al asignar');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(userId) {
    try {
      await branchesApi.removeUser(branch.id, userId);
      toast.success('Usuario removido');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al remover');
    }
  }

  return (
    <Dialog open={!!branch} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{branch.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-muted rounded-xl space-y-1 text-xs">
            <p><span className="text-muted-foreground">Empresa:</span> {branch.company}</p>
            {branch.city && <p><span className="text-muted-foreground">Ciudad:</span> {branch.city}</p>}
            {branch.address && <p><span className="text-muted-foreground">Dirección:</span> {branch.address}</p>}
            {branch.phone && <p><span className="text-muted-foreground">Teléfono:</span> {branch.phone}</p>}
          </div>

          <div>
            <p className="font-semibold text-foreground mb-2">Usuarios asignados ({(branch.users || []).length})</p>
            {(branch.users || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin usuarios asignados</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {branch.users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-foreground font-medium text-xs">{u.nombre || u.name}</p>
                      <p className="text-muted-foreground text-[10px]">{u.email} · {u.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => handleRemove(u.id)}>
                      <UserMinus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {available.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-2">Asignar usuario</p>
              <div className="flex gap-2">
                <Select value={assignId} onValueChange={setAssignId}>
                  <SelectTrigger className="flex-1 rounded-xl text-xs h-9"><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                  <SelectContent>
                    {available.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.nombre || u.name} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAssign} disabled={!assignId || loading} className="h-9 px-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSucursales() {
  const [branches, setBranches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailBranch, setDetailBranch] = useState(null);
  const [filterCompany, setFilterCompany] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAll();
    companiesApi.getAll().catch(() => []).then(list => setCompanies(list || []));
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [b, u] = await Promise.all([
        branchesApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setBranches(b || []);
      setAllUsers(u || []);
    } catch (err) {
      toast.error('Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(form) {
    try {
      if (editing?.id) {
        await branchesApi.update(editing.id, form);
        toast.success('Sucursal actualizada');
      } else {
        await branchesApi.create(form);
        toast.success('Sucursal creada');
      }
      setFormOpen(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al guardar');
      throw err;
    }
  }

  async function openDetail(b) {
    try {
      const detail = await branchesApi.getById(b.id);
      setDetailBranch(detail);
    } catch {
      setDetailBranch(b);
    }
  }

  const filteredBranches = branches.filter(b => {
    if (filterCompany && b.companyId !== filterCompany && b.company !== filterCompany) return false;
    if (searchText && !b.name?.toLowerCase().includes(searchText.toLowerCase()) && !b.city?.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
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
      <Header title="Sucursales" subtitle={`${branches.length} sucursales`} backTo="/AdminDashboard" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-6 space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o ciudad..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          {companies.length > 0 && (
            <Select value={filterCompany || 'all'} onValueChange={(v) => setFilterCompany(v === 'all' ? '' : v)}>
              <SelectTrigger className="rounded-xl sm:w-52">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full shrink-0">
            <Plus className="w-4 h-4 mr-2" />Nueva sucursal
          </Button>
        </div>

        {filteredBranches.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay sucursales creadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBranches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(b)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{b.name}</p>
                        {!b.active && <Badge className="bg-red-100 text-red-800 border-0 text-xs">Inactiva</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{b.company}</p>
                      {b.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />{b.city}{b.address ? ` · ${b.address}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-secondary font-mono">{b._count?.users ?? (b.users?.length ?? 0)}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />usuarios</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setEditing(b); setFormOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar sucursal' : 'Nueva sucursal'}</DialogTitle>
          </DialogHeader>
          <BranchForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <BranchDetail
        branch={detailBranch}
        allUsers={allUsers}
        onClose={() => setDetailBranch(null)}
        onRefresh={() => { fetchAll(); setDetailBranch(null); }}
      />

      <BottomNav />
    </div>
  );
}
