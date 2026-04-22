# Mubis Frontend Context

Este documento es el contexto base de Mubis frontend para cualquier conversacion nueva con Codex, Claude u otro agente. Leerlo antes de tocar rutas, pantallas, permisos, dashboards, publicacion, pujas, peritajes o postventa.

## Que es Mubis

Mubis es una plataforma de subastas de carros. La web tiene UI distinta por rol y debe reflejar reglas de negocio reales del backend. No es solo un marketplace: cada publicacion pasa por peritaje, luego por subasta, luego por decision del vendedor, y si se acepta, termina en transaccion e inventario/postventa.

Todo lo que pase en subastas debe verse reflejado en dashboards, movimientos, inventario, alertas y metricas segun rol.

## Roles y experiencia esperada

### SUPERADMIN

Es Mubis/nosotros.

Debe tener visibilidad de toda la aplicacion:

- Panel superadmin.
- Usuarios.
- Empresas/concesionarios.
- Sucursales.
- Solicitudes.
- Soporte.
- Subastas.
- Inventario.
- Movimientos.
- Analiticas.
- Peritajes.
- Configuracion operativa.

Puede monitorear todo el tenant. No deberia publicar vehiculos como flujo comercial normal.

### ADMIN_GENERAL

Gerente/admin de un concesionario completo.

La UI debe mostrar:

- Dashboard general de su empresa.
- Resumen total del concesionario.
- Filtro por sucursal especifica.
- Ventas/compras/metricas de toda la empresa.
- Subastas propias/de la empresa segun scope.
- Movimientos.
- Inventario/postventa.
- Analiticas.
- Acceso a publicar carro como vendedor.

Nunca debe ver datos de otra empresa.

### ADMIN_SUCURSAL

Administrador de una sucursal.

La UI debe mostrar:

- Dashboard de sucursal.
- Dealers/vendedores de esa sucursal.
- Subastas, ventas, compras, inventario y movimientos de esa sucursal.
- Analiticas limitadas a sucursal.
- Acceso a publicar carro como vendedor.

Nunca debe ver datos de otras sucursales.

**Es el ÚNICO rol que ve inventario.** `SeBusca` lo ven admin sucursal y recomprador únicamente. Ningún otro rol (superadmin, admin general, dealer, perito) ve ninguno de los dos.

### DEALER

Concesionario/vendedor-comprador comun.

La UI debe permitir:

- Comprar/pujar.
- Publicar carro.
- Ver `MisSubastas`.
- Ver pipeline de sus subastas.
- Ver movimientos propios.
- Ver ganadas/deseados/se busca/cuenta segun navegacion.
- Ver saldo de publicaciones.

No puede pujar en sus propias subastas.

### RECOMPRADOR

Comprador puro.

La UI debe permitir:

- Ver subastas activas.
- Pujar.
- Ver ganadas.
- Ver deseados.
- Ver movimientos/postventa donde participa.
- Ver catalogo B2B si aplica.

La UI NO debe mostrar historial completo de pujas de una subasta a recomprador. Puede ver su puja, estado y datos necesarios para comprar, pero no informacion sensible de otros postores.

### PERITO

Inspector/perito.

La UI debe permitir:

- Ver peritajes pendientes de su sucursal.
- Tomar peritaje.
- Continuar peritaje en progreso.
- Completar o rechazar.
- Ver historial.

No debe tener UI de compra, publicacion comercial ni decision de ofertas.

## Estados que la UI debe entender

### Subastas

- `ACTIVE`: visible al publico comprador; tiempo corriendo; se puede pujar.
- `PENDING_DECISION`: termino el tiempo y hay lider; vendedor debe aceptar/rechazar/aceptar puja anterior. No decir que ya esta vendida.
- `ENDED`: finalizada. Puede tener ganador o no tener ganador.
- `CLOSED` / `CANCELLED`: cierres/cancelaciones especificas.

