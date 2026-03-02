import { MapPin, ChevronDown, Check, Menu, X } from "lucide-react";
import { useState } from "react";

const MainNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = ["Inicio", "Cómo funciona", "Para Dealers", "Contacto"];

  return (
    <nav className="w-full bg-background sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-black tracking-tight text-foreground">mubis</span>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <MapPin className="w-4 h-4" />
            Bogotá
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <a href="#" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            <Check className="w-4 h-4" />
            Aplicar como Dealer
          </a>
        </div>
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {links.map((link) => (
            <a key={link} href="#" className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              {link}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4" /> Bogotá
            </button>
            <a href="#" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              <Check className="w-4 h-4" /> Aplicar como Dealer
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNav;
