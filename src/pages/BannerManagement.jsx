import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { bannersApi } from '@/api/services';

export default function BannerManagement() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    gradientFrom: 'violet-600',
    gradientVia: 'purple-600',
    gradientTo: 'fuchsia-600',
    active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await bannersApi.getAll();
      setBanners(data);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Error al cargar los banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.imageUrl) {
        toast.error('La URL de la imagen es requerida');
        return;
      }

      if (editingBanner) {
        await bannersApi.update(editingBanner.id, formData);
        toast.success('Banner actualizado');
      } else {
        await bannersApi.create(formData);
        toast.success('Banner creado');
      }

      setDialogOpen(false);
      resetForm();
      loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Error al guardar el banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      gradientFrom: banner.gradientFrom || 'violet-600',
      gradientVia: banner.gradientVia || 'purple-600',
      gradientTo: banner.gradientTo || 'fuchsia-600',
      active: banner.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;
    try {
      await bannersApi.delete(id);
      toast.success('Banner eliminado');
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error al eliminar el banner');
    }
  };

  const handleToggle = async (id) => {
    try {
      await bannersApi.toggle(id);
      toast.success('Estado actualizado');
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      gradientFrom: 'violet-600',
      gradientVia: 'purple-600',
      gradientTo: 'fuchsia-600',
      active: true,
    });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex === targetIndex) return;

    const reordered = [...banners];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setBanners(reordered);
    
    try {
      await bannersApi.reorder(reordered.map(b => b.id));
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al reordenar');
      loadBanners();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 p-4 pb-20 md:pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/AdminDashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Banners</h1>
              <p className="text-gray-600">Administra los banners del home</p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Banner
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando...</div>
          ) : banners.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">No hay banners configurados</p>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Crear el primer banner
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {banners.map((banner, index) => (
                <Card
                  key={banner.id}
                  className="p-4"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    
                    <div className="w-32 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-r from-${banner.gradientFrom} via-${banner.gradientVia} to-${banner.gradientTo}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {banner.title || 'Sin título'}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {banner.subtitle || 'Sin subtítulo'}
                      </p>
                      {banner.linkUrl && (
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {banner.linkUrl}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggle(banner.id)}
                        title={banner.active ? 'Desactivar' : 'Activar'}
                      >
                        {banner.active ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
            </DialogTitle>
            <DialogDescription>
              Configura el banner para el carrusel del home
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageUrl">URL de la Imagen *</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del banner"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Subtítulo del banner"
              />
            </div>

            <div>
              <Label htmlFor="linkUrl">URL de Enlace (opcional)</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://example.com/promo"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="gradientFrom">Gradiente Desde</Label>
                <Input
                  id="gradientFrom"
                  value={formData.gradientFrom}
                  onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                  placeholder="violet-600"
                />
              </div>
              <div>
                <Label htmlFor="gradientVia">Gradiente Via</Label>
                <Input
                  id="gradientVia"
                  value={formData.gradientVia}
                  onChange={(e) => setFormData({ ...formData, gradientVia: e.target.value })}
                  placeholder="purple-600"
                />
              </div>
              <div>
                <Label htmlFor="gradientTo">Gradiente Hasta</Label>
                <Input
                  id="gradientTo"
                  value={formData.gradientTo}
                  onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                  placeholder="fuchsia-600"
                />
              </div>
            </div>

            {formData.imageUrl && (
              <div>
                <Label>Vista Previa</Label>
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingBanner ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
