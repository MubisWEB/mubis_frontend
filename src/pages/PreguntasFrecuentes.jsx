import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Qué es Mubis?",
    a: "Mubis es una plataforma tecnológica que conecta concesionarios (Dealers) y compradores profesionales (Recompradores) para la compraventa de vehículos mediante subastas privadas, rápidas y transparentes."
  },
  {
    q: "¿Cuáles son los roles en Mubis?",
    a: "Existen dos roles principales: el Dealer, que es un concesionario verificado que puede publicar vehículos y también comprar; y el Recomprador, un comprador profesional que solo participa en las subastas como comprador."
  },
  {
    q: "¿Cuánto dura una subasta?",
    a: "Cada subasta tiene una duración de 1 hora. Son diseñadas para ser rápidas, claras y eficientes."
  },
  {
    q: "¿Qué es el peritaje de 100 puntos?",
    a: "Es una inspección profesional exhaustiva que evalúa el estado del vehículo en 100 criterios diferentes, brindando total transparencia sobre las condiciones del vehículo antes de la subasta."
  },
  {
    q: "¿Hay comisión de compra?",
    a: "No. Comprar en Mubis no tiene costo para los compradores. No se cobra ninguna comisión de compra."
  },
  {
    q: "¿Cuánto tiempo toma cerrar una venta?",
    a: "Una vez finalizada la subasta, el comprador ganador y el vendedor cierran el trato directamente en un plazo máximo de 96 horas (4 días). Si necesitas más tiempo, puedes solicitar una extensión de 4 u 8 días adicionales."
  },
  {
    q: "¿Mubis gestiona las transferencias de vehículos?",
    a: "No. Mubis actúa exclusivamente como facilitador de la red, conectando a compradores y vendedores. Las transferencias y trámites se realizan directamente entre las partes."
  },
  {
    q: "¿Cómo me registro en Mubis?",
    a: "Puedes registrarte desde la plataforma completando el formulario de registro. Tu cuenta será verificada antes de que puedas participar en subastas."
  },
  {
    q: "¿Es seguro usar Mubis?",
    a: "Sí. Todos los usuarios son verificados antes de participar y cada vehículo pasa por un peritaje de 100 puntos. Además, cumplimos con la Ley 1581 de 2012 sobre protección de datos personales."
  },
  {
    q: "¿Cómo puedo contactar a Mubis?",
    a: "Puedes escribirnos a info@mubis.co o llamarnos al +57 601 234 5678."
  },
];

export default function PreguntasFrecuentes() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopBar />
      <MainNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">Preguntas Frecuentes</h1>
        <p className="text-muted-foreground mb-10">Encuentra respuestas a las dudas más comunes sobre Mubis.</p>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
