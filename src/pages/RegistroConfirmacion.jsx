import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import MubisLogo from "@/components/MubisLogo";

export default function RegistroConfirmacion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/30">
      <TopBar />

      <nav className="w-full bg-background/80 backdrop-blur border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16">
          <MubisLogo size="md" linkTo="/" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            {/* glow sutil */}
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />

            <Card className="relative overflow-hidden p-8 bg-background border border-border/60 shadow-premium rounded-2xl text-center">
              {/* accent line con tu gradiente oficial */}
              <div
                className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                style={{ background: "var(--gradient-purple)" }}
              />

              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 180, damping: 14 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/25"
              >
                <CheckCircle className="h-9 w-9 text-violet-600" />
              </motion.div>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
                Solicitud enviada
              </h1>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Recibimos tu información. Nuestro equipo la revisará y te enviaremos un correo con el
                estado de tu acceso.
              </p>

              <div className="mt-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-left">
                <p className="text-xs text-muted-foreground">
                  ⏱️ Tiempo estimado: <span className="text-foreground/80 font-medium">24–48 horas hábiles</span>
                  <br />
                  📩 Revisa tu bandeja de entrada (y spam) para los próximos pasos.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full h-11 font-semibold rounded-xl shadow-sm bg-violet-600 text-white hover:bg-violet-700 transition active:translate-y-[1px]"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Volver al inicio
                </Button>

                <Link
                  to="/login"
                  className="block text-sm font-medium text-foreground hover:underline underline-offset-4"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </Card>
          </div>
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