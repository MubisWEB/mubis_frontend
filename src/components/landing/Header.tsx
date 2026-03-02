import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
    setIsMenuOpen(false);
  };
  return <>
      {/* Promo banner (single message) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-foreground text-background">
        <div className="container mx-auto px-4 py-2 bg-primary"></div>
      </div>

      <header className="fixed top-10 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center lg:pl-12 xl:pl-20">
              <span className="text-2xl font-bold text-foreground">mub</span>
              <span className="relative text-2xl font-bold text-foreground">
                <span className="invisible">i</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-2xl font-bold">
                  ı
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 top-0 w-1.5 h-1.5 rounded-full bg-accent"></span>
              </span>
              <span className="text-2xl font-bold text-foreground">s</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection("como-funciona")} className="text-muted-foreground hover:text-foreground transition-colors">
                Quiero unirme
              </button>
              <button onClick={() => scrollToSection("contacto")} className="text-muted-foreground hover:text-foreground transition-colors">
                Ayuda
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Herramientas
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border border-border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => scrollToSection("contacto")}>
                    Valuación gratuita
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection("como-funciona")}>
                    Cómo funciona
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection("testimonios")}>
                    Testimonios
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xl" title="Colombia">
                🇨🇴
              </span>
              <span className="text-xl" title="Panamá">
                🇵🇦
              </span>

              {/* QUIERO UNIRME (NO VERDE, HOVER NEGRO) */}
              <Button variant="outline" className="
                  font-semibold px-6 rounded-full
                  border-black
                  text-black
                  bg-white
                  hover:bg-black
                  hover:text-white
                  hover:border-black
                  active:bg-black
                  active:text-white
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                " onClick={() => navigate("/registro")}>
                Quiero unirme
              </Button>

              {/* INICIAR SESIÓN (MORADO) */}
              <Button className="bg-primary hover:bg-mubis-purple-dark text-primary-foreground font-semibold px-6 rounded-full" onClick={() => navigate("/login")}>
                Iniciar Sesión
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
              <button onClick={() => scrollToSection("como-funciona")} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Quiero unirme
              </button>
              <button onClick={() => scrollToSection("contacto")} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Ayuda
              </button>
              <button onClick={() => scrollToSection("como-funciona")} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Herramientas
              </button>

              {/* QUIERO UNIRME (NO VERDE, HOVER NEGRO) */}
              <Button variant="outline" className="
                  font-semibold px-6 rounded-full
                  border-black
                  text-black
                  bg-white
                  hover:bg-black
                  hover:text-white
                  hover:border-black
                  active:bg-black
                  active:text-white
                  focus-visible:ring-0
                  focus-visible:ring-offset-0
                " onClick={() => {
            setIsMenuOpen(false);
            navigate("/registro");
          }}>
                Quiero unirme
              </Button>

              {/* INICIAR SESIÓN (MORADO) */}
              <Button className="bg-primary hover:bg-mubis-purple-dark text-primary-foreground font-semibold w-full rounded-full" onClick={() => {
            setIsMenuOpen(false);
            navigate("/login");
          }}>
                Iniciar Sesión
              </Button>
            </nav>}
        </div>
      </header>
    </>;
};
export default Header;