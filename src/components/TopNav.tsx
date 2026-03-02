import { ChevronDown } from "lucide-react";

const TopNav = () => {
  return (
    <nav className="w-full border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black tracking-tight text-foreground">mubis</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Quiero unirme</a>
            <a href="#" className="hover:text-foreground transition-colors">Ayuda</a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              Herramientas <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-lg">
            <span>🇨🇴</span>
            <span>🇲🇽</span>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center justify-center rounded-full border border-foreground px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Quiero unirme
          </a>
          <a href="#" className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
