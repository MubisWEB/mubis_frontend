# Pricing Engine - Parte 3: Outputs, API, MVP, UX y Operaciones

> **Documento de Diseño - Mubis Pricing Engine**
> Secciones 9-14 | Fecha: 2026-03-25
> Estado: BORRADOR PARA REVISIÓN TÉCNICA

---

## 9. OUTPUTS DE NEGOCIO

### 9.1 Esquema Completo de Respuesta

El Pricing Engine retorna un objeto estructurado que cubre cuatro dimensiones: **precios**, **scores de confianza**, **riesgos** y **metadatos de trazabilidad**.

```typescript
// ── Interfaz principal de respuesta ──────────────────────────────────────────

interface ValuationResponse {
  // ── Precios (COP) ──────────────────────────────────────────────────────────
  buy_now_price: number;              // Precio recomendado de compra para el dealer
  target_auction_floor: number;       // Precio mínimo de subasta (starting_price)
  target_auction_ceiling: number;     // Precio máximo esperado en subasta
  expected_market_price: number;      // Precio estimado al consumidor final (reventa)

  // ── Proyección temporal ────────────────────────────────────────────────────
  expected_days_to_sell: number;      // Días estimados para venta post-compra

  // ── Scores (0-100) ────────────────────────────────────────────────────────
  confidence_score: number;           // Confianza general del avalúo
  market_liquidity_score: number;     // Qué tan rápido se vende este tipo de vehículo
  document_risk_score: number;        // Riesgo documental (0=limpio, 100=muy riesgoso)
  physical_condition_score: number;   // Estado físico basado en inspección

  // ── Riesgos ────────────────────────────────────────────────────────────────
  risk_flags: RiskFlag[];

  // ── Recomendación ──────────────────────────────────────────────────────────
  recommended_action: 'AUCTION' | 'QUICK_BUY' | 'MANUAL_REVIEW' | 'DISCARD';
  explanation_summary: string;        // Resumen legible para humanos

  // ── Desglose ───────────────────────────────────────────────────────────────
  price_breakdown: PriceBreakdown;
  comparable_vehicles: ComparableVehicle[];

  // ── Metadatos ──────────────────────────────────────────────────────────────
  metadata: ValuationMetadata;
}

interface RiskFlag {
  code: string;                       // e.g. "PRENDA_ACTIVA", "KM_ANOMALY"
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;                // Descripción legible
  impact_on_price: number;            // Ajuste en COP (negativo = reduce precio)
  source: string;                     // Fuente que detectó el riesgo
  actionable: boolean;                // Si el usuario puede resolver el problema
  resolution_hint?: string;           // Sugerencia para resolver
}

interface PriceBreakdown {
  base_price: number;                 // Precio base de referencia (Fasecolda/mercado)
  year_adjustment: number;            // Ajuste por año (COP)
  km_adjustment: number;              // Ajuste por kilometraje (COP)
  condition_adjustment: number;       // Ajuste por condición física (COP)
  document_adjustment: number;        // Ajuste por estado documental (COP)
  market_demand_adjustment: number;   // Ajuste por oferta/demanda regional (COP)
  regional_adjustment: number;        // Ajuste por ciudad/región (COP)
  equipment_adjustment: number;       // Ajuste por equipamiento extra (COP)
  color_adjustment: number;           // Ajuste por color (popularidad)
  historical_auction_weight: number;  // Peso dado al historial de subastas (0-1)
  factors: {
    year_factor: number;              // Multiplicador año (0.25 - 1.0)
    km_factor: number;                // Multiplicador km (0.70 - 1.0)
    condition_factor: number;         // Multiplicador condición (0.50 - 1.25)
    demand_factor: number;            // Multiplicador demanda (0.85 - 1.15)
    regional_factor: number;          // Multiplicador regional (0.90 - 1.10)
  };
}

interface ComparableVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  city: string;
  sold_price: number;                 // Precio de cierre en COP
  sold_date: string;                  // ISO date
  source: 'MUBIS_AUCTION' | 'TUCARRO' | 'REVISTA_MOTOR' | 'FASECOLDA';
  similarity_score: number;           // 0-100 qué tan comparable es
  days_on_market?: number;            // Días que tardó en venderse
}

interface ValuationMetadata {
  engine_version: string;             // e.g. "1.0.0-mvp"
  model_version: string;              // e.g. "rules-v1" | "ml-v2"
  timestamp: string;                  // ISO 8601
  processing_time_ms: number;
  sources_used: DataSourceStatus[];
  cache_hit: boolean;
  tenant_id: string;
  request_id: string;
}

interface DataSourceStatus {
  source: string;                     // "MUBIS_HISTORY" | "FASECOLDA" | "RUNT" | "TUCARRO"
  status: 'OK' | 'PARTIAL' | 'UNAVAILABLE' | 'STALE';
  records_found: number;
  last_updated: string;               // ISO date
  latency_ms: number;
}
```

### 9.2 Ejemplo Completo de Respuesta

Vehículo: **Toyota Corolla 2021, 45.000 km, Bogotá, score de inspección 82/100**.

```json
{
  "buy_now_price": 68500000,
  "target_auction_floor": 62000000,
  "target_auction_ceiling": 74000000,
  "expected_market_price": 79500000,
  "expected_days_to_sell": 18,
  "confidence_score": 78,
  "market_liquidity_score": 85,
  "document_risk_score": 12,
  "physical_condition_score": 82,
  "risk_flags": [
    {
      "code": "SOAT_NEAR_EXPIRY",
      "severity": "LOW",
      "description": "SOAT vence en menos de 30 días (vence 2026-04-20)",
      "impact_on_price": -200000,
      "source": "RUNT",
      "actionable": true,
      "resolution_hint": "El propietario puede renovar el SOAT antes de la subasta para evitar este descuento."
    },
    {
      "code": "MINOR_PAINT_DAMAGE",
      "severity": "LOW",
      "description": "Daño menor de pintura reportado en inspección (puerta trasera derecha)",
      "impact_on_price": -350000,
      "source": "INSPECCION_MUBIS",
      "actionable": false
    }
  ],
  "recommended_action": "AUCTION",
  "explanation_summary": "Toyota Corolla 2021 con 45.000 km en excelente estado general (82/100). Alta liquidez en Bogotá con 7 ventas similares en los últimos 90 días. Precio de compra sugerido: $68.500.000 COP. Se recomienda subasta estándar con piso de $62.000.000. Margen estimado para dealer: ~$11.000.000 (16%). Riesgos menores: SOAT próximo a vencer y daño menor de pintura.",
  "price_breakdown": {
    "base_price": 85000000,
    "year_adjustment": -6800000,
    "km_adjustment": -2850000,
    "condition_adjustment": 1500000,
    "document_adjustment": -200000,
    "market_demand_adjustment": 2100000,
    "regional_adjustment": 850000,
    "equipment_adjustment": 0,
    "color_adjustment": 0,
    "historical_auction_weight": 0.40,
    "factors": {
      "year_factor": 0.92,
      "km_factor": 0.93,
      "condition_factor": 1.04,
      "demand_factor": 1.03,
      "regional_factor": 1.01
    }
  },
  "comparable_vehicles": [
    {
      "id": "clx8f3k2a0001...",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2021,
      "km": 38000,
      "city": "Bogotá",
      "sold_price": 71000000,
      "sold_date": "2026-03-10",
      "source": "MUBIS_AUCTION",
      "similarity_score": 94,
      "days_on_market": 12
    },
    {
      "id": "clx9a1m5b0003...",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "km": 52000,
      "city": "Bogotá",
      "sold_price": 65500000,
      "sold_date": "2026-02-28",
      "source": "MUBIS_AUCTION",
      "similarity_score": 87,
      "days_on_market": 8
    },
    {
      "id": "ext-tucarro-9821",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2021,
      "km": 41000,
      "city": "Bogotá",
      "sold_price": 78000000,
      "sold_date": "2026-03-05",
      "source": "TUCARRO",
      "similarity_score": 91,
      "days_on_market": 22
    },
    {
      "id": "ext-tucarro-10455",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2022,
      "km": 28000,
      "city": "Medellín",
      "sold_price": 82000000,
      "sold_date": "2026-03-15",
      "source": "TUCARRO",
      "similarity_score": 79,
      "days_on_market": 15
    },
    {
      "id": "ref-fasecolda-2021-corolla",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2021,
      "km": 0,
      "city": "Nacional",
      "sold_price": 85000000,
      "sold_date": "2026-01-01",
      "source": "FASECOLDA",
      "similarity_score": 65
    }
  ],
  "metadata": {
    "engine_version": "1.0.0-mvp",
    "model_version": "rules-v1",
    "timestamp": "2026-03-25T14:32:18.442Z",
    "processing_time_ms": 342,
    "sources_used": [
      {
        "source": "MUBIS_HISTORY",
        "status": "OK",
        "records_found": 7,
        "last_updated": "2026-03-25T14:32:18.000Z",
        "latency_ms": 45
      },
      {
        "source": "FASECOLDA",
        "status": "OK",
        "records_found": 1,
        "last_updated": "2026-03-01T00:00:00.000Z",
        "latency_ms": 210
      },
      {
        "source": "RUNT",
        "status": "OK",
        "records_found": 1,
        "last_updated": "2026-03-25T14:32:18.100Z",
        "latency_ms": 180
      },
      {
        "source": "TUCARRO",
        "status": "PARTIAL",
        "records_found": 12,
        "last_updated": "2026-03-24T08:00:00.000Z",
        "latency_ms": 890
      }
    ],
    "cache_hit": false,
    "tenant_id": "clx1abc...",
    "request_id": "req_pricing_8f3a2b1c"
  }
}
```

