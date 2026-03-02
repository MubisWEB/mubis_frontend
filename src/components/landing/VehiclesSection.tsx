import { motion } from "framer-motion";
import { vehicles } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gauge, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VehiclesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="vehiculos" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Vehículos recientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una muestra de nuestro inventario verificado. Los precios son exclusivos para dealers.
          </p>
        </motion.div>

        {/* Vehicle Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status Badge */}
                  <Badge
                    className="absolute top-3 right-3"
                    style={
                      vehicle.status === "en_subasta"
                        ? { backgroundColor: '#39FF14', color: '#1a1a2e' }
                        : {}
                    }
                  >
                    {vehicle.status === "en_subasta" ? "En subasta" : "Vendido"}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{vehicle.year}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="w-4 h-4" />
                    <span>{vehicle.km.toLocaleString("es-CO")} km</span>
                  </div>

                  {/* Price Placeholder */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Precio exclusivo para dealers</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="font-semibold text-lg px-8"
            style={{ 
              backgroundColor: '#39FF14',
              color: '#1a1a2e'
            }}
            onClick={() => navigate('/registro')}
          >
            Accede para ver precios y pujar
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default VehiclesSection;
