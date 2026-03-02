import mazda3Image from "@/assets/mazda3-illustration.png";
const HeroSection = () => {
  return <section className="relative min-h-[70vh] overflow-hidden pt-28">
      {/* White background */}
      <div className="absolute inset-0 bg-background" />


      <div className="container mx-auto px-4 md:py-20 relative z-10 py-0 pt-0 pb-0 bg-[#e6e6e6]">
        <div className="grid lg:grid-cols-2 gap-8 items-center bg-[#e6e6e6]">
          {/* Text Content */}
          <div className="text-center lg:text-left animate-fade-in lg:pl-12 xl:pl-20">
            <h1 className="md:text-6xl font-bold leading-tight lg:text-5xl py-[10px] text-sidebar-foreground text-4xl">compra y vende usados en subastas privadas.<br />
              Aplica hoy.
            </h1>
          </div>

          {/* Car Image - positioned to right */}
          <div className="relative flex justify-end animate-fade-in" style={{
          animationDelay: "0.2s"
        }}>
            <div className="relative w-full max-w-2xl h-72 md:h-96 lg:h-[28rem]">
              <img alt="Mazda 3 morado mubis" className="object-contain w-full h-full" src="/lovable-uploads/10f3baeb-44b7-48e6-ab08-c7048f522a63.png" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;