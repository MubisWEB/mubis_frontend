# Pricing Engine - Negocio, Arquitectura y Datos

> Documento de diseno tecnico v1.0 — Mubis Pricing Engine
> Fecha: 2026-03-25
> Autores: Equipo de Producto + Ingenieria

---

## 1. RESUMEN EJECUTIVO

### Que resuelve el Pricing Engine

El sistema de pricing actual de Mubis opera con precios base hardcodeados por marca (`BRAND_BASE`), depreciacion lineal por anio y kilometraje, y un ajuste basico por score de inspeccion. Esto genera tres problemas criticos:

1. **Imprecision**: Un BMW Serie 3 2020 y un BMW X5 2020 reciben el mismo precio base (280M COP). No se distingue por modelo, version, motor ni equipamiento.
2. **Desconexion del mercado**: Los precios de referencia solo consideran subastas internas pasadas. No se consultan fuentes externas (Fasecolda, Revista Motor, TuCarro) ni se detectan tendencias de oferta/demanda.
3. **Cero visibilidad documental/legal**: Un vehiculo con prenda activa, SOAT vencido o siniestro total recibe la misma valuacion que uno limpio.

### Por que es estrategico para Mubis

Mubis opera en un mercado C2B donde la **confianza en el precio** determina si el consumidor acepta la oferta y si el dealer participa en la subasta. Un pricing impreciso causa:

- **Consumidores que rechazan**: Si el precio sugerido esta por debajo del mercado, el vendedor no sube su vehiculo o rechaza la oferta ganadora.
- **Dealers que no pujan**: Si el precio de salida esta inflado, los concesionarios no participan y la subasta queda desierta.
- **Margen erosionado**: Sin datos de margen potencial, los dealers pujan a ciegas y Mubis no puede optimizar su fee de corretaje.

### Impacto en metricas clave

| Metrica | Estado actual | Objetivo con Pricing Engine |
|---|---|---|
| Tasa de conversion (vehiculo subido → subasta cerrada) | ~35% estimado | 55-65% |
| Tiempo promedio de decision del vendedor | 36h | < 12h |
| Subastas desiertas (0 pujas) | ~20% | < 5% |
| Precision del precio sugerido vs. cierre real | +-30% | +-10% |
| Confianza del dealer en precio sugerido | Baja (pricing generico) | Alta (datos de mercado) |
| Deteccion de vehiculos problematicos pre-subasta | Manual | Automatica |

### Diferenciador competitivo: "Blue Book Colombiano"

Ninguna plataforma en Colombia ofrece hoy una valuacion vehicular en tiempo real que combine:

- Datos transaccionales reales (subastas cerradas en Mubis)
- Referencias de mercado (Fasecolda, Revista Motor, TuCarro)
- Estado documental y legal (RUNT, SOAT, tecnomecanica, prendas, comparendos)
- Score de inspeccion fisica (perito Mubis)
- Demanda por ciudad y segmento (cuantos dealers quieren ese tipo de vehiculo)

Este motor de pricing posiciona a Mubis como la **fuente de verdad del precio de vehiculos usados en Colombia**, creando un efecto de red: mas datos → mejor precio → mas usuarios → mas datos.

---

## 2. CASOS DE USO

### CU-01: Consumidor sube placa y km — precio estimado instantaneo

| Campo | Detalle |
|---|---|
| **Actor** | Consumidor (vendedor del vehiculo) |
| **Trigger** | El consumidor ingresa la placa y el kilometraje en la landing page o app |
| **Flujo del sistema** | 1. Recibir placa y km via API publica (no requiere auth). 2. Consultar cache Redis por placa — si existe valuacion < 24h, retornar cache. 3. Si no hay cache: consultar RUNT (o tabla interna) para obtener marca, modelo, anio, cilindraje, combustible, ciudad de registro. 4. Consultar tabla `vehicle_price_references` para Fasecolda y Revista Motor del modelo/anio. 5. Consultar `vehicle_market_listings` para precios promedio en TuCarro del mismo modelo +-1 anio. 6. Ejecutar Pricing Core: calcular precio intrinseco, ponderar con mercado, aplicar ajuste regional (ciudad). 7. Guardar resultado en `valuation_result` y cache Redis (TTL 24h). 8. Retornar precio estimado con rango y confianza. |
| **Output esperado** | `{ estimatedPrice: 82_000_000, minPrice: 70_000_000, maxPrice: 94_000_000, confidence: "medium", source: "fasecolda+mercado", disclaimer: "Precio estimado sujeto a inspeccion" }` |
| **Notas** | Sin inspeccion, la confianza nunca es "high". El precio no incluye ajuste por estado fisico. Este endpoint es publico y debe tener rate limiting (10 req/min por IP). |

### CU-02: Dealer abre unidad en subasta — precio recomendado de compra y margen potencial

| Campo | Detalle |
|---|---|
| **Actor** | Dealer / Recomprador (comprador en la subasta) |
| **Trigger** | El dealer abre el detalle de una subasta activa |
| **Flujo del sistema** | 1. Obtener `vehicleId` y `auctionId` de la subasta. 2. Cargar `valuation_result` mas reciente del vehiculo (debe existir, calculado al publicar subasta). 3. Consultar `vehicle_market_listings` para precio promedio de reventa del modelo en TuCarro/retail. 4. Calcular margen potencial: `precioReventaEstimado - precioSubastaActual - costoReacondicionamiento`. 5. El costo de reacondicionamiento se estima como `(100 - scoreGlobal) * factorCosto` basado en historico de reparaciones. 6. Retornar recomendacion: precio maximo al que deberia pujar para mantener margen >= 15%. |
| **Output esperado** | `{ suggestedMaxBid: 78_000_000, estimatedResalePrice: 95_000_000, estimatedReconditioningCost: 3_500_000, potentialMargin: 13_500_000, marginPercent: 14.2, recommendation: "COMPRAR_CON_PRECAUCION" }` |
| **Notas** | La recomendacion es orientativa. Niveles: `COMPRAR`, `COMPRAR_CON_PRECAUCION`, `NO_RECOMENDADO`. |

### CU-03: Vehiculo con data incompleta — revision manual

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (automatico) + Operador Mubis (manual) |
| **Trigger** | Durante la fase de Normalizacion, el sistema detecta campos faltantes o inconsistentes |
| **Flujo del sistema** | 1. El modulo de Normalizacion valida campos obligatorios: marca, modelo, anio, km, placa. 2. Si faltan campos o hay inconsistencias (ej: anio > anio actual, km < 0, marca no reconocida, placa con formato invalido): crear registro en `anomaly_flags` con tipo `DATA_INCOMPLETA` o `DATA_INCONSISTENTE`. 3. El estado del vehiculo se mantiene en `PENDING_INSPECTION` y no avanza a subasta. 4. Se envia notificacion al equipo de operaciones (via Socket.io al dashboard SuperAdmin). 5. El operador revisa, corrige manualmente o contacta al consumidor para completar datos. 6. Una vez corregido, se re-ejecuta el pipeline de valuacion. |
| **Output esperado** | `{ anomalyId: "clx...", vehicleId: "clx...", type: "DATA_INCOMPLETA", fields: ["cilindraje", "combustible"], severity: "MEDIUM", requiresManualReview: true, assignedTo: null }` |
| **Notas** | El sistema debe tolerar datos parciales y generar valuaciones con confianza `low` cuando sea posible, en vez de bloquear completamente. |

