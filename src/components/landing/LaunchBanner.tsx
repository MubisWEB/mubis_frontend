const LaunchBanner = () => {
  return <section className="md:py-16 py-0 bg-secondary-foreground">
      <div className="container mx-auto px-4 bg-secondary-foreground">
        <div className="md:py-20 px-8 md:px-16 text-center py-[40px]">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
            <span className="text-4xl text-primary">Administramos</span>
            <br />
            <span className="text-4xl py-0 text-primary">tus Retomas</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto font-light text-secondary">
            Aumenta tus ventas de carros nuevos, con un servicio eficiente y confiable.
          </p>
        </div>
      </div>
    </section>;
};
export default LaunchBanner;