Nombres de negocio usados en la UI:

- Activas: `ACTIVE`.
- En decision: `PENDING_DECISION`.
- En proceso / peritaje: vehiculos o inspecciones antes de publicacion.
- Rechazadas: carros rechazados por peritaje o subastas/ofertas rechazadas segun contexto.
- Finalizadas: subastas que ya terminaron con o sin ganador.
- Postventa: transacciones/inventario derivados de subastas aceptadas.
- Sin ganador: subastas ended sin `winnerId`.

### Peritaje

- Pendiente: aun no tomado por perito.
- En progreso: perito lo tomo.
- Completado: crea subasta automaticamente.
- Rechazado: no se publica.

## Flujo visual principal

### Publicacion de carro

El formulario de publicacion debe pedir datos suficientes para crear vehiculo:

- Marca/modelo/ano/km/ciudad/placa/color.
- Combustible/transmision/cilindraje.
- Fotos.
- Documentacion.
- Specs.
- Precio de salida sugerido/inicial.

Reglas UI:

- Solo `DEALER`, `ADMIN_GENERAL`, `ADMIN_SUCURSAL` publican.
- Mostrar saldo de publicaciones.
- Al enviar, se consume 1 publicacion en backend.
- Despues de publicar, el carro queda pendiente de peritaje, no activo aun.
- No simular publicacion local si el backend falla.

### Verifik

Verifik es un feature para autollenado: se ingresan placa y cedula, y una app/integracion trae datos para completar campos. En frontend se debe tratar como ayuda del formulario, no como bypass de reglas.

No debe:

- Crear carro sin enviar `POST /vehicles`.
- Saltarse consumo de saldo.
- Saltarse peritaje.
- Saltarse permisos de rol.
- Mostrar datos sensibles a roles no autorizados.

UI de Verifik en `PublicarCarroDialog`:
- Fila `[Placa] [Cedula] [🔍 Buscar]` en una sola linea (flex row).
- Si backend devuelve 503 con `code: 'VERIFIK_NO_CREDITS'`, mostrar "Servicio de consulta de placa no disponible" (no error generico).
- Si Verifik retorna datos, se autocompletan campos. Cambiar la placa resetea los datos autocompletados.

### Estimacion de precio de mercado

En `PublicarCarroDialog` existe logica de estimacion de precio real via Fasecolda/interno:

- El precio se busca automáticamente con debounce de 900ms al cambiar km, transmisión o combustible (cuando ya hay placa encontrada).
- También se puede refrescar manualmente con botón RefreshCw.
- Wrapper en `services.js`: `vehiclesApi.getMarketEstimate(brand, model, year, km, transmision, combustible, plate)` — 7 parámetros, `plate` es opcional pero mejora confidence a 'high' via Fasecolda.
- Respuesta: `{ marketPrice, minPrice, maxPrice, confidence ('high'|'low'), comparablesCount, source }`.

### Busqueda de placa — HeroPlacaSearch (Landing)

`src/components/HeroPlacaSearch.jsx` — caja visual en el hero del landing:
- Inputs placa (uppercase, 6 chars, font-mono) + cédula (numérico).
- **No llama a ninguna API.** Al hacer submit abre Dialog teaser de login/registro.
- Pasa `{ placa, cedula }` como `location.state` a `/login` y `/registro`.
- Posición: dentro del `<HeroSection>` como sección independiente (después del CTA principal).

### Busqueda de placa — MarketPlacaSearch (MisSubastas)

`src/components/MarketPlacaSearch.jsx` — caja real con lookup de Verifik:
- Inputs placa + cédula → llama `vehiclesApi.lookupPlate` y luego `vehiclesApi.getMarketEstimate` con plate.
- Muestra datos del carro + precio de mercado + badge de confianza.
- Botón "¿Quieres avanzar?" → abre `PublicarCarroDialog` con `initialPrefill` ya llenado.
- Posición: en `MisSubastas.jsx` arriba del layout aside+main, full-width.