### CU-04: Vehiculo con dano estructural o alerta documental — descarta o baja score

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (automatico) al completarse la inspeccion o al consultarse el estado documental |
| **Trigger** | El perito completa la inspeccion con score < 40, o el modulo de Enriquecimiento detecta alerta documental (prenda, siniestro, comparendos graves) |
| **Flujo del sistema** | 1. **Alerta por inspeccion**: Si `scoreGlobal < 40` o si la categoria "estructura" del JSON `scores` tiene valor < 30: crear `anomaly_flags` con tipo `DANO_ESTRUCTURAL`, severidad `HIGH`. Reducir precio sugerido en 40-60% automaticamente. Si `scoreGlobal < 20`: marcar vehiculo como `NO_SUBASTABLE` y notificar al equipo. 2. **Alerta documental**: Si se detecta prenda activa o leasing vigente: crear `anomaly_flags` con tipo `PRENDA_ACTIVA`. El vehiculo NO puede subastarse hasta que se resuelva (bloqueo duro). Si SOAT vencido o tecnomecanica vencida: crear flag con severidad `MEDIUM`. El vehiculo puede subastarse pero se muestra advertencia al dealer. Si hay siniestro total registrado: crear flag con severidad `CRITICAL`. Vehiculo bloqueado. 3. Registrar todo en `pricing_audit_log` con la decision tomada y la razon. |
| **Output esperado** | `{ blocked: true, reason: "PRENDA_ACTIVA", anomalyFlags: [{ type: "PRENDA_ACTIVA", severity: "CRITICAL", detail: "Prenda vigente registrada en RUNT - Banco XYZ" }], action: "BLOCKED_FROM_AUCTION" }` |
| **Notas** | Las alertas documentales requieren integracion con RUNT (fase 2). En fase 1, el estado documental se ingresa manualmente o se extrae del JSON `documentation` del vehiculo. |

### CU-05: Vehiculo de alta rotacion — push a dealers correctos

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (automatico) al publicar una subasta |
| **Trigger** | El vehiculo tiene un perfil de alta demanda segun datos historicos |
| **Flujo del sistema** | 1. Al publicar la subasta, el Pricing Core calcula un `demandScore` (0-100) basado en: numero de pujas promedio en subastas similares (misma marca/modelo +-2 anios), tasa de cierre exitoso, tiempo promedio hasta primera puja. 2. Si `demandScore >= 70`: clasificar como "alta rotacion". 3. Consultar `dealer_bid` historico para identificar dealers que mas pujan por ese segmento (marca + rango de precio + ciudad). 4. Generar notificaciones push dirigidas a esos dealers especificos con la subasta. 5. Opcionalmente: asignar la subasta a un "carrusel destacado" en el feed del dealer. 6. Registrar en `pricing_audit_log` la clasificacion y los dealers notificados. |
| **Output esperado** | `{ demandScore: 85, classification: "ALTA_ROTACION", targetDealers: ["dealer1_id", "dealer2_id", "dealer3_id"], notificationsSent: 3, auctionHighlighted: true }` |
| **Notas** | El `demandScore` se recalcula en batch nocturno para todos los segmentos activos. La clasificacion se almacena en `pricing_features`. |

### CU-06: Anomalia de precio detectada — alerta al equipo

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (deteccion automatica) + Equipo de operaciones Mubis |
| **Trigger** | El Pricing Core detecta una discrepancia significativa entre el precio calculado y los datos de referencia, o un patron inusual en pujas |
| **Flujo del sistema** | 1. **Anomalia pre-subasta**: Si la valuacion intrinseca difiere > 25% de las referencias de mercado (Fasecolda/TuCarro): crear `anomaly_flags` con tipo `PRECIO_ANOMALO`. Si el vehiculo tiene < 3 comparables en el mercado y el precio base es > 200M COP: flag `PRECIO_SIN_REFERENCIA` con severidad `MEDIUM`. 2. **Anomalia durante subasta**: Si la puja actual supera el `maxPrice` de la valuacion en > 20%: flag `SOBREPUJA_DETECTADA`. Si la puja actual esta < 50% del `minPrice`: flag `SUBPUJA_DETECTADA`. 3. Para todas las anomalias: enviar notificacion en tiempo real al dashboard SuperAdmin via Socket.io. Registrar en `pricing_audit_log`. El operador puede: confirmar precio (override manual), ajustar rango, pausar subasta, o contactar al dealer/consumidor. |
| **Output esperado** | `{ anomalyId: "clx...", type: "SOBREPUJA_DETECTADA", auctionId: "clx...", currentBid: 150_000_000, valuationMax: 110_000_000, deviationPercent: 36.4, severity: "HIGH", alertSentTo: ["superadmin_dashboard"], requiresAction: true }` |
| **Notas** | Las anomalias no bloquean la subasta automaticamente (excepto documentales). Son alertas para revision humana. El sistema debe aprender de los overrides manuales para calibrar umbrales. |

### CU-07: Actualizacion nocturna de referencias de mercado

| Campo | Detalle |
|---|---|
| **Actor** | Sistema (job programado) |
| **Trigger** | Cron job diario a las 02:00 AM COT |
| **Flujo del sistema** | 1. Job Bull/BullMQ `update-market-references` se ejecuta. 2. Para cada combinacion activa marca/modelo/anio (vehiculos en plataforma o subastados en ultimos 90 dias): scrape o consultar API de TuCarro para precios promedio de venta. Consultar tabla de Fasecolda (importacion manual periodica o API si disponible). Consultar tabla de Revista Motor (importacion manual). 3. Actualizar registros en `vehicle_market_listings` y `vehicle_price_references`. 4. Recalcular `pricing_features` para cada segmento. 5. Invalidar cache Redis de valuaciones afectadas (vehiculos con valuacion > 24h cuyo segmento cambio > 5%). 6. Generar reporte de cambios significativos y enviar al equipo. |
| **Output esperado** | Log de ejecucion con: segmentos actualizados, precios que cambiaron > 5%, errores de scraping, tiempo de ejecucion. |
| **Notas** | El scraping de TuCarro debe ser resiliente a cambios de estructura HTML. Usar rate limiting para no ser bloqueado. Fase 1: importacion manual de CSVs para Fasecolda y Revista Motor. |

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Diagrama logico

```
                                    ┌─────────────────────────────────────────────────┐
                                    │              PRICING ENGINE                      │
                                    │         (Modular Monolith - NestJS)              │
  ┌──────────┐                      │                                                  │
  │ Consumer │─── POST /pricing ───►│  ┌─────────────┐    ┌────────────────┐           │
  │   App    │    /estimate         │  │  INGESTION   │───►│ NORMALIZATION  │           │
  └──────────┘                      │  │              │    │                │           │
                                    │  │ - Placa+KM   │    │ - Validar      │           │
  ┌──────────┐                      │  │ - VehicleId  │    │ - Limpiar      │           │
  │ Dealer   │─── GET /pricing ────►│  │ - Manual CSV │    │ - Mapear marca │           │
  │   App    │    /valuation/:id    │  └──────┬───────┘    └───────┬────────┘           │
  └──────────┘                      │         │                    │                    │
                                    │         ▼                    ▼                    │
  ┌──────────┐                      │  ┌─────────────────────────────────────┐          │
  │SuperAdmin│─── GET /pricing ────►│  │          ENRICHMENT                 │          │
  │Dashboard │    /anomalies        │  │                                     │          │
  └──────────┘                      │  │  ┌───────────┐  ┌────────────────┐  │          │
                                    │  │  │ Inspection│  │  Market Data   │  │          │
  ┌──────────┐                      │  │  │  Scores   │  │ (Fasecolda,    │  │          │
  │  Cron    │─── Bull Job ────────►│  │  │           │  │  RevMotor,     │  │          │
  │  02:00   │    update-refs       │  │  └─────┬─────┘  │  TuCarro)      │  │          │
  └──────────┘                      │  │        │        └───────┬────────┘  │          │
                                    │  │  ┌─────┴────┐  ┌───────┴────────┐  │          │
                                    │  │  │  Doc     │  │  Internal      │  │          │
                                    │  │  │  Status  │  │  Auction       │  │          │
                                    │  │  │ (RUNT)   │  │  History       │  │          │
                                    │  │  └─────┬────┘  └───────┬────────┘  │          │
                                    │  └────────┼───────────────┼──────────┘          │
                                    │           ▼               ▼                      │
                                    │  ┌──────────────────────────────────┐             │
                                    │  │         PRICING CORE             │             │
                                    │  │                                  │             │
                                    │  │  1. Precio base (modelo+version)│             │
                                    │  │  2. Depreciacion (anio+km)      │             │
                                    │  │  3. Ajuste inspeccion (score)   │             │
                                    │  │  4. Ajuste documental (flags)   │             │
                                    │  │  5. Ponderacion mercado externo │             │
                                    │  │  6. Ajuste regional (ciudad)    │             │
                                    │  │  7. Ajuste demanda (rotacion)   │             │
                                    │  │  8. Anomaly detection           │             │
                                    │  │                                  │             │
                                    │  │  Output: ValuationResult         │             │
                                    │  └──────────────┬───────────────────┘             │
                                    │                 │                                 │
                                    │                 ▼                                 │
                                    │  ┌──────────────────────────────────┐             │
                                    │  │         SERVING API              │             │
                                    │  │                                  │             │
                                    │  │  - REST endpoints               │             │
                                    │  │  - Socket.io (anomaly alerts)   │             │
                                    │  │  - Redis cache                  │             │
                                    │  │  - Audit logging                │             │
                                    │  └──────────────────────────────────┘             │
                                    └─────────────────────────────────────────────────┘
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ▼                   ▼                   ▼
                              ┌──────────┐      ┌──────────────┐    ┌──────────┐
                              │PostgreSQL│      │    Redis      │    │ Bull/    │
                              │ (Prisma) │      │   Cache +     │    │ BullMQ   │
                              │          │      │   Pub/Sub     │    │ (Jobs)   │
                              └──────────┘      └──────────────┘    └──────────┘
```

