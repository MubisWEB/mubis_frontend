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
import { Filter, X } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';

const brands = ['Toyota', 'Chevrolet', 'Mazda', 'Renault', 'Kia', 'Hyundai', 'Volkswagen', 'Ford', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];

export default function FilterSheet({ filters, setFilters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    setFilters(localFilters);
    onApply?.(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const empty = { brand: '', yearFrom: '', yearTo: '', priceMin: '', priceMax: '', mileageMax: '' };
    setLocalFilters(empty);
    setFilters(empty);
  };

  const hasFilters = Object.values(filters).some(v => v);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className={`rounded-full font-medium h-10 px-4 text-sm border-0 ${
            hasFilters ? 'bg-secondary text-secondary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
          }`}
        >
          <Filter className="w-4 h-4 mr-1" />
          Filtrar
          {hasFilters && (
            <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
              {Object.values(filters).filter(v => v).length}
            </span>
          )}
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
