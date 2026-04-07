import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, Car, Calendar, Gauge, Loader2, Package } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/lib/AuthContext';
import { branchInventoryApi, branchesApi } from '@/api/services';
import { toast } from 'sonner';

function getDaysColor(days) {
  if (days <= 30) return 'text-green-600 bg-green-50';
  if (days <= 60) return 'text-yellow-600 bg-yellow-50';
  if (days <= 90) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

export default function AdminInventarioSucursal() {
  const { user } = useAuth();
  const role = user?.role;

  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    branchId: '',
    brand: '',
    model: '',
    version: '',
    year: new Date().getFullYear(),
    km: 0,
  });

  const isAdminSucursal = role === 'admin_sucursal';
  const isDealer = role === 'dealer';
  const canEdit = !isDealer;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      let data;
      if ((isAdminSucursal || isDealer) && user?.branchId) {
        data = await branchInventoryApi.getByBranch(user.branchId);
      } else {
        data = await branchInventoryApi.getAll();
      }
      setVehicles(data || []);

      if (!isAdminSucursal && !isDealer) {
        const allBranches = await branchesApi.getAll();
        setBranches(allBranches || []);
      }
    } catch (err) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }

  const filtered = vehicles.filter((v) => {
    const matchesSearch = !search ||
      `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = filterBranch === 'all' || v.branchId === filterBranch;
    return matchesSearch && matchesBranch;
  });

  async function handleAdd() {
    if (!form.brand || !form.model || !form.version || !form.year || !form.branchId) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      await branchInventoryApi.create({
        ...form,
        year: Number(form.year),
        km: Number(form.km),
      });
      toast.success('Vehículo agregado al inventario');
      setAddOpen(false);
      setForm({ branchId: isAdminSucursal ? user?.branchId || '' : '', brand: '', model: '', version: '', year: new Date().getFullYear(), km: 0 });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al agregar vehículo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await branchInventoryApi.delete(id);
      toast.success('Vehículo eliminado del inventario');
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      toast.error('Error al eliminar vehículo');
    } finally {
      setDeleting(null);
    }
  }

  function openAddDialog() {
    setForm({
      branchId: isAdminSucursal ? user?.branchId || '' : '',
      brand: '',
      model: '',
      version: '',
      year: new Date().getFullYear(),
      km: 0,
    });
    setAddOpen(true);
  }

  const uniqueBranches = [...new Map(
    vehicles.filter(v => v.branch).map(v => [v.branch.id, v.branch])
  ).values()];

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Inventario de Sucursal" backTo="/Cuenta" />

      <div className="px-4 pt-4 space-y-4">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por marca, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {canEdit && (
            <Button onClick={openAddDialog} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Branch filter - only for admin_general */}
        {!isAdminSucursal && !isDealer && uniqueBranches.length > 0 && (
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las sucursales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las sucursales</SelectItem>
              {uniqueBranches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name} - {b.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Stats */}
        <div className="flex gap-3">
          <Card className="flex-1 p-3 text-center border border-border">
            <p className="text-2xl font-bold">{filtered.length}</p>
            <p className="text-xs text-muted-foreground">Vehículos</p>
          </Card>
          <Card className="flex-1 p-3 text-center border border-border">
            <p className="text-2xl font-bold">
              {filtered.length > 0 ? Math.round(filtered.reduce((s, v) => s + (v.daysInInventory || 0), 0) / filtered.length) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Promedio días</p>
          </Card>
        </div>

        {/* Vehicle List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay vehículos en el inventario</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((v) => (
              <Card key={v.id} className="p-4 border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{v.version}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {v.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" /> {v.km.toLocaleString('es-CO')} km
                      </span>
                    </div>
                    {v.branch && (
                      <p className="text-xs text-muted-foreground mt-1">{v.branch.name}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDaysColor(v.daysInInventory)}`}>
                      {v.daysInInventory}d
                    </span>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(v.id)}
                        disabled={deleting === v.id}
                      >
                        {deleting === v.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar vehículo al inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!isAdminSucursal && (
              <div>
                <Label>Sucursal *</Label>
                <Select value={form.branchId} onValueChange={(val) => setForm({ ...form, branchId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name} - {b.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Marca *</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ej: Toyota" />
            </div>
            <div>
              <Label>Modelo *</Label>
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ej: Corolla" />
            </div>
            <div>
              <Label>Versión / Motor *</Label>
              <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="Ej: 1.8 CVT" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Año *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div>
                <Label>Kilometraje</Label>
                <Input type="number" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
