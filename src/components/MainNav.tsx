import { MapPin, ChevronDown, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MubisLogo from "@/components/MubisLogo";
import { useAuth, getRedirectForRole } from "@/lib/AuthContext";

const links = [
  { label: "Inicio", path: "/" },
  { label: "Cómo funciona", path: "/como-funciona" },
  { label: "Para Dealers", path: "/para-dealers" },
  { label: "Contacto", path: "/contacto" },
];

const MainNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const roleLabel: Record<string, string> = {
    perito: 'Peritajes',
    dealer: 'Mis subastas',
    recomprador: 'Comprar',
    admin: 'Dashboard',
  };

  const authenticatedLabel = user?.role ? (roleLabel[user.role] || 'Ingresar') : 'Ingresar';
  const authenticatedPath = user?.role ? getRedirectForRole(user.role) : '/login';

  return (
    <nav className="w-full bg-background sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/")}><MubisLogo size="sm" /></button>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <MapPin className="w-4 h-4" />
            Bogotá
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate(authenticatedPath)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                {authenticatedLabel}
              </button>
              <button onClick={() => navigate('/Cuenta')} className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border text-foreground hover:bg-muted transition-colors">
                <User className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
              Ingresar
            </button>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {links.map((link) => (
            <button key={link.path} onClick={() => handleNav(link.path)} className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4" /> Bogotá
            </button>
            <button onClick={() => handleNav("/login")} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              Ingresar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNav;