### 9.3 Lógica de `recommended_action`

| Acción | Condiciones | Descripción |
|--------|-------------|-------------|
| `AUCTION` | confidence >= 50 AND document_risk <= 50 AND no CRITICAL flags | Flujo normal. Subasta estándar de 48h. |
| `QUICK_BUY` | confidence >= 70 AND liquidity >= 80 AND document_risk <= 20 AND buy_now_price < 50M | Vehículos de alta rotación, bajo riesgo. Se puede ofrecer compra inmediata. |
| `MANUAL_REVIEW` | confidence < 50 OR document_risk > 50 OR cualquier CRITICAL flag OR sin comparables | Requiere revisión de analista humano antes de proceder. |
| `DISCARD` | document_risk > 90 (prenda, siniestro total) OR physical_condition < 20 | Vehículo no apto para la plataforma. |

### 9.4 Relación de Precios

```
expected_market_price   ← Lo que paga un consumidor final (retail)
  └── Margen dealer (10-20%)
target_auction_ceiling  ← Máximo que pagaría un dealer racional en subasta
  └── Zona de negociación subasta
target_auction_floor    ← starting_price de la subasta
  └── Margen de protección al vendedor
buy_now_price           ← Precio sugerido para compra directa (sin subasta)
```

Invariantes:
- `target_auction_floor <= buy_now_price <= target_auction_ceiling <= expected_market_price`
- `target_auction_floor >= expected_market_price * 0.75` (protección al vendedor)
- `buy_now_price` se calcula como `target_auction_ceiling * 0.93` (descuento por certeza inmediata)

---

## 10. API DEL PRICING ENGINE

> **PENDIENTE DE IMPLEMENTACION** -- Estas especificaciones son para documentacion/handoff al desarrollador backend. Los endpoints actuales (`POST /api/pricing/suggest`) seguiran funcionando hasta la migracion completa a v1.

### 10.1 Convenciones Generales

- **Base path**: `/api/v1/`
- **Versionado**: En URL (`/v1/`, `/v2/`). El endpoint legacy `/api/pricing/suggest` se mantiene como alias hasta deprecacion.
- **Autenticacion**: Bearer JWT en header `Authorization`. Todos los endpoints requieren autenticacion.
- **Multi-tenant**: El `tenantId` se extrae del JWT. No se pasa en el body.
- **Moneda**: Todos los precios en COP (pesos colombianos), tipo `number` (enteros, sin decimales).
- **Rate Limiting**: Basado en tenant + role. Headers de respuesta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- **Cache**: Header `X-Valuation-Cache: HIT|MISS`. ETags para GET endpoints.

### 10.2 Errores Estandar

```typescript
interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;  // Errores de validacion por campo
  request_id: string;
  timestamp: string;
}
```

| Codigo | Uso |
|--------|-----|
| 400 | Parametros invalidos o faltantes |
| 401 | JWT ausente o expirado |
| 403 | Rol no autorizado para este endpoint |
| 404 | Vehiculo/inspeccion no encontrada |
| 409 | Conflicto (e.g., valuacion ya en proceso) |
| 422 | Datos validos pero no procesables (e.g., placa no existe en RUNT) |
| 429 | Rate limit excedido |
| 503 | Fuente de datos externa no disponible |

---

### 10.3 Endpoint 1: Valuacion Instantanea

```
POST /api/v1/valuation/instant
```

Valuacion rapida solo con placa y kilometraje. Util para landing pages y cotizaciones rapidas del consumidor. No requiere inspeccion ni vehiculo registrado en la plataforma.

**Auth**: `SUPERADMIN`, `DEALER`, `PERITO`, `RECOMPRADOR`
**Rate limit**: 30 req/min por usuario, 200 req/min por tenant

```typescript
// ── Request ──────────────────────────────────────────────────────────────────
interface InstantValuationRequest {
  placa: string;          // Placa colombiana (formato ABC123 o ABC12D)
  km: number;             // Kilometraje actual, min: 0, max: 999999
  city?: string;          // Ciudad del vehiculo (default: se infiere de RUNT)
}

// ── Response 200 ─────────────────────────────────────────────────────────────
interface InstantValuationResponse {
  vehicle_info: {
    placa: string;
    brand: string;
    model: string;
    year: number;
    cilindraje: string;
    combustible: string;
    color: string;
    servicio: string;       // "Particular" | "Publico"
  };
  price_range: {
    min: number;            // Precio minimo estimado (COP)
    max: number;            // Precio maximo estimado (COP)
    midpoint: number;       // Punto medio (COP)
  };
  confidence_score: number; // 0-100 (tipicamente bajo sin inspeccion: 30-50)
  document_summary: {
    soat_status: 'VIGENTE' | 'VENCIDO' | 'PROXIMO_A_VENCER' | 'NO_DISPONIBLE';
    soat_expiry?: string;
    tecnomecanica_status: 'VIGENTE' | 'VENCIDA' | 'NO_REQUERIDA' | 'NO_DISPONIBLE';
    tecnomecanica_expiry?: string;
    prenda: boolean | null;
    comparendos: number | null;
    impuestos_al_dia: boolean | null;
  };
  risk_flags: RiskFlag[];
  next_steps: string[];     // e.g. ["Agendar inspección para precio más preciso"]
  metadata: ValuationMetadata;
}
```

**Errores especificos**:

| Codigo | Caso | Mensaje |
|--------|------|---------|
| 400 | Placa con formato invalido | `"Formato de placa inválido. Use ABC123 o ABC12D"` |
| 422 | Placa no encontrada en RUNT | `"No se encontró vehículo con placa {placa} en RUNT"` |
| 422 | Vehiculo de servicio publico | `"Vehículos de servicio público no son elegibles"` |
| 503 | RUNT no disponible | `"Servicio RUNT temporalmente no disponible. Intente en unos minutos"` |

**Estrategia de cache**: Cache por `placa + km` con TTL de 24 horas. Invalidar si km cambia en mas de 1.000.

---

### 10.4 Endpoint 2: Valuacion Completa

```
POST /api/v1/valuation/full
```

Valuacion completa usando todas las fuentes de datos disponibles. Se ejecuta despues de que el vehiculo esta registrado en la plataforma y, preferiblemente, despues de la inspeccion.

**Auth**: `SUPERADMIN`, `DEALER`
**Rate limit**: 10 req/min por usuario, 50 req/min por tenant

```typescript
// ── Request ──────────────────────────────────────────────────────────────────
interface FullValuationRequest {
  vehicle_id?: string;          // ID del vehiculo en Mubis (preferido)
  // ── Alternativa: datos manuales ────────────────────────────────────────
  placa?: string;
  brand?: string;
  model?: string;
  year?: number;
  km?: number;
  city?: string;
  combustible?: string;
  transmision?: string;
  cilindraje?: string;
  color?: string;
  score_global?: number;        // 0-100, score de inspeccion
  documentation?: {
    soat_vigente: boolean;
    tecnomecanica_vigente: boolean;
    prenda: boolean;
    impuestos_al_dia: boolean;
    comparendos: number;
  };
  // ── Opciones ───────────────────────────────────────────────────────────
  force_refresh?: boolean;      // Ignorar cache, forzar recalculo
  include_comparables?: boolean; // Default: true
  max_comparables?: number;     // Default: 5, max: 20
}

// ── Response 200 ─────────────────────────────────────────────────────────────
// Retorna ValuationResponse completo (ver seccion 9.1)
type FullValuationResponse = ValuationResponse;
```

**Errores especificos**:

| Codigo | Caso | Mensaje |
|--------|------|---------|
| 400 | Ni vehicle_id ni datos manuales completos | `"Proporcione vehicle_id o (brand + model + year + km)"` |
| 404 | vehicle_id no encontrado o no pertenece al tenant | `"Vehículo no encontrado"` |
| 422 | Ano fuera de rango (< 1990 o > current+1) | `"Año del vehículo fuera de rango aceptado"` |
| 409 | Valuacion ya en proceso para este vehiculo | `"Ya existe una valuación en proceso para este vehículo"` |

**Estrategia de cache**: Cache por `vehicle_id` con TTL de 6 horas. Invalidar automaticamente cuando: se completa una inspeccion, se actualiza el km, o cambian datos documentales.

---

### 10.5 Endpoint 3: Consultar Valuacion

```
GET /api/v1/vehicle/:id/valuation
```

Obtener la ultima valuacion cacheada de un vehiculo. No ejecuta calculo nuevo.

**Auth**: `SUPERADMIN`, `DEALER`, `PERITO`
**Rate limit**: 60 req/min por usuario