### 3.2 Modulos principales

#### Modulo 1: Ingestion (`PricingIngestionModule`)

**Responsabilidad**: Recibir datos de entrada de multiples fuentes y normalizar la solicitud.

| Fuente de entrada | Formato | Frecuencia |
|---|---|---|
| API publica (placa + km) | REST POST | Realtime, on-demand |
| API interna (vehicleId) | REST POST | Realtime, al publicar subasta |
| Importacion CSV de referencias | Upload file | Manual, mensual |
| Scraping TuCarro | Bull Job | Batch, diario 02:00 AM |
| Tablas Fasecolda/RevMotor | CSV Import | Manual, cuando se publica nueva edicion |

**Componentes**:
- `PricingIngestionController` — endpoints REST
- `PlacaLookupService` — resolucion placa → datos tecnicos (RUNT o tabla interna)
- `CsvImportService` — parsing y validacion de CSVs de referencia
- `MarketScraperService` — scraping de TuCarro (Bull job)

#### Modulo 2: Normalizacion (`PricingNormalizationModule`)

**Responsabilidad**: Limpiar, validar y estandarizar los datos del vehiculo.

**Operaciones**:
- Normalizar marca: `"TOYOTA"`, `"toyota"`, `"Toyota Motor"` → `"Toyota"`
- Normalizar modelo: `"COROLLA CROSS"`, `"Corolla-Cross"`, `"COROLLA X CROSS"` → `"Corolla Cross"`
- Validar anio: `>= 1990` y `<= anioActual + 1`
- Validar km: `>= 0` y `<= 1_000_000`
- Validar placa: formato colombiano `AAA-123` o `AAA-12A`
- Detectar campos faltantes → generar `anomaly_flags`
- Mapear combustible: `"gasolina"`, `"gas"`, `"diesel"`, `"hibrido"`, `"electrico"`
- Mapear transmision: `"manual"`, `"automatica"`, `"CVT"`

**Diccionario de normalizacion**: Tabla `brand_model_catalog` con marcas/modelos canonicos y aliases. Se mantiene manualmente y se enriquece con los datos que ingresan.

#### Modulo 3: Enriquecimiento (`PricingEnrichmentModule`)

**Responsabilidad**: Agregar datos de contexto que no vienen en la solicitud original.

| Dato | Fuente | Almacenamiento |
|---|---|---|
| Score de inspeccion | Tabla `Inspection` (existente) | Join directo |
| Scores por categoria | JSON `scores` en Inspection | Parse en runtime |
| Estado documental | RUNT (fase 2) / JSON `documentation` (fase 1) | `vehicle_document_status` |
| Precio Fasecolda | Tabla importada | `vehicle_price_references` |
| Precio Revista Motor | Tabla importada | `vehicle_price_references` |
| Precios TuCarro | Scraping diario | `vehicle_market_listings` |
| Historial subastas Mubis | Tabla `Auction` (existente) | Query directo |
| Demanda por segmento | Calculo sobre `Bid` historicos | `pricing_features` |

#### Modulo 4: Pricing Core (`PricingCoreModule`)

**Responsabilidad**: Calcular la valuacion final del vehiculo. Este es el motor de calculo.

**Pipeline de calculo** (en orden):

```
PASO 1: Precio base por modelo+version
  → Tabla vehicle_price_references (Fasecolda para el modelo/anio)
  → Fallback: tabla interna brand_model_base (reemplaza BRAND_BASE hardcodeado)
  → Fallback final: promedio del segmento (marca + rango de anios)

PASO 2: Depreciacion por edad
  → Curva NO lineal (reemplaza depreciacion lineal del 8%)
  → Anio 1: -15%, Anio 2: -12%, Anio 3: -10%, Anio 4-6: -8%, Anio 7-10: -6%, 10+: -4%
  → Vehiculos premium deprecian diferente a economicos (factor por segmento)

PASO 3: Depreciacion por kilometraje
  → Curva por tramos: 0-30k: minimo impacto, 30-80k: moderado, 80-150k: alto, 150k+: muy alto
  → Factor combinado km*anio (un 2023 con 100k km es peor que un 2018 con 100k km)

PASO 4: Ajuste por inspeccion
  → scoreGlobal pondera +-25% (se mantiene)
  → NUEVO: scores por categoria con pesos diferenciados:
    - Motor/mecanica: peso 0.30
    - Carroceria/estructura: peso 0.25
    - Interior: peso 0.15
    - Electrica: peso 0.15
    - Llantas/frenos: peso 0.15
  → Score estructura < 30 → flag DANO_ESTRUCTURAL

PASO 5: Ajuste documental
  → Prenda activa: BLOQUEO (no se valua, no se subasta)
  → Siniestro total: BLOQUEO
  → SOAT vencido: -0% precio pero flag WARNING
  → Tecnomecanica vencida: -2%
  → Comparendos pendientes: -0% pero flag INFO
  → Historial de propietarios > 5: -3%

PASO 6: Ponderacion con mercado externo
  → Promedio ponderado: 50% intrinseco + 30% Fasecolda/RevMotor + 20% TuCarro
  → Si no hay datos externos: 100% intrinseco, confianza = "low"
  → Si solo hay Fasecolda: 60% intrinseco + 40% Fasecolda

PASO 7: Ajuste regional (ciudad)
  → Factor multiplicador por ciudad basado en historico de transacciones:
    - Bogota: 1.00 (base)
    - Medellin: 0.98
    - Cali: 0.95
    - Barranquilla: 0.93
    - Bucaramanga: 0.92
    - Otras ciudades: 0.90
  → Los factores se recalculan mensualmente con datos reales

PASO 8: Ajuste por demanda
  → demandScore del segmento (calculado en batch nocturno)
  → Alta demanda (>70): +3-5%
  → Baja demanda (<30): -3-5%
  → Demanda normal: sin ajuste

PASO 9: Calculo de confianza
  → HIGH: scoreGlobal != null AND >= 3 comparables internos AND datos Fasecolda disponibles
  → MEDIUM: al menos 1 fuente externa O >= 1 comparable interno
  → LOW: sin fuentes externas y sin comparables

PASO 10: Deteccion de anomalias
  → Comparar resultado vs. cada fuente individual
  → Si desviacion > 25% con cualquier fuente: flag PRECIO_ANOMALO
  → Si resultado > 2 desviaciones estandar del segmento: flag OUTLIER
```

**Output**: `ValuationResult` completo con precio sugerido, rango, confianza, factores y anomalias detectadas.

#### Modulo 5: Serving API (`PricingServingModule`)

**Responsabilidad**: Exponer resultados, gestionar cache, emitir eventos.

| Endpoint | Metodo | Auth | Descripcion |
|---|---|---|---|
| `/pricing/estimate` | POST | Publico (rate limited) | Estimacion rapida por placa+km |
| `/pricing/valuate` | POST | JWT (SUPERADMIN, DEALER) | Valuacion completa por vehicleId |
| `/pricing/valuation/:id` | GET | JWT | Obtener valuacion existente |
| `/pricing/valuation/:vehicleId/history` | GET | JWT (SUPERADMIN) | Historial de valuaciones |
| `/pricing/anomalies` | GET | JWT (SUPERADMIN) | Listar anomalias pendientes |
| `/pricing/anomalies/:id/resolve` | POST | JWT (SUPERADMIN) | Resolver anomalia (override) |
| `/pricing/references/import` | POST | JWT (SUPERADMIN) | Importar CSV de referencias |
| `/pricing/market/:brand/:model` | GET | JWT | Datos de mercado por marca/modelo |
| `/pricing/health` | GET | Interno | Health check del motor de pricing |

