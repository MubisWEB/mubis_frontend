import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { ArrowRight, Car, DollarSign, Shield, BarChart3, Clock, Users } from "lucide-react";

const features = [
  { icon: Car, title: "Inventario premium", description: "Accede a vehículos con peritaje certificado de concesionarios líderes en Colombia." },
  { icon: DollarSign, title: "Precios competitivos", description: "El modelo de subasta garantiza precios justos de mercado para compradores y vendedores." },
  { icon: Shield, title: "Transacciones seguras", description: "Cada operación está respaldada por documentación verificada y soporte legal." },
  { icon: BarChart3, title: "Analíticas en tiempo real", description: "Monitorea tus subastas, pujas y rendimiento desde un dashboard centralizado." },
  { icon: Clock, title: "Cierre en 4 días", description: "Proceso optimizado para que recibas tu inventario lo más rápido posible." },
  { icon: Users, title: "Red exclusiva", description: "Forma parte de una red privada de dealers verificados en todo el país." },
];

const steps = [
  { num: "01", title: "Solicita acceso", description: "Completa el formulario de registro con los datos de tu concesionario." },
  { num: "02", title: "Verificación", description: "Nuestro equipo valida tu documentación y aprueba tu cuenta en 24-48 horas." },
  { num: "03", title: "Empieza a operar", description: "Accede a subastas activas, puja por inventario y haz crecer tu negocio." },
];

export default function ParaDealers() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[480px] md:min-h-[560px] flex items-center justify-center overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/hero-dealer.mp4"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Haz crecer tu <span className="text-secondary">concesionario</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Mubis te conecta con el mejor inventario verificado de Colombia a través de subastas privadas entre dealers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <a href="/registro" className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity">
                Aplicar ahora <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/como-funciona" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                ¿Cómo funciona?
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Todo lo que necesitas para operar
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to join */}
        <section className="bg-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              ¿Cómo unirte?
            </h2>
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <span className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-xl font-black text-secondary-foreground flex-shrink-0">
                    {s.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="text-muted-foreground mt-1">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-secondary py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-foreground mb-4">¿Listo para empezar?</h2>
            <p className="text-secondary-foreground/80 mb-8">Aplica hoy y empieza a recibir inventario verificado</p>
            <a href="/registro" className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground hover:opacity-90 transition-opacity">
              Registrar mi concesionario <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
