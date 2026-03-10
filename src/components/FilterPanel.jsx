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
import { Filter, X } from 'lucide-react';

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

export default function FilterPanel({ filters, setFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleReset = () => {
    const empty = { brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '' };
    setLocalFilters(empty);
    setFilters(empty);
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sticky top-4">
      <div className="flex items-center gap-2 mb-5">
        <Filter className="w-4 h-4 text-secondary" />
        <h3 className="text-base font-bold text-foreground">Filtros</h3>
        {hasFilters && (
          <span className="ml-auto w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
            {Object.values(filters).filter(v => v).length}
          </span>
        )}
      </div>

      <div className="space-y-5">
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
