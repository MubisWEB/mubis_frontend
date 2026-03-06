import step1Img from "@/assets/step-1.jpg";
import step2Img from "@/assets/step-2.jpg";
import step3Img from "@/assets/step-3.jpg";
import { Users, Car, Gavel, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: Car,
    title: "Recomprador",
    description:
      "Persona que quiere vender su carro usado de forma rápida y al mejor precio. Publica su vehículo y recibe ofertas de múltiples dealers verificados.",
  },
  {
    icon: Users,
    title: "Dealer",
    description:
      "Concesionario o comprador profesional verificado que participa en subastas privadas para adquirir inventario de calidad a precios competitivos.",
  },
];

const steps = [
  {
    num: 1,
    title: "El Recomprador publica su carro",
    description:
      "El dueño del vehículo sube la información de su carro. Mubis realiza un peritaje certificado con fotos estandarizadas y documentación validada.",
    image: step1Img,
  },
  {
    num: 2,
    title: "Los Dealers pujan en subasta privada",
    description:
      "Concesionarios verificados compiten en tiempo real para ofrecer el mejor precio por el vehículo. Más competencia = mejor precio para el vendedor.",
    image: step2Img,
  },
  {
    num: 3,
    title: "Se cierra el trato",
    description:
      "El Dealer ganador completa la compra. Documentos listos, transferencia facilitada y pago seguro para ambas partes.",
    image: step3Img,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-secondary mb-4">
          Así funciona Mubis
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Los <span className="font-semibold text-foreground">Dealers</span> pueden comprar y vender vehículos. Los <span className="font-semibold text-foreground">Recompradores</span> participan en subastas para comprar al mejor precio.
        </p>

        {/* Roles */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{role.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col">
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-5 flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-foreground text-base">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/como-funciona"
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
          >
            Ver más detalles <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
