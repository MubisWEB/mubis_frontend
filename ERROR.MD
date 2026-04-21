# ERROR LOG — Frontend

Registro de errores cometidos para no repetirlos.

## Suposiciones incorrectas sobre componentes/UI

<!-- Ejemplo: Asumir que un componente usa props X cuando en realidad usa Y -->

## Errores de rutas e imports

<!-- Ejemplo: Importar desde ruta incorrecta, confundir alias de paths -->

## Errores de estado y lógica

<!-- Ejemplo: Asumir que un estado se maneja en el componente cuando está en el store -->

## Errores de integración con API/backend

- **`getMarketEstimate` — parámetro `plate` faltaba (2026-04-20):** El wrapper en `services.js` no pasaba el 7° parámetro `plate` al backend, por lo que la fuente siempre era interna (`confidence: low`) en vez de Fasecolda (`confidence: high`). Corrección: agregar `plate` como parámetro opcional en `getMarketEstimate(brand, model, year, km, transmision, combustible, plate)`.

## Errores de bundling / Vite

- **`Cannot read properties of undefined (reading 'createContext')` en vendor chunk (recurrente):** Causa raíz: dependencia circular entre chunks en el build de producción. `react-dom` (en `vendor-react`) depende de `scheduler`, `react-is` y `use-sync-external-store`. Esos paquetes no tenían regla en `manualChunks` → caían al catch-all `vendor`. El catch-all `vendor` importa React (de `vendor-react`), creando el ciclo: `vendor-react → vendor (scheduler) → vendor-react (react)`. Cuando el ciclo se evalúa, React está `undefined` → `createContext` falla. Correcciones aplicadas en `vite.config.ts`:
  Correcciones aplicadas en `vite.config.ts` (en orden de diagnóstico, todas necesarias):
  1. Agregar `scheduler`, `react-is`, `use-sync-external-store` a `vendor-react` (dependencias internas de react-dom).
  2. Agregar `sonner`, `vaul`, `cmdk`, `react-day-picker`, `next-themes` a `vendor-ui`. `next-themes` fue el culpable confirmado via DevTools: su `createContext` con `setTheme/themes/forcedTheme/storageKey` era visible en el minificado.
  3. Agregar `react-router` (base package, ≠ react-router-dom) y `@remix-run` a `vendor-react`. Eran el ciclo restante: `vendor-react (react-router-dom) → vendor (@remix-run/router, react-router) → vendor-react (react)`.
  4. Agregar `optimizeDeps.include: ['react', 'react-dom', 'react/jsx-runtime']` para pre-bundling en dev.
  **Regla general: cualquier paquete que use React o que sea dependencia interna de React debe asignarse explícitamente a `vendor-react` o `vendor-ui` en `manualChunks`. Nunca dejar que caiga al catch-all `vendor`. Al agregar nuevas dependencias, verificar si son React-based.**

## Otros
