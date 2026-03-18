import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import MubisLogo from "@/components/MubisLogo";
import { authApi } from "@/api/services";

export default function RecuperarContrasena() {
  const [tenants, setTenants] = useState([]);
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    authApi.getTenants().then((list) => {
      setTenants(list);
      if (list.length === 1) setTenantSlug(list[0].slug);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenantSlug || !email) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email, tenantSlug);
      setSent(true);
    } catch {
      toast.error("No pudimos procesar tu solicitud. Verifica el correo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/30">
      <TopBar />
      <nav className="w-full bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="sm" linkTo="/" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-7">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="w-full max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
            <Card className="relative overflow-hidden p-8 bg-background border border-border/60 shadow-premium rounded-2xl">
              <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: "var(--gradient-purple)" }} />

              {sent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">Revisa tu correo</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Si existe una cuenta con <span className="font-medium text-foreground">{email}</span>, recibirás un enlace para restablecer tu contraseña.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline underline-offset-4 mt-4"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">¿Olvidaste tu contraseña?</h1>
                    <p className="text-muted-foreground text-sm">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {tenants.length > 1 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Empresa</label>
                        <select value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} disabled={loading}
                          className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40">
                          <option value="">Selecciona tu empresa</option>
                          {tenants.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:border-violet-500/40"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 font-semibold rounded-xl shadow-sm bg-violet-600 text-white hover:bg-violet-700 transition active:translate-y-[1px]"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" />Enviando...</>
                      ) : (
                        "Enviar enlace de recuperación"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </div>

          {!sent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }} className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
              </Link>
            </motion.div>
          )}
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
