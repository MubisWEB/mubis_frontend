import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  M
                </span>
              </div>
              <span className="text-xl font-bold">mubis</span>
            </div>

            <p className="text-background/70 mb-6">
              La forma más rápida y segura de vender tu carro a concesionarios
              verificados.
            </p>

            {/* Social */}
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    bg-background/10
                    text-background
                    hover:bg-primary
                    hover:text-primary-foreground
                    transition-colors
                  "
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces rápidos</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("como-funciona")}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Cómo funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("testimonios")}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Testimonios
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contacto")}
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Valuación gratis
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-primary transition-colors"
                >
                  Para concesionarios
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                "Términos y condiciones",
                "Política de privacidad",
                "Aviso legal",
                "Preguntas frecuentes",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5 text-primary" />
                <span>contacto@mubis.com</span>
              </li>
              <li className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5 text-primary" />
                <span>+52 55 1234 5678</span>
              </li>
              <li className="flex items-start gap-3 text-background/70">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <span>Ciudad de México, México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {currentYear} Mubis. Todos los derechos reservados.
            </p>
            <p className="text-background/60 text-sm">
              Hecho con 💜 en México
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
