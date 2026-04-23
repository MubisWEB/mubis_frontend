import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handshake, Trash2, Upload, Pencil, X, Plus } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { alliesApi, mediaApi } from '@/api/services';

const EMPTY_FORM = { name: '', description: '', logoUrl: '' };

export default function AdminAliados() {
  const [allies, setAllies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlly, setEditingAlly] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const inputRef = useRef(null);

  const loadAllies = async () => {
    try {
      const data = await alliesApi.getAll();
      setAllies(data || []);
    } catch {
      setAllies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAllies(); }, []);

  const openAdd = () => {
    setEditingAlly(null);
    setForm(EMPTY_FORM);
    setLogoFile(null);
    setLogoPreview('');
    setShowForm(true);
  };

  const openEdit = (ally) => {
    setEditingAlly(ally);
    setForm({ name: ally.name, description: ally.description, logoUrl: ally.logoUrl || '' });
    setLogoFile(null);
    setLogoPreview(ally.logoUrl || '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAlly(null);
    setLogoFile(null);
    setLogoPreview('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Nombre y descripción son obligatorios');
      return;
    }
    setSaving(true);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        const result = await mediaApi.upload([logoFile], 'allies');
        logoUrl = result.urls ? result.urls[0] : (Array.isArray(result) ? result[0] : result);
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        ...(logoUrl ? { logoUrl } : {}),
      };

      if (editingAlly) {
        await alliesApi.update(editingAlly.id, payload);
        toast.success('Aliado actualizado');
      } else {
        await alliesApi.create(payload);
        toast.success('Aliado creado');
      }
      closeForm();
      loadAllies();
    } catch (err) {
      console.error('[AdminAliados] Error al guardar:', err?.response?.data ?? err);
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(' · ') : (msg || 'Error al guardar aliado'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este aliado? Esta acción no se puede deshacer.')) return;
    try {
      await alliesApi.delete(id);
      toast.success('Aliado eliminado');
      loadAllies();
    } catch {
      toast.error('Error al eliminar aliado');
    }
  };

  const handleToggle = async (ally) => {
    setTogglingId(ally.id);
    try {
      await alliesApi.update(ally.id, { active: !ally.active });
      toast.success(ally.active ? 'Aliado desactivado' : 'Aliado activado');
      loadAllies();
    } catch {
      toast.error('Error al actualizar estado');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Gestión de Aliados" subtitle="Administra los aliados visibles en el landing" backTo="/Cuenta" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

        {/* Info */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Handshake className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Aliados de Mubis</p>
            <p className="text-xs text-blue-700 mt-1">
              Los aliados activos se muestran en la sección "Nuestros Aliados" del landing page.
              Usa logos con fondo transparente (PNG) para mejores resultados.
            </p>
          </div>
        </div>

        {/* Agregar nuevo */}
        <Button onClick={openAdd} className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Agregar aliado
        </Button>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => (
              <Card key={i} className="p-4 border border-border rounded-2xl animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : allies.length === 0 ? (
          <Card className="p-8 text-center border border-border rounded-2xl bg-card">
            <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">Sin aliados</p>
            <p className="text-xs text-muted-foreground mt-1">La sección "Nuestros Aliados" no se mostrará en el landing hasta que agregues al menos uno.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {allies.map(ally => (
              <Card key={ally.id} className="p-4 border border-border rounded-2xl bg-card">
                <div className="flex gap-4 items-start">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {ally.logoUrl ? (
                      <img src={ally.logoUrl} alt={ally.name} className="max-w-full max-h-full object-contain p-1" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground text-center leading-tight px-1">{ally.name}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-foreground truncate">{ally.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ally.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ally.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ally.description}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 px-2.5 text-xs rounded-full ${ally.active !== false ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
                      onClick={() => handleToggle(ally)}
                      disabled={togglingId === ally.id}
                    >
                      {togglingId === ally.id ? '...' : ally.active !== false ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() => openEdit(ally)}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs rounded-full text-destructive border-destructive/20 hover:bg-destructive/5"
                      onClick={() => handleDelete(ally.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeForm} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-5">{editingAlly ? 'Editar aliado' : 'Nuevo aliado'}</h3>

            <div className="space-y-4">
              {/* Logo upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Logo (recomendado: PNG con fondo transparente)</Label>
                <label htmlFor="ally-logo" className="flex flex-col items-center justify-center w-full border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={logoPreview} alt="Vista previa" className="max-h-20 max-w-full object-contain" />
                      <span className="text-xs text-muted-foreground">Clic para cambiar</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Upload className="w-7 h-7 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Subir logo</span>
                    </div>
                  )}
                  <input id="ally-logo" ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>

              {/* Nombre */}
              <div>
                <Label htmlFor="ally-name" className="text-sm font-medium mb-1 block">Nombre *</Label>
                <Input
                  id="ally-name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Banco de Bogotá"
                  className="rounded-xl"
                />
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="ally-desc" className="text-sm font-medium mb-1 block">Descripción corta *</Label>
                <textarea
                  id="ally-desc"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Breve descripción del aliado (1-2 líneas)"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={closeForm} className="flex-1 rounded-xl">Cancelar</Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.description.trim()}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? 'Guardando...' : editingAlly ? 'Guardar cambios' : 'Crear aliado'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
