import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Filter, X, Zap, Leaf, Truck, Car, Sparkles } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';

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

export default function FilterSheet({ filters, setFilters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const handleApply = () => {
    setFilters(localFilters);
    onApply?.(localFilters);
    setOpen(false);
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
    } else {
      // Select new category - clear all category filters first, then apply new one
      setActiveCategory(cat.id);
      const newFilters = { ...localFilters, fuelType: '', bodyType: '', category: '', priceMax: '', ...cat.filter };
      setLocalFilters(newFilters);
    }
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full font-medium h-10 px-4 text-sm border-0 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          <Filter className="w-4 h-4 mr-1" />
          Filtrar
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <MubisLogo size="sm" />
          </div>
          <SheetTitle className="text-xl font-bold font-sans text-foreground">Filtros</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-5 px-1 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Quick Categories */}
          <div className="pb-4 border-b border-border">
            <Label className="text-foreground font-semibold text-sm mb-3 block">Mundos</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs font-medium transition-all min-h-[4rem] justify-center ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 text-foreground hover:bg-muted border border-border'
                    }`}
                  >
                    {Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : <span className="text-base flex-shrink-0">{cat.emoji}</span>}
                    <span className="text-center leading-tight">{cat.label}</span>
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
              <SelectTrigger className="rounded-xl border-border h-11">
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Desde"
                value={localFilters.yearFrom}
                onChange={(e) => setLocalFilters({ ...localFilters, yearFrom: e.target.value })}
                className="rounded-xl border-border h-11"
              />
              <Input
                type="number"
                placeholder="Hasta"
                value={localFilters.yearTo}
                onChange={(e) => setLocalFilters({ ...localFilters, yearTo: e.target.value })}
                className="rounded-xl border-border h-11"
              />
            </div>
          </div>

          <div>
            <Label className="text-foreground font-semibold text-sm mb-2 block">Precio (millones COP)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Mín"
                value={localFilters.priceMin}
                onChange={(e) => setLocalFilters({ ...localFilters, priceMin: e.target.value })}
                className="rounded-xl border-border h-11"
              />
              <Input
                type="number"
                placeholder="Máx"
                value={localFilters.priceMax}
                onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
                className="rounded-xl border-border h-11"
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
              className="rounded-xl border-border h-11"
            />
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t border-border mt-4">
          <Button 
            onClick={handleApply}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold h-12 rounded-full"
          >
            Aplicar filtros
          </Button>
          {hasFilters && (
            <Button 
              variant="ghost"
              onClick={handleReset}
              className="w-full text-muted-foreground font-medium"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