### PublicarCarroDialog — initialPrefill y campos nuevos

- Prop `initialPrefill` opcional: cuando open+initialPrefill, prellenado automático con todos los campos incluyendo transmisión, doors, airConditioning, steering, passengers.
- Auto-price debounce: `useEffect` con 900ms detecta cambios en km/transmision/combustible y actualiza precio automáticamente (sin que el usuario presione botón).
- `handleLookupPlate` ahora extrae y guarda: transmisión, doors, airConditioning, steering, passengers desde la respuesta del backend.

### Peritaje

Pantallas clave:

- `PeritajesPendientes`: perito ve pendientes de su sucursal.
- `PeritajeDetalle`: toma, evalua, completa o rechaza.
- `HistorialPeritajes` / detalle historial.

Al completar peritaje, backend crea subasta automaticamente. La UI debe mostrar resultado real y navegar/actualizar con datos del backend.

### Compra y puja

Pantallas clave:

- `Comprar`.
- `DetalleSubasta`.
- `Ganadas`.
- `Deseados`.

Reglas UI:

- No permitir puja si subasta no esta `ACTIVE`.
- No permitir que vendedor puje en su propia subasta.
- Si el backend rechaza por misma sucursal consecutiva, mostrar error claro.
- Recomprador no ve historial completo de pujas.
- Dealer/admin comprador tampoco deberia ver informacion sensible que no le corresponde, salvo si es vendedor/admin con permiso.
- El monto mostrado debe venir de backend luego de pujar.
- `Ganadas` debe incluir subastas donde el usuario es `winnerId` y tambien `PENDING_DECISION` donde es `leaderId`. Dealer, recomprador, admin general y admin sucursal pueden usarla cuando compran.
- Si una puja maxima queda pendiente por proxy delay, el backend recalcula ganador real antes de decision/aceptacion. La UI debe confiar en la respuesta de backend y no derivar ganador localmente.

### Chat comprador-vendedor

- Ruta: `/Chat/:auctionId`.
- Este chat es directo entre comprador y vendedor de una subasta, para coordinar entrega/pago.
- Solo debe abrir con `auctionId`, nunca con `vehicleId`.
- El comprador lider en decision o ganador final puede iniciar la conversacion.
- Si el vendedor entra antes de que el comprador inicie el chat, mostrar: "El comprador aun no ha iniciado el chat. En cuanto lo haga, podras comunicarte aqui."
- No mezclar con Mubis Soporte: `SupportCase`/`SupportMessage` es mediacion admin/superadmin; `AuctionConversation`/`AuctionMessage` es comprador-vendedor.

### Decision del vendedor

Pantallas clave:

- `MisSubastas`.
- `DetalleSubastaVendedor`.

Cuando una subasta esta `PENDING_DECISION`, el vendedor debe ver acciones manuales:

- Aceptar oferta ganadora.
- Rechazar y extender 48 horas.
- Aceptar oferta anterior si aplica.

Reglas:

- No autoaceptar.
- Si rechaza, comunicar que se abre otra ventana de 48 horas.
- Si ya fue extendida y vence sin accion, queda finalizada sin ganador.
- Boton de volver a subastar debe ser manual, no automatico.

### Postventa

Pantallas clave:

- `AdminInventario`.
- `AdminMovimientos`.
- `Movimientos`.
- Vistas de inventario/transacciones por rol.

Una subasta aceptada debe aparecer como:

- Transaccion.
- Registro de inventario.
- Movimiento del vendedor y comprador.
- Metrica de dashboard.

Admins avanzan etapas segun scope:

- Pago confirmado.
- Documentos solicitados.
- Documentos recibidos.
- Despacho.
- Entrega.
- Notas.

## Dashboards

Evitar datos simulados `SIM_*` cuando ya hay endpoint real. Los dashboards deben consumir backend real y mostrar fallback solo si es estrictamente necesario y claramente seguro.

