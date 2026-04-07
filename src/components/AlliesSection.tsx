import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { alliesApi } from "@/api/services";
import { Plus, Trash2, X, Pencil } from "lucide-react";

interface Ally {
  id: string;
  name: string;
  description: string;
  logoUrl?: string | null;
  order?: number;
  active?: boolean;
}

const AlliesSection = () => {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";

  const [allies, setAllies] = useState<Ally[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlly, setEditingAlly] = useState<Ally | null>(null);
  const [form, setForm] = useState({ name: "", description: "", logoUrl: "" });
  const [saving, setSaving] = useState(false);

  const fetchAllies = async () => {
    try {
      const data = isSuperadmin
        ? await alliesApi.getAll()
        : await alliesApi.getActive();
      setAllies(data);
    } catch {
      setAllies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllies();
  }, [isSuperadmin]);

  const openAdd = () => {
    setEditingAlly(null);
    setForm({ name: "", description: "", logoUrl: "" });
    setShowForm(true);
  };

  const openEdit = (ally: Ally) => {
    setEditingAlly(ally);
    setForm({
      name: ally.name,
      description: ally.description,
      logoUrl: ally.logoUrl || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      if (form.logoUrl.trim()) payload.logoUrl = form.logoUrl.trim();

      if (editingAlly) {
        await alliesApi.update(editingAlly.id, payload);
      } else {
        await alliesApi.create(payload);
      }
      setShowForm(false);
      setEditingAlly(null);
      await fetchAllies();
    } catch (err) {
      console.error("Error saving ally:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este aliado?")) return;
    try {
      await alliesApi.delete(id);
      await fetchAllies();
    } catch (err) {
      console.error("Error deleting ally:", err);
    }
  };

  const handleToggle = async (ally: Ally) => {
    try {
      await alliesApi.update(ally.id, { active: !ally.active });
      await fetchAllies();
    } catch (err) {
      console.error("Error toggling ally:", err);
    }
  };

  if (loading) return null;
  if (!isSuperadmin && allies.length === 0) return null;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
          Nuestros Aliados
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Trabajamos con las empresas más importantes del sector automotriz y
          financiero en Colombia.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {allies.map((ally) => (
            <div
              key={ally.id}
              className={`relative rounded-2xl border border-border bg-card p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow ${
                isSuperadmin && ally.active === false ? "opacity-50" : ""
              }`}
            >
              {isSuperadmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleToggle(ally)}
                    className={`p-1 rounded text-xs ${
                      ally.active !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    title={ally.active !== false ? "Desactivar" : "Activar"}
                  >
                    {ally.active !== false ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => openEdit(ally)}
                    className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ally.id)}
                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="w-full h-16 flex items-center justify-center mb-4">
                {ally.logoUrl ? (
                  <img
                    src={ally.logoUrl}
                    alt={ally.name}
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-lg font-black text-foreground tracking-tight">
                    {ally.name}
                  </span>
                )}
              </div>
              {ally.logoUrl && (
                <span className="text-sm font-semibold text-foreground mb-1">
                  {ally.name}
                </span>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {ally.description}
              </p>
            </div>
          ))}

          {isSuperadmin && (
            <button
              onClick={openAdd}
              className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-5 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-card transition-all min-h-[140px]"
            >
              <Plus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground font-medium">
                Agregar aliado
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingAlly(null);
              }}
              className="absolute top-3 right-3 p-1 rounded hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4">
              {editingAlly ? "Editar aliado" : "Nuevo aliado"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nombre del aliado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Breve descripción"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL del logo (opcional)
                </label>
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.description.trim()}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving
                  ? "Guardando..."
                  : editingAlly
                    ? "Guardar cambios"
                    : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AlliesSection;
