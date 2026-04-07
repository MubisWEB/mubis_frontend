# Mubis — Plataforma de Subastas de Vehículos

Mubis es una plataforma B2B de subastas de vehículos usados diseñada para el mercado colombiano. Conecta dealers, recompradores y peritos en un flujo end-to-end: publicación → peritaje → subasta en tiempo real → cierre y pago.

---

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Roles y permisos](#roles-y-permisos)
- [Módulos principales](#módulos-principales)
- [Requisitos previos](#requisitos-previos)
- [Instalación y desarrollo](#instalación-y-desarrollo)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Estructura de carpetas](#estructura-de-carpetas)

---

## Características

- **Subastas en tiempo real** — pujas sincronizadas vía WebSocket (Socket.io); el marcador se actualiza para todos los participantes sin recargar la página.
- **Puja automática (proxy bidding)** — el usuario define su máximo; el sistema compite incrementalmente hasta ese límite sin revelarlo a los demás.
- **Publicación guiada de vehículos** — formulario multi-paso con compresión automática de imágenes en el cliente, validación por campo y previsualización antes de enviar.
- **Flujo de peritaje** — los peritos asignados a cada sucursal inspeccionan el vehículo; sólo los que aprueban pasan a subasta.
- **Pronto Pago** — el vendedor puede solicitar un adelanto de hasta el 10 % del valor adjudicado antes del pago final.
- **Asistente de ruta** — optimización de recorrido (nearest-neighbor TSP) con mapa interactivo Leaflet y exportación a Google Maps / Waze.
- **Panel de administración** — dashboard con analíticas (Recharts), gestión de dealers, solicitudes de verificación, movimientos financieros y mediación de casos de soporte.
- **Sistema de casos de soporte** — hilo de mensajes entre comprador, vendedor y Mubis como mediador.
- **Autenticación con roles** — JWT + refresh token, rutas protegidas por rol, confirmación de email y estado de verificación pendiente.
- **Exportación de documentos** — generación de PDFs desde el cliente con jsPDF + html2canvas.
- **Integración de pagos** — Stripe (React Stripe.js).
- **Dark / Light mode** — mediante `next-themes`.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 18 |
| Bundler | Vite 6 (plugin SWC) |
| Tipado | TypeScript 5 (jsconfig en archivos `.jsx`) |
| Estilos | Tailwind CSS 3 |
| Componentes base | Radix UI (shadcn/ui) |
| Routing | React Router v6 |
| Estado servidor | TanStack React Query v5 |
| Tiempo real | Socket.io-client v4 |
| Mapas | Leaflet + React-Leaflet |
| Gráficas | Recharts |
| Animaciones | Framer Motion |
| Formularios | React Hook Form + Zod |
| Pagos | Stripe (React Stripe.js) |
| Notificaciones | Sonner |
| HTTP client | Axios |
| Fechas | date-fns, Moment.js |
| Generación PDF | jsPDF + html2canvas |
| Testing | Vitest |

---

## Arquitectura del proyecto

```
Cliente (React SPA)
        │
        ├── REST API  ──► Backend (Axios, JWT auth)
        │
        └── WebSocket ──► Socket.io server (subastas en tiempo real)
```

La autenticación usa un par `accessToken` / `refreshToken` almacenado en `localStorage`. El cliente de Axios adjunta el token en cada petición y renueva el access token de forma transparente cuando expira.

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| `dealer` | Comprar, vender, mis subastas, ganados, guardadas, movimientos, soporte |
| `recomprador` | Comprar, ganados, guardadas, movimientos, soporte |
| `perito` | Lista de peritajes pendientes, detalle de peritaje |
| `admin` | Dashboard, gestión de dealers, solicitudes, subastas, movimientos, analíticas, casos |

Las rutas se protegen con los componentes `<RequireAuth>` y `<RequireRole roles={[...]}>`.

---

## Módulos principales

### Autenticación
`/login` · `/registro` · `/registro-confirmacion` · `/PendienteVerificacion`

Registro con email y contraseña, confirmación por correo electrónico y revisión manual del perfil de dealer por parte del equipo de Mubis.

### Marketplace — Comprar
`/Comprar`

Catálogo de subastas activas con filtros avanzados (marca, precio, ciudad, kilometraje). Cada tarjeta muestra el contador regresivo de cierre en tiempo real.

### Detalle de subasta
`/DetalleSubasta/:auctionId`

Vista completa del vehículo (galería de fotos, specs, documentación, resultados del peritaje). Permite pujar directamente con el sistema de puja automática. Incluye watchlist y la opción de reportar un problema (abre un caso de soporte).

### Publicar vehículo (dealer)
Accesible desde `/MisSubastas` vía `<PublicarCarroDialog>`.

Formulario de 4 pasos:
1. Datos del vehículo y del vendedor
2. Fotos (compresión en cliente, mínimo 5) + tarjeta de propiedad
3. Documentación (SOAT, técnico-mecánica, multas)
4. Resumen + solicitud de peritaje

### Peritaje
`/PeritajesPendientes` · `/PeritajeDetalle/:vehicleId`

Los peritos ven los vehículos asignados a su sucursal, toman la inspección y la completan o rechazan con un informe.

### Pronto Pago
Modal disponible en `/Ganados`. El vendedor elige el monto del adelanto (hasta el 10 % del valor adjudicado) con un slider; Mubis cobra una comisión del 5 %.

### Asistente de ruta
Modal accesible desde `/Ganados`. Calcula la ruta óptima (TSP por vecino más cercano) entre la oficina del dealer y todos los vehículos ganados en proceso. Muestra el mapa con Leaflet y exporta la ruta a Google Maps o Waze.

### Movimientos
`/Movimientos`

Historial de transacciones financieras del usuario.

### Panel de administración
`/AdminDashboard` · `/AdminDealers` · `/AdminSolicitudes` · `/AdminSubastas` · `/AdminMovimientos` · `/AdminAnaliticas` · `/AdminCasos`

KPIs, gráficas de actividad, gestión de usuarios y mediación de casos de soporte.

### Soporte
`/SoporteCasos` · `/AyudaSoporte`

Hilo de mensajes entre las partes involucradas. El admin puede cambiar el estado del caso y registrar resoluciones.

---

## Requisitos previos

- **Node.js** ≥ 18
- **npm** ≥ 9 (o pnpm / yarn equivalente)
- Backend de Mubis corriendo y accesible (ver Variable de entorno `VITE_API_URL`)

---

## Instalación y desarrollo

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd mubis_frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# 4. Iniciar servidor de desarrollo
npm run dev
# La aplicación abre en http://localhost:8080
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en el puerto 8080 |
| `npm run build` | Build de producción en `/dist` |
| `npm run build:dev` | Build en modo desarrollo (sin minificación) |
| `npm run preview` | Previsualizar el build de producción localmente |
| `npm run lint` | Ejecutar ESLint (solo errores, sin warnings) |
| `npm run lint:fix` | Corregir errores de lint automáticamente |
| `npm run typecheck` | Verificar tipos con TypeScript |

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base del backend REST
VITE_API_URL=http://localhost:3000/api

# URL del servidor de WebSocket
VITE_WS_URL=http://localhost:3000

# Clave pública de Stripe (empieza con pk_)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

> Todas las variables expuestas al cliente deben tener el prefijo `VITE_`.

---

## Estructura de carpetas

```
src/
├── api/
│   ├── client.js          # Instancia de Axios con interceptores JWT
│   ├── services.js        # Servicios REST por dominio (auth, vehículos, subastas…)
│   └── socket.js          # Cliente Socket.io y helpers de sala
│
├── components/
│   ├── ui/                # Componentes base (shadcn/ui sobre Radix UI)
│   ├── BidModal.jsx       # Modal de puja automática
│   ├── ExtensionModal.jsx # Extensión de plazo de cierre
│   ├── PublicarCarroDialog.jsx  # Formulario multi-paso de publicación
│   ├── ProntoPagoModal.jsx      # Solicitud de adelanto de pago
│   ├── RouteAssistant.jsx       # Optimizador de ruta con mapa
│   ├── Header.jsx / TopBar.tsx  # Cabecera con navegación
│   ├── BottomNav.jsx      # Navegación inferior móvil
│   └── RequireAuth.jsx    # Guards de ruta por rol
│
├── lib/
│   ├── AuthContext.jsx    # Contexto global de autenticación
│   └── utils.ts           # Helper cn() para clases Tailwind
│
├── pages/                 # Una carpeta de componentes de página por ruta
│   ├── Landing.jsx
│   ├── Login.jsx / Registro.jsx
│   ├── Comprar.jsx
│   ├── DetalleSubasta.jsx
│   ├── MisSubastas.jsx
│   ├── Ganados.jsx / Guardadas.jsx
│   ├── Movimientos.jsx
│   ├── Cuenta.jsx
│   ├── PeritajesPendientes.jsx / PeritajeDetalle.jsx
│   ├── Admin*.jsx         # Vistas del panel de administración
│   └── SoporteCasos.jsx / AdminCasos.jsx
│
└── App.tsx                # Raíz: providers, BrowserRouter y árbol de rutas
```