Dashboards importantes:

- `AdminDashboard`: superadmin.
- `AdminGeneralDashboard`: empresa/concesionario completo.
- `AdminSucursalDashboard`: sucursal.
- `AdminAnaliticas`: ruta compartida, pero datos y permisos deben ser scope-aware.
- `MiRendimiento` / metricas dealer si aplica.

Metricas esperadas:

- Vehiculos publicados.
- Vendidos/comprados.
- Subastas activas.
- En decision.
- En peritaje.
- Rechazadas.
- Postventa.
- Sin ganador.
- Revenue/corretaje.
- Transacciones.
- Inventario.
- Rendimiento vendedores/dealers.
- Rendimiento peritos.
- Modelos/marcas mas solicitadas o pujadas.

Admin general debe poder ver resumen total de empresa y filtrar por sucursal.

## Permisos de rutas

La UI usa proteccion por rol, pero backend es la fuente de verdad. La UI debe ayudar a no mostrar accesos incorrectos, pero no confiar en eso para seguridad.

Rutas comunes por rol:

- Superadmin: dashboard admin, usuarios, solicitudes, soporte, empresas, sucursales, subastas, banners, partners, carga masiva, analiticas, peritajes si aplica, compra/publicacion e inventario global. **NO ve SeBusca.**
- Admin general: `AdminGeneralDashboard`, `AdminSucursalDashboard`, `AdminAnaliticas`, `AdminInventario`, `AdminMovimientos`, `AdminSolicitudes`, `AdminSubastas`, `AdminCargaMasiva`, compra/publicacion segun rol. **NO ve SeBusca.**
- Admin sucursal: `AdminSucursalDashboard`, `AdminAnaliticas`, `AdminInventario`, `AdminMovimientos`, `AdminSolicitudes`, `AdminSubastas`, `SeBusca`, compra/publicacion segun rol. **Comparte SeBusca solo con recomprador.**
- Dealer: `Comprar`, `MisSubastas`, `Movimientos`, `Ganadas`, `Deseados`, `Cuenta`. **NO ve SeBusca ni inventario.**
- Recomprador: `Comprar`, `Ganadas`, `Deseados`, `Movimientos`, `SeBusca`, `Cuenta`. **NO ve inventario.**
- Perito: `PeritajesPendientes`, `HistorialPeritajes`, `Cuenta`.

Si una ruta es compartida, el componente debe adaptar queries y UI por role/scope.

## API y servicios

Usar los clientes en `src/api/services.js`. No duplicar fetches ad hoc si ya existe wrapper.

Areas clave:

- Auth y usuario actual.
- Auctions/subastas.
- Bids/pujas.
- Vehicles/publicacion.
- Inspections/peritajes.
- Transactions/movimientos.
- Inventory/postventa.
- Analytics/dashboards.
- Publications/saldo de publicaciones.
- Verifik/autollenado: `vehiclesService.lookupPlate(placa, documentType, documentNumber)`.
- Market estimate/precio de mercado: `vehiclesService.getMarketEstimate(brand, model, year, km, transmision, combustible, plate)`.

Cuando una accion cambia estado, refrescar datos relevantes:

- Pujar: detalle subasta, tarjetas/listado, pujas propias.
- Aceptar/rechazar: `MisSubastas`, detalle vendedor, movimientos, dashboard.
- Completar peritaje: pendientes/historial y subastas activas.
- Avanzar postventa: inventario, movimientos, dashboard.

## Navegacion y UI

El bottom nav es fijo. En screenshots `fullPage` puede aparecer a mitad de imagen por comportamiento de Playwright con elementos `fixed`; revisar viewport real antes de tocar layout por ese artefacto.

La UI debe ser clara para usuarios de negocio:

