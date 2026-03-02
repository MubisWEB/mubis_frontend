import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    negocio: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    ciudad: "",
    acepta: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.negocio ||
      !formData.nit ||
      !formData.contacto ||
      !formData.email ||
      !formData.telefono ||
      !formData.ciudad
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!formData.acepta) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    navigate("/registro-confirmacion");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <span className="text-2xl font-black tracking-tight text-foreground">mubis</span>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-xl"
        >
          <Card className="p-8 bg-card border border-border shadow-sm rounded-2xl">
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                Solicita tu acceso
              </h1>
              <p className="text-muted-foreground text-sm">
                Únete a la plataforma líder de subastas de vehículos
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nombre del negocio
                  </label>
                  <Input
                    type="text"
                    placeholder="AutoMax Colombia"
                    value={formData.negocio}
                    onChange={(e) => handleChange("negocio", e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">NIT</label>
                  <Input
                    type="text"
                    placeholder="900.123.456-7"
                    value={formData.nit}
                    onChange={(e) => handleChange("nit", e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nombre de contacto
                  </label>
                  <Input
                    type="text"
                    placeholder="Carlos Mendoza"
                    value={formData.contacto}
                    onChange={(e) => handleChange("contacto", e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="carlos@automax.co"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Teléfono</label>
                  <Input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ciudad</label>
                  <select
                    value={formData.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Selecciona una ciudad</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-3 pt-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={formData.acepta}
                  onChange={(e) => handleChange("acepta", e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>
                  Acepto los{" "}
                  <span className="text-secondary font-semibold">
                    términos y condiciones
                  </span>{" "}
                  y la{" "}
                  <span className="text-secondary font-semibold">
                    política de privacidad
                  </span>{" "}
                  de Mubis™
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading || !formData.acepta}
                className="w-full h-12 font-semibold rounded-full shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando solicitud...
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-secondary font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </main>

      <footer className="bg-footer text-footer-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-secondary" />
          <span>contacto@mubis.com</span>
        </div>
      </footer>
    </div>
  );
}