```typescript
// ── Params ───────────────────────────────────────────────────────────────────
// :id → vehicle ID (cuid)

// ── Query params ─────────────────────────────────────────────────────────────
interface GetValuationQuery {
  include_history?: boolean;    // Incluir valuaciones anteriores (default: false)
  include_comparables?: boolean; // Default: true
}

// ── Response 200 ─────────────────────────────────────────────────────────────
interface GetValuationResponse {
  current: ValuationResponse;
  history?: ValuationResponse[]; // Solo si include_history=true. Max 10 mas recientes.
}

// ── Response 404 ─────────────────────────────────────────────────────────────
// Si no existe valuacion para el vehiculo
// { "message": "No existe valuación para el vehículo {id}" }
```

**Estrategia de cache**: ETag basado en hash del ultimo calculo. `304 Not Modified` si no cambio.

---

### 10.6 Endpoint 4: Recalcular Post-Inspeccion

```
POST /api/v1/inspection/:id/recalculate
```

Recalcula la valuacion despues de que una inspeccion se marca como `COMPLETED`. Debe llamarse automaticamente desde el servicio de inspecciones (event-driven) o manualmente por un admin.

**Auth**: `SUPERADMIN`, `PERITO`
**Rate limit**: 5 req/min por usuario

```typescript
// ── Params ───────────────────────────────────────────────────────────────────
// :id → inspection ID (cuid)

// ── Request (body opcional) ──────────────────────────────────────────────────
interface RecalculateRequest {
  override_score?: number;      // Solo SUPERADMIN: sobreescribir score de inspeccion
  override_reason?: string;     // Justificacion del override (requerido si override_score)
  force_sources?: string[];     // Forzar uso de fuentes especificas
}

// ── Response 200 ─────────────────────────────────────────────────────────────
interface RecalculateResponse {
  previous_valuation: {
    buy_now_price: number;
    confidence_score: number;
    timestamp: string;
  } | null;
  current_valuation: ValuationResponse;
  delta: {
    buy_now_price_change: number;       // COP, puede ser negativo
    buy_now_price_change_pct: number;   // Porcentaje de cambio
    confidence_change: number;
    new_risk_flags: RiskFlag[];         // Flags nuevos post-inspeccion
    resolved_risk_flags: string[];      // Codes de flags resueltos
  };
}
```

**Errores especificos**:

| Codigo | Caso | Mensaje |
|--------|------|---------|
| 404 | Inspeccion no encontrada | `"Inspección no encontrada"` |
| 422 | Inspeccion no esta COMPLETED | `"La inspección debe estar completada para recalcular"` |
| 403 | PERITO intenta usar override_score | `"Solo SUPERADMIN puede sobreescribir el score"` |

**Integracion con flujo existente**: Este endpoint debe llamarse automaticamente via evento cuando `InspectionStatus` cambia a `COMPLETED`. Implementar con EventEmitter de NestJS:

```typescript
// En inspection.service.ts (existente)
this.eventEmitter.emit('inspection.completed', { inspectionId, vehicleId });

// En pricing.service.ts (nuevo listener)
@OnEvent('inspection.completed')
async handleInspectionCompleted(payload: { inspectionId: string; vehicleId: string }) {
  await this.recalculate(payload.inspectionId);
}
```

---

### 10.7 Endpoint 5: Vehiculos Comparables

```
GET /api/v1/vehicle/:id/comparables
```

Retorna vehiculos comparables usados en el calculo de precio. Util para que dealers justifiquen ofertas.

**Auth**: `SUPERADMIN`, `DEALER`
**Rate limit**: 30 req/min por usuario

```typescript
// ── Params ───────────────────────────────────────────────────────────────────
// :id → vehicle ID (cuid)

// ── Query params ─────────────────────────────────────────────────────────────
interface ComparablesQuery {
  limit?: number;              // Default: 10, max: 20
  min_similarity?: number;     // Default: 50 (0-100)
  sources?: string;            // Filtrar por fuente: "MUBIS_AUCTION,TUCARRO"
  year_range?: number;         // Rango de anos +/- (default: 2)
  city?: string;               // Filtrar por ciudad
}

// ── Response 200 ─────────────────────────────────────────────────────────────
interface ComparablesResponse {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    city: string;
  };
  comparables: ComparableVehicle[];
  total_found: number;
  filters_applied: Record<string, string>;
  market_summary: {
    avg_price: number;
    median_price: number;
    min_price: number;
    max_price: number;
    std_deviation: number;
    sample_size: number;
    date_range: { from: string; to: string };
  };
}
```

**Estrategia de cache**: Cache de 12 horas. Invalidar cuando se cierra una subasta del mismo brand+model.

---

### 10.8 Endpoint 6: Valuacion por Lotes

```
POST /api/v1/valuation/batch
```

Valuacion de multiples vehiculos en una sola peticion. Para dealers que quieren evaluar inventario o importaciones masivas.

**Auth**: `SUPERADMIN`, `DEALER`
**Rate limit**: 2 req/min por usuario, 5 req/min por tenant

```typescript
// ── Request ──────────────────────────────────────────────────────────────────
interface BatchValuationRequest {
  vehicles: BatchVehicleInput[];  // Min: 1, Max: 50
  options?: {
    include_comparables?: boolean;  // Default: false (para reducir payload)
    parallel?: boolean;             // Default: true
  };
}

interface BatchVehicleInput {
  reference_id: string;    // ID de referencia del cliente (para mapear resultados)
  vehicle_id?: string;     // ID en Mubis
  placa?: string;
  brand?: string;
  model?: string;
  year?: number;
  km?: number;
  city?: string;
}

// ── Response 200 ─────────────────────────────────────────────────────────────
interface BatchValuationResponse {
  results: BatchResultItem[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    processing_time_ms: number;
  };
}

interface BatchResultItem {
  reference_id: string;
  status: 'SUCCESS' | 'ERROR';
  valuation?: ValuationResponse;      // Solo si status === 'SUCCESS'
  error?: {
    code: number;
    message: string;
  };
}
```

**Errores especificos**:

| Codigo | Caso | Mensaje |
|--------|------|---------|
| 400 | Array vacio o > 50 vehiculos | `"Se requieren entre 1 y 50 vehículos"` |
| 400 | reference_id duplicado | `"reference_id duplicado: {id}"` |
| 429 | Rate limit batch | `"Máximo 2 valuaciones por lotes por minuto"` |

**Nota de implementacion**: Procesar con `Promise.allSettled()` para que un fallo individual no afecte el lote. Considerar Bull/BullMQ para lotes grandes (>20 vehiculos).

---

### 10.9 Endpoint 7: Salud del Sistema

```
GET /api/v1/pricing/health
```

Estado de salud del pricing engine: frescura de datos, conectividad con fuentes externas y metricas operacionales.

**Auth**: `SUPERADMIN`
**Rate limit**: 10 req/min

```typescript
// ── Response 200 ─────────────────────────────────────────────────────────────
interface PricingHealthResponse {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptime_seconds: number;
  data_sources: {
    name: string;
    status: 'OK' | 'DEGRADED' | 'DOWN';
    last_successful_sync: string;       // ISO date
    records_count: number;
    freshness: 'FRESH' | 'STALE' | 'CRITICAL';
    freshness_threshold_hours: number;
    avg_latency_ms: number;
    error_rate_24h: number;             // Porcentaje
  }[];
  engine_stats: {
    valuations_24h: number;
    avg_processing_time_ms: number;
    p95_processing_time_ms: number;
    cache_hit_rate: number;             // Porcentaje
    manual_review_rate: number;         // Porcentaje
    error_rate_24h: number;
  };
  alerts: {
    type: 'WARNING' | 'CRITICAL';
    message: string;
    since: string;
  }[];
}
```

**Integracion**: Este endpoint tambien es consumido por el dashboard de SuperAdmin para monitoreo.

---

### 10.10 Resumen de Endpoints

| # | Metodo | Path | Auth | Rate Limit | Cache TTL |
|---|--------|------|------|------------|-----------|
| 1 | POST | `/api/v1/valuation/instant` | ALL | 30/min usuario | 24h |
| 2 | POST | `/api/v1/valuation/full` | SA, DEALER | 10/min usuario | 6h |
| 3 | GET | `/api/v1/vehicle/:id/valuation` | SA, DEALER, PERITO | 60/min usuario | ETag |
| 4 | POST | `/api/v1/inspection/:id/recalculate` | SA, PERITO | 5/min usuario | -- |
| 5 | GET | `/api/v1/vehicle/:id/comparables` | SA, DEALER | 30/min usuario | 12h |
| 6 | POST | `/api/v1/valuation/batch` | SA, DEALER | 2/min usuario | -- |
| 7 | GET | `/api/v1/pricing/health` | SA | 10/min | 30s |

> SA = SUPERADMIN. Rate limits son orientativos; ajustar segun uso real en produccion.

---

## 11. MVP vs FASES

### 11.1 MVP (4-6 semanas)

#### Alcance Incluido