- Dealer entiende si un carro esta en peritaje, activo, decision o finalizado.
- Perito entiende que debe tomar/continuar/completar.
- Recomprador entiende si puede pujar y si va ganando.
- Admin entiende si mira empresa completa o sucursal.
- Superadmin ve operacion global.

Evitar textos que prometan acciones que backend no permite. Si backend rechaza, mostrar error especifico.

## Playwright / pruebas frontend

Existe config en `playwright.config.ts`.

Scripts:

- `npm run test:e2e`
- `npm run test:e2e:headed`

Suite principal:

- `tests/e2e/role-navigation.spec.ts`
- `tests/e2e/user-flows.spec.ts`

Cubre:

- Login via API.
- Inyeccion de tokens en localStorage.
- Landing por rol.
- Rutas permitidas por rol.
- Rutas denegadas por rol.
- Screenshots por rol/ruta.
- Deteccion de respuestas API 4xx en rutas permitidas.

Para correr con backend local:

```powershell
$env:E2E_API_URL='http://localhost:3000/api'
$env:E2E_BASE_URL='http://localhost:5174'
$env:E2E_PORT='5174'
npm run test:e2e -- --workers=1 --reporter=line
```

Importante: usar `localhost` para frontend por CORS del backend.

`user-flows.spec.ts` cubre flujos UI de cierre:

- Dealer abre publicacion, llena formulario y envia a peritaje sin crear data real en DB porque mockea el POST de escritura.
- Perito ve una solicitud pendiente mockeada y toma el peritaje desde la UI.
- Detalle de subasta muestra claramente el error backend de puja consecutiva por misma sucursal.

## Validaciones recientes esperadas

Estas validaciones estaban verdes en la ultima pasada:

- Frontend build: `npm run build`.
- Backend build: `npm run build`.
- Frontend Playwright role navigation: `17/17`.
- Frontend Playwright user flows: `3/3`.
- Backend business flow e2e: `5/5`.
- Frontend audit: `0 vulnerabilities`.
- Backend audit: `0 vulnerabilities`.

### Carga masiva y comunicaciones (2026-04-21)
- `src/pages/AdminCargaMasiva.jsx` permite subir `.xlsx`, `.xls` o `.csv`.
- La plantilla descargable incluye columnas: Rol, Nombre, Email, Telefono, Ciudad, Empresa, Sucursal, NIT, Direccion.
- Roles aceptados desde la UI/Excel: `dealer`, `perito`, `recomprador`, `admin_general`, `admin_sucursal`.
- Superadmin puede cargar todos los roles aceptados.
- Admin general tambien puede entrar a `AdminCargaMasiva`, pero la UI y el backend lo limitan a cargar `admin_sucursal` de su propio concesionario.
- `admin_general` debe dejar Sucursal vacia; `admin_sucursal` debe traer una sucursal existente.
- El backend resuelve Empresa/Sucursal contra Company/Branch para mantener scoping real de dashboards y permisos.
- Los correos se mandan desde backend con `EMAIL_FROM=info@mubis.co` cuando el proveedor este activo; la UI no debe simular envio.
- Correo visible para soporte/contacto/legal: `info@mubis.co`. Cuenta tecnica para integraciones/proveedores: `api@mubis.co`.
- WhatsApp automatizado aun no debe prometer envio real si no hay cuenta Meta/Twilio configurada; backend queda en modo disabled/log.
- Produccion esperada: `VITE_API_URL=https://api.mubis.co/api` y `VITE_WS_URL=https://api.mubis.co`.

### SEO tecnico (2026-04-22)
- `index.html` tiene metadatos base para `https://mubis.co`: title, description, canonical, Open Graph, Twitter card y JSON-LD Organization.
- `src/components/SeoMeta.tsx` actualiza title/description/canonical/robots por ruta publica usando React Router.
- Rutas publicas indexables: `/`, `/como-funciona`, `/para-dealers`, `/contacto`, `/preguntas-frecuentes`, `/terminos-y-condiciones`, `/politica-de-privacidad`, `/aviso-legal`.
- Rutas privadas y de auth quedan con `noindex` en runtime; `public/robots.txt` tambien bloquea rutas internas/admin/subastas/cuenta.
- `public/sitemap.xml` lista solo rutas publicas y usa `https://mubis.co`.
- No volver a poner imagenes externas de Lovable/R2 para preview social; usar assets propios bajo `https://mubis.co`.

