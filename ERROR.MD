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

## Otros
