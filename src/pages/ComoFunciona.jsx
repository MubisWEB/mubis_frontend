import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import step1Img from "@/assets/step-1.jpg";
import step2Img from "@/assets/step-2.jpg";
import step3Img from "@/assets/step-3.jpg";
import { CheckCircle, Shield, Zap, Clock, Users, TrendingUp, ArrowRight, Car, Gavel, UserCheck, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    num: 1,
    title: "El Dealer publica su vehículo",
    description: "El Dealer sube su inventario a la plataforma. Mubis coordina un peritaje certificado de 100 puntos de inspección con fotos estandarizadas y documentación validada.",
    details: [
      "Peritaje de 100 puntos de inspección",
      "Fotos profesionales estandarizadas",
      "Documentación del vehículo validada",
      "Historial de mantenimiento disponible",
    ],
    image: step1Img,
  },
  {
    num: 2,
    title: "Dealers y Recompradores pujan",
    description: "Compradores verificados compiten en subastas de 1 hora, rápidas, claras y eficientes. Más competencia significa un mejor precio para el vendedor.",
    details: [
      "Subastas de 1 hora: rápidas y eficientes",
      "Dealers y Recompradores compitiendo por el mismo vehículo",
      "Alertas en tiempo real cuando te superan",
      "Proceso claro y transparente",
    ],
    image: step2Img,
  },
  {
    num: 3,
    title: "Se cierra la venta",
    description: "El ganador y el vendedor cierran el trato directamente. Mubis facilita la conexión y el cierre se completa en 96 horas (4 días).",
    details: [
      "Cierre de venta en 96 horas (4 días)",
      "Mubis conecta comprador y vendedor",
      "Opción de Pronto Pago para liquidez inmediata",
      "Soporte dedicado durante todo el proceso",
    ],
    image: step3Img,
  },
];

const roles = [
  {
    icon: Users,
    title: "Dealer",
    subtitle: "Concesionario o comprador profesional",
    description: "Concesionario verificado que puede comprar y vender vehículos en la plataforma. Publica su inventario para subasta y también participa como comprador en subastas de otros Dealers.",
    benefits: [
      "Publica vehículos y recibe ofertas competitivas",
      "Compra inventario verificado de otros Dealers",
      "Acceso completo a compra y venta en la plataforma",
      "Cierre de venta en 96 horas (4 días)",
    ],
  },
  {
    icon: Car,
    title: "Recomprador",
    subtitle: "Comprador verificado",
    description: "Comprador que participa en subastas privadas para adquirir vehículos verificados al mejor precio. Solo puede comprar, no publicar vehículos en la plataforma.",
    benefits: [
      "Acceso a inventario verificado con peritaje de 100 puntos",
      "Subastas de 1 hora: rápidas, claras y eficientes",
      "Toda la información del vehículo en un solo lugar",
      "Cierre de venta en 96 horas (4 días)",
    ],
  },
];

const benefits = [
  { icon: Shield, title: "100% Verificado", description: "Cada vehículo pasa por un peritaje de 100 puntos antes de ser publicado." },
  { icon: Zap, title: "Subastas de 1 hora", description: "Subastas rápidas, claras y eficientes. Sin esperas innecesarias." },
  { icon: Clock, title: "Cierre en 4 días", description: "Desde la subasta hasta el cierre de venta en máximo 96 horas (4 días)." },
  { icon: DollarSign, title: "Sin comisión de compra", description: "Comprar en Mubis no tiene costo. Los compradores no pagan ninguna comisión." },
  { icon: TrendingUp, title: "Todo en un solo lugar", description: "Dealers y Recompradores conectados en una sola plataforma." },
  { icon: UserCheck, title: "Soporte dedicado", description: "Equipo de soporte disponible para acompañarte en cada paso." },
];

export default function ComoFunciona() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              ¿Cómo funciona <span className="text-secondary">Mubis</span>?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Mubis es una plataforma de subastas privadas de vehículos usados. Los <strong className="text-foreground">Dealers</strong> pueden comprar y vender, mientras que los <strong className="text-foreground">Recompradores</strong> participan como compradores para conseguir el mejor precio.
            </p>
          </div>
        </section>

        {/* Roles explanation */}
        <section className="bg-card py-16 md:py-20 border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Los dos roles en Mubis
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
              Nuestra plataforma funciona con dos actores principales que se benefician mutuamente.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.title} className="rounded-2xl border border-border bg-background p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">{role.description}</p>
                    <ul className="space-y-2">
                      {role.benefits.map((b, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Steps detail */}
        <section className="bg-muted py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              El proceso paso a paso
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
              Desde la publicación del vehículo hasta el cierre del trato, todo ocurre dentro de Mubis.
            </p>
            <div className="space-y-20">
              {steps.map((step, i) => (
                <div key={step.num} className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
                  <div className="w-full md:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                      <img src={step.image} alt={step.title} className="w-full aspect-[4/3] object-cover" />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground">
                        {step.num}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-background py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              ¿Por qué elegir Mubis?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-secondary py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-foreground mb-4">¿Listo para empezar?</h2>
            <p className="text-secondary-foreground/80 mb-8">Aplica ahora y sé parte de la plataforma líder en subastas de vehículos usados</p>
            <Link to="/registro" className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground hover:opacity-90 transition-opacity">
              Aplicar Ahora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