### Catálogo Chevrolet (2026-04-20)
- `src/constants/vehicleData.js`: Chevrolet expandido a 23 modelos (Onix, Onix Plus, Spark, Beat, Sail, Sonic, Cruze, Groove, Tracker, Trax, Trailblazer, Captiva, Equinox, Blazer, Traverse, Camaro, Malibu, Tahoe, Suburban, S10, Montana, Colorado, Silverado).
- `src/constants/vehicleImages.js`: imágenes para onix, onixplus, groove, trailblazer, captiva, s10.

## Features implementadas (2026-04 — sesiones anteriores)

### Tarjetas con backdrop blur
- `src/components/VehicleThumbnail.jsx`: componente reutilizable. Fondo = misma imagen blur+scale, imagen encima con object-contain. Usado en VehicleCard, WonAuctionCard, MisSubastas, B2BCatalogo.

### SeBusca
- `src/pages/SeBusca.jsx`: ahora permite "Todas las marcas" (sin filtro de marca obligatorio). Error real del backend visible en toast.
- `src/api/services.js` `branchInventoryApi.search`: filtros yearMin/yearMax/kmMin/kmMax usan comparacion correcta (no truthy).
- `src/constants/vehicleData.js`: agregadas Mini, BYD, Tesla, Porsche, Lexus, Volvo, Land Rover, Jaguar.

### Preferencias (ahora con backend)
- `src/pages/Preferencias.jsx`: reescrita. Consume `preferencesApi` (no localStorage). Muestra contador "X disponibles" por preferencia. Click en preferencia navega a /Comprar?brand=&model=. Boton "Cargar CSV" parsea con PapaParse columnas Marca/Modelo.
- `src/pages/Comprar.jsx`: lee `useSearchParams()` para precargar brand y model. filteredVehicles incluye filtro por model.
- `src/api/services.js`: nuevo `preferencesApi` (getAll, create, bulkCreate, remove).

### Configuracion de notificaciones
- `src/pages/ConfiguracionNotificaciones.jsx`: nueva pantalla con toggles por tipo, agrupados por categoria.
- Ruta `/ConfiguracionNotificaciones` en App.tsx.
- Icono engranaje en `Notificaciones.jsx` que navega a la pantalla de config.
- `notificationsApi.getPreferences()` y `updatePreference()` agregados en services.js.

### Movimientos
- `src/pages/Movimientos.jsx`: filtro cambiado de status a Todos/Comprados/Vendidos. isSale basado en sellerId no en role. Botones Exportar XLSX y CSV.
- `src/api/services.js`: `transactionsApi.export(queryString)` para descarga de archivo.
- `src/pages/Cuenta.jsx`: eliminado link "Subastas Ganadas" de todos los roles. La pagina /Ganados sigue existiendo accesible desde el bottom nav de /Comprar.

## Cuidado antes de cambiar

- No reintroducir datos `SIM_*` en dashboards ya conectados.
- No mostrar historial de pujas a recomprador.
- No mostrar botones de decision a compradores.
- No permitir publicar a recomprador/perito.
- No esconder errores de saldo insuficiente.
- No decir que una subasta en decision ya esta vendida.
- No autoaceptar ofertas desde UI.
- No volver a publicar automaticamente despues de las 48h.
- No saltar scope de admin general/admin sucursal.
- No asumir que admin general y admin sucursal ven lo mismo.
- No asumir que Verifik reemplaza publicacion/peritaje; solo autollenado.
