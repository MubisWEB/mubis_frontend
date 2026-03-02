import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import MubisLogo from "@/components/MubisLogo";

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [formData, setFormData] = useState({
    negocio: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    ciudad: "",
    password: "",
    password2: "",
    acepta: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Campos obligatorios
    if (
      !formData.negocio ||
      !formData.nit ||
      !formData.contacto ||
      !formData.email ||
      !formData.telefono ||
      !formData.ciudad ||
      !formData.password ||
      !formData.password2
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    // 2) Contraseñas
    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (formData.password !== formData.password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // 3) Términos
    if (!formData.acepta) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);

    toast.success("Solicitud enviada. Te contactaremos pronto.");
    navigate("/registro-confirmacion");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/30">
      <TopBar />

      <nav className="w-full bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="lg" linkTo="/" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-7">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-xl"
        >
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />

            <Card className="relative overflow-hidden p-8 bg-background border border-border/60 shadow-premium rounded-2xl">
              {/* Accent line usando tu gradiente del root */}
              <div
                className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                style={{ background: "var(--gradient-purple)" }}
              />

              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
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
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm
                                 focus-visible:ring-2 focus-visible:ring-violet-500/25
                                 focus-visible:border-violet-500/40"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      NIT
                    </label>
                    <Input
                      type="text"
                      placeholder="900.123.456-7"
                      value={formData.nit}
                      onChange={(e) => handleChange("nit", e.target.value)}
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm
                                 focus-visible:ring-2 focus-visible:ring-violet-500/25
                                 focus-visible:border-violet-500/40"
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
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm
                                 focus-visible:ring-2 focus-visible:ring-violet-500/25
                                 focus-visible:border-violet-500/40"
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
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm
                                 focus-visible:ring-2 focus-visible:ring-violet-500/25
                                 focus-visible:border-violet-500/40"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={formData.telefono}
                      onChange={(e) => handleChange("telefono", e.target.value)}
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm
                                 focus-visible:ring-2 focus-visible:ring-violet-500/25
                                 focus-visible:border-violet-500/40"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Ciudad
                    </label>
                    <select
                      value={formData.ciudad}
                      onChange={(e) => handleChange("ciudad", e.target.value)}
                      disabled={loading}
                      className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground
                                 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40"
                    >
                      <option value="">Selecciona una ciudad</option>
                      <option value="Bogotá">Bogotá</option>
                      <option value="Medellín">Medellín</option>
                      <option value="Cali">Cali</option>
                      <option value="Barranquilla">Barranquilla</option>
                      <option value="Cartagena">Cartagena</option>
                    </select>
                  </div>

                  {/* NUEVO: contraseña */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm pr-12
                                   focus-visible:ring-2 focus-visible:ring-violet-500/25
                                   focus-visible:border-violet-500/40"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NUEVO: repetir contraseña */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Repetir contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword2 ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={formData.password2}
                        onChange={(e) => handleChange("password2", e.target.value)}
                        className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm pr-12
                                   focus-visible:ring-2 focus-visible:ring-violet-500/25
                                   focus-visible:border-violet-500/40"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1"
                        aria-label={showPassword2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword2 ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
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
                    <span className="text-violet-600 font-semibold">
                      términos y condiciones
                    </span>{" "}
                    y la{" "}
                    <span className="text-violet-600 font-semibold">
                      política de privacidad
                    </span>{" "}
                    de Mubis™
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={loading || !formData.acepta}
                  className="w-full h-11 font-semibold rounded-xl shadow-sm
                             bg-violet-600 text-white hover:bg-violet-700
                             transition active:translate-y-[1px]"
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

                <div className="mt-1 text-center text-xs text-muted-foreground">
                  Solo concesionarios verificados. Te contactaremos para validar tu información.
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-foreground hover:underline underline-offset-4"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Footer igual al login */}
      <footer className="bg-footer text-footer-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-secondary" />
          <span>contacto@mubis.com</span>
        </div>
      </footer>
    </div>
  );
}