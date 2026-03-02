import step1Image from "@/assets/step1-inventory.jpg";
import step2Image from "@/assets/step2-bidding.jpg";
import step3Image from "@/assets/step3-deal.jpg";
const steps = [{
  number: 1,
  title: "Recibe inventario verificado",
  image: step1Image,
  description: "Autos con peritaje certificado por concesionarios líderes, fotos estandarizadas, y documentación validada."
}, {
  number: 2,
  title: "Puja con inteligencia",
  image: step2Image,
  description: "Concesionarios líderes compiten. IA optimiza matching y probabilidad de compra."
}, {
  number: 3,
  title: "Compra y recibe tu carro",
  image: step3Image,
  description: "Cierre rápido, documentos listos, inventario directo."
}];
const HowItWorks = () => {
  return <section id="cómo-funciona" className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
          Así funciona Mubis para dealers
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(step => <div key={step.number} className="flex flex-col">
              {/* Image with rounded corners */}
              <div className="relative rounded-2xl overflow-hidden mb-4 group cursor-pointer">
                <div className="aspect-[4/3]">
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                {/* Subtle purple overlay on hover */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Step number and title */}
              <div className="flex items-start gap-3 mb-2">
                <span className="flex-shrink-0 w-7 h-7 rounded-full font-bold text-sm flex items-center justify-center bg-primary text-primary-foreground">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold text-foreground leading-tight">{step.title}</h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm pl-10">{step.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;