**Eventos Socket.io**:
- `pricing:anomaly:new` — nueva anomalia detectada → dashboard SuperAdmin
- `pricing:valuation:updated` — valuacion recalculada → dealers viendo esa subasta
- `pricing:batch:completed` — job nocturno finalizado → log interno

### 3.3 Flujo end-to-end: Placa ingresada → Oferta sugerida

```
Consumidor                   API Gateway          Pricing Engine               Databases
    │                            │                       │                         │
    │── POST /pricing/estimate ──►                       │                         │
    │   { placa: "ABC123",       │                       │                         │
    │     km: 45000 }            │                       │                         │
    │                            │── Rate limit check ──►│                         │
    │                            │                       │                         │
    │                            │                       │── Redis GET ──────────►│
    │                            │                       │   cache:placa:ABC123    │
    │                            │                       │◄── MISS ──────────────│
    │                            │                       │                         │
    │                            │                       │── [INGESTION] ─────────│
    │                            │                       │   Lookup placa         │
    │                            │                       │── Query brand_model ──►│
    │                            │                       │◄── Toyota Corolla 2021─│
    │                            │                       │                         │
    │                            │                       │── [NORMALIZATION] ─────│
    │                            │                       │   Validar datos         │
    │                            │                       │   Mapear marca canonica │
    │                            │                       │                         │
    │                            │                       │── [ENRICHMENT] ────────│
    │                            │                       │── Query Fasecolda ────►│
    │                            │                       │◄── ref: 85M COP ──────│
    │                            │                       │── Query TuCarro ──────►│
    │                            │                       │◄── avg: 82M COP ──────│
    │                            │                       │── Query auctions ─────►│
    │                            │                       │◄── avg: 79M COP (4) ──│
    │                            │                       │                         │
    │                            │                       │── [PRICING CORE] ──────│
    │                            │                       │   base=85M, yr=0.85,   │
    │                            │                       │   km=0.93, mkt=0.50    │
    │                            │                       │   → suggested: 82M     │
    │                            │                       │                         │
    │                            │                       │── [SERVING] ───────────│
    │                            │                       │── Redis SET ──────────►│
    │                            │                       │── INSERT valuation ───►│
    │                            │                       │                         │
    │◄─── 200 OK ───────────────│◄──────────────────────│                         │
    │   { estimatedPrice: 82M,   │                       │                         │
    │     min: 70M, max: 94M,    │                       │                         │
    │     confidence: "medium" } │                       │                         │
```

### 3.4 Estrategia arquitectonica

**Fase 1 — Modular monolith (actual NestJS)**

El Pricing Engine se implementa como modulos NestJS dentro del monolito existente:

```
src/
  pricing/
    pricing.module.ts              ← Modulo raiz (ya existe, se refactoriza)
    pricing.controller.ts          ← Se extiende con nuevos endpoints
    pricing.service.ts             ← Se refactoriza a PricingCoreService
    ingestion/
      ingestion.module.ts
      ingestion.service.ts
      placa-lookup.service.ts
      csv-import.service.ts
    normalization/
      normalization.module.ts
      normalization.service.ts
      brand-model-catalog.ts
    enrichment/
      enrichment.module.ts
      enrichment.service.ts
      market-data.service.ts
      document-status.service.ts
    core/
      pricing-core.module.ts
      pricing-core.service.ts      ← Reemplaza logica actual de pricing.service.ts
      depreciation.calculator.ts
      market-weight.calculator.ts
      anomaly-detector.service.ts
    serving/
      serving.module.ts
      serving.controller.ts
      cache.service.ts
      pricing.gateway.ts           ← Socket.io gateway para alertas
    jobs/
      update-market-refs.job.ts
      recalc-features.job.ts
    dto/
      suggest-price.dto.ts         ← Ya existe
      estimate-price.dto.ts
      valuation-result.dto.ts
```

**Por que monolith primero**:
- El equipo es pequeno y la infraestructura actual es un solo servicio NestJS
- Los modulos NestJS ya proveen aislamiento via inyeccion de dependencias
- Se puede extraer a microservicio cuando: el batch nocturno impacte la latencia del API, o el volumen de valuaciones supere 1000/hora
- La separacion en subdirectorios prepara la extraccion futura

**Fase 2 — Extraccion de servicios (cuando sea necesario)**

Candidatos a microservicio independiente:
1. `MarketScraperService` — puede correr en un worker separado (CPU/red intensivo)
2. `PricingCoreService` — si se necesita escalar horizontalmente el calculo
3. `AnomalyDetectorService` — si se implementa ML en Python

### 3.5 Orquestacion batch + realtime

| Tipo | Tecnologia | Jobs |
|---|---|---|
| **Batch nocturno** | Bull/BullMQ + Redis | `update-market-references` (02:00 AM), `recalc-pricing-features` (03:00 AM), `invalidate-stale-valuations` (03:30 AM), `generate-anomaly-report` (04:00 AM) |
| **Realtime** | Calculo sincrono en request | Valuacion on-demand (< 500ms target), Estimacion publica (< 200ms target con cache) |
| **Event-driven** | Socket.io (ya en uso) | Alertas de anomalia, actualizacion de valuacion durante subasta, notificaciones a dealers |

**Configuracion Bull/BullMQ**:

```typescript
// pricing-jobs.module.ts
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pricing-jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 7 * 24 * 3600 }, // 7 dias
        removeOnFail: { age: 30 * 24 * 3600 },    // 30 dias
      },
    }),
  ],
})
```

### 3.6 Cache (Redis)

| Key pattern | TTL | Contenido |
|---|---|---|
| `pricing:estimate:{placa}` | 24h | Estimacion publica (sin inspeccion) |
| `pricing:valuation:{vehicleId}:{version}` | 7d | Valuacion completa |
| `pricing:ref:fasecolda:{brand}:{model}:{year}` | 30d | Precio Fasecolda |
| `pricing:ref:tucarro:{brand}:{model}:{year}` | 24h | Promedio TuCarro |
| `pricing:features:{segment}` | 24h | Features calculados del segmento |
| `pricing:demand:{brand}:{model}` | 24h | demandScore del segmento |

**Invalidacion**: El batch nocturno invalida selectivamente keys cuyos datos de referencia cambiaron > 5%.

### 3.7 Observabilidad

| Aspecto | Implementacion |
|---|---|
| **Structured logging** | Logger de NestJS con formato JSON. Cada valuacion loguea: `vehicleId`, `tenantId`, `priceSuggested`, `confidence`, `sources`, `latencyMs`. |
| **Metricas de latencia** | Histogram por endpoint: p50, p95, p99. Target: estimacion < 200ms, valuacion < 500ms. |
| **Drift detection** | Comparar precio sugerido vs. precio de cierre real en subastas completadas. Si drift promedio > 15% en 7 dias → alerta al equipo. |
| **Audit trail** | Toda valuacion se registra en `pricing_audit_log` con version del modelo, inputs, outputs, y fuentes consultadas. |
| **Alertas** | `pricing:anomaly:count > 10/hora` → alerta. `pricing:latency:p95 > 1000ms` → alerta. `pricing:batch:failed` → alerta. |

---

## 4. MODELO DE DATOS

### 4.1 Diagrama de relaciones

