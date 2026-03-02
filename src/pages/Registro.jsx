import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import MubisLogo from "@/components/MubisLogo";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);

    // Redirect to confirmation page
    navigate("/registro-confirmacion");
  };

  return (
    <div className="min-h-screen bg-gradient-brand flex flex-col">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Header con logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-6 text-center px-6"
      >
        <MubisLogo size="xl" variant="light" />
      </motion.div>

      {/* Contenido principal */}
      <div className="flex-1 flex items-start justify-center px-6 pt-2 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-xl"
        >
          <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-premium-lg rounded-2xl">
            {/* Títulos */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl font-bold text-brand-dark mb-2">
                Solicita tu acceso
              </h1>
              <p className="text-brand-slate text-sm">
                Únete a la plataforma líder de subastas de vehículos
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grid 2 columnas en desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    Nombre del negocio
                  </label>
                  <Input
                    type="text"
                    placeholder="AutoMax Colombia"
                    value={formData.negocio}
                    onChange={(e) => handleChange("negocio", e.target.value)}
                    className="h-12 rounded-xl border-brand-slate/20 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    NIT
                  </label>
                  <Input
                    type="text"
                    placeholder="900.123.456-7"
                    value={formData.nit}
                    onChange={(e) => handleChange("nit", e.target.value)}
                    className="h-12 rounded-xl border-brand-slate/20 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    Nombre de contacto
                  </label>
                  <Input
                    type="text"
                    placeholder="Carlos Mendoza"
                    value={formData.contacto}
                    onChange={(e) => handleChange("contacto", e.target.value)}
                    className="h-12 rounded-xl border-brand-slate/20 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    Correo electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="carlos@automax.co"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-12 rounded-xl border-brand-slate/20 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    className="h-12 rounded-xl border-brand-slate/20 focus:border-primary focus:ring-primary"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-dark">
                    Ciudad
                  </label>
                  <select
                    value={formData.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-brand-slate/20 bg-white px-3 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-primary"
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

              {/* Checkbox */}
              <label className="flex items-start gap-3 pt-2 text-sm text-brand-slate">
                <input
                  type="checkbox"
                  checked={formData.acepta}
                  onChange={(e) => handleChange("acepta", e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 rounded border-brand-slate/30"
                />
                <span>
                  Acepto los{" "}
                  <span className="text-primary font-semibold">
                    términos y condiciones
                  </span>{" "}
                  y la{" "}
                  <span className="text-primary font-semibold">
                    política de privacidad
                  </span>{" "}
                  de Mubis™
                </span>
              </label>

              {/* Botón */}
              <Button
                type="submit"
                disabled={loading || !formData.acepta}
                className="
                  w-full h-12 font-semibold rounded-xl shadow-lg neon-glow-subtle
                  bg-[#39FF14] text-[#1a1a2e]
                  hover:bg-[#39FF14] hover:text-[#1a1a2e]
                  active:bg-[#39FF14] active:text-[#1a1a2e]
                  focus:bg-[#39FF14] focus:text-[#1a1a2e]
                "
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

            {/* Link a login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-brand-slate">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
