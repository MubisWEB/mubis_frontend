const allies = [
  {
    name: "Renting Colombia",
    description: "Vehículos de diferentes marcas y modelos de flota corporativa.",
  },
  {
    name: "Sura",
    description: "Vehículos de salvamento y siniestros de diversas marcas.",
  },
  {
    name: "GM Financial",
    description: "Autos y camionetas de diferentes marcas recuperados de cartera.",
  },
  {
    name: "Zurich",
    description: "Vehículos de salvamento certificados de múltiples marcas.",
  },
  {
    name: "Davivienda",
    description: "Camionetas, taxis y buses de diferentes marcas y modelos.",
  },
  {
    name: "Toyota Financial",
    description: "Vehículos Toyota y otras marcas de concesionarios autorizados.",
  },
  {
    name: "SBS Seguros",
    description: "Vehículos de salvamento de varios modelos y marcas.",
  },
  {
    name: "Eximarco",
    description: "Motores eléctricos, repuestos industriales y vehículos especializados.",
  },
];

const AlliesSection = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
          Nuestros Aliados
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Trabajamos con las empresas más importantes del sector automotriz y financiero en Colombia.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {allies.map((ally) => (
            <div
              key={ally.name}
              className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="w-full h-16 flex items-center justify-center mb-4">
                <span className="text-lg font-black text-foreground tracking-tight">
                  {ally.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {ally.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlliesSection;
