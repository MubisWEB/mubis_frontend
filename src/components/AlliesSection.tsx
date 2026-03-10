const allies = [
  { name: "Renting Colombia", initials: "RC", color: "bg-emerald-600", description: "Vehículos de flota corporativa de diferentes marcas y modelos." },
  { name: "Sura", initials: "S", color: "bg-blue-700", description: "Vehículos de salvamento y siniestros de diversas marcas." },
  { name: "GM Financial", initials: "GM", color: "bg-slate-800", description: "Autos y camionetas recuperados de cartera financiera." },
  { name: "Zurich", initials: "Z", color: "bg-sky-600", description: "Vehículos de salvamento certificados de múltiples marcas." },
  { name: "Davivienda", initials: "DV", color: "bg-red-600", description: "Camionetas, taxis y buses de diferentes marcas y modelos." },
  { name: "Toyota Financial", initials: "TF", color: "bg-red-500", description: "Vehículos Toyota y otras marcas de concesionarios autorizados." },
  { name: "SBS Seguros", initials: "SBS", color: "bg-indigo-700", description: "Vehículos de salvamento de varios modelos y marcas." },
  { name: "Exiambiente", initials: "EX", color: "bg-teal-600", description: "Motores eléctricos, repuestos industriales y vehículos especializados." },
];

const AlliesSection = () => {
  return (
    <section className="bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
          Nuestros Aliados
        </h2>
        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto mb-8">
          Empresas líderes del sector automotriz y financiero confían en Mubis.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allies.map((ally) => (
            <div
              key={ally.name}
              className="rounded-xl border border-border bg-card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl ${ally.color} flex items-center justify-center mb-3`}
              >
                <span className="text-white text-sm font-black tracking-tight">
                  {ally.initials}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{ally.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
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