| Feature | Prioridad | Esfuerzo | Riesgo | Impacto |
|---------|-----------|----------|--------|---------|
| Motor de reglas basico (precio base + depreciacion ano + km + score inspeccion) | P0 | 1 semana | Bajo | Alto |
| Endpoint `/valuation/instant` (placa + km) | P0 | 1 semana | Medio | Alto |
| Endpoint `/valuation/full` (todos los inputs) | P0 | 1 semana | Bajo | Alto |
| Consulta RUNT para datos basicos del vehiculo por placa | P0 | 1.5 semanas | Alto | Alto |
| Historial de subastas Mubis como fuente de comparables | P0 | 3 dias | Bajo | Alto |
| Tabla Fasecolda como precio base de referencia | P0 | 1 semana | Medio | Alto |
| Endpoint `/vehicle/:id/valuation` (cache) | P1 | 3 dias | Bajo | Medio |
| Endpoint `/inspection/:id/recalculate` | P1 | 3 dias | Bajo | Alto |
| Risk flags basicos (SOAT, tecnomecanica, prenda) | P1 | 1 semana | Medio | Alto |
| Output completo con `recommended_action` | P1 | 3 dias | Bajo | Medio |
| Cache con Redis | P1 | 2 dias | Bajo | Medio |
| Endpoint `/pricing/health` basico | P2 | 1 dia | Bajo | Bajo |
| Migracion de `/api/pricing/suggest` a nuevo schema | P1 | 2 dias | Bajo | Medio |

#### NO Incluido en MVP

- Scraping de TuCarro / Revista Motor
- Modelo de ML (se usa motor de reglas)
- Endpoint batch
- Endpoint comparables separado
- Ajuste por equipamiento/accesorios
- Ajuste por color
- Analisis de imagenes
- Prediccion de demanda
- Dealer matching
- Dashboard de data quality
- Override manual (human-in-the-loop completo)

#### Dependencias

| Dependencia | Tipo | Estado | Riesgo |
|-------------|------|--------|--------|
| API RUNT (consulta por placa) | Externa | Requiere credenciales y contrato | **ALTO** - Sin RUNT no hay valuacion instantanea |
| Tabla Fasecolda 2026 (CSV/Excel) | Datos | Requiere compra/acuerdo | **MEDIO** - Se puede usar tabla aproximada inicialmente |
| Redis para cache | Infraestructura | No configurado | **BAJO** - Se puede usar cache in-memory como fallback |
| Historial de subastas Mubis | Interna | Disponible (tabla Auction) | **BAJO** - Ya existe en la base de datos |
| EventEmitter NestJS | Interna | Disponible en NestJS | **BAJO** - Modulo nativo |

#### Evaluacion de Riesgo Tecnico

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| RUNT no disponible o con latencia alta | Alta | Alto | Implementar fallback: permitir input manual de brand/model/year. Cache agresivo de respuestas RUNT. |
| Precision del motor de reglas insuficiente | Media | Medio | Las tablas de BRAND_BASE ya existen en el codigo actual. Calibrar con datos historicos de subastas. Aceptar MAE inicial de 15-20%. |
| Datos de Fasecolda desactualizados | Media | Medio | Usar ultima tabla disponible. Marcar confidence como "LOW" si la tabla tiene > 6 meses. |
| Pocos comparables para modelos poco comunes | Alta | Medio | Si < 3 comparables, reducir confidence y considerar MANUAL_REVIEW. |

#### Evaluacion de Riesgo Legal

| Riesgo | Descripcion | Mitigacion |
|--------|-------------|------------|
| Responsabilidad por precio incorrecto | Si un dealer compra basado en precio sugerido y pierde dinero | Disclaimer claro: "Precio estimado, no garantizado". Nunca mostrar un solo numero; siempre rango. |
| Uso de datos RUNT | Regulacion de Habeas Data en Colombia | Obtener autorizacion del propietario del vehiculo antes de consultar. Registrar consentimiento. |
| Scraping de TuCarro (V2) | Terminos de servicio de TuCarro/MercadoLibre | Diferir a V2. Evaluar API oficial o acuerdo comercial. |
| Datos personales en comparables | Mostrar placas/info de otros vehiculos | Nunca exponer placas ni datos del propietario en comparables. Solo brand/model/year/km/city/price. |

#### Impacto de Negocio Esperado

- **Conversion a inspeccion**: +15-25% al dar precio estimado previo (actualmente no existe)
- **Tiempo de decision del dealer**: -30% al tener precio sugerido con fundamento
- **Confianza del vendedor**: Precio transparente con explicacion clara
- **Precio de starting_price mas preciso**: Reduce subastas que terminan sin pujas por precio inicial demasiado alto

---

### 11.2 V2 (2-3 meses post-MVP)

| Feature | Prioridad | Esfuerzo | Riesgo | Impacto |
|---------|-----------|----------|--------|---------|
| Scraping TuCarro (precios de mercado retail) | P0 | 2 semanas | Alto | Alto |
| Scraping Revista Motor (precios de referencia) | P1 | 1 semana | Medio | Medio |
| Endpoint `/valuation/batch` | P1 | 1 semana | Bajo | Medio |
| Endpoint `/vehicle/:id/comparables` | P1 | 1 semana | Bajo | Medio |
| Ajuste regional por ciudad (Bogota, Medellin, Cali, Barranquilla, etc.) | P0 | 1 semana | Bajo | Alto |
| Factor de demanda estacional (enero bajo, noviembre alto) | P1 | 1 semana | Medio | Medio |
| Human-in-the-loop basico (cola de revision manual) | P0 | 2 semanas | Bajo | Alto |
| Modelo ML v1: regresion gradient boosting (XGBoost/LightGBM) | P1 | 3 semanas | Alto | Alto |
| Dashboard de metricas de pricing para SuperAdmin | P1 | 2 semanas | Bajo | Medio |
| Ajuste por color (colores populares vs. impopulares) | P2 | 3 dias | Bajo | Bajo |
| Ajuste por equipamiento (sunroof, cuero, etc.) | P2 | 1 semana | Medio | Medio |
| Notificaciones de precio al dealer via Socket.io | P1 | 1 semana | Bajo | Medio |
| A/B testing framework para comparar reglas vs ML | P1 | 1 semana | Medio | Alto |

#### Nuevas Fuentes de Datos (V2)

| Fuente | Metodo | Frecuencia | Datos |
|--------|--------|------------|-------|
| TuCarro | Web scraping (Puppeteer) | Diario | Precios publicados, dias en mercado, fotos |
| Revista Motor | Web scraping | Semanal | Precios de referencia por modelo |
| Historial Mubis extendido | Query interno | Tiempo real | Tendencias de precio, velocidad de venta |
| IPC (DANE) | API publica | Mensual | Inflacion para ajuste de precios historicos |

#### Dependencias V2

| Dependencia | Riesgo |
|-------------|--------|
| Infraestructura de scraping (proxy rotativo, scheduling) | Medio - Requiere infraestructura adicional |
| Datos de entrenamiento para ML (minimo 500+ subastas cerradas) | Alto - Si no hay volumen suficiente, el modelo no sera fiable |
| Servidor GPU o servicio ML (AWS SageMaker / Lambda) | Bajo - Se puede empezar con CPU para modelos pequenos |

---

### 11.3 V3 (6+ meses)

| Feature | Prioridad | Esfuerzo | Riesgo | Impacto |
|---------|-----------|----------|--------|---------|
| Analisis de imagenes con vision AI (detectar danos, verificar fotos) | P1 | 6 semanas | Alto | Alto |
| Prediccion de demanda por modelo/ciudad/temporada | P1 | 4 semanas | Alto | Alto |
| Dealer matching optimizado (sugerir subasta a dealers con mayor probabilidad de compra) | P0 | 4 semanas | Medio | Muy Alto |
| Precio dinamico de subasta (ajuste automatico de starting_price si no hay pujas) | P1 | 2 semanas | Medio | Alto |
| Modelo de deep learning (transformers para series temporales de precios) | P2 | 8 semanas | Muy Alto | Alto |
| Expansion regional: factores por departamento (32 departamentos de Colombia) | P1 | 3 semanas | Bajo | Medio |
| Integracion con API de peajes (km reales estimados) | P2 | 2 semanas | Alto | Bajo |
| Deteccion de fraude (km rollback, clonacion de placas) | P1 | 4 semanas | Alto | Alto |
| API publica para integraciones de terceros (dealers con sistemas propios) | P2 | 3 semanas | Medio | Medio |
| Reentrenamiento automatico del modelo (MLOps pipeline) | P1 | 4 semanas | Alto | Alto |
| Recomendacion de precio de reventa para dealer (calculando margen optimo) | P1 | 3 semanas | Medio | Alto |
| WhatsApp bot para cotizacion instantanea | P2 | 3 semanas | Medio | Alto |

#### Consideraciones de Expansion Regional

| Aspecto | Detalle |
|---------|---------|
| Variacion de precios por ciudad | Bogota +5-10%, Medellin +3-5%, ciudades pequenas -10-15% vs. promedio nacional |
| Vehiculos populares por region | Costa: pickups y SUVs. Bogota: sedanes y hatchbacks. Eje cafetero: modelos economicos. |
| Infraestructura vial | Ciudades con mejor infraestructura penalizan menos el km alto |
| Disponibilidad de inspectores (peritos) | Limita la cobertura del servicio completo en ciudades pequenas |
| Regulacion local | Pico y placa (Bogota, Medellin) afecta demanda por tipo de placa |
| Conectividad de fuentes de datos | RUNT es nacional, pero TuCarro tiene mas listings en ciudades grandes |

