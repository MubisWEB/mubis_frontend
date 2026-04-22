import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MainNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">Política de Tratamiento de Información y Datos Personales</h1>

          <h2 className="text-2xl font-bold text-foreground">Política de Privacidad</h2>
          <p>
            La empresa <strong>MUBIS COLOMBIA S.A.S.</strong>, sociedad comercial colombiana identificada con <strong>NIT 9018366670</strong>, con domicilio en <strong>Calle 170 # 69-80, Bogotá D.C., Colombia</strong>, informa a los titulares de datos personales acerca de la presente <strong>Política de Tratamiento de Información y Datos Personales</strong> (en adelante, la "Política"), en cumplimiento de lo dispuesto en la <strong>Ley 1581 de 2012</strong>, el <strong>Decreto 1377 de 2013</strong> y el <strong>Decreto Único Reglamentario 1074 de 2015</strong>.
          </p>
          <p>Para todos los efectos relacionados con el tratamiento de datos personales, consultas, reclamos o solicitudes, los titulares podrán comunicarse con:</p>
          <p>
            <strong>Correo electrónico:</strong> <a href="mailto:info@mubis.co" className="text-secondary hover:underline">info@mubis.co</a><br />
            <strong>Teléfono:</strong> +34 670 03 30 99
          </p>
          <p>El propósito de esta política es informar a los titulares de los datos personales sobre los derechos que les asisten, así como los mecanismos establecidos por <strong>Mubis Colombia S.A.S.</strong> para garantizar su protección.</p>
          <p>El tratamiento de los datos personales se realizará únicamente cuando exista <strong>autorización previa, expresa e informada del titular</strong>, la cual se entiende otorgada cuando el titular suministra voluntariamente su información y acepta las condiciones de tratamiento establecidas en esta política.</p>
          <p>Esta política es de obligatorio cumplimiento para <strong>Mubis Colombia S.A.S., sus empleados, contratistas, aliados y terceros</strong> que actúen en nombre de la compañía.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">1. Definiciones Principales</h2>
          <p>Para efectos de esta Política se adoptan las siguientes definiciones conforme a la legislación colombiana:</p>
          <ul className="space-y-2">
            <li><strong>Autorización:</strong> consentimiento previo, expreso e informado del titular para el tratamiento de sus datos personales.</li>
            <li><strong>Base de Datos:</strong> conjunto organizado de datos personales que sean objeto de tratamiento.</li>
            <li><strong>Dato Personal:</strong> cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
            <li><strong>Dato Público:</strong> información calificada como pública por la ley o la Constitución.</li>
            <li><strong>Dato Sensible:</strong> información que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación.</li>
            <li><strong>Encargado del Tratamiento:</strong> persona natural o jurídica que realiza el tratamiento de datos personales por cuenta del responsable.</li>
            <li><strong>Responsable del Tratamiento:</strong> persona natural o jurídica que decide sobre la base de datos y/o el tratamiento de los datos personales.</li>
            <li><strong>Titular:</strong> persona natural cuyos datos personales son objeto de tratamiento.</li>
            <li><strong>Transferencia:</strong> envío de datos personales a un responsable ubicado dentro o fuera de Colombia.</li>
            <li><strong>Transmisión:</strong> tratamiento de datos personales que implica la comunicación de estos a un encargado para que realice el tratamiento por cuenta del responsable.</li>
          </ul>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">2. Principios para el Tratamiento de Datos</h2>
          <p>Mubis Colombia S.A.S. aplicará los siguientes principios:</p>
          <h3 className="text-lg font-semibold text-foreground">Autorización previa</h3>
          <p>El tratamiento de datos personales se realizará únicamente con autorización previa del titular.</p>
          <h3 className="text-lg font-semibold text-foreground">Finalidad</h3>
          <p>Los datos personales serán utilizados únicamente para los fines informados al titular.</p>
          <h3 className="text-lg font-semibold text-foreground">Calidad del dato</h3>
          <p>Los datos deben ser veraces, completos, exactos y actualizados.</p>
          <h3 className="text-lg font-semibold text-foreground">Acceso restringido</h3>
          <p>El acceso a los datos estará limitado únicamente a personal autorizado.</p>
          <h3 className="text-lg font-semibold text-foreground">Seguridad</h3>
          <p>Se implementarán medidas técnicas, administrativas y humanas para proteger los datos personales.</p>
          <h3 className="text-lg font-semibold text-foreground">Confidencialidad</h3>
          <p>Los datos personales serán tratados de manera confidencial incluso después de terminada la relación con el titular.</p>
          <h3 className="text-lg font-semibold text-foreground">Temporalidad</h3>
          <p>Los datos personales se conservarán únicamente durante el tiempo necesario para cumplir con las finalidades del tratamiento.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">3. Tratamiento y Finalidades</h2>
          <p>Los datos personales recopilados por <strong>Mubis Colombia S.A.S.</strong> podrán ser utilizados para:</p>
          <ul className="space-y-1">
            <li>Gestionar el registro y uso de la plataforma Mubis.</li>
            <li>Permitir la compra, venta o intermediación de vehículos entre usuarios y concesionarios.</li>
            <li>Validar identidad y documentación de usuarios.</li>
            <li>Gestionar procesos de inspección, valoración o comercialización de vehículos.</li>
            <li>Cumplir obligaciones legales y regulatorias.</li>
            <li>Procesar pagos, comisiones o transacciones realizadas dentro de la plataforma.</li>
            <li>Gestionar relaciones comerciales con concesionarios, dealers, aliados o proveedores.</li>
            <li>Realizar análisis de datos, estudios de mercado y mejora de servicios.</li>
            <li>Atender consultas, solicitudes, quejas o reclamos.</li>
            <li>Enviar información comercial, promociones o comunicaciones relacionadas con los servicios de Mubis.</li>
            <li>Cumplir obligaciones tributarias, contractuales y regulatorias.</li>
          </ul>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">4. Derechos del Titular</h2>
          <p>Los titulares de datos personales tienen derecho a:</p>
          <ul className="space-y-1">
            <li>Conocer, actualizar y rectificar sus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informados sobre el uso de sus datos.</li>
            <li>Presentar quejas ante la <strong>Superintendencia de Industria y Comercio</strong>.</li>
            <li>Revocar la autorización o solicitar la supresión de los datos cuando sea procedente.</li>
            <li>Acceder gratuitamente a sus datos personales.</li>
          </ul>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">5. Procedimiento para Consultas y Reclamos</h2>
          <p>Los titulares podrán presentar consultas o reclamos enviando su solicitud a:</p>
          <p><strong>Correo electrónico:</strong> <a href="mailto:info@mubis.co" className="text-secondary hover:underline">info@mubis.co</a></p>
          <p>La solicitud deberá contener:</p>
          <ul className="space-y-1">
            <li>Nombre del titular</li>
            <li>Documento de identificación</li>
            <li>Descripción de la solicitud</li>
            <li>Dirección de contacto</li>
          </ul>
          <h3 className="text-lg font-semibold text-foreground">Tiempo de respuesta</h3>
          <p>Consultas: máximo <strong>10 días hábiles</strong><br />Reclamos: máximo <strong>15 días hábiles</strong></p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">6. Revocatoria de Autorización y Supresión de Datos</h2>
          <p>El titular podrá solicitar en cualquier momento la revocatoria de la autorización o la eliminación de sus datos personales cuando:</p>
          <ul className="space-y-1">
            <li>considere que no se están tratando conforme a la ley</li>
            <li>hayan dejado de ser necesarios</li>
            <li>se haya cumplido la finalidad para la cual fueron recolectados</li>
          </ul>
          <p>La solicitud podrá realizarse mediante el correo: <a href="mailto:info@mubis.co" className="text-secondary hover:underline">info@mubis.co</a></p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">7. Deberes de Mubis como Responsable del Tratamiento</h2>
          <p>Mubis Colombia S.A.S. se compromete a:</p>
          <ul className="space-y-1">
            <li>Garantizar el derecho de hábeas data.</li>
            <li>Conservar la autorización otorgada por los titulares.</li>
            <li>Informar claramente el uso de los datos.</li>
            <li>Implementar medidas de seguridad para proteger la información.</li>
            <li>Cumplir las instrucciones de la Superintendencia de Industria y Comercio.</li>
          </ul>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">8. Transferencia y Transmisión Internacional de Datos</h2>
          <p>Mubis podrá transferir o transmitir datos personales a terceros o proveedores tecnológicos dentro o fuera de Colombia cuando sea necesario para la prestación del servicio, garantizando niveles adecuados de protección de datos conforme a la legislación colombiana.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">9. Seguridad de la Información</h2>
          <p>Mubis implementa medidas técnicas, administrativas y organizativas para evitar el acceso no autorizado, pérdida, uso indebido o alteración de los datos personales.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">10. Retención de Información</h2>
          <p>Los datos personales serán almacenados únicamente durante el tiempo necesario para cumplir con las finalidades descritas en esta política o mientras exista obligación legal o contractual de conservarlos.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">11. Modificaciones a la Política</h2>
          <p>Mubis Colombia S.A.S. podrá modificar esta política en cualquier momento. Cualquier cambio será comunicado oportunamente a través de los canales habituales de comunicación o mediante publicación en la plataforma.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">12. Ley y Jurisdicción</h2>
          <p>La presente política se rige por la <strong>legislación colombiana</strong>. Cualquier controversia será resuelta por los tribunales competentes de la <strong>República de Colombia</strong>.</p>

          <hr className="border-border" />

          <h2 className="text-2xl font-bold text-foreground">13. Vigencia</h2>
          <p>La presente Política entra en vigencia a partir del <strong>06 de Marzo de 2026</strong> y permanecerá vigente mientras Mubis Colombia S.A.S. realice tratamiento de datos personales.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
