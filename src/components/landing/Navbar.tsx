import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#como-funciona", label: "Cómo funciona" },
    { href: "#beneficios", label: "Para dealers" },
    { href: "#vehiculos", label: "Vehículos" },
    { href: "#prensa", label: "Prensa" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1 group">
            <span className="font-serif text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-none">
              mub
              <span className="relative inline-block leading-none">
                i
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-[0.08em] w-[0.22em] h-[0.22em] rounded-full"
                  style={{ backgroundColor: "#39FF14" }}
                />
              </span>
              s
            </span>
            <span className="text-muted-foreground text-sm font-sans">™</span>
          </a>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className="font-medium"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
            <Button
              className="font-semibold"
              style={{ 
                backgroundColor: '#39FF14',
                color: '#1a1a2e'
              }}
              onClick={() => navigate('/registro')}
            >
              Solicitar acceso
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-card/98 backdrop-blur-md border-b border-border transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-left py-2"
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full font-medium"
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              className="w-full font-semibold"
              style={{ 
                backgroundColor: '#39FF14',
                color: '#1a1a2e'
              }}
              onClick={() => {
                navigate('/registro');
                setIsMobileMenuOpen(false);
              }}
            >
              Solicitar acceso
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