---

## 12. UX / PRODUCT REQUIREMENTS

### 12.1 Consumidor (Vendedor)

El consumidor es quien ingresa su vehiculo a la plataforma para venderlo a concesionarios. Su objetivo es obtener el mejor precio posible con la menor friccion.

#### Informacion que ve

1. **Rango estimado de precio** (prominente, centrado)
   - Formato: `$62.000.000 - $74.000.000 COP`
   - Nunca un solo numero; siempre rango para gestionar expectativas
   - Indicador visual tipo barra con el rango coloreado

2. **Explicacion simple y transparente**
   - Maximo 3 oraciones
   - Ejemplo: *"Tu Toyota Corolla 2021 con 45.000 km esta en excelente estado. Vehiculos similares en Bogota se han vendido entre $65M y $78M en los ultimos 3 meses. El precio final depende de la subasta."*
   - Evitar jerga tecnica (no mostrar "confidence_score" ni "factors")

3. **Comparacion con mercado**
   - Grafico simple tipo gauge: "Tu vehiculo vs. mercado"
   - Barras horizontales mostrando 3-4 vehiculos similares vendidos recientemente (sin datos identificables)
   - Texto: *"Basado en 7 vehiculos similares vendidos recientemente"*

4. **Proximos pasos claros**
   - CTA principal: "Agendar Inspeccion Gratuita"
   - Texto de apoyo: *"Con la inspeccion, podemos darte un precio mas preciso y publicar tu vehiculo en subasta."*
   - Timeline visual: Cotizacion → Inspeccion → Subasta (48h) → Pago

5. **Estado documental** (si disponible via RUNT)
   - Semaforo simple: SOAT vigente, Tecnomecanica vigente, Sin prenda
   - Si hay problemas: alerta amigable con solucion (no alarmar)

#### Jerarquia de Informacion (Mobile-First)

```
┌─────────────────────────────────────┐
│  [Header: Tu Cotización]            │
├─────────────────────────────────────┤
│                                     │
│   Tu Toyota Corolla 2021            │
│   45.000 km · Bogotá                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  PRECIO ESTIMADO            │    │
│  │  $62.000.000 - $74.000.000  │    │
│  │  ████████████░░░░░░░░░░░░░  │    │
│  │  ← Mín          Máx →      │    │
│  └─────────────────────────────┘    │
│                                     │
│  "Vehículos similares en Bogotá     │
│   se vendieron entre $65M y $78M    │
│   en los últimos 3 meses."          │
│                                     │
│  ── Comparación de Mercado ──       │
│  Corolla 2021 38k km  → $71M  ██▓  │
│  Corolla 2020 52k km  → $65M  ██░  │
│  Corolla 2021 41k km  → $78M  ███  │
│                                     │
│  ── Documentos ──                   │
│  ✓ SOAT vigente                     │
│  ✓ Tecnomecánica vigente            │
│  ✓ Sin prenda                       │
│                                     │
│  ── Próximos Pasos ──               │
│  ① Cotización ←── Estás aquí        │
│  ② Inspección gratuita              │
│  ③ Subasta (48 horas)               │
│  ④ Recibe tu pago                   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [AGENDAR INSPECCIÓN] (CTA)  │    │
│  └─────────────────────────────┘    │
│                                     │
│  Precio estimado, no garantizado.   │
│  El precio final se determina en    │
│  la subasta.                        │
└─────────────────────────────────────┘
```

#### Integracion con Paginas Existentes

| Pagina Actual | Integracion |
|---------------|-------------|
| Formulario de registro de vehiculo | Agregar paso previo: "Cotiza tu vehiculo" con placa + km. Si el precio le conviene, continua con el registro completo. |
| Pagina de detalle del vehiculo | Mostrar rango de precio si existe valuacion. Link a "Ver detalle de cotizacion". |
| Vista post-inspeccion | Actualizar rango con precio mas preciso (post-recalculate). Notificar al vendedor. |

---

### 12.2 Dealer (Comprador / Postor)

El dealer necesita informacion detallada para tomar decisiones de compra informadas y rapidas.

#### Informacion que ve

1. **Precio sugerido de compra** (destacado)
   - `buy_now_price`: "Precio sugerido: $68.500.000"
   - Contexto: "Este es el precio al que recomendamos comprar para obtener un margen saludable."

2. **Precio de salida sugerido** (si revende)
   - `expected_market_price`: "Precio de venta estimado: $79.500.000"
   - Basado en mercado retail (TuCarro, concesionarios)

3. **Margen esperado**
   - Calculo: `expected_market_price - buy_now_price - brokerage_fee (250.000)`
   - Formato: "$10.750.000 (15.7%)"
   - Semaforo: Verde (>12%), Amarillo (8-12%), Rojo (<8%)

4. **Riesgos identificados**
   - Lista de `risk_flags` con iconos por severidad
   - Expandibles con detalle y sugerencia de accion

5. **Confianza del avaluo**
   - Barra visual 0-100 con etiqueta: "Alta (78/100)"
   - Tooltip: "Basado en 7 vehiculos comparables y datos de 4 fuentes"

6. **Vehiculos comparables** (tabla interactiva)
   - Tabla con: marca, modelo, ano, km, ciudad, precio venta, fecha, fuente
   - Ordenable por columna
   - Clickable para ver detalle (solo comparables de Mubis)

#### Jerarquia de Informacion

```
┌─────────────────────────────────────────────────────────┐
│  Toyota Corolla 2021 · 45.000 km · Bogotá · Score: 82  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ COMPRA       │  │ VENTA EST.   │  │ MARGEN       │  │
│  │ $68.500.000  │  │ $79.500.000  │  │ $10.750.000  │  │
│  │              │  │              │  │ 15.7% 🟢     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  Confianza: ████████████████░░░░ 78/100                 │
│  Liquidez:  █████████████████░░░ 85/100                 │
│  Días p/venta estimados: 18                             │
│                                                         │
│  ── Rango de Subasta ──                                 │
│  $62.000.000 ◄════════════════► $74.000.000             │
│  Piso                                      Techo        │
│                                                         │
│  ── Riesgos (2) ──                                      │
│  ⚠ SOAT próximo a vencer (2026-04-20)     [-$200.000]  │
│  ⚠ Daño menor de pintura                  [-$350.000]  │
│                                                         │
│  ── Comparables (5) ──                                  │
│  ┌───────┬────────┬──────┬───────┬────────┬──────────┐  │
│  │ Marca │ Modelo │ Año  │ Km    │ Ciudad │ Precio   │  │
│  ├───────┼────────┼──────┼───────┼────────┼──────────┤  │
│  │Toyota │Corolla │ 2021 │38.000 │Bogotá  │$71.000.0 │  │
│  │Toyota │Corolla │ 2020 │52.000 │Bogotá  │$65.500.0 │  │
│  │...    │        │      │       │        │          │  │
│  └───────┴────────┴──────┴───────┴────────┴──────────┘  │
│                                                         │
│  ── Desglose de Precio ──                               │
│  [Expandible: muestra price_breakdown completo]         │
│                                                         │
│  Acción recomendada: SUBASTA ESTÁNDAR                   │
│                                                         │
│  [VER EN SUBASTA]  [AGREGAR A WATCHLIST]                │
└─────────────────────────────────────────────────────────┘
```

#### Puntos de Integracion con Dashboard Existente

| Pagina/Componente Actual | Integracion |
|--------------------------|-------------|
| Lista de subastas activas | Agregar columna/badge "Precio sugerido" y "Margen est." en cada tarjeta de subasta |
| Detalle de subasta | Panel lateral o tab con toda la info de valuacion. CTA: "Ver avaluo completo" |
| Formulario de puja (bid) | Mostrar nota: "Precio sugerido: $68.5M. Tu puja: $X" con indicador de margen resultante |
| Watchlist | Agregar "Margen estimado" como columna en la lista de vehiculos guardados |
| Historial de compras | Comparar precio pagado vs. precio sugerido (analisis de precision retroactivo) |

---

### 12.3 Equipo Interno Mubis (SuperAdmin)

El equipo Mubis necesita visibilidad completa para monitorear, ajustar y mejorar el motor de pricing.

#### Informacion que ve

1. **Vista analitica completa**
   - Todos los campos de `ValuationResponse` sin filtrar
   - Historial de valuaciones por vehiculo (timeline)
   - Grafico de distribucion de precios por marca/modelo
   - Mapa de calor por ciudad

2. **Override manual con justificacion**
   - Formulario para ajustar cualquier precio
   - Campo obligatorio: "Razon del ajuste" (dropdown + texto libre)
   - Opciones de razon: "Datos incorrectos", "Vehiculo especial", "Contexto de mercado", "Solicitud de gerencia", "Otro"
   - Log inmutable de todos los overrides

3. **Trazabilidad de decisiones**
   - Audit trail completo: quien valuo, cuando, con que datos, que fuentes se usaron
   - Diff visual cuando se recalcula (que cambio y por que)
   - Link directo al vehiculo, inspeccion y subasta asociados