```
┌──────────┐     ┌────────────────────┐     ┌─────────────────────┐
│ Vehicle  │────►│ VehicleDocStatus   │     │ MarketReference     │
│(existente)│    │ (SOAT, prenda...)  │     │ (TuCarro scraped)   │
│          │────►│                    │     │                     │
│          │    └────────────────────┘     └─────────────────────┘
│          │                                         │
│          │────►┌────────────────────┐              │
│          │     │ PricingFeatureSet  │◄─────────────┘
│          │     │ (features calculados)│
│          │    └────────┬───────────┘
│          │             │
│          │────►┌───────▼────────────┐     ┌─────────────────────┐
│          │     │ ValuationResult    │────►│ PricingAuditLog     │
│          │     │ (resultado cached) │     │ (traza de decision) │
│          │    └────────────────────┘     └─────────────────────┘
│          │
│          │────►┌────────────────────┐     ┌─────────────────────┐
│          │     │ AnomalyFlag        │     │ PriceReference      │
│          │     │ (alertas detectadas)│     │ (Fasecolda/RevMotor)│
└──────────┘    └────────────────────┘     └─────────────────────┘

Modelos existentes referenciados: Vehicle, Auction, Bid, Transaction, User, Tenant, Inspection
```

### 4.2 Entidades detalladas

#### `vehicle_document_status`

Almacena el estado documental y legal de un vehiculo, consolidando informacion de RUNT y documentos cargados.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant del vehiculo | No | FK → Tenant.id |
| vehicleId | String | Vehiculo evaluado | No | FK → Vehicle.id (unique) |
| soatStatus | String | Estado SOAT: `VIGENTE`, `VENCIDO`, `NO_REGISTRADO` | No | — |
| soatExpiry | DateTime | Fecha de vencimiento del SOAT | Si | — |
| tecnoStatus | String | Estado tecnomecanica: `VIGENTE`, `VENCIDO`, `NO_APLICA`, `NO_REGISTRADO` | No | — |
| tecnoExpiry | DateTime | Fecha de vencimiento tecnomecanica | Si | — |
| prendaStatus | String | Estado prenda: `LIBRE`, `PRENDA_ACTIVA`, `LEASING_VIGENTE` | No | — |
| prendaDetail | String | Detalle de la prenda (entidad financiera, monto) | Si | — |
| siniestroTotal | Boolean | Indica si el vehiculo fue declarado perdida total | No (default false) | — |
| siniestroDetail | String | Detalle del siniestro si aplica | Si | — |
| comparendosCount | Int | Numero de comparendos pendientes | No (default 0) | — |
| comparendosAmount | BigInt | Monto total de comparendos en COP | No (default 0) | — |
| impuestosAlDia | Boolean | Si los impuestos vehiculares estan al dia | No (default true) | — |
| propietariosCount | Int | Numero de propietarios historicos | No (default 1) | — |
| runtLastCheck | DateTime | Ultima vez que se consulto RUNT | Si | — |
| runtRawData | Json | Respuesta cruda de RUNT para auditoria | Si | — |
| overrideByUserId | String | Usuario que hizo override manual | Si | FK → User.id |
| overrideNotes | String | Notas del override | Si | — |
| createdAt | DateTime | Fecha de creacion | No | — |
| updatedAt | DateTime | Fecha de ultima actualizacion | No | — |

#### `vehicle_market_listings`

Registros de precios de mercado obtenidos por scraping o importacion de portales externos.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant de referencia | No | FK → Tenant.id |
| source | String | Fuente: `TUCARRO`, `MERCADOLIBRE`, `OLX`, `MANUAL` | No | — |
| sourceListingId | String | ID del listing en la fuente original | Si | — |
| brand | String | Marca normalizada | No | — |
| model | String | Modelo normalizado | No | — |
| year | Int | Anio del vehiculo | No | — |
| km | Int | Kilometraje reportado en el listing | Si | — |
| price | BigInt | Precio publicado en COP | No | — |
| city | String | Ciudad del listing | Si | — |
| combustible | String | Tipo de combustible | Si | — |
| transmision | String | Tipo de transmision | Si | — |
| listingUrl | String | URL del listing original | Si | — |
| listingDate | DateTime | Fecha de publicacion del listing | Si | — |
| isActive | Boolean | Si el listing sigue activo | No (default true) | — |
| scrapedAt | DateTime | Fecha en que se obtuvo el dato | No | — |
| createdAt | DateTime | Fecha de creacion del registro | No | — |

#### `vehicle_price_references`

Precios oficiales de referencia de fuentes institucionales (Fasecolda, Revista Motor).

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant | No | FK → Tenant.id |
| source | String | Fuente: `FASECOLDA`, `REVISTA_MOTOR` | No | — |
| brand | String | Marca | No | — |
| model | String | Modelo | No | — |
| version | String | Version/linea (ej: "1.6 MT Active") | Si | — |
| year | Int | Anio modelo | No | — |
| referencePrice | BigInt | Precio de referencia en COP | No | — |
| referencePriceLow | BigInt | Precio bajo del rango (si aplica) | Si | — |
| referencePriceHigh | BigInt | Precio alto del rango (si aplica) | Si | — |
| validFrom | DateTime | Inicio de vigencia de este precio | No | — |
| validTo | DateTime | Fin de vigencia (o null si vigente) | Si | — |
| rawData | Json | Datos crudos de la fuente | Si | — |
| importBatchId | String | ID del lote de importacion | Si | — |
| createdAt | DateTime | Fecha de creacion | No | — |

#### `pricing_features`

Feature store precalculado para cada vehiculo o segmento. Materializa los calculos que alimentan al Pricing Core.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant | No | FK → Tenant.id |
| vehicleId | String | Vehiculo especifico (si es por vehiculo) | Si | FK → Vehicle.id |
| segmentKey | String | Clave de segmento: `{brand}:{model}:{yearRange}` | No | — |
| depreciationFactor | Float | Factor de depreciacion calculado (0-1) | No | — |
| kmFactor | Float | Factor de kilometraje calculado (0-1) | No | — |
| inspectionFactor | Float | Factor de inspeccion calculado (0.75-1.25) | Si | — |
| documentFactor | Float | Factor documental calculado (0-1) | Si | — |
| marketFactor | Float | Factor de mercado externo | Si | — |
| regionalFactor | Float | Factor regional por ciudad | No (default 1.0) | — |
| demandScore | Float | Score de demanda del segmento (0-100) | No (default 50) | — |
| avgBidsPerAuction | Float | Promedio de pujas en subastas de este segmento | Si | — |
| avgCloseRate | Float | Tasa de cierre exitoso del segmento (0-1) | Si | — |
| avgTimeToFirstBid | Float | Tiempo promedio (minutos) hasta primera puja | Si | — |
| comparablesCount | Int | Numero de subastas comparables encontradas | No (default 0) | — |
| comparablesAvgPrice | BigInt | Precio promedio de cierre de comparables | Si | — |
| externalRefsCount | Int | Numero de referencias externas disponibles | No (default 0) | — |
| calculatedAt | DateTime | Fecha del ultimo calculo | No | — |
| version | Int | Version del modelo de calculo usado | No (default 1) | — |
| createdAt | DateTime | Fecha de creacion | No | — |
| updatedAt | DateTime | Fecha de actualizacion | No | — |

#### `valuation_result`

Resultado cacheado de cada valuacion realizada. Versionado para trazabilidad.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant | No | FK → Tenant.id |
| vehicleId | String | Vehiculo valuado | Si | FK → Vehicle.id |
| auctionId | String | Subasta asociada (si aplica) | Si | FK → Auction.id |
| requestType | String | Tipo: `ESTIMATE` (publico), `VALUATION` (completo), `REVALUATION` (recalculo) | No | — |
| placa | String | Placa consultada | Si | — |
| brand | String | Marca usada en el calculo | No | — |
| model | String | Modelo usado en el calculo | No | — |
| year | Int | Anio usado en el calculo | No | — |
| km | Int | Kilometraje usado en el calculo | No | — |
| suggestedPrice | BigInt | Precio sugerido en COP | No | — |
| minPrice | BigInt | Precio minimo del rango | No | — |
| maxPrice | BigInt | Precio maximo del rango | No | — |
| confidence | String | Nivel de confianza: `HIGH`, `MEDIUM`, `LOW` | No | — |
| factors | Json | Detalle de factores aplicados (depreciacion, km, score, etc.) | No | — |
| sourcesUsed | Json | Fuentes consultadas y sus valores `[{source, price, weight}]` | No | — |
| inspectionScoreGlobal | Float | Score de inspeccion usado (si disponible) | Si | — |
| demandScore | Float | Score de demanda del segmento al momento del calculo | Si | — |
| anomalyFlags | Json | Anomalias detectadas durante el calculo | Si | — |
| modelVersion | Int | Version del modelo de pricing que genero este resultado | No (default 1) | — |
| isLatest | Boolean | Si es la valuacion mas reciente para este vehiculo | No (default true) | — |
| requestedByUserId | String | Usuario que solicito la valuacion | Si | FK → User.id |
| latencyMs | Int | Tiempo de calculo en milisegundos | Si | — |
| expiresAt | DateTime | Cuando expira esta valuacion | Si | — |
| createdAt | DateTime | Fecha de creacion | No | — |

