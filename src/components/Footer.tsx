import { Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-black text-footer-heading">mubis</span>
            </div>
            <p className="text-sm leading-relaxed">
              La forma más rápida y segura de vender tu carro a concesionarios verificados.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-sm font-semibold text-footer-heading mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Cómo funciona", path: "/como-funciona" },
                { label: "Para Dealers", path: "/para-dealers" },
                { label: "Contacto", path: "/contacto" },
              ].map((l) => (
                <li key={l.path}>
                  <button onClick={() => navigate(l.path)} className="hover:text-footer-heading transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-footer-heading mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Términos y condiciones", path: "/terminos-y-condiciones" },
                { label: "Política de privacidad", path: "/politica-de-privacidad" },
                { label: "Aviso legal", path: "/aviso-legal" },
                { label: "Preguntas frecuentes", path: "/preguntas-frecuentes" },
              ].map((l) => (
                <li key={l.path}>
                  <button onClick={() => navigate(l.path)} className="hover:text-footer-heading transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-footer-heading mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-secondary" /> info@mubis.co</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-secondary" /> +57 601 234 5678</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary" /> Bogotá, Colombia</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-footer-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-footer-foreground">
          <span>© 2026 Mubis. Todos los derechos reservados.</span>
          <span>Hecho con 💜 en Colombia 🇨🇴</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
