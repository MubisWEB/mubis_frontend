import { motion } from "framer-motion";
import { pressLogos, testimonial } from "@/data/mockData";
import { Quote } from "lucide-react";

const PressSection = () => {
  return (
    <section id="prensa" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Press Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            Como se ha visto en
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {pressLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="w-24 h-12 bg-muted rounded-lg flex items-center justify-center"
              >
                <span className="font-bold text-muted-foreground text-lg">
                  {logo.placeholder}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card rounded-2xl p-8 lg:p-12 shadow-xl border border-border relative">
            <Quote className="absolute top-6 left-6 w-12 h-12" style={{ color: 'rgba(57, 255, 20, 0.2)' }} />
            
            <blockquote className="relative z-10">
              <p className="font-serif text-xl lg:text-2xl text-foreground leading-relaxed mb-8 italic">
                "{testimonial.quote}"
              </p>
              
              <footer className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </footer>
            </blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PressSection;
