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

- **`Cannot read properties of undefined (reading 'createContext')` en vendor chunk (recurrente):** `sonner`, `vaul`, `cmdk` y `react-day-picker` son librerías que usan React internamente pero no tenían regla en `manualChunks` → caían en el catch-all `vendor`. Cuando ese chunk se evalúa antes que `vendor-react`, `React` es `undefined` al intentar llamar `createContext`. Corrección: agregar esas librerías a la regla `vendor-ui` en `vite.config.ts` para que queden junto a `@radix-ui`. También agregar `optimizeDeps.include: ['react', 'react-dom', 'react/jsx-runtime']` para pre-bundling en dev. **Cada vez que se agregue una nueva dependencia React-based de UI, añadirla a la regla `vendor-ui`.**

## Otros
