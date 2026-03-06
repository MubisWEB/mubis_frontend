import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import step1Img from "@/assets/step-1.jpg";
import step2Img from "@/assets/step-2.jpg";
import step3Img from "@/assets/step-3.jpg";
import { CheckCircle, Shield, Zap, Clock, Users, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Recibe inventario verificado",
    description: "Cada vehículo pasa por un peritaje certificado realizado por expertos independientes. Incluye fotos estandarizadas, historial de mantenimiento y documentación legal validada.",
    details: [
      "Peritaje de 150+ puntos de inspección",
      "Fotos profesionales estandarizadas",
      "Documentación legal verificada (SOAT, Tecnomecánica, multas)",
      "Historial de mantenimiento disponible",
    ],
    image: step1Img,
  },
  {
    num: 2,
    title: "Puja con inteligencia",
    description: "Participa en subastas privadas donde concesionarios verificados compiten por el mejor inventario. Nuestra plataforma te da las herramientas para tomar decisiones informadas.",
    details: [
      "Subastas con tiempo limitado para decisiones rápidas",
      "Historial de pujas en tiempo real",
      "Alertas cuando te superan",
      "Precio de reserva transparente",
    ],
    image: step2Img,
  },
  {
    num: 3,
    title: "Compra y recibe tu carro",
    description: "Una vez ganada la subasta, el proceso de cierre es rápido y seguro. Documentos listos, transferencia facilitada e inventario directo a tu concesionario.",
    details: [
      "Cierre en menos de 48 horas",
      "Documentos de transferencia preparados",
      "Opción de Pronto Pago para liquidez inmediata",
      "Soporte dedicado durante todo el proceso",
    ],
    image: step3Img,
  },
];

const benefits = [
  { icon: Shield, title: "100% Verificado", description: "Cada vehículo pasa por un peritaje exhaustivo antes de ser publicado." },
  { icon: Zap, title: "Cierre rápido", description: "Proceso optimizado para cerrar operaciones en menos de 48 horas." },
  { icon: Clock, title: "Ahorro de tiempo", description: "Sin visitas innecesarias. Toda la información que necesitas está en la plataforma." },
  { icon: Users, title: "Red exclusiva", description: "Acceso a una red privada de concesionarios y dealers verificados." },
  { icon: TrendingUp, title: "Mejores precios", description: "La competencia entre dealers garantiza precios justos de mercado." },
  { icon: CheckCircle, title: "Soporte dedicado", description: "Equipo de soporte disponible para acompañarte en cada paso." },
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
              Conectamos concesionarios con inventario verificado a través de subastas privadas. Rápido, seguro y transparente.
            </p>
          </div>
        </section>

        {/* Steps detail */}
        <section className="bg-muted py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
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
            <p className="text-secondary-foreground/80 mb-8">Únete a la red de dealers más grande de Colombia</p>
            <a href="/registro" className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-3 text-sm font-semibold text-foreground hover:opacity-90 transition-opacity">
              Aplicar como Dealer <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