4. **Drift monitoring**
   - Grafico de MAE/MAPE por semana
   - Alerta si la precision cae por debajo del umbral
   - Feature importance (que factores pesan mas en los precios actuales)
   - Comparacion reglas vs. mercado real

5. **Dashboard de calidad de datos**
   - Frescura de cada fuente de datos (ultimo sync, % de exito)
   - Cobertura: % de valuaciones automaticas vs. manuales
   - Vehiculos sin suficientes comparables
   - Rate de errores por endpoint

#### Pagina Principal: Dashboard de Pricing (SuperAdmin)

```
┌──────────────────────────────────────────────────────────────┐
│  PRICING ENGINE · Dashboard                  [Último 30d ▼] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│  │Valuaciones │ │ Precision  │ │ Cobertura  │ │ Reviews  │  │
│  │   1.247    │ │ MAE: 8.2%  │ │   91.3%    │ │  8.7%    │  │
│  │  +12% ↑    │ │ Meta: <10% │ │ Meta: >85% │ │Meta:<15% │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │
│                                                              │
│  ── Precisión del Motor (últimos 90 días) ──                 │
│  [Gráfico de línea: MAE real vs. meta por semana]            │
│                                                              │
│  ── Estado de Fuentes de Datos ──                            │
│  MUBIS_HISTORY  ● OK     Fresh    1.247 records   45ms      │
│  FASECOLDA      ● OK     Fresh    8.420 records   210ms     │
│  RUNT           ● OK     Fresh    on-demand       180ms     │
│  TUCARRO        ● WARN   Stale    12.891 records  890ms     │
│                                                              │
│  ── Cola de Revisión Manual (12 pendientes) ──               │
│  [Tabla con vehículos pendientes de revisión, ordenados      │
│   por prioridad. Click para abrir caso.]                     │
│                                                              │
│  ── Últimas Valuaciones ──                                   │
│  [Tabla con las últimas 20 valuaciones, filtrable por        │
│   marca, ciudad, confidence, recommended_action]             │
│                                                              │
│  ── Overrides Recientes ──                                   │
│  [Lista de ajustes manuales con analista, razón, delta]      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Integracion con Paginas Existentes de SuperAdmin

| Pagina Actual | Integracion |
|---------------|-------------|
| Dashboard principal (KPIs) | Agregar tarjeta: "Precision del Pricing" y "Valuaciones hoy" |
| Detalle de vehiculo | Tab "Avaluo" con valuacion completa + historial + boton override |
| Detalle de subasta | Mostrar precio sugerido vs. precio actual de puja. Indicador: "Subasta por encima/debajo del estimado" |
| Listado de inspecciones completadas | Columna "Avaluo generado" (Si/No/Pendiente). Click para ver. |
| Pagina de metricas (Goals) | Integrar metricas de pricing como KPIs adicionales |

---

## 13. HUMAN-IN-THE-LOOP

### 13.1 Triggers para Revision Manual

Cada trigger tiene un codigo, condicion precisa y prioridad asignada automaticamente.

```typescript
interface ManualReviewTrigger {
  code: string;
  condition: string;
  priority: 'P1_URGENT' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  auto_action: 'QUEUE' | 'BLOCK_AUCTION' | 'FLAG_ONLY';
}
```

| Codigo | Condicion | Prioridad | Accion |
|--------|-----------|-----------|--------|
| `LOW_CONFIDENCE` | `confidence_score < 40` | P2_HIGH | QUEUE |
| `HIGH_DOC_RISK` | `document_risk_score > 70` | P1_URGENT | BLOCK_AUCTION |
| `PRICE_ANOMALY` | Precio > 2 desviaciones estandar de comparables | P2_HIGH | QUEUE |
| `VEHICLE_TOO_NEW` | `year >= current_year` (< 1 ano de antiguedad) | P3_MEDIUM | QUEUE |
| `VEHICLE_TOO_OLD` | `year < current_year - 20` (> 20 anos) | P3_MEDIUM | QUEUE |
| `KM_TOO_LOW` | `km < (age_years * 3000)` - sospecha de alteracion | P1_URGENT | BLOCK_AUCTION |
| `KM_TOO_HIGH` | `km > (age_years * 35000)` - uso excesivo | P3_MEDIUM | FLAG_ONLY |
| `PREMIUM_VEHICLE` | Marca en lista premium (Porsche, Land Rover, BMW, Mercedes, Audi, Volvo) | P3_MEDIUM | QUEUE |
| `STRUCTURAL_DAMAGE` | Score de inspeccion de estructura < 40 o flag explicito | P1_URGENT | BLOCK_AUCTION |
| `SINIESTRO` | Vehiculo reportado como siniestrado en RUNT/Fasecolda | P1_URGENT | BLOCK_AUCTION |
| `CONFLICTING_DATA` | Diferencia > 20% entre fuentes de datos para el mismo vehiculo | P2_HIGH | QUEUE |
| `NO_COMPARABLES` | `comparable_vehicles.length === 0` - primer vehiculo de su tipo | P2_HIGH | QUEUE |
| `PRENDA_ACTIVA` | Prenda registrada en RUNT | P1_URGENT | BLOCK_AUCTION |
| `IMPUESTOS_PENDIENTES` | Impuestos no al dia segun RUNT | P2_HIGH | QUEUE |
| `COMPARENDOS_ALTOS` | `comparendos > 5` | P3_MEDIUM | FLAG_ONLY |

**Notas de implementacion**:
- `QUEUE`: El vehiculo entra en cola de revision. La subasta puede publicarse pero con advertencia.
- `BLOCK_AUCTION`: La subasta NO se puede publicar hasta que un analista apruebe.
- `FLAG_ONLY`: La subasta se publica normalmente pero los dealers ven el flag.

### 13.2 Workflow de Revision

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  Valuacion   │     │  Detectar    │     │  Crear entrada en    │
│  calculada   │────>│  triggers    │────>│  cola de revision    │
└──────────────┘     └──────────────┘     └──────────┬───────────┘
                                                      │
                                          ┌───────────▼──────────┐
                                          │  Cola priorizada     │
                                          │  (P1 > P2 > P3 > P4)│
                                          └───────────┬──────────┘
                                                      │
                                          ┌───────────▼──────────┐
                                          │  Analista toma caso  │
                                          │  (auto-assign o      │
                                          │   manual pick)       │
                                          └───────────┬──────────┘
                                                      │
                              ┌────────────┬──────────┼──────────┬────────────┐
                              ▼            ▼          ▼          ▼            ▼
                        ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
                        │ APROBAR  │ │ AJUSTAR  │ │SOLICITAR│ │RECHAZAR│ │ESCALAR │
                        │ precio   │ │ precio   │ │ + datos │ │vehiculo│ │a senior│
                        │ actual   │ │ manual   │ │         │ │        │ │        │
                        └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘ └───┬────┘
                             │            │            │          │          │
                             ▼            ▼            ▼          ▼          ▼
                        ┌─────────────────────────────────────────────────────────┐
                        │  Registrar decision con:                               │
                        │  - analyst_id                                          │
                        │  - action taken                                        │
                        │  - justification (texto obligatorio)                   │
                        │  - original_price vs adjusted_price                    │
                        │  - timestamp                                           │
                        │  - time_spent_seconds                                  │
                        └────────────────────────┬────────────────────────────────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │  Actualizar valuacion   │
                                    │  + Desbloquear subasta  │
                                    │  + Notificar dealer     │
                                    │  + Log en AuditEvent    │
                                    └─────────────────────────┘
```

### 13.3 Modelo de Datos para Revision

```typescript
// Nuevo modelo Prisma (PENDIENTE DE IMPLEMENTACION)

// schema.prisma additions:

// enum ReviewStatus {
//   PENDING
//   IN_PROGRESS
//   APPROVED
//   ADJUSTED
//   REJECTED
//   ESCALATED
//   DATA_REQUESTED
// }

// model ValuationReview {
//   id                String       @id @default(cuid())
//   tenantId          String
//   vehicleId         String
//   valuationId       String       // ID de la valuacion original
//   triggers          String[]     // Codigos de triggers que activaron la revision
//   priority          String       // P1_URGENT, P2_HIGH, P3_MEDIUM, P4_LOW
//   status            ReviewStatus @default(PENDING)
//   assignedTo        String?      // ID del analista
//   assignedAt        DateTime?
//   originalPrice     BigInt       // buy_now_price original
//   adjustedPrice     BigInt?      // Precio ajustado (si aplica)
//   action            String?      // APPROVE, ADJUST, REJECT, ESCALATE, REQUEST_DATA
//   justification     String?      // Texto libre del analista
//   justificationCategory String?  // "Datos incorrectos", "Vehiculo especial", etc.
//   timeSpentSeconds  Int?
//   resolvedAt        DateTime?
//   escalatedTo       String?      // ID del analista senior
//   createdAt         DateTime     @default(now())
//   updatedAt         DateTime     @updatedAt
// }
```

### 13.4 Gestion de la Cola

#### Priorizacion

La cola se ordena por un **score de prioridad compuesto**:

```
priority_score = (priority_base * 100) + age_in_hours + (block_multiplier * 50)
```

Donde:
- `priority_base`: P1=4, P2=3, P3=2, P4=1
- `age_in_hours`: Horas desde que entro en cola (incentiva resolver los mas viejos)
- `block_multiplier`: 1 si la accion es `BLOCK_AUCTION`, 0 si no

