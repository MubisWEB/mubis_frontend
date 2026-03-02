import { Star, Quote } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const testimonials = [{
  name: "Carlos Mendoza",
  location: "Ciudad de México",
  rating: 5,
  text: "Vendí mi Honda Civic en solo 3 días. El proceso fue increíblemente simple y recibí un precio justo. ¡100% recomendado!",
  image: null
}, {
  name: "María García",
  location: "Guadalajara",
  rating: 5,
  text: "Estaba nerviosa de vender mi carro online, pero Mubis me dio total confianza. Los concesionarios son profesionales y el pago fue inmediato.",
  image: null
}, {
  name: "Roberto Sánchez",
  location: "Monterrey",
  rating: 5,
  text: "Comparé ofertas de 5 concesionarios diferentes y elegí la mejor. Ahorrε tiempo y dinero. Mubis es el futuro de la venta de autos.",
  image: null
}, {
  name: "Ana López",
  location: "Puebla",
  rating: 4,
  text: "Excelente experiencia. El equipo de soporte me ayudó en cada paso. Mi SUV fue vendido en menos de una semana.",
  image: null
}];
const Testimonials = () => {
  return <section id="testimonios" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Miles de personas ya vendieron su carro con Mubis. Aquí están sus experiencias.
          </p>
        </div>

        <Carousel opts={{
        align: "start",
        loop: true
      }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2 pl-4">
                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg h-full border border-border">
                  <Quote className="w-8 h-8 text-primary/30 mb-4 border-destructive" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? "fill-accent text-accent" : "text-muted"}`} />)}
                  </div>

                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>)}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>;
};
export default Testimonials;