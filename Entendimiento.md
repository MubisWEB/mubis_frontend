# Entendimiento funcional del frontend 

Este frontend en React representa la capa de experiencia de Mubis y está enfocado en operar subastas de vehículos en tiempo real de forma clara para cada rol.

Lo veo como una SPA de negocio bien segmentada: combina catálogo, pujas, seguimiento operativo, soporte y administración dentro de un flujo continuo para dealers, recompradores, peritos y administradores.

## Qué resuelve esta capa

- Presenta el marketplace de subastas activas con filtros y vistas de detalle.
- Permite pujar y recibir actualización en vivo por WebSocket.
- Soporta publicación guiada de vehículos con formularios y validaciones.
- Expone flujos operativos post-subasta (ganados, movimientos, pronto pago, soporte).
- Entrega paneles administrativos con analítica y gestión de casos.

## Cómo está estructurado

- `pages/`: pantallas por ruta y por rol.
- `components/`: piezas reutilizables de UI y modales de negocio.
- `api/`: cliente Axios, servicios REST y cliente Socket.io.
- `lib/`: contexto de autenticación y utilidades compartidas.

En términos de arquitectura, la app conversa con el backend por REST para operaciones CRUD/consulta y por sockets para eventos de subasta.

## Fortalezas técnicas observadas

- Separación funcional razonable por módulos y contexto de autenticación.
- Uso de React Query para estado remoto y sincronización de datos.
- Integración real-time bien alineada con el dominio de subastas.
- Stack de UI moderno (Tailwind + Radix/shadcn) que facilita consistencia visual.

## Lectura práctica para el equipo

Si hay problemas de sesión o permisos de vista, revisar primero `AuthContext`, guards de ruta y `api/client.js`.

Si falla la experiencia de puja o contadores, revisar `api/socket.js`, componentes de detalle y modales de puja.

Si el problema es administrativo, rastrear la ruta en `App.tsx` y luego la pantalla `Admin*` correspondiente.
