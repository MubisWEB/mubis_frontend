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
import { loginUser, setCurrentUser, getRedirectForRole } from "@/lib/mockStore";

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
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user = loginUser(email, password);
    if (!user) {
      setLoading(false);
      toast.error("Credenciales incorrectas");
      return;
    }

    setCurrentUser(user);
    setLoading(false);
    toast.success("¡Bienvenido de nuevo!");

    // Check verification for non-admin
    if (user.role !== 'admin' && user.verification_status !== 'VERIFIED') {
      setTimeout(() => navigate('/PendienteVerificacion'), 300);
      return;
    }

    setTimeout(() => {
      navigate(getRedirectForRole(user.role));
    }, 300);
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
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="w-full max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
            <Card className="relative overflow-hidden p-8 bg-background border border-border/60 shadow-premium rounded-2xl">
              <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: "var(--gradient-purple)" }} />
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Bienvenido de nuevo</h1>
                <p className="text-muted-foreground text-sm">Accede a subastas exclusivas de vehículos</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                  <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:border-violet-500/40" disabled={loading} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Contraseña</label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm pr-12 focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:border-violet-500/40" disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full h-11 font-semibold rounded-xl shadow-sm bg-violet-600 text-white hover:bg-violet-700 transition active:translate-y-[1px]">
                  {loading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Iniciando sesión...</>) : "Iniciar sesión"}
                </Button>
              </form>
            </Card>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }} className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="font-semibold text-foreground hover:underline underline-offset-4">Solicita acceso aquí</Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-footer text-footer-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-secondary" /><span>info@mubis.com</span>
        </div>
      </footer>
    </div>
  );
}