#### SLAs

| Prioridad | SLA Respuesta | SLA Resolucion | Escalacion |
|-----------|---------------|----------------|------------|
| P1_URGENT | 30 minutos | 2 horas | Automatica a lead si > 1h sin asignar |
| P2_HIGH | 2 horas | 8 horas | Automatica a lead si > 4h sin asignar |
| P3_MEDIUM | 8 horas | 24 horas | Notificacion a lead si > 12h sin asignar |
| P4_LOW | 24 horas | 48 horas | Notificacion semanal de pendientes |

#### Reglas de Escalacion

1. Si un caso P1 no se asigna en 30 min → notificacion push + email al lead del equipo
2. Si un caso lleva > 50% de su SLA sin resolverse → notificacion al analista asignado
3. Si un analista tiene > 10 casos abiertos → redistribuir automaticamente
4. Si se supera el SLA → marcar en rojo en dashboard + alerta al gerente de operaciones

#### Descripcion del Panel de Cola (SuperAdmin)

```
┌──────────────────────────────────────────────────────────────────┐
│  REVISIONES MANUALES                    [12 pendientes · 3 P1]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filtros: [Prioridad ▼] [Estado ▼] [Analista ▼] [Trigger ▼]    │
│                                                                  │
│  ┌──────┬────────────────────┬──────┬──────┬─────────┬────────┐  │
│  │Prior.│ Vehículo           │Trigger│Edad  │Analista │Acción  │  │
│  ├──────┼────────────────────┼──────┼──────┼─────────┼────────┤  │
│  │🔴 P1 │Porsche Cayenne 2023│PRENDA│ 15m  │ —       │[Tomar] │  │
│  │🔴 P1 │Mazda 3 2019        │KM_LOW│ 42m  │Ana G.  │[Ver]   │  │
│  │🔴 P1 │Chevrolet Spark 2018│SINIES│  2h  │ —       │[Tomar] │  │
│  │🟡 P2 │Toyota Hilux 2020   │CONFID│  3h  │Juan M. │[Ver]   │  │
│  │🟡 P2 │Renault Duster 2021 │CONFL │  5h  │ —       │[Tomar] │  │
│  │🟢 P3 │BMW X3 2022         │PREMIU│  8h  │ —       │[Tomar] │  │
│  │...   │                    │      │      │         │        │  │
│  └──────┴────────────────────┴──────┴──────┴─────────┴────────┘  │
│                                                                  │
│  ── Métricas de la Cola ──                                       │
│  Tiempo promedio de resolución: 3.2h                             │
│  % dentro de SLA: 94%                                            │
│  Reviews hoy: 8 aprobados, 3 ajustados, 1 rechazado             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 13.5 Vista de Detalle de Revision

Cuando el analista abre un caso:

```
┌──────────────────────────────────────────────────────────────────┐
│  REVISIÓN #VR-2026-0342                          [P1 · PRENDA]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Vehículo ──                                                  │
│  Porsche Cayenne 2023 · 12.000 km · Bogotá                      │
│  Placa: [oculta, visible con click] · Score: 75                  │
│                                                                  │
│  ── Valuación Original ──                                        │
│  Compra sugerida: $285.000.000                                   │
│  Rango subasta: $260.000.000 - $310.000.000                      │
│  Confianza: 35/100 (BAJA)                                        │
│                                                                  │
│  ── Triggers Activos ──                                          │
│  🔴 PRENDA_ACTIVA: Prenda registrada en RUNT                    │
│  🟡 PREMIUM_VEHICLE: Marca premium requiere revisión             │
│  🟡 LOW_CONFIDENCE: Confianza < 40                               │
│                                                                  │
│  ── Fuentes de Datos Consultadas ──                              │
│  RUNT: OK (prenda detectada, SOAT vigente)                       │
│  FASECOLDA: OK (precio ref: $320.000.000)                        │
│  MUBIS_HISTORY: 1 comparable (muestra insuficiente)              │
│  TUCARRO: 3 similares encontrados ($290M - $340M)                │
│                                                                  │
│  ── Comparables Detallados ──                                    │
│  [Tabla expandida con todos los comparables + links]             │
│                                                                  │
│  ── Desglose de Precio ──                                        │
│  [price_breakdown completo con cada factor]                      │
│                                                                  │
│  ══════════════════════════════════════════════════════════════   │
│  DECISIÓN DEL ANALISTA                                           │
│  ══════════════════════════════════════════════════════════════   │
│                                                                  │
│  Acción: (●) Aprobar  (○) Ajustar  (○) Rechazar                │
│          (○) Solicitar más datos  (○) Escalar                    │
│                                                                  │
│  Precio ajustado: [___________] (solo si "Ajustar")              │
│                                                                  │
│  Categoría: [Vehículo con prenda ▼]                              │
│                                                                  │
│  Justificación:                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ Prenda activa confirmada en RUNT. El propietario debe    │    │
│  │ levantar la prenda antes de proceder. Bloquear subasta.  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [CONFIRMAR DECISIÓN]                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 13.6 Feedback Loop (V3)

En V3, las decisiones de los analistas alimentan el modelo de ML:

1. **Datos de entrenamiento**: Cada override genera un par `(features, precio_ajustado)` que se usa como dato de entrenamiento supervisado.
2. **Calibracion de triggers**: Si un trigger genera > 80% de aprobaciones sin ajuste, su umbral se ajusta automaticamente (o se elimina).
3. **Deteccion de patrones**: Si un analista siempre ajusta el mismo tipo de vehiculo en la misma direccion, se genera una regla automatica candidata.

---

## 14. METRICAS

### 14.1 Metricas Tecnicas

#### 14.1.1 MAE (Mean Absolute Error)

| Atributo | Valor |
|----------|-------|
| **Definicion** | Error absoluto medio entre el precio sugerido (`buy_now_price`) y el precio final de cierre de la subasta (`Auction.current_bid` cuando `status = ENDED` y `winnerId != null`) |
| **Formula** | `MAE = (1/n) * Σ|buy_now_price_i - final_price_i|` |
| **Meta MVP** | < 15% del precio final (en COP) |
| **Meta V2** | < 10% |
| **Meta V3** | < 7% |
| **Frecuencia** | Diaria (rolling 30 dias), semanal (reporte), mensual (revision) |
| **Alerta amarilla** | MAE > 12% sostenido por 7 dias |
| **Alerta roja** | MAE > 18% sostenido por 3 dias |
| **Nota** | Solo se mide contra subastas que cerraron con ganador. Excluir subastas sin pujas. |

#### 14.1.2 MAPE (Mean Absolute Percentage Error)

| Atributo | Valor |
|----------|-------|
| **Definicion** | Error porcentual absoluto medio. Normaliza el MAE para comparar entre rangos de precios. |
| **Formula** | `MAPE = (100/n) * Σ|buy_now_price_i - final_price_i| / final_price_i` |
| **Meta MVP** | < 15% |
| **Meta V2** | < 10% |
| **Meta V3** | < 7% |
| **Frecuencia** | Semanal |
| **Alerta amarilla** | MAPE > 13% |
| **Alerta roja** | MAPE > 20% |
| **Segmentacion** | Medir por marca, por rango de precio, por ciudad, por antiguedad |

#### 14.1.3 Cobertura de Valuaciones Automaticas

| Atributo | Valor |
|----------|-------|
| **Definicion** | Porcentaje de vehiculos que reciben valuacion automatica sin necesidad de revision manual |
| **Formula** | `cobertura = (valuaciones_auto / valuaciones_totales) * 100` |
| **Meta MVP** | > 75% |
| **Meta V2** | > 85% |
| **Meta V3** | > 92% |
| **Frecuencia** | Diaria |
| **Alerta amarilla** | < 70% por 3 dias |
| **Alerta roja** | < 60% por 1 dia |

#### 14.1.4 Latencia de Valuacion

| Atributo | Valor |
|----------|-------|
| **Definicion** | Tiempo de procesamiento del endpoint de valuacion, desde request hasta response |
| **Formula** | Percentil del `processing_time_ms` en `ValuationMetadata` |
| **Meta P50** | < 500ms (valuacion instant), < 2s (valuacion full) |
| **Meta P95** | < 1.5s (instant), < 5s (full) |
| **Meta P99** | < 3s (instant), < 10s (full) |
| **Frecuencia** | Tiempo real (dashboard), resumen diario |
| **Alerta amarilla** | P95 > 3s (instant) o > 8s (full) |
| **Alerta roja** | P95 > 5s (instant) o > 15s (full) |

#### 14.1.5 Frescura de Datos por Fuente

| Atributo | Valor |
|----------|-------|
| **Definicion** | Tiempo desde la ultima sincronizacion exitosa de cada fuente de datos |
| **Formula** | `freshness = now() - last_successful_sync` |
| **Umbrales** | MUBIS_HISTORY: tiempo real. FASECOLDA: < 30 dias. RUNT: on-demand. TUCARRO: < 48h. |
| **Frecuencia** | Cada hora (check automatico) |
| **Alerta amarilla** | Fuente > 2x su umbral de frescura |
| **Alerta roja** | Fuente > 5x su umbral o status DOWN |