#### `anomaly_flags`

Anomalias detectadas por vehiculo o subasta. Se usan para revision manual y para alimentar el aprendizaje del modelo.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant | No | FK → Tenant.id |
| vehicleId | String | Vehiculo afectado | Si | FK → Vehicle.id |
| auctionId | String | Subasta afectada (si aplica) | Si | FK → Auction.id |
| valuationId | String | Valuacion que detecto la anomalia | Si | FK → ValuationResult.id |
| type | String | Tipo de anomalia (ver enum abajo) | No | — |
| severity | String | Severidad: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` | No | — |
| detail | String | Descripcion legible de la anomalia | No | — |
| metadata | Json | Datos adicionales (valores esperados vs. encontrados, etc.) | Si | — |
| affectedFields | String[] | Campos del vehiculo afectados | Si | — |
| autoAction | String | Accion automatica tomada: `NONE`, `PRICE_ADJUSTED`, `BLOCKED`, `FLAGGED` | No (default "NONE") | — |
| requiresManualReview | Boolean | Si necesita revision humana | No (default false) | — |
| status | String | Estado: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED` | No (default "OPEN") | — |
| resolvedByUserId | String | Usuario que resolvio | Si | FK → User.id |
| resolvedAt | DateTime | Fecha de resolucion | Si | — |
| resolutionNotes | String | Notas de resolucion | Si | — |
| createdAt | DateTime | Fecha de deteccion | No | — |

**Tipos de anomalia (`type`)**:

| Tipo | Descripcion | Severidad tipica |
|---|---|---|
| `DATA_INCOMPLETA` | Campos obligatorios faltantes | MEDIUM |
| `DATA_INCONSISTENTE` | Datos contradictorios (ej: anio futuro) | MEDIUM |
| `DANO_ESTRUCTURAL` | Score estructura < 30 en inspeccion | HIGH |
| `PRENDA_ACTIVA` | Prenda o leasing vigente detectado | CRITICAL |
| `SINIESTRO_TOTAL` | Vehiculo con perdida total registrada | CRITICAL |
| `PRECIO_ANOMALO` | Precio calculado difiere > 25% de referencias | HIGH |
| `PRECIO_SIN_REFERENCIA` | Vehiculo de alto valor sin comparables | MEDIUM |
| `SOBREPUJA_DETECTADA` | Puja supera maxPrice en > 20% | HIGH |
| `SUBPUJA_DETECTADA` | Puja esta < 50% del minPrice | MEDIUM |
| `OUTLIER` | Precio > 2 desviaciones estandar del segmento | HIGH |
| `DOC_SOAT_VENCIDO` | SOAT vencido | LOW |
| `DOC_TECNO_VENCIDA` | Tecnomecanica vencida | LOW |
| `DOC_COMPARENDOS` | Comparendos pendientes significativos | INFO |

#### `pricing_audit_log`

Registro inmutable de cada decision del motor de pricing. Requerido para auditoria, debugging y entrenamiento futuro de modelos.

| Campo | Tipo | Descripcion | Nullable | Relaciones |
|---|---|---|---|---|
| id | String (cuid) | Identificador unico | No | PK |
| tenantId | String | Tenant | No | FK → Tenant.id |
| vehicleId | String | Vehiculo involucrado | Si | FK → Vehicle.id |
| auctionId | String | Subasta involucrada | Si | FK → Auction.id |
| valuationId | String | Valuacion generada | Si | FK → ValuationResult.id |
| eventType | String | Tipo de evento (ver tabla abajo) | No | — |
| actorType | String | Quien ejecuto: `SYSTEM`, `USER`, `JOB`, `OVERRIDE` | No | — |
| actorUserId | String | Usuario que ejecuto (si aplica) | Si | FK → User.id |
| inputData | Json | Datos de entrada del calculo | No | — |
| outputData | Json | Datos de salida del calculo | No | — |
| sourcesConsulted | Json | Fuentes consultadas y sus respuestas | Si | — |
| decision | String | Decision tomada: `VALUED`, `BLOCKED`, `FLAGGED`, `OVERRIDE`, `RECALCULATED` | No | — |
| reason | String | Razon de la decision | Si | — |
| modelVersion | Int | Version del modelo de pricing | No | — |
| latencyMs | Int | Tiempo de ejecucion en ms | Si | — |
| createdAt | DateTime | Timestamp del evento | No | — |

**Tipos de evento (`eventType`)**:

| Evento | Descripcion |
|---|---|
| `VALUATION_REQUESTED` | Se solicito una nueva valuacion |
| `VALUATION_COMPLETED` | Valuacion calculada exitosamente |
| `VALUATION_FAILED` | Error en el calculo |
| `ANOMALY_DETECTED` | Se detecto una anomalia |
| `ANOMALY_RESOLVED` | Anomalia resuelta por operador |
| `PRICE_OVERRIDE` | Operador sobreescribio precio manualmente |
| `VEHICLE_BLOCKED` | Vehiculo bloqueado por alerta critica |
| `VEHICLE_UNBLOCKED` | Vehiculo desbloqueado tras resolucion |
| `BATCH_REFS_UPDATED` | Referencias de mercado actualizadas (batch) |
| `FEATURES_RECALCULATED` | Features del segmento recalculados |
| `CACHE_INVALIDATED` | Cache de valuacion invalidado |

#### `dealer_bid` (referencia al modelo `Bid` existente)

No se crea una tabla nueva. Se consulta la tabla `Bid` existente para:
- Calcular historico de pujas por segmento (marca/modelo/rango de anio)
- Identificar dealers mas activos por segmento para notificaciones dirigidas
- Calcular `demandScore` y `avgBidsPerAuction` en `pricing_features`

**Queries clave sobre Bid**:
```sql
-- Pujas promedio por segmento (usado en pricing_features.avgBidsPerAuction)
SELECT a.brand, a.model, COUNT(b.id)::float / COUNT(DISTINCT a.id) as avg_bids
FROM "Bid" b
JOIN "Auction" a ON b."auctionId" = a.id
WHERE a.status = 'ENDED' AND a."winnerId" IS NOT NULL
GROUP BY a.brand, a.model;

-- Top dealers por segmento (usado en CU-05)
SELECT b."userId", COUNT(*) as bid_count, AVG(b.amount) as avg_bid
FROM "Bid" b
JOIN "Auction" a ON b."auctionId" = a.id
WHERE a.brand = $1 AND a.model = $2
GROUP BY b."userId"
ORDER BY bid_count DESC
LIMIT 10;
```

#### `transaction_outcome` (referencia al modelo `Transaction` existente)

No se crea una tabla nueva. Se consulta la tabla `Transaction` existente para:
- Calcular precio real de cierre (`finalAmount`) vs. precio sugerido → drift detection
- Alimentar el factor de mercado interno del Pricing Core
- Calcular metricas de precision del motor de pricing

**Queries clave sobre Transaction**:
```sql
-- Drift: precio sugerido vs. cierre real (ultimos 30 dias)
SELECT
  vr.brand, vr.model,
  AVG(ABS(t."finalAmount"::numeric - vr."suggestedPrice"::numeric) / vr."suggestedPrice"::numeric * 100) as avg_drift_percent
FROM "Transaction" t
JOIN "ValuationResult" vr ON vr."auctionId" = t."auctionId" AND vr."isLatest" = true
WHERE t."completedAt" > NOW() - INTERVAL '30 days'
GROUP BY vr.brand, vr.model;
```

---

## 19. SQL / ESQUEMA INICIAL

Las siguientes definiciones Prisma se **agregan** al schema existente. Siguen las convenciones actuales: `tenantId` como FK al modelo `Tenant`, IDs tipo `cuid()`, indices por `tenantId`, y relaciones explicitas.

