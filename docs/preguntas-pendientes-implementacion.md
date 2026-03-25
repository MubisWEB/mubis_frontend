# Preguntas Pendientes para Implementacion - Mubis

**Fecha:** 2026-03-25
**Contexto:** Feedback recibido del equipo sobre funcionalidades faltantes y mejoras requeridas.

---

## 1. Registro - "No encuentro mi concesionario"

**Estado actual:** El formulario de registro carga concesionarios desde el endpoint `GET /auth/companies`. El usuario selecciona su empresa de un dropdown.

**Preguntas:**
- El problema reportado es que el concesionario no aparece en la lista porque **no esta registrado en el sistema**, o es un **problema de usabilidad** del dropdown en mobile?
- Si es porque el concesionario no existe, debemos agregar una opcion de **"No encuentro mi concesionario"** con un campo de texto libre para que el usuario ingrese el nombre manualmente?
- En ese caso, se crea una **solicitud de alta** del concesionario, o se permite el registro inmediato como "independiente"?
- Quien es el responsable de dar de alta nuevos concesionarios en la plataforma?

**Impacto:** Bloquea el onboarding de nuevos dealers cuyo concesionario no este pre-cargado.

---

## 2. Pagina "Se Busca" - Feature nueva

**Estado actual:** No existe en frontend ni backend. Ruta actualmente retorna 404.

**Preguntas:**
| # | Pregunta | Opciones sugeridas |
|---|----------|-------------------|
| 2.1 | Quien puede **publicar** en "Se Busca"? | Solo dealers / Dealers + Recompradores |
| 2.2 | Quien puede **ver** las publicaciones? | Solo dealers (para ofrecer carros) / Todos los usuarios autenticados |
| 2.3 | Cual es la **ruta** esperada? | `/SeBusca`, `/se-busca`, otra |
| 2.4 | Cuantas **publicaciones consume** cada post? | 1 publicacion / Otro |
| 2.5 | Tiene **expiracion** la publicacion? | Si: cuantos dias? / No |
| 2.6 | Como se **responde** a un "Se Busca"? | Chat directo / Caso de soporte / El dealer ofrece un carro de su inventario |
| 2.7 | Se puede **editar/eliminar** despues de publicar? | Si / No |

**Campos confirmados:** Marca, Modelo, Ano (rango), Km (rango), Tipo de combustible, Motor/Version.

**Dependencias:** Requiere nuevo modulo en backend (controller, service, modelo Prisma), nueva pagina en frontend, y definicion de flujo de respuesta.

---

## 3. Recargar Publicaciones - Gateway de Pagos

**Estado actual:** La integracion con Wompi ya existe en el backend (`wompi.service.ts`). El frontend en la pagina Cuenta tiene el slider de cantidad y genera el checkout. Existe el webhook endpoint para confirmar pagos.

**Preguntas:**
- El flujo actual con Wompi **no funciona** en produccion, o simplemente faltan las **credenciales de produccion**?
- Las claves del `.env` (`WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`) estan configuradas con valores de prueba. Se necesitan las **credenciales reales** para activar pagos.
- El webhook de confirmacion (`POST /publications/webhook`) esta configurado en el **dashboard de Wompi**?
- Hay algun otro gateway de pagos que prefieran ademas de Wompi (Stripe, MercadoPago, etc.)?

**Accion requerida:** Compartir credenciales de produccion de Wompi y confirmar configuracion del webhook.

---

## 4. Movimientos - Mostrar comprados tambien

**Estado actual:** El backend (`transactions.findMine()`) ya retorna transacciones donde el usuario es comprador O vendedor. El frontend (`Movimientos.jsx`) ya muestra ambas con indicadores de direccion (flecha arriba = venta, flecha abajo = compra).

**Preguntas:**
- Que falta exactamente? El reporte dice "tiene que mostrar los comprados tambien". Puede ser que:
  - a) Los datos no llegan correctamente del backend (bug)
  - b) La UI no distingue visualmente entre compras y ventas de forma clara
  - c) Se necesitan **tabs separadas** (Compras / Ventas / Todas)
- Se requiere algun **detalle adicional** en cada movimiento (ej. estado del inventario, documentos)?

---

## 5. Analitica - Mas completa + Ranking

**Estado actual:** La pagina `MiRendimiento` muestra stats basicos: vehiculos, subastas, transacciones, revenue, y un pie chart de distribucion por estado.

**Preguntas:**
| # | Pregunta | Opciones |
|---|----------|----------|
| 5.1 | El ranking es entre asesores de la **misma sucursal** o del **mismo concesionario**? | Sucursal / Concesionario / Ambos |
| 5.2 | Que **metricas** del ranking? | Cantidad de ventas / Revenue total / Ambas / Otras |
| 5.3 | Que **periodo** abarca el ranking? | Mensual / Trimestral / Configurable |
| 5.4 | El ranking muestra **posicion + top N**, o el **listado completo** de asesores? | Top 5 / Top 10 / Completo |
| 5.5 | Que informacion de **carros comprados y vendidos** hace falta? | Historial detallado / Graficas de tendencia / Metricas de conversion / Especificar |