#### 14.1.6 Model Drift Detection

| Atributo | Valor |
|----------|-------|
| **Definicion** | Degradacion progresiva de la precision del modelo por cambios en la distribucion de datos |
| **Formula** | Comparar distribucion de features (KS test) y MAE de la ultima semana vs. ventana de referencia (90 dias) |
| **Meta** | p-value del KS test > 0.05 (no hay drift significativo) |
| **Frecuencia** | Semanal |
| **Alerta amarilla** | p-value < 0.05 en 1+ features |
| **Alerta roja** | p-value < 0.01 en 2+ features o MAE aumenta > 3pp vs. referencia |
| **Accion** | Trigger para re-entrenar modelo (V3) o revisar reglas (MVP/V2) |

#### 14.1.7 Feature Importance Tracking

| Atributo | Valor |
|----------|-------|
| **Definicion** | Seguimiento de cuales factores tienen mayor impacto en el precio final |
| **Formula** | MVP: peso relativo de cada factor en `price_breakdown`. V3: SHAP values del modelo ML. |
| **Meta** | Sin meta numerica; es para interpretabilidad |
| **Frecuencia** | Mensual |
| **Accion** | Si un factor tiene importancia < 1%, evaluar si vale la pena mantenerlo |

---

### 14.2 Metricas de Negocio

#### 14.2.1 Conversion a Inspeccion

| Atributo | Valor |
|----------|-------|
| **Definicion** | Porcentaje de consumidores que, despues de recibir un precio estimado (valuacion instantanea), agendan una inspeccion |
| **Formula** | `conversion = (inspecciones_agendadas / valuaciones_instant) * 100` |
| **Meta MVP** | > 20% |
| **Meta V2** | > 30% |
| **Frecuencia** | Semanal |
| **Alerta amarilla** | < 15% por 2 semanas |
| **Alerta roja** | < 10% por 1 semana |
| **Segmentacion** | Por ciudad, por rango de precio, por marca |

#### 14.2.2 Conversion a Oferta Aceptada

| Atributo | Valor |
|----------|-------|
| **Definicion** | Porcentaje de subastas que terminan con un ganador (oferta aceptada por el vendedor) respecto al total de subastas publicadas |
| **Formula** | `conversion = (subastas con winnerId != null / subastas totales ENDED) * 100` |
| **Meta MVP** | > 55% |
| **Meta V2** | > 65% |
| **Frecuencia** | Semanal |
| **Alerta amarilla** | < 50% por 2 semanas |
| **Alerta roja** | < 40% por 1 semana |
| **Correlacion** | Cruzar con precision del starting_price. Si starting_price esta muy alto, las subastas no reciben pujas. |

#### 14.2.3 Margen Bruto por Operacion

| Atributo | Valor |
|----------|-------|
| **Definicion** | Diferencia entre el precio al que el dealer compra (subasta) y el precio al que revende (estimado), menos el corretaje Mubis |
| **Formula** | `margen = expected_market_price - final_auction_price - 250.000` |
| **Meta** | Margen promedio > 12% para que los dealers encuentren la plataforma atractiva |
| **Frecuencia** | Mensual (requiere tracking de reventa, disponible V2+) |
| **Alerta amarilla** | Margen promedio < 10% |
| **Alerta roja** | Margen promedio < 7% (dealers dejaran de comprar) |
| **Nota** | En MVP solo se puede estimar. En V2+ se puede medir si dealers reportan precio de reventa. |

#### 14.2.4 Tiempo Promedio a Venta

| Atributo | Valor |
|----------|-------|
| **Definicion** | Dias desde que el vehiculo entra a la plataforma (registro) hasta que se cierra la transaccion |
| **Formula** | `tiempo = Transaction.completedAt - Vehicle.createdAt` (en dias) |
| **Meta** | < 14 dias promedio (registro → inspeccion → subasta 48h → decision → pago) |
| **Frecuencia** | Semanal |
| **Alerta amarilla** | > 21 dias promedio |
| **Alerta roja** | > 30 dias promedio |
| **Descomposicion** | Medir cada etapa: registro→inspeccion, inspeccion→subasta, subasta→decision, decision→pago |

#### 14.2.5 Porcentaje de Reviews Manuales

| Atributo | Valor |
|----------|-------|
| **Definicion** | Porcentaje de valuaciones que requieren revision humana antes de poder proceder a subasta |
| **Formula** | `pct_review = (valuaciones con recommended_action = MANUAL_REVIEW / valuaciones_totales) * 100` |
| **Meta MVP** | < 25% |
| **Meta V2** | < 15% |
| **Meta V3** | < 8% |
| **Frecuencia** | Diaria |
| **Alerta amarilla** | > 30% por 3 dias |
| **Alerta roja** | > 40% por 1 dia |
| **Accion** | Si es alto, revisar triggers: puede que algun umbral este demasiado agresivo |

#### 14.2.6 Satisfaccion de Dealers con Precios Sugeridos

| Atributo | Valor |
|----------|-------|
| **Definicion** | Medida indirecta: frecuencia con la que dealers pujan cerca del precio sugerido (dentro de +/- 10%) |
| **Formula** | `satisfaction_proxy = (pujas dentro del rango sugerido / pujas totales) * 100` |
| **Meta** | > 60% de pujas dentro del rango sugerido |
| **Frecuencia** | Mensual |
| **Alerta amarilla** | < 50% |
| **Alerta roja** | < 35% |
| **Complemento V2** | Encuesta NPS trimestral a dealers: "Que tan util es el precio sugerido?" (1-10) |

#### 14.2.7 Uplift por Dealer Matching (V3)

| Atributo | Valor |
|----------|-------|
| **Definicion** | Incremento en el precio final de subasta cuando se invita a dealers con alta probabilidad de interes vs. broadcast general |
| **Formula** | `uplift = (avg_price_matched - avg_price_broadcast) / avg_price_broadcast * 100` |
| **Meta V3** | > 5% de uplift |
| **Frecuencia** | Mensual |
| **Alerta** | No aplica hasta V3 |
| **Nota** | Requiere A/B testing: grupo control (broadcast) vs. grupo tratamiento (matched) |

#### 14.2.8 Revenue por Vehiculo Valuado

| Atributo | Valor |
|----------|-------|
| **Definicion** | Ingreso promedio que genera Mubis por cada vehiculo que pasa por el pricing engine (considerando que no todos se venden) |
| **Formula** | `revenue_per_valuation = (total_brokerage_fees_periodo / total_valuaciones_periodo)` |
| **Meta MVP** | > $50.000 COP por valuacion (asumiendo ~20% de conversion a transaccion con fee de $250.000) |
| **Meta V2** | > $75.000 COP |
| **Frecuencia** | Mensual |
| **Alerta amarilla** | < $35.000 COP |
| **Alerta roja** | < $20.000 COP |

---

### 14.3 Dashboard de Metricas (Resumen)

```
┌──────────────────────────────────────────────────────────────────┐
│  PRICING ENGINE · Métricas                   [Último 30d ▼]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Técnicas ──                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ MAE        │ │ Cobertura  │ │ P50 Lat.   │ │ Cache Hit    │  │
│  │   8.2%     │ │   91.3%    │ │   420ms    │ │   67%        │  │
│  │ Meta: <10% │ │ Meta: >85% │ │ Meta:<500ms│ │              │  │
│  │ ✅ OK      │ │ ✅ OK      │ │ ✅ OK      │ │              │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
│                                                                  │
│  ── De Negocio ──                                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Conv.      │ │ Conv.      │ │ Margen     │ │ Rev/         │  │
│  │ Inspección │ │ Oferta     │ │ Dealer     │ │ Valuación    │  │
│  │   24%      │ │   58%      │ │   14.2%    │ │  $62.000     │  │
│  │ Meta: >20% │ │ Meta: >55% │ │ Meta: >12% │ │ Meta:>$50k   │  │
│  │ ✅ OK      │ │ ✅ OK      │ │ ✅ OK      │ │ ✅ OK        │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
│                                                                  │
│  [Gráfico: Tendencia de MAE últimos 90 días]                     │
│  [Gráfico: Conversiones por semana]                              │
│  [Tabla: Métricas por marca/modelo (top 10)]                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 14.4 Implementacion de Tracking

Para el MVP, las metricas se calculan con queries programados (cron jobs en NestJS):

```typescript
// pricing-metrics.service.ts (PENDIENTE DE IMPLEMENTACION)

interface MetricSnapshot {
  metric: string;
  value: number;
  period: string;           // "2026-03-25" | "2026-W13" | "2026-03"
  segment?: string;         // "toyota" | "bogota" | "premium"
  status: 'OK' | 'WARNING' | 'CRITICAL';
  threshold_warning: number;
  threshold_critical: number;
  timestamp: string;
}

// Cron: cada hora para metricas tecnicas, diario para metricas de negocio
// Almacenar en tabla MetricSnapshot (nueva)
// Exponer via GET /api/v1/pricing/metrics (SUPERADMIN only)
```

---

> **FIN de Secciones 9-14**
> Siguiente documento: Secciones 15+ (Seguridad, Infraestructura, Plan de Implementacion)
