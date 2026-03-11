import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import SponsorBanner from "@/components/SponsorBanner";

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MainNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">Términos y Condiciones</h1>
          <p className="text-muted-foreground">Última actualización: 06 de marzo de 2026</p>

          <h2 className="text-2xl font-bold text-foreground">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar la plataforma Mubis (en adelante, la "Plataforma"), operada por <strong>Mubis Colombia S.A.S.</strong>, identificada con NIT 9018366670, con domicilio en Calle 170 # 69-80, Bogotá D.C., Colombia, usted acepta estos Términos y Condiciones en su totalidad.</p>

          <h2 className="text-2xl font-bold text-foreground">2. Descripción del Servicio</h2>
          <p>Mubis es una plataforma tecnológica que facilita la conexión entre concesionarios (Dealers) y compradores profesionales (Recompradores) para la compraventa de vehículos mediante subastas privadas. Mubis actúa exclusivamente como facilitador de la red y no participa en las transferencias de propiedad ni en las transacciones financieras entre las partes.</p>

          <h2 className="text-2xl font-bold text-foreground">3. Registro y Cuentas</h2>
          <p>Para utilizar la Plataforma es necesario crear una cuenta proporcionando información veraz, completa y actualizada. Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. Mubis se reserva el derecho de verificar la identidad y documentación de los usuarios antes de habilitar su participación en subastas.</p>

          <h2 className="text-2xl font-bold text-foreground">4. Roles de Usuario</h2>
          <ul className="space-y-2">
            <li><strong>Dealer:</strong> concesionario verificado que puede publicar vehículos para subasta y también participar como comprador en subastas de otros Dealers.</li>
            <li><strong>Recomprador:</strong> comprador profesional verificado que participa exclusivamente como comprador en las subastas.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground">5. Funcionamiento de las Subastas</h2>
          <p>Las subastas tienen una duración de <strong>1 hora</strong>, son rápidas, claras y eficientes. Cada vehículo publicado cuenta con un peritaje profesional de <strong>100 puntos</strong>. El cierre de la venta entre las partes se realiza en un plazo máximo de <strong>96 horas (4 días)</strong> posteriores a la finalización de la subasta. El comprador puede solicitar una extensión de 4 u 8 días adicionales si lo necesita. Mubis facilita la conexión entre comprador y vendedor.</p>

          <h2 className="text-2xl font-bold text-foreground">6. Comisiones</h2>
          <p>No existe comisión de compra para los compradores. El modelo de comisiones aplicable a los vendedores será informado de forma transparente al momento del registro y publicación de vehículos.</p>

          <h2 className="text-2xl font-bold text-foreground">7. Responsabilidades del Usuario</h2>
          <p>Los usuarios se comprometen a utilizar la Plataforma de manera lícita, proporcionar información veraz sobre los vehículos publicados y cumplir con los acuerdos de compraventa derivados de las subastas.</p>

          <h2 className="text-2xl font-bold text-foreground">8. Limitación de Responsabilidad</h2>
          <p>Mubis actúa como facilitador tecnológico y no es responsable por las condiciones de los vehículos, el cumplimiento de las transacciones entre las partes, ni por cualquier daño directo o indirecto derivado del uso de la Plataforma.</p>

          <h2 className="text-2xl font-bold text-foreground">9. Propiedad Intelectual</h2>
          <p>Todo el contenido, marcas, logotipos y elementos de la Plataforma son propiedad de Mubis Colombia S.A.S. y están protegidos por la legislación de propiedad intelectual colombiana e internacional.</p>

          <h2 className="text-2xl font-bold text-foreground">10. Modificaciones</h2>
          <p>Mubis se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán comunicados a través de la Plataforma.</p>

          <h2 className="text-2xl font-bold text-foreground">11. Ley Aplicable</h2>
          <p>Estos Términos se rigen por la legislación de la República de Colombia. Cualquier controversia será resuelta por los tribunales competentes de Bogotá D.C.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