### Enums nuevos

```prisma
// ─── Pricing Engine Enums ─────────────────────────────────────────────────────

enum DocumentStatus {
  VIGENTE
  VENCIDO
  NO_REGISTRADO
  NO_APLICA
}

enum PrendaStatus {
  LIBRE
  PRENDA_ACTIVA
  LEASING_VIGENTE
}

enum ValuationRequestType {
  ESTIMATE
  VALUATION
  REVALUATION
}

enum ValuationConfidence {
  HIGH
  MEDIUM
  LOW
}

enum AnomalySeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
  INFO
}

enum AnomalyType {
  DATA_INCOMPLETA
  DATA_INCONSISTENTE
  DANO_ESTRUCTURAL
  PRENDA_ACTIVA
  SINIESTRO_TOTAL
  PRECIO_ANOMALO
  PRECIO_SIN_REFERENCIA
  SOBREPUJA_DETECTADA
  SUBPUJA_DETECTADA
  OUTLIER
  DOC_SOAT_VENCIDO
  DOC_TECNO_VENCIDA
  DOC_COMPARENDOS
}

enum AnomalyStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}

enum AnomalyAutoAction {
  NONE
  PRICE_ADJUSTED
  BLOCKED
  FLAGGED
}

enum PricingAuditEventType {
  VALUATION_REQUESTED
  VALUATION_COMPLETED
  VALUATION_FAILED
  ANOMALY_DETECTED
  ANOMALY_RESOLVED
  PRICE_OVERRIDE
  VEHICLE_BLOCKED
  VEHICLE_UNBLOCKED
  BATCH_REFS_UPDATED
  FEATURES_RECALCULATED
  CACHE_INVALIDATED
}

enum PricingAuditActorType {
  SYSTEM
  USER
  JOB
  OVERRIDE
}

enum PricingAuditDecision {
  VALUED
  BLOCKED
  FLAGGED
  OVERRIDE
  RECALCULATED
}
```

### Modelos nuevos

```prisma
// ─── Pricing Engine Models ────────────────────────────────────────────────────

model MarketReference {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])

  source          String   // TUCARRO, MERCADOLIBRE, OLX, MANUAL
  sourceListingId String?  // ID del listing en la fuente original
  brand           String
  model           String
  year            Int
  km              Int?
  price           BigInt   // Precio publicado en COP
  city            String?
  combustible     String?
  transmision     String?
  listingUrl      String?
  listingDate     DateTime?
  isActive        Boolean  @default(true)
  scrapedAt       DateTime

  createdAt       DateTime @default(now())

  @@index([tenantId])
  @@index([brand, model, year])
  @@index([source, scrapedAt])
  @@index([isActive])
}

model PriceReference {
  id                 String   @id @default(cuid())
  tenantId           String
  tenant             Tenant   @relation(fields: [tenantId], references: [id])

  source             String   // FASECOLDA, REVISTA_MOTOR
  brand              String
  model              String
  version            String?  // Linea/version especifica (ej: "1.6 MT Active")
  year               Int
  referencePrice     BigInt   // Precio de referencia en COP
  referencePriceLow  BigInt?  // Limite inferior del rango
  referencePriceHigh BigInt?  // Limite superior del rango
  validFrom          DateTime // Inicio de vigencia
  validTo            DateTime? // Fin de vigencia (null = vigente)
  rawData            Json?    // Respuesta cruda de la fuente para auditoria
  importBatchId      String?  // ID del lote de importacion

  createdAt          DateTime @default(now())

  @@index([tenantId])
  @@index([brand, model, year])
  @@index([source, validFrom])
  @@index([importBatchId])
}

model VehicleDocumentStatus {
  id                String        @id @default(cuid())
  tenantId          String
  tenant            Tenant        @relation(fields: [tenantId], references: [id])
  vehicleId         String        @unique
  vehicle           Vehicle       @relation(fields: [vehicleId], references: [id])

  soatStatus        DocumentStatus @default(NO_REGISTRADO)
  soatExpiry        DateTime?
  tecnoStatus       DocumentStatus @default(NO_REGISTRADO)
  tecnoExpiry       DateTime?
  prendaStatus      PrendaStatus   @default(LIBRE)
  prendaDetail      String?       // Entidad financiera, monto, etc.
  siniestroTotal    Boolean        @default(false)
  siniestroDetail   String?
  comparendosCount  Int            @default(0)
  comparendosAmount BigInt         @default(0)
  impuestosAlDia    Boolean        @default(true)
  propietariosCount Int            @default(1)

  runtLastCheck     DateTime?
  runtRawData       Json?         // Respuesta cruda de RUNT

  overrideByUserId  String?
  overrideByUser    User?         @relation("docStatusOverride", fields: [overrideByUserId], references: [id])
  overrideNotes     String?

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([tenantId])
  @@index([prendaStatus])
  @@index([siniestroTotal])
}

model PricingFeatureSet {
  id                   String    @id @default(cuid())
  tenantId             String
  tenant               Tenant    @relation(fields: [tenantId], references: [id])
  vehicleId            String?
  vehicle              Vehicle?  @relation(fields: [vehicleId], references: [id])

  segmentKey           String    // "{brand}:{model}:{yearRange}" ej: "Toyota:Corolla:2020-2024"
  depreciationFactor   Float     // Factor 0-1
  kmFactor             Float     // Factor 0-1
  inspectionFactor     Float?    // Factor 0.75-1.25
  documentFactor       Float?    // Factor 0-1
  marketFactor         Float?    // Factor basado en mercado externo
  regionalFactor       Float     @default(1.0) // Factor por ciudad

  demandScore          Float     @default(50)  // 0-100
  avgBidsPerAuction    Float?
  avgCloseRate         Float?    // Tasa 0-1
  avgTimeToFirstBid    Float?    // Minutos
  comparablesCount     Int       @default(0)
  comparablesAvgPrice  BigInt?   // Promedio en COP
  externalRefsCount    Int       @default(0)

  calculatedAt         DateTime
  version              Int       @default(1) // Version del modelo de calculo

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([tenantId])
  @@index([segmentKey])
  @@index([vehicleId])
  @@index([calculatedAt])
}

model ValuationResult {
  id                    String              @id @default(cuid())
  tenantId              String
  tenant                Tenant              @relation(fields: [tenantId], references: [id])
  vehicleId             String?
  vehicle               Vehicle?            @relation(fields: [vehicleId], references: [id])
  auctionId             String?
  auction               Auction?            @relation(fields: [auctionId], references: [id])

  requestType           ValuationRequestType
  placa                 String?             // Placa consultada (si aplica)
  brand                 String
  model                 String
  year                  Int
  km                    Int
  city                  String?

  suggestedPrice        BigInt              // Precio sugerido en COP
  minPrice              BigInt              // Limite inferior del rango
  maxPrice              BigInt              // Limite superior del rango
  confidence            ValuationConfidence

  factors               Json                // { depreciationFactor, kmFactor, scoreFactor, ... }
  sourcesUsed           Json                // [{ source, price, weight }]

  inspectionScoreGlobal Float?
  demandScore           Float?

  anomalyFlagsSnapshot  Json?               // Snapshot de anomalias al momento del calculo
  modelVersion          Int                 @default(1)
  isLatest              Boolean             @default(true)

  requestedByUserId     String?
  requestedByUser       User?               @relation("valuationRequester", fields: [requestedByUserId], references: [id])

  latencyMs             Int?                // Tiempo de calculo en ms
  expiresAt             DateTime?           // Cuando expira esta valuacion

  createdAt             DateTime            @default(now())

  // Relaciones inversas
  anomalyFlags          AnomalyFlag[]
  auditLogs             PricingAuditLog[]   @relation("auditValuation")

  @@index([tenantId])
  @@index([vehicleId, isLatest])
  @@index([auctionId])
  @@index([placa])
  @@index([brand, model, year])
  @@index([createdAt])
}

model AnomalyFlag {
  id                   String             @id @default(cuid())
  tenantId             String
  tenant               Tenant             @relation(fields: [tenantId], references: [id])
  vehicleId            String?
  vehicle              Vehicle?           @relation(fields: [vehicleId], references: [id])
  auctionId            String?
  auction              Auction?           @relation(fields: [auctionId], references: [id])
  valuationId          String?
  valuation            ValuationResult?   @relation(fields: [valuationId], references: [id])

  type                 AnomalyType
  severity             AnomalySeverity
  detail               String             // Descripcion legible de la anomalia
  metadata             Json?              // Datos adicionales: valores esperados vs encontrados
  affectedFields       String[]           // Campos del vehiculo afectados

  autoAction           AnomalyAutoAction  @default(NONE)
  requiresManualReview Boolean            @default(false)
  status               AnomalyStatus      @default(OPEN)

  resolvedByUserId     String?
  resolvedByUser       User?              @relation("anomalyResolver", fields: [resolvedByUserId], references: [id])
  resolvedAt           DateTime?
  resolutionNotes      String?

  createdAt            DateTime           @default(now())

  @@index([tenantId])
  @@index([vehicleId])
  @@index([auctionId])
  @@index([status])
  @@index([severity])
  @@index([type])
  @@index([createdAt])
}

model PricingAuditLog {
  id                String                  @id @default(cuid())
  tenantId          String
  tenant            Tenant                  @relation(fields: [tenantId], references: [id])
  vehicleId         String?
  vehicle           Vehicle?                @relation(fields: [vehicleId], references: [id])
  auctionId         String?
  auction           Auction?                @relation(fields: [auctionId], references: [id])
  valuationId       String?
  valuation         ValuationResult?        @relation("auditValuation", fields: [valuationId], references: [id])

  eventType         PricingAuditEventType
  actorType         PricingAuditActorType
  actorUserId       String?
  actorUser         User?                   @relation("pricingAuditActor", fields: [actorUserId], references: [id])

  inputData         Json                    // Datos de entrada del calculo
  outputData        Json                    // Datos de salida del calculo
  sourcesConsulted  Json?                   // Fuentes consultadas y respuestas

  decision          PricingAuditDecision
  reason            String?                 // Razon de la decision

  modelVersion      Int                     // Version del modelo de pricing
  latencyMs         Int?                    // Tiempo de ejecucion en ms

  createdAt         DateTime                @default(now())

  @@index([tenantId])
  @@index([vehicleId])
  @@index([auctionId])
  @@index([eventType])
  @@index([createdAt])
  @@index([actorUserId])
}
```

