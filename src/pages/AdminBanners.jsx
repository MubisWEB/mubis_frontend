import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Upload, Info } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { bannersApi, mediaApi } from '@/api/services';

const IDEAL_RATIO = 970 / 150; // ~6.47
const TOLERANCE = 0.25; // ±25%

function isValidRatio(width, height) {
  const ratio = width / height;
  return Math.abs(ratio - IDEAL_RATIO) / IDEAL_RATIO <= TOLERANCE;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const loadBanners = async () => {
    try {
      const data = await bannersApi.getAll();
      setBanners(data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      URL.revokeObjectURL(objectUrl);

      if (!isValidRatio(w, h)) {
        toast.error('Dimensiones no compatibles', {
          description: `Tu imagen es ${w}×${h}px (relación ${(w / h).toFixed(1)}:1). Se necesita aprox. 6.5:1 (ej. 970×150px).`,
        });
        if (inputRef.current) inputRef.current.value = '';
        return;
      }

      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('No se pudo leer la imagen');
    };
    img.src = objectUrl;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await mediaApi.upload([selectedFile]);
      const imageUrl = Array.isArray(result) ? (result[0]?.url || result[0]) : (result?.url || result);
      await bannersApi.create({ imageUrl });
      toast.success('Banner publicado', { description: 'Ya aparece en la página principal.' });
      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
      loadBanners();
    } catch {
      toast.error('Error al subir el banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await bannersApi.delete(id);
      toast.success('Banner eliminado');
      loadBanners();
    } catch {
      toast.error('Error al eliminar banner');
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Gestión de Banners" subtitle="Banners de la página principal" backTo="/Cuenta" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Size recommendation */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Tamaño recomendado: 970 × 150 px</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Relación de aspecto panorámica ~6.5:1. Se acepta ±25% de tolerancia.
              Formatos: PNG, JPG, WEBP.
            </p>
          </div>
        </div>

        {/* Upload card */}
        <Card className="p-4 border border-border rounded-2xl">
          <h2 className="text-sm font-bold text-foreground mb-3">Subir nuevo banner</h2>

          <label
            htmlFor="banner-upload"
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">Clic o arrastra la imagen aquí</p>
            <p className="text-xs text-muted-foreground mt-1">970 × 150 px aprox.</p>
            <input
              id="banner-upload"
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {preview && (
            <div className="mt-3 space-y-3">
              <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '970/150' }}>
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-full"
                  onClick={cancelPreview}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground rounded-full"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : 'Publicar banner'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Active banners list */}
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">Banners activos</h2>
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map(i => (
                <Card key={i} className="p-3 border border-border rounded-2xl animate-pulse">
                  <div style={{ aspectRatio: '970/150' }} className="bg-muted rounded-xl w-full" />
                </Card>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <Card className="p-6 text-center border border-border rounded-2xl bg-card">
              <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Sin banners personalizados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Se muestran los banners predeterminados en la Landing.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {banners.map(banner => (
                <Card key={banner.id} className="p-3 border border-border rounded-2xl bg-card">
                  <div className="relative w-full rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '970/150' }}>
                    <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {banner.createdAt
                        ? new Date(banner.createdAt).toLocaleDateString('es-CO')
                        : 'Subido recientemente'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full h-8 px-3"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />Eliminar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
