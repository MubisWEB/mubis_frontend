import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

export default function AvisoLegal() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MainNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">Aviso Legal</h1>
          <p className="text-muted-foreground">Última actualización: 06 de marzo de 2026</p>

          <h2 className="text-2xl font-bold text-foreground">Identificación del Responsable</h2>
          <p>En cumplimiento de la normativa vigente, se informa que este sitio web es propiedad de:</p>
          <ul className="space-y-1">
            <li><strong>Razón social:</strong> Mubis Colombia S.A.S.</li>
            <li><strong>NIT:</strong> 9018366670</li>
            <li><strong>Domicilio:</strong> Calle 170 # 69-80, Bogotá D.C., Colombia</li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:info@mubis.com" className="text-secondary hover:underline">info@mubis.com</a></li>
            <li><strong>Teléfono:</strong> +34 670 03 30 99</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground">Objeto</h2>
          <p>Mubis es una plataforma tecnológica que facilita la conexión entre concesionarios y compradores profesionales para la compraventa de vehículos mediante subastas privadas. Mubis actúa como facilitador de la red y no interviene directamente en las transacciones entre las partes.</p>

          <h2 className="text-2xl font-bold text-foreground">Propiedad Intelectual</h2>
          <p>Todos los contenidos del sitio web, incluyendo textos, imágenes, logotipos, marcas, diseños gráficos y código fuente, son propiedad de Mubis Colombia S.A.S. o de sus licenciantes y están protegidos por la legislación colombiana e internacional en materia de propiedad intelectual.</p>

          <h2 className="text-2xl font-bold text-foreground">Condiciones de Uso</h2>
          <p>El acceso al sitio web implica la aceptación de las condiciones de uso. El usuario se compromete a utilizar el sitio web de conformidad con la ley, la moral y el orden público. Queda prohibido el uso del sitio con fines ilícitos o que atenten contra los derechos de terceros.</p>

          <h2 className="text-2xl font-bold text-foreground">Exclusión de Responsabilidad</h2>
          <p>Mubis Colombia S.A.S. no se responsabiliza de los daños que puedan derivarse de interferencias, interrupciones, virus informáticos, averías o desconexiones en el funcionamiento del sistema, ni de retrasos o bloqueos en el uso causados por deficiencias o sobrecargas en líneas telefónicas o de internet.</p>

          <h2 className="text-2xl font-bold text-foreground">Legislación Aplicable</h2>
          <p>Este aviso legal se rige por la legislación de la República de Colombia. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales de Bogotá D.C.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
