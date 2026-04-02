import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Trophy, Bookmark, LayoutGrid, LayoutList, Zap, Leaf, Truck, Car, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

// Categorías rápidas para filtrado
const quickCategories = [
  { id: 'electric', label: 'Eléctricos', icon: Zap, filter: { fuelType: 'electrico' } },
  { id: 'hybrid', label: 'Híbridos', icon: Leaf, filter: { fuelType: 'hibrido' } },
  { id: 'suv', label: 'SUVs', icon: Truck, filter: { bodyType: 'suv' } },
  { id: 'sedan', label: 'Sedanes', icon: Car, filter: { bodyType: 'sedan' } },
  { id: 'luxury', label: 'Premium', icon: Sparkles, filter: { category: 'premium' } },
  { id: 'economic', label: 'Budget', icon: null, emoji: '💵', filter: { priceMax: '50' } },
];

export default function FilterPanel({ filters, setFilters, viewMode, setViewMode, showViewMode = false, showSavedLinks = false }) {
  const navigate = useNavigate();
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeCategory, setActiveCategory] = useState(null);

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleReset = () => {
    const empty = { brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '', fuelType: '', bodyType: '', category: '' };
    setLocalFilters(empty);
    setFilters(empty);
    setActiveCategory(null);
  };

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat.id) {
      // Deselect
      setActiveCategory(null);
      const resetFilters = { ...localFilters, fuelType: '', bodyType: '', category: '', priceMax: '' };
      setLocalFilters(resetFilters);
      setFilters(resetFilters);
    } else {
      // Select new category - clear all category filters first, then apply new one
      setActiveCategory(cat.id);
      const newFilters = { ...localFilters, fuelType: '', bodyType: '', category: '', priceMax: '', ...cat.filter };
      setLocalFilters(newFilters);
      setFilters(newFilters);
    }
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-4 self-start">
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-secondary" />
        <h3 className="text-base font-bold text-foreground">Filtros</h3>
      </div>

      <div className="space-y-5">
        {/* Quick Categories */}
        <div className="pb-4 border-b border-border">
          <Label className="text-foreground font-semibold text-sm mb-3 block">Mundos</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-medium transition-all min-w-0 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 text-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : <span className="flex-shrink-0">{cat.emoji}</span>}
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Marca</Label>
          <Select
            value={localFilters.brand}
            onValueChange={(v) => setLocalFilters({ ...localFilters, brand: v })}
          >
            <SelectTrigger className="rounded-xl border-border h-10">
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Año del modelo</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Desde"
              value={localFilters.yearFrom}
              onChange={(e) => setLocalFilters({ ...localFilters, yearFrom: e.target.value })}
              className="rounded-xl border-border h-10"
            />
            <Input
              type="number"
              placeholder="Hasta"
              value={localFilters.yearTo}
              onChange={(e) => setLocalFilters({ ...localFilters, yearTo: e.target.value })}
              className="rounded-xl border-border h-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Precio (millones COP)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={localFilters.priceMin}
              onChange={(e) => setLocalFilters({ ...localFilters, priceMin: e.target.value })}
              className="rounded-xl border-border h-10"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={localFilters.priceMax}
              onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
              className="rounded-xl border-border h-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-foreground font-semibold text-sm mb-2 block">Kilometraje máximo</Label>
          <Input
            type="number"
            placeholder="Ej: 50000"
            value={localFilters.mileageMax}
            onChange={(e) => setLocalFilters({ ...localFilters, mileageMax: e.target.value })}
            className="rounded-xl border-border h-10"
          />
        </div>
      </div>

      <div className="pt-4 space-y-2 border-t border-border mt-5">
        <Button
          onClick={handleApply}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-10 rounded-full"
        >
          Aplicar filtros
        </Button>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="w-full text-muted-foreground font-medium text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
