import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { stats } from "@/data/mockData";

const useCountUp = (
  end: number,
  duration: number = 2000,
  start: boolean = false
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
};

const StatItem = ({
  label,
  value,
  suffix,
  isVisible,
}: {
  label: string;
  value: number;
  suffix: string;
  isVisible: boolean;
}) => {
  const count = useCountUp(value, 2000, isVisible);

  return (
    <div className="text-center">
      <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-2">
        {count.toLocaleString("es-CO")}
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="font-medium text-muted-foreground">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Resultados que hablan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Números que respaldan nuestra plataforma líder en subastas B2B
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {isVisible ? (
                <StatItem
                  label={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              ) : (
                <div className="text-center">
                  <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                    0<span className="text-primary">{stat.suffix}</span>
                  </div>
                  <p className="font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
