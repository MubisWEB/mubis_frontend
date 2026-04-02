import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Upload, Info, Move, ZoomIn, ZoomOut } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { bannersApi, mediaApi } from '@/api/services';

const BANNER_ASPECT_RATIO = 970 / 150; // ~6.47

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);
  
  // Image positioning state
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // percentage
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef(null);

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

    // Accept any image
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    // Reset position and scale for new image
    setImagePosition({ x: 50, y: 50 });
    setImageScale(1);
  };

  // Dragging handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setImagePosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * 0.2)),
      y: Math.max(0, Math.min(100, prev.y - dy * 0.5))
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    
    setImagePosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * 0.2)),
      y: Math.max(0, Math.min(100, prev.y - dy * 0.5))
    }));
    
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await mediaApi.upload([selectedFile], 'banners');
      const imageUrl = result.urls ? result.urls[0] : (Array.isArray(result) ? result[0] : result);
      
      // Only send imageUrl - positioning is handled on frontend display
      await bannersApi.create({ imageUrl });
      
      toast.success('Banner publicado', { description: 'Ya aparece en la página principal.' });
      setSelectedFile(null);
      setPreview(null);
      setImagePosition({ x: 50, y: 50 });
      setImageScale(1);
      if (inputRef.current) inputRef.current.value = '';
      loadBanners();
    } catch (err) {
      console.error('Error al subir banner:', err);
      toast.error('Error al subir el banner', {
        description: err?.response?.data?.message || 'Intenta de nuevo'
      });
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
    setImagePosition({ x: 50, y: 50 });
    setImageScale(1);
    if (inputRef.current) inputRef.current.value = '';
  };

  const adjustScale = (delta) => {
    setImageScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Gestión de Banners" subtitle="Banners de la página principal" backTo="/Cuenta" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Size recommendation */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Recomendaciones para mejores resultados</p>
            <p className="text-xs text-blue-700 mt-1">
              • <strong>Tamaño ideal:</strong> 970 × 150 px (relación 6.5:1)<br />
              • <strong>Formatos:</strong> PNG, JPG, WEBP<br />
              • <strong>Tip:</strong> Puedes subir cualquier imagen y ajustar su posición arrastrando
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
            <p className="text-xs text-muted-foreground mt-1">Cualquier tamaño - podrás ajustar después</p>
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
            <div className="mt-4 space-y-3">
              {/* Instructions */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Move className="w-4 h-4" />
                <span>Arrastra la imagen para ajustar su posición</span>
              </div>

              {/* Preview container with draggable image */}
              <div 
                ref={previewContainerRef}
                className="relative w-full rounded-xl overflow-hidden border-2 border-primary/30 cursor-move select-none"
                style={{ aspectRatio: `${BANNER_ASPECT_RATIO}` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <img 
                  src={preview} 
                  alt="Vista previa" 
                  className="absolute w-full h-full pointer-events-none"
                  style={{ 
                    objectFit: 'cover',
                    objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                    transform: `scale(${imageScale})`,
                    transformOrigin: 'center'
                  }} 
                  draggable={false}
                />
                {/* Drag overlay indicator */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className={`bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                    <Move className="w-3 h-3" />
                    {isDragging ? 'Arrastrando...' : 'Arrastra para ajustar'}
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => adjustScale(-0.1)}
                  disabled={imageScale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-16 text-center">
                  {Math.round(imageScale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => adjustScale(0.1)}
                  disabled={imageScale >= 2}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Action buttons */}
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
                  <div style={{ aspectRatio: `${BANNER_ASPECT_RATIO}` }} className="bg-muted rounded-xl w-full" />
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
                  <div 
                    className="relative w-full rounded-xl overflow-hidden mb-2" 
                    style={{ aspectRatio: `${BANNER_ASPECT_RATIO}` }}
                  >
                    <img 
                      src={banner.imageUrl} 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                    />
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
