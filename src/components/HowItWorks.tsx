import step1Img from "@/assets/step-1.jpg";
import step2Img from "@/assets/step-2.jpg";
import step3Img from "@/assets/step-3.jpg";

const steps = [
  {
    num: 1,
    title: "Recibe inventario verificado",
    description: "Autos con peritaje certificado por concesionarios líderes, fotos estandarizadas, y documentación validada.",
    image: step1Img,
  },
  {
    num: 2,
    title: "Puja con inteligencia",
    description: "Concesionarios líderes compiten. IA optimiza matching y probabilidad de compra.",
    image: step2Img,
  },
  {
    num: 3,
    title: "Compra y recibe tu carro",
    description: "Cierre rápido, documentos listos, inventario directo.",
    image: step3Img,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-secondary mb-12">
          Así funciona Mubis
        </h2>
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
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