### Modificaciones a modelos existentes

Los siguientes modelos existentes necesitan relaciones inversas para conectar con los nuevos modelos del pricing engine. Agregar estos campos a los modelos correspondientes:

```prisma
// ─── Agregar a modelo Tenant ──────────────────────────────────────────────────

model Tenant {
  // ... campos existentes ...

  // Pricing Engine relations
  marketReferences      MarketReference[]
  priceReferences       PriceReference[]
  vehicleDocStatuses    VehicleDocumentStatus[]
  pricingFeatureSets    PricingFeatureSet[]
  valuationResults      ValuationResult[]
  anomalyFlags          AnomalyFlag[]
  pricingAuditLogs      PricingAuditLog[]
}

// ─── Agregar a modelo Vehicle ─────────────────────────────────────────────────

model Vehicle {
  // ... campos existentes ...

  // Pricing Engine relations
  documentStatus        VehicleDocumentStatus?
  pricingFeatures       PricingFeatureSet[]
  valuations            ValuationResult[]
  anomalyFlags          AnomalyFlag[]
  pricingAuditLogs      PricingAuditLog[]
}

// ─── Agregar a modelo Auction ─────────────────────────────────────────────────

model Auction {
  // ... campos existentes ...

  // Pricing Engine relations
  valuations            ValuationResult[]
  anomalyFlags          AnomalyFlag[]
  pricingAuditLogs      PricingAuditLog[]
}

// ─── Agregar a modelo User ────────────────────────────────────────────────────

model User {
  // ... campos existentes ...

  // Pricing Engine relations
  docStatusOverrides    VehicleDocumentStatus[] @relation("docStatusOverride")
  valuationRequests     ValuationResult[]       @relation("valuationRequester")
  anomalyResolutions    AnomalyFlag[]           @relation("anomalyResolver")
  pricingAuditActions   PricingAuditLog[]       @relation("pricingAuditActor")
}
```

### Indices de rendimiento adicionales

```prisma
// Indices compuestos para queries frecuentes del Pricing Engine.
// Agregar a los modelos correspondientes si Prisma los soporta
// o crearlos via migracion SQL directa:

// Para busqueda rapida de valuaciones vigentes por vehiculo:
// CREATE INDEX idx_valuation_vehicle_latest ON "ValuationResult" ("vehicleId", "isLatest") WHERE "isLatest" = true;

// Para busqueda de anomalias abiertas por severidad (dashboard SuperAdmin):
// CREATE INDEX idx_anomaly_open_severity ON "AnomalyFlag" ("status", "severity", "createdAt" DESC) WHERE "status" = 'OPEN';

// Para busqueda de referencias vigentes por marca/modelo:
// CREATE INDEX idx_price_ref_active ON "PriceReference" ("brand", "model", "year", "validFrom" DESC) WHERE "validTo" IS NULL;

// Para market references activas:
// CREATE INDEX idx_market_ref_active ON "MarketReference" ("brand", "model", "year", "scrapedAt" DESC) WHERE "isActive" = true;
```

### Migracion SQL directa (indices parciales)

```sql
-- Ejecutar despues de la migracion de Prisma para crear indices parciales
-- que Prisma no soporta nativamente:

-- Valuaciones vigentes (query mas frecuente del pricing engine)
CREATE INDEX IF NOT EXISTS idx_valuation_vehicle_latest
  ON "ValuationResult" ("vehicleId", "createdAt" DESC)
  WHERE "isLatest" = true;

-- Anomalias abiertas para el dashboard de operaciones
CREATE INDEX IF NOT EXISTS idx_anomaly_open_severity
  ON "AnomalyFlag" ("tenantId", "severity", "createdAt" DESC)
  WHERE "status" = 'OPEN';

-- Referencias de precio vigentes
CREATE INDEX IF NOT EXISTS idx_price_ref_current
  ON "PriceReference" ("brand", "model", "year")
  WHERE "validTo" IS NULL;

-- Listings de mercado activos
CREATE INDEX IF NOT EXISTS idx_market_ref_active_recent
  ON "MarketReference" ("brand", "model", "year", "scrapedAt" DESC)
  WHERE "isActive" = true;

-- Audit log por vehiculo (para trazabilidad)
CREATE INDEX IF NOT EXISTS idx_audit_vehicle_timeline
  ON "PricingAuditLog" ("vehicleId", "createdAt" DESC)
  WHERE "vehicleId" IS NOT NULL;
```

---

## Apendice: Checklist de implementacion

| # | Tarea | Dependencia | Prioridad |
|---|---|---|---|
| 1 | Agregar enums y modelos Prisma al schema | Ninguna | P0 |
| 2 | Ejecutar migracion y crear tablas | 1 | P0 |
| 3 | Ejecutar indices parciales SQL | 2 | P0 |
| 4 | Agregar relaciones inversas a modelos existentes (Tenant, Vehicle, Auction, User) | 2 | P0 |
| 5 | Crear `PricingNormalizationModule` con diccionario de marcas/modelos | 2 | P0 |
| 6 | Refactorizar `pricing.service.ts` → `PricingCoreService` con nuevo pipeline | 5 | P0 |
| 7 | Crear `PricingEnrichmentModule` (fase 1: datos internos + CSV imports) | 6 | P1 |
| 8 | Crear endpoint publico `/pricing/estimate` con cache Redis | 6 | P1 |
| 9 | Implementar `AnomalyDetectorService` | 6 | P1 |
| 10 | Configurar Bull/BullMQ para jobs nocturnos | 2 | P1 |
| 11 | Crear importador CSV para Fasecolda y Revista Motor | 7 | P1 |
| 12 | Implementar scraper TuCarro (Bull job) | 10 | P2 |
| 13 | Crear dashboard de anomalias en SuperAdmin frontend | 9 | P2 |
| 14 | Implementar notificaciones dirigidas (CU-05) | 9, 10 | P2 |
| 15 | Integracion RUNT (fase 2) | 7 | P3 |
| 16 | Drift detection y alertas automaticas | 6, 9 | P2 |
