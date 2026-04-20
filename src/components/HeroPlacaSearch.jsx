import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function HeroPlacaSearch() {
  const navigate = useNavigate();
  const [placa, setPlaca] = useState('');
  const [cedula, setCedula] = useState('');
  const [open, setOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!placa.trim() || !cedula.trim()) return;
    setOpen(true);
  };

  return (
    <>
      <section className="bg-secondary py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">

          <h2 className="text-4xl sm:text-5xl md:text-[3.75rem] font-black text-white leading-[1.05] tracking-tight">
            ¿Cuánto vale tu carro hoy?
          </h2>
          <p className="mt-4 text-white/65 text-lg max-w-lg mx-auto">
            Ingresa la placa y tu cédula para conocer el precio de mercado en Colombia.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <Input
              placeholder="Placa  ·  ABC123"
              value={placa}
              onChange={(e) =>
                setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
              }
              className="h-14 rounded-2xl bg-white border-0 text-foreground placeholder:text-foreground/35 font-bold text-lg tracking-widest font-mono uppercase shadow-none focus-visible:ring-2 focus-visible:ring-white/80"
              maxLength={6}
            />
            <Input
              placeholder="Cédula  ·  1234567890"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
              className="h-14 rounded-2xl bg-white border-0 text-foreground placeholder:text-foreground/35 font-bold text-lg shadow-none focus-visible:ring-2 focus-visible:ring-white/80"
              inputMode="numeric"
              maxLength={12}
            />
            <Button
              type="submit"
              disabled={!placa.trim() || !cedula.trim()}
              className="h-14 px-7 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold text-base gap-2 shrink-0 disabled:opacity-30"
            >
              Ver precio <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-5 text-white/40 text-xs">
            Solo para dealers y compradores verificados de Mubis.
          </p>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl border border-border p-0 overflow-hidden">
          <div className="p-7">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/10 mb-5">
              <Lock className="w-5 h-5 text-secondary" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground leading-snug">
              Inicia sesión para ver el precio de{' '}
              <span className="text-secondary font-mono">{placa}</span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              El precio de mercado está disponible para miembros de Mubis.
            </DialogDescription>

            <div className="mt-6 space-y-2.5">
              <Button
                onClick={() => navigate('/login', { state: { placa, cedula } })}
                className="w-full h-11 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold"
              >
                Iniciar sesión
              </Button>
              <Button
                onClick={() => navigate('/registro', { state: { placa, cedula } })}
                variant="outline"
                className="w-full h-11 rounded-xl font-semibold"
              >
                Crear cuenta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