**Nota:** El endpoint de analiticas del backend (`GET /analytics/my`) necesitara ampliarse para incluir datos de ranking comparativo.

---

## 6. Reemplazar Mis Metas por Inventario (CRM)

**Estado actual:** `MisMetas` muestra metas asignadas con barras de progreso. Se solicita reemplazar esta pagina por un modulo de **Inventario** conectado al CRM del concesionario.

**Preguntas:**
| # | Pregunta |
|---|----------|
| 6.1 | Que **CRM** usan los concesionarios? Hay un API especifico a integrar (ej. Salesforce, HubSpot, DMS propio)? |
| 6.2 | Si no hay API de CRM disponible, se puede arrancar con **carga manual o upload CSV** como primera version? |
| 6.3 | La informacion del inventario es **por sucursal** o **por concesionario completo**? |
| 6.4 | Cada asesor ve **solo su inventario asignado** o el **inventario completo** de la sucursal? |
| 6.5 | Las notificaciones de cambio de zona (verde -> naranja -> roja) van por **push notification**, **email**, **SMS**, o **notificacion in-app**? |
| 6.6 | El inventario se **actualiza automaticamente** (via API del CRM) o requiere **actualizacion manual**? |
| 6.7 | Se necesita **accion** cuando un carro esta en zona roja (ej. descuento automatico, alerta al gerente), o solo es **informativo**? |

**Especificaciones confirmadas:**
- Campos: Marca, Modelo, Ano, Km, Motor/Version, Tipo de combustible, Tiempo en inventario
- Codigo de colores: 0-29 dias (verde), 30-59 dias (naranja), 60+ dias (rojo)
- Actualizacion en tiempo real con notificaciones

---

## 7. API de Placas

**Preguntas:**
- Cual es el **proveedor** que menciono Andres? Necesitamos: nombre del servicio, URL del API, documentacion, y credenciales de acceso.
- Donde se usaria en el flujo? Al **crear un vehiculo**, el dealer ingresa la placa y se auto-completan los campos (marca, modelo, ano, etc.)?
- Se usaria tambien en la pagina de **peritaje** para pre-cargar informacion?
- Hay **costo por consulta**? Si es asi, se limita el numero de consultas por usuario/dia?

---

## 8. Notificaciones - Cuenta aceptada + Confirmacion de solicitud

**Estado actual:** El servicio de email (`email.service.ts`) es un **placeholder** que solo hace `console.log`. No hay integracion con ningun proveedor de email real. No existe servicio de SMS.

**Preguntas:**
| # | Pregunta |
|---|----------|
| 8.1 | Que **proveedor de email** se quiere usar? SendGrid, AWS SES, Resend, Mailgun, otro? |
| 8.2 | Para **SMS/WhatsApp**: Twilio, WhatsApp Business API, otro? Ya tienen cuenta? |
| 8.3 | Ya tienen **credenciales** de alguno de estos servicios? |
| 8.4 | Se necesita un **dominio verificado** para enviar emails (ej. `notificaciones@mubis.co`)? |
| 8.5 | Ademas de cuenta aceptada, que **otros eventos** deben generar notificacion por email/SMS? |

**Flujo solicitado:**
1. Al **aplicar** a Mubis: Email de confirmacion indicando "Recibiras respuesta en 24-48 horas"
2. Al ser **aceptado**: Notificacion por email Y telefono (SMS o WhatsApp)
3. Al ser **rechazado**: Email explicando motivo (esto ya existe como template pero sin envio real)

---

## Resumen de Prioridades Sugeridas

| Prioridad | Item | Bloqueador? | Requiere respuesta? |
|-----------|------|-------------|---------------------|
| Alta | Registro - concesionario | Si - afecta onboarding | Si |
| Alta | "Se Busca" - feature nueva | Si - pagina 404 | Si |
| Alta | Notificaciones email/SMS | Si - sin comunicacion al usuario | Si (credenciales) |
| Media | Inventario (reemplazo Metas) | No | Si (CRM) |
| Media | Analitica + Ranking | No | Si (metricas) |
| Media | Movimientos - comprados | Posible bug | Parcial |
| Baja | Recargar publicaciones | No - ya funciona en test | Si (credenciales prod) |
| Baja | API de placas | No | Si (proveedor) |

---

**Siguiente paso:** Una vez respondidas estas preguntas, se puede iniciar la implementacion de cada item con alcance claro y sin ambiguedades.
