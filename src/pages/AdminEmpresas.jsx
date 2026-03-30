import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Pencil, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { companiesApi } from '@/api/services';
import { toast } from 'sonner';

export default function AdminEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getAll();
      setCompanies(data || []);
    } catch {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await companiesApi.update(editingId, { name: formName.trim() });
        toast.success('Empresa actualizada');
      } else {
        await companiesApi.create(formName.trim());
        toast.success('Empresa creada');
      }
      setFormName('');
      setEditingId(null);
      setShowForm(false);
      loadCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingId(company.id);
    setFormName(company.name);
    setShowForm(true);
  };

  const handleDeactivate = async (company) => {
    try {
      await companiesApi.remove(company.id);
      toast.success(`${company.name} desactivada`);
      loadCompanies();
    } catch {
      toast.error('Error al desactivar empresa');
    }
  };

  const handleReactivate = async (company) => {
    try {
      await companiesApi.update(company.id, { active: true });
      toast.success(`${company.name} reactivada`);
      loadCompanies();
    } catch {
      toast.error('Error al reactivar empresa');
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = companies.filter(c => c.active).length;

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Empresas" subtitle={`${activeCount} empresas activas`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border border-border shadow-sm rounded-xl"
            />
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setFormName(''); }}
            className="h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Plus className="w-4 h-4 mr-1" />Agregar
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-4 border border-secondary/30 shadow-sm">
            <h3 className="font-bold text-foreground mb-3">
              {editingId ? 'Editar empresa' : 'Nueva empresa'}
            </h3>
            <form onSubmit={handleSave} className="flex gap-2">
              <Input
                placeholder="Nombre oficial de la empresa"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="flex-1 h-11 rounded-xl border-border"
                autoFocus
                required
              />
              <Button type="submit" disabled={saving} className="h-11 rounded-xl bg-primary text-primary-foreground">
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowForm(false); setEditingId(null); setFormName(''); }}
                className="h-11 rounded-xl"
              >
                Cancelar
              </Button>
            </form>
          </Card>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <Card key={i} className="p-4 border border-border shadow-sm animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/5" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center border border-border shadow-sm">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? 'No se encontraron empresas con ese nombre' : 'No hay empresas registradas'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(company => (
              <Card key={company.id} className="p-4 border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${company.active ? 'bg-secondary/10' : 'bg-muted'}`}>
                      <Building2 className={`w-5 h-5 ${company.active ? 'text-secondary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${company.active ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                        {company.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(company.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={company.active ? 'bg-primary/10 text-primary text-xs' : 'bg-destructive/10 text-destructive text-xs'}>
                      {company.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(company)} className="h-8 w-8 p-0 rounded-full">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {company.active ? (
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivate(company)} className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleReactivate(company)} className="h-8 w-8 p-0 rounded-full text-primary hover:text-primary">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
