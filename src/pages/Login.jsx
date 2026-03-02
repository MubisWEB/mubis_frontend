import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import { Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem("mubis_authenticated", "true");
    localStorage.setItem("mubis_user_role", "dealer");

    setLoading(false);
    toast.success("¡Bienvenido de nuevo!");

    setTimeout(() => {
      navigate("/Comprar");
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <span className="text-2xl font-black tracking-tight text-foreground">mubis</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-card border border-border shadow-sm rounded-2xl">
            {/* Títulos */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                Bienvenido de nuevo
              </h1>
              <p className="text-muted-foreground text-sm">
                Accede a subastas exclusivas de vehículos
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-border focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-secondary hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold rounded-full shadow-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </Card>

          {/* Opción de registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="text-center mt-6"
          >
            <p className="text-muted-foreground text-sm">
              ¿No tienes cuenta?{" "}
              <Link
                to="/registro"
                className="font-semibold text-secondary hover:underline"
              >
                Solicita acceso aquí
              </Link>
            </p>
          </motion.div>
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
