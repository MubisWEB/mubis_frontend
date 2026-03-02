import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccessRequestSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="solicitar-acceso"
      className="py-20 lg:py-32 bg-white relative overflow-hidden"
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6">
            ¿Listo para acceder a inventario exclusivo?
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a nuestra red de dealers verificados y comienza a participar en
            subastas de vehículos premium hoy mismo.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "Sin costo de registro",
              "Acceso inmediato",
              "Soporte 24/7",
              "Garantía de mejor precio",
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-800 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
            size="lg"
            className="font-semibold text-lg px-10 py-6 rounded-full
                      bg-primary text-primary-foreground
                      hover:bg-mubis-purple-dark"
            onClick={() => navigate("/registro")}
          >
            Solicitar acceso ahora
          </Button>

            <Button
              size="lg"
              variant="outline"
              className="font-semibold text-lg px-10 py-6 rounded-full border-black text-black hover:bg-black hover:text-white"
              onClick={() => navigate("/login")}
            >
              Ya tengo cuenta
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AccessRequestSection;
