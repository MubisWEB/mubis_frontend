import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Image as ImageIcon, Plus, X, Search, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { ALL_BRANDS, getModelsForBrand } from '@/constants/vehicleData';

// Funciones para localStorage
const PREFERENCES_KEY = (userId) => `mubis_vehicle_preferences_${userId}`;

function loadPreferences(userId) {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePreferences(userId, preferences) {
  localStorage.setItem(PREFERENCES_KEY(userId), JSON.stringify(preferences));
}

export default function SeBusca() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [preferences, setPreferences] = useState([]);

  // Cargar preferencias al montar
  useEffect(() => {
    if (user?.id) {
      const loaded = loadPreferences(user.id);
      setPreferences(loaded);
    }
  }, [user?.id]);

  // Actualizar modelos disponibles cuando cambia la marca
  useEffect(() => {
    if (selectedBrand) {
      const models = getModelsForBrand(selectedBrand);
      setAvailableModels(models);
      setSelectedModel(''); // Reset model when brand changes
    } else {
      setAvailableModels([]);
      setSelectedModel('');
    }
  }, [selectedBrand]);

  // Agregar nueva preferencia
  const handleAddPreference = () => {
    if (!selectedBrand) {
      toast.error('Selecciona una marca');
      return;
    }

    // Verificar si ya existe la misma combinación
    const exists = preferences.some(p => 
      p.brand === selectedBrand && 
      (p.model === selectedModel || (!p.model && !selectedModel))
    );
    
    if (exists) {
      toast.error('Esta preferencia ya está en tu lista');
      return;
    }

    const newPref = {
      id: Date.now().toString(),
      brand: selectedBrand,
      model: selectedModel || null, // null significa "todos los modelos"
      createdAt: new Date().toISOString(),
    };

    const updated = [...preferences, newPref];
    setPreferences(updated);
    savePreferences(user.id, updated);
    
    // Limpiar formulario
    setSelectedBrand('');
    setSelectedModel('');

    const description = newPref.model 
      ? `${newPref.brand} ${newPref.model}` 
      : `${newPref.brand} - Todos los modelos`;

    toast.success('Preferencia agregada', {
      description: description,
    });
  };

  // Eliminar preferencia
  const handleRemovePreference = (id) => {
    const updated = preferences.filter(p => p.id !== id);
    setPreferences(updated);
    savePreferences(user.id, updated);
    toast.success('Preferencia eliminada');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      {/* Title Section */}
      <div className="px-4 md:px-8 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-6 h-6 text-secondary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Se Busca</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Marca tus preferencias de vehículos</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 space-y-6 pb-6">
        
        {/* Banner Management Button */}
        <Card className="border border-border shadow-sm rounded-2xl p-5 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground mb-1">Gestionar Anuncios</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sube y administra tus banners publicitarios en la página principal
              </p>
              <Button 
                onClick={() => navigate('/AdminBanners')}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-full h-9"
              >
                Ir a Gestión de Banners
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Preference Form */}
        <Card className="border border-border shadow-sm rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Agregar Preferencia</h3>
          </div>

          <div className="space-y-4">
            {/* Brand Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Marca *</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="rounded-xl border-border h-11">
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection - appears when brand is selected */}
            {selectedBrand && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Modelo <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Select value={selectedModel || "_all_"} onValueChange={(val) => setSelectedModel(val === "_all_" ? "" : val)}>
                  <SelectTrigger className="rounded-xl border-border h-11">
                    <SelectValue placeholder="Todos los modelos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all_">Todos los modelos</SelectItem>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Deja vacío para recibir alertas de cualquier modelo de {selectedBrand}
                </p>
              </div>
            )}

            {/* Add Button */}
            <Button 
              onClick={handleAddPreference}
              disabled={!selectedBrand}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar a mi Lista
            </Button>
          </div>
        </Card>

        {/* Preferences List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">Mis Preferencias ({preferences.length})</h3>
            {preferences.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setPreferences([]);
                  savePreferences(user.id, []);
                  toast.success('Todas las preferencias eliminadas');
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpiar todo
              </Button>
            )}
          </div>

          {preferences.length === 0 ? (
            <Card className="border border-dashed border-border shadow-sm rounded-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Sin preferencias aún</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega marcas que te interesan para recibir notificaciones cuando estén disponibles
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {preferences.map((pref) => (
                <Card key={pref.id} className="border border-border shadow-sm rounded-xl p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {pref.brand}{pref.model ? ` ${pref.model}` : ''}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {pref.model ? 'Modelo específico' : 'Todos los modelos'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePreference(pref.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <Card className="border border-border/50 bg-muted/30 shadow-sm rounded-2xl p-4">
          <p className="text-sm text-muted-foreground">
            Agrega marcas y modelos de vehículos que te interesan. Recibirás notificaciones cuando haya vehículos disponibles que coincidan con tus preferencias.
          </p>
        </Card>

      </div>

      <BottomNav />
    </div>
  );
}