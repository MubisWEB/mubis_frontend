# Motor de Pricing Mubis — Parte 4: Implementación, Stack, Seguridad y Recomendación Final

> Documento técnico de diseño — Secciones 15, 16, 17, 20 y Apéndices
> Última actualización: 2026-03-25
> Stack actual: NestJS 11 · TypeScript 5.7 · Prisma 7.5 · PostgreSQL · AWS

---

## 15. PLAN DE IMPLEMENTACIÓN

### Visión general del backlog

El plan se organiza en 10 épicas distribuidas en 8 sprints de 2 semanas (16 semanas total). Las épicas 8 y 9 corren en paralelo con el resto del desarrollo.

```
Sprint:  1    2    3    4    5    6    7    8
Épica 1: ████████
Épica 2:      ████████
Épica 3:           ████████
Épica 4:                ████████
Épica 5:                     ████████
Épica 6:                          ████████
Épica 7:                               ████████
Épica 8:                          ████████████████  (paralelo)
Épica 9: ████████████████████████████████████████  (continuo)
Épica 10:                                    ████
```

---

### Épica 1: Ingestión de Datos (Sprint 1–2)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **ING-01** | Como **ingeniero de datos**, quiero crear un módulo `DataIngestionModule` en NestJS para que centralice toda la ingestión de datos externos y sea extensible a nuevas fuentes. | - Módulo registrado en `AppModule` con estructura de providers por fuente. - Interfaz `DataSourceAdapter` definida con métodos `fetch()`, `normalize()`, `validate()`. - Test unitario del módulo cargando correctamente. - Documentación Swagger del módulo. | M | Ninguna |
| **ING-02** | Como **ingeniero de datos**, quiero implementar un adaptador para consulta RUNT (o proveedor autorizado de RUNT) para que pueda obtener datos técnicos del vehículo a partir de la placa. | - Adapter implementa `DataSourceAdapter`. - Manejo de errores: timeout (30s), respuesta inválida, servicio no disponible. - Datos parseados: marca, línea, modelo, cilindraje, tipo combustible, servicio, clase, color, fecha matrícula, número de motor, VIN. - Rate limiting configurable vía `.env` (default: 10 req/min). - Log estructurado de cada consulta con `source`, `timestamp`, `responseTime`, `status`. - Datos de placa tratados como PII (ver Épica 9). | L | ING-01, contrato con proveedor RUNT |
| **ING-03** | Como **ingeniero de datos**, quiero implementar un adaptador para datos de Fasecolda para que pueda obtener valores de referencia por línea/modelo/año. | - Adapter implementa `DataSourceAdapter`. - Parsing de tabla Fasecolda: código Fasecolda, valor nuevo, valor usado por año. - Cache de resultados en PostgreSQL (tabla `fasecolda_reference`) con TTL de 30 días. - Job de actualización mensual vía `@nestjs/schedule`. - Manejo de cambio de estructura en la fuente (alerta si el parsing falla). | L | ING-01, acuerdo de licenciamiento Fasecolda |
| **ING-04** | Como **ingeniero de datos**, quiero implementar ingestión de historial interno de subastas para que el motor use datos propios de Mubis como fuente principal de mercado. | - Query a tabla `Auction` con `status = 'ENDED'` y `winnerId IS NOT NULL`. - Agregación por `brand + model + year + city`. - Cálculo de: promedio, mediana, p25, p75, desviación estándar, conteo. - Vista materializada `mv_market_history` con refresh cada hora. - Datos accesibles desde `PricingService`. | M | Ninguna |
| **ING-05** | Como **ingeniero de datos**, quiero un mecanismo de importación manual de datos de mercado (CSV/Excel) para que el equipo pueda cargar datos de Revista Motor u otras fuentes editoriales. | - Endpoint `POST /api/pricing/import` con upload de CSV. - Validación de columnas: `brand, model, year, price, source, date`. - Almacenamiento en tabla `external_price_reference`. - Solo accesible por `SUPERADMIN`. - Log de auditoría de cada importación (quién, cuándo, cuántos registros). | M | ING-01 |
| **ING-06** | Como **product owner**, quiero que cada dato ingestado tenga metadata de trazabilidad para que pueda auditar el origen de cualquier valuación. | - Toda tabla de datos externos incluye: `source` (enum), `fetched_at` (timestamp), `raw_response` (JSON), `confidence_score` (0–1), `expires_at`. - Índice por `source` y `fetched_at`. - Política de retención: raw_response se elimina después de 90 días (datos derivados se mantienen). | S | ING-01 |

---

### Épica 2: Normalización y Catálogo Maestro (Sprint 2–3)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **NOR-01** | Como **ingeniero de datos**, quiero crear un catálogo maestro de vehículos (`vehicle_catalog`) para que toda valuación use referencias normalizadas de marca/línea/modelo. | - Tabla `vehicle_catalog` con: `id`, `brand` (normalizado), `line`, `model_year`, `body_type`, `fasecolda_code`, `active`, `created_at`. - Seed inicial con las ~20 marcas del `BRAND_BASE` actual + modelos colombianos más comunes. - Endpoint CRUD para `SUPERADMIN`. - Constraint unique en `(brand, line, model_year)`. | M | Ninguna |
| **NOR-02** | Como **ingeniero de datos**, quiero un servicio de normalización de nombres de marca/modelo para que datos de distintas fuentes se unifiquen (ej: "CHEVROLET", "Chevrolet", "chevrolet" → `chevrolet`). | - Servicio `NormalizationService` con método `normalizeBrand(input: string): string`. - Tabla de aliases: `brand_alias` (`alias` → `canonical_brand`). - Normalización aplicada en ingestión (antes de almacenar). - Cobertura: al menos las 20 marcas del sistema + variaciones comunes. - Fuzzy matching con distancia de Levenshtein <= 2 para sugerencias. | M | NOR-01 |
| **NOR-03** | Como **ingeniero de datos**, quiero mapear los datos de Fasecolda al catálogo maestro para que los precios de referencia se vinculen correctamente a cada vehículo. | - Tabla de mapeo `fasecolda_catalog_map` (`fasecolda_code` → `vehicle_catalog_id`). - Script de mapeo inicial con las líneas más vendidas en Colombia. - Endpoint para mapeo manual por `SUPERADMIN` cuando el automático falle. - Reporte de líneas no mapeadas. | M | NOR-01, ING-03 |
| **NOR-04** | Como **ingeniero de datos**, quiero normalizar las ciudades de Colombia para que los ajustes regionales funcionen correctamente. | - Tabla `city_catalog` con: nombre normalizado, departamento, tier (1=principal, 2=intermedia, 3=pequeña). - Seed con las 32 capitales + ciudades con actividad automotriz relevante. - Factor de ajuste por tier: tier 1 = 1.0, tier 2 = 0.95, tier 3 = 0.90. - Mapeo de variaciones: "Bogotá D.C.", "Bogota", "BOGOTA" → `bogota`. | S | Ninguna |
| **NOR-05** | Como **product owner**, quiero que el sistema detecte y marque datos de baja calidad para que no contaminen las valuaciones. | - Reglas de validación: precio fuera de rango (< 5M o > 1,000M COP), año futuro, km negativos, marca no reconocida. - Datos marcados con `quality_flag`: `valid`, `suspect`, `rejected`. - Datos `rejected` excluidos automáticamente de cálculos. - Datos `suspect` incluidos pero con peso reducido (0.5x). - Dashboard de calidad de datos para `SUPERADMIN`. | M | NOR-01, ING-04 |

---

### Épica 3: Pricing Core v1 (Sprint 3–4)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **PRC-01** | Como **ingeniero de backend**, quiero reemplazar las constantes hardcodeadas de `BRAND_BASE` por una tabla configurable para que los precios base se actualicen sin deploy. | - Tabla `brand_base_price` con: `brand`, `base_price_cop`, `updated_at`, `updated_by`. - Seed con los valores actuales de `BRAND_BASE`. - `PricingService` lee de tabla (con cache en memoria, TTL 1h). - Endpoint `PUT /api/pricing/config/brand-base` para `SUPERADMIN`. - Log de auditoría en cada cambio de precio base. | S | Ninguna |
| **PRC-02** | Como **ingeniero de backend**, quiero implementar curvas de depreciación no lineales por segmento para que la valuación sea más precisa que el 8% lineal actual. | - Función de depreciación por segmento: `premium` (más lenta los primeros 3 años), `mainstream` (lineal estándar), `economy` (más agresiva). - Curva exponencial: `factor = max(0.20, e^(-k * age))` donde `k` varía por segmento. - Tabla `depreciation_curve` configurable por `SUPERADMIN`. - Tests con casos reales: un BMW 2023 vs un Renault 2023, verificar que la diferencia sea razonable. | M | PRC-01 |
| **PRC-03** | Como **ingeniero de backend**, quiero incorporar el valor de referencia Fasecolda en la fórmula de precio para que la valuación tenga un ancla de mercado oficial. | - Si existe `fasecolda_code` para el vehículo, el precio Fasecolda reemplaza al `base_price` como punto de partida. - Fórmula: `referencePrice = fasecolda_value ?? brand_base_price`. - El response incluye `fasecolda_reference` cuando está disponible. - Si Fasecolda y brand_base difieren > 40%, se marca `warning: 'high_deviation'`. | M | ING-03, NOR-03 |
| **PRC-04** | Como **ingeniero de backend**, quiero agregar ajuste por ciudad al cálculo de precio para que refleje las diferencias regionales del mercado colombiano. | - Factor ciudad aplicado como multiplicador: `cityFactor` de tabla `city_catalog`. - Ciudades sin dato: factor 1.0 (neutral). - El response incluye `cityAdjustment` en `factors`. - Validación: Bogotá, Medellín, Cali deben tener factor >= 1.0; ciudades pequeñas < 1.0. | S | NOR-04 |
| **PRC-05** | Como **ingeniero de backend**, quiero mejorar el cálculo de mercado usando mediana en vez de promedio y ponderando por recencia para que sea más robusto ante outliers. | - Usar mediana en lugar de promedio para `marketAvg`. - Ponderar por recencia: subastas de los últimos 30 días peso 1.0, 30–90 días peso 0.7, 90–180 días peso 0.4, >180 días peso 0.2. - Excluir outliers: descartar datos fuera de 2 desviaciones estándar. - Incluir `marketMedian`, `marketStdDev` en el response. | M | ING-04 |
| **PRC-06** | Como **ingeniero de backend**, quiero que la fórmula de pricing sea pluggable para que pueda evolucionar de reglas a ML sin cambiar la API. | - Interfaz `PricingStrategy` con método `calculate(input: VehicleData, context: MarketContext): PricingResult`. - Implementación `RuleBasedStrategy` (v1, actual). - `PricingService` inyecta strategy vía factory configurable. - Feature flag `PRICING_STRATEGY` en `.env` para cambiar entre estrategias. - Tests de regresión que validen que ambas estrategias producen resultados dentro de ±10% para el mismo input. | M | PRC-01 |
| **PRC-07** | Como **ingeniero de backend**, quiero generar un desglose detallado de cada valuación para que el equipo entienda cómo se llegó al precio sugerido. | - El response incluye `breakdown`: array de `{ factor, label, value, impact_pct }`. - Ejemplo: `[{ factor: 'depreciation', label: 'Depreciación por año (5 años)', value: 0.67, impact_pct: -33 }, ...]`. - El breakdown se almacena en `pricing_audit_log` (ver PRC-08). | S | PRC-02, PRC-04, PRC-05 |
| **PRC-08** | Como **product owner**, quiero un log de auditoría inmutable de cada valuación para que pueda rastrear decisiones de pricing en el tiempo. | - Tabla `pricing_audit_log`: `id`, `tenant_id`, `vehicle_id`, `requested_by`, `input` (JSON), `output` (JSON), `breakdown` (JSON), `strategy_version`, `created_at`. - Cada llamada a `suggestPrice()` genera un registro. - No se permite UPDATE ni DELETE en esta tabla (solo INSERT). - Índices: `(tenant_id, vehicle_id)`, `(created_at)`. - Retención: 3 años mínimo. | M | PRC-06 |

---

### Épica 4: Sistema de Scoring (Sprint 4–5)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **SCR-01** | Como **ingeniero de backend**, quiero implementar un scoring de documentación del vehículo para que la valuación refleje el riesgo documental. | - Inputs: `documentation` JSON del vehículo (SOAT, tecnomecánica, tarjeta de propiedad, prendas, etc.). - Score 0–100 basado en: documentos presentes (+puntos), documentos vencidos (-puntos), prendas activas (penalización fuerte). - Pesos configurables en tabla `doc_scoring_weights`. - El score de documentación es un factor independiente en la fórmula: `docFactor` (0.7–1.0). | M | PRC-06 |
| **SCR-02** | Como **ingeniero de backend**, quiero implementar un scoring de estado mecánico basado en la inspección para que complemente el `scoreGlobal` existente con más granularidad. | - Descomponer `scores` JSON de la inspección en sub-scores: motor, transmisión, suspensión, frenos, carrocería, interior, eléctrico. - Ponderar cada sub-score según impacto en valor (motor y transmisión pesan más). - Producir `mechanicalScore` (0–100) que reemplaza al `scoreGlobal` genérico en la fórmula. - Fallback: si no hay inspección, usar `scoreGlobal` o factor neutral (1.0). | M | Ninguna |
| **SCR-03** | Como **ingeniero de backend**, quiero implementar un scoring de riesgo del vendedor para que la plataforma pueda alertar sobre transacciones potencialmente problemáticas. | - Inputs: historial de subastas del dealer, tasa de cancelación, casos de soporte, antigüedad en plataforma. - Score 0–100: > 70 = bajo riesgo, 40–70 = medio, < 40 = alto. - NO afecta el precio sugerido directamente (es informativo). - Visible solo para `SUPERADMIN` en el panel de la subasta. - Almacenado en `seller_risk_score` con historial. | M | Ninguna |
| **SCR-04** | Como **ingeniero de backend**, quiero un score compuesto que combine todos los sub-scores en un "índice de confianza de la valuación" para que los usuarios entiendan qué tan fiable es el precio sugerido. | - `confidenceIndex` = f(data_completeness, market_samples, inspection_quality, doc_completeness). - Escala: `high` (>80), `medium` (50–80), `low` (<50). - Reemplaza el campo `confidence` actual que solo usa `marketCount`. - El response incluye `confidenceIndex` numérico + `confidenceLabel`. | S | SCR-01, SCR-02, PRC-05 |
| **SCR-05** | Como **product owner**, quiero que los pesos de todos los scores sean configurables sin deploy para que el equipo de negocio pueda ajustar la fórmula. | - Tabla `scoring_config` con: `factor_name`, `weight`, `min_value`, `max_value`, `updated_by`, `updated_at`. - Endpoint `GET/PUT /api/pricing/config/scoring` para `SUPERADMIN`. - Validación: la suma de pesos debe ser ~1.0 (tolerance ±0.05). - Cambios de configuración generan un nuevo `config_version` para trazabilidad en `pricing_audit_log`. | S | SCR-01, SCR-02 |

---

### Épica 5: API de Valuación (Sprint 5–6)

> **PARA IMPLEMENTAR POR EQUIPO BACKEND**

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **API-01** | Como **desarrollador frontend**, quiero un endpoint `POST /api/pricing/valuate` que acepte un vehículo completo y retorne la valuación detallada para que pueda mostrarla en la UI de publicación. | - Request: `{ vehicleId }` o `{ brand, model, year, km, city, documentation, scoreGlobal }`. - Response: `{ suggestedPrice, minPrice, maxPrice, confidenceIndex, confidenceLabel, breakdown[], factors{}, marketData{}, warnings[] }`. - Swagger documentado con ejemplos. - Rate limit: 60 req/min por usuario. - Tiempo de respuesta < 500ms (p95). | L | PRC-06, SCR-04 |
| **API-02** | Como **desarrollador frontend**, quiero un endpoint `GET /api/pricing/history/:vehicleId` que retorne el historial de valuaciones de un vehículo para que pueda mostrar la evolución del precio. | - Response: array de valuaciones ordenadas por fecha desc. - Incluye: `suggestedPrice`, `confidenceLabel`, `strategy_version`, `created_at`. - Paginado: `?page=1&limit=20`. - Filtro por rango de fechas: `?from=2026-01-01&to=2026-03-25`. - Solo accesible por el dealer dueño del vehículo o `SUPERADMIN`. | M | PRC-08 |
| **API-03** | Como **desarrollador frontend**, quiero un endpoint `GET /api/pricing/comparables` que retorne subastas similares para que el dealer pueda validar el precio sugerido. | - Request: `?brand=toyota&model=corolla&year=2022&city=bogota&limit=5`. - Response: array de subastas completadas con: `finalPrice`, `year`, `km`, `city`, `completedAt`. - Excluye datos PII (sin placa, sin dealer). - Ordenadas por relevancia (mismo modelo > misma marca, mismo año > ±2 años). | M | ING-04 |
| **API-04** | Como **desarrollador frontend**, quiero un endpoint `GET /api/pricing/market-pulse` que retorne estadísticas generales del mercado para que el dashboard muestre tendencias. | - Response: `{ totalValuations30d, avgPriceByBrand[], priceChangeByBrand[], topModels[], avgDaysToSell }`. - Datos agregados de los últimos 30, 60, 90 días. - Cache con TTL de 1 hora (evitar queries pesadas en cada request). - Solo accesible por `SUPERADMIN` y `DEALER`. | M | ING-04, PRC-08 |
| **API-05** | Como **desarrollador frontend**, quiero que la API retorne warnings y sugerencias cuando los datos del vehículo son incompletos para que la UI pueda solicitar la información faltante. | - `warnings[]` en el response con: `{ code, message, severity, field }`. - Warnings definidos: `MISSING_INSPECTION`, `MISSING_DOCS`, `LOW_MARKET_DATA`, `HIGH_KM`, `PRICE_DEVIATION`, `UNKNOWN_MODEL`. - `severity`: `info`, `warning`, `critical`. - Cada warning incluye sugerencia actionable. | S | API-01 |
| **API-06** | Como **integrador externo**, quiero un endpoint `POST /api/pricing/batch-valuate` que procese múltiples vehículos en una sola llamada para que las importaciones masivas no requieran N llamadas individuales. | - Request: array de hasta 50 vehículos. - Response: array de resultados (misma estructura que API-01) + `summary { total, successful, failed, avgPrice }`. - Procesamiento asíncrono si > 10 vehículos (retorna `jobId`, consultar con `GET /api/pricing/jobs/:jobId`). - Solo accesible por `SUPERADMIN`. | L | API-01 |
| **API-07** | Como **equipo de backend**, quiero versionamiento de la API de pricing para que cambios en la fórmula no rompan integraciones existentes. | - Header `X-Pricing-Version` con valor default `v1`. - Registro de versiones en `pricing_api_versions` con fecha de deprecación. - Soporte de al menos 2 versiones simultáneas. - Response incluye header `X-Pricing-Version-Used`. | S | API-01 |

---

### Épica 6: Panel Interno + Override (Sprint 6–7)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **PNL-01** | Como **SuperAdmin**, quiero un panel de pricing en el admin donde pueda ver todas las valuaciones recientes para que tenga visibilidad del comportamiento del motor. | - Vista tabla con: vehículo, precio sugerido, confianza, estrategia usada, fecha. - Filtros: por marca, rango de precio, nivel de confianza, fecha. - Ordenamiento por cualquier columna. - Paginación de 50 registros. - Enlace a detalle de cada valuación. | L | API-02, PRC-08 |
| **PNL-02** | Como **SuperAdmin**, quiero poder hacer override manual del precio sugerido para que pueda corregir valuaciones que el motor calcula incorrectamente. | - Botón "Ajustar precio" en el detalle de valuación. - Campos: `overridePrice` (COP), `reason` (texto obligatorio, min 20 caracteres), `category` (enum: `market_knowledge`, `data_error`, `special_condition`, `other`). - El override se registra en `pricing_override_log`: `original_price`, `override_price`, `reason`, `category`, `user_id`, `created_at`. - El override NO modifica el `pricing_audit_log` original (inmutable). - El precio override se usa como `suggestedPrice` en la subasta. | M | PNL-01, PRC-08 |
| **PNL-03** | Como **SuperAdmin**, quiero un dashboard de salud del motor de pricing para que pueda detectar problemas antes de que afecten a los usuarios. | - Métricas: cantidad de valuaciones/día, distribución de confianza, % de overrides, desviación promedio entre precio sugerido y precio final de subasta. - Alertas: si % de overrides > 20%, si confianza promedio < 50, si desviación > 30%. - Gráficos de tendencia (últimos 30 días). | L | PNL-01, PRC-08 |
| **PNL-04** | Como **SuperAdmin**, quiero poder configurar los parámetros del motor de pricing desde la UI para que no dependa de deploys para ajustes de negocio. | - UI para editar: precios base por marca, curvas de depreciación, pesos de scoring, factores por ciudad. - Preview del impacto: "Si cambias este parámetro, X vehículos activos cambiarían su precio en promedio Y%". - Confirmación con contraseña para cambios que afecten > 100 vehículos. - Historial de cambios de configuración visible. | L | PRC-01, SCR-05, NOR-04 |
| **PNL-05** | Como **SuperAdmin**, quiero ver un comparativo entre el precio sugerido y el precio final de subasta para que pueda medir la efectividad del motor. | - Tabla: vehículo, precio sugerido, precio final, diferencia ($ y %), fecha. - Filtros: solo overrides, solo desviaciones > 20%, por marca. - KPI: "accuracy rate" = % de subastas donde el precio final está dentro del rango [minPrice, maxPrice]. - Meta: accuracy rate > 60% en el primer trimestre. | M | PNL-01, PRC-08 |

---

### Épica 7: Tracking y Analytics (Sprint 7–8)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **TRK-01** | Como **product owner**, quiero tracking de cada evento del ciclo de pricing para que pueda analizar el funnel completo desde ingestión hasta subasta. | - Eventos emitidos vía `EventEmitter2`: `pricing.valuation.requested`, `pricing.valuation.completed`, `pricing.override.applied`, `pricing.auction.completed`. - Cada evento incluye: `tenantId`, `vehicleId`, `userId`, `timestamp`, `payload`. - Almacenamiento en tabla `pricing_event_log` con retención de 1 año. | M | PRC-08 |
| **TRK-02** | Como **analista de datos**, quiero un reporte mensual automático de rendimiento del motor de pricing para que el equipo tenga visibilidad sin consultar el panel. | - Job cron mensual (1ro de cada mes a las 6:00 AM COT). - Métricas: total valuaciones, accuracy rate, % overrides, top 5 marcas con mayor desviación, distribución de confianza. - Output: JSON almacenado en `pricing_monthly_report`. - Notificación a `SUPERADMIN` cuando el reporte esté listo (via sistema de notificaciones existente). | M | TRK-01, PNL-05 |
| **TRK-03** | Como **analista de datos**, quiero poder exportar datos de pricing a CSV para que pueda hacer análisis en herramientas externas (Excel, Google Sheets). | - Endpoint `GET /api/pricing/export` con filtros de fecha y marca. - Formato CSV con: vehículo, precio sugerido, precio final, confianza, factores principales. - Límite: máximo 10,000 registros por exportación. - Solo `SUPERADMIN`. - Datos PII excluidos (sin placas, sin nombres). | S | PRC-08 |
| **TRK-04** | Como **ingeniero de backend**, quiero métricas de performance del servicio de pricing para que pueda detectar degradación antes de que afecte a los usuarios. | - Métricas: latencia p50/p95/p99, tasa de errores, throughput (valuaciones/min). - Logging estructurado con `requestId`, `duration_ms`, `cache_hit`, `data_sources_used[]`. - Alerta si p95 > 1000ms o error rate > 5%. - Integración con logging existente (console → CloudWatch). | M | API-01 |
| **TRK-05** | Como **product owner**, quiero un análisis de correlación entre precio sugerido, precio de subasta y tiempo de venta para que pueda calibrar el motor. | - Vista materializada que cruce: `pricing_audit_log` con `Auction` (status ENDED). - Métricas: correlación precio sugerido vs final, tiempo promedio de subasta por rango de confianza, tasa de subastas sin ofertas por rango de precio. - Actualización diaria (cron a las 2:00 AM COT). | L | TRK-01, ING-04 |

---

### Épica 8: QA y Validación (Sprint 6–8, paralelo)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **QA-01** | Como **QA engineer**, quiero un suite de tests de regresión para el motor de pricing con al menos 50 casos de prueba para que cada cambio en la fórmula sea validado automáticamente. | - Dataset de prueba con 50 vehículos reales (datos anonimizados). - Para cada vehículo: input, precio esperado (rango), fuente de verdad. - Tests ejecutados en CI/CD (Jest). - Threshold: 90% de casos dentro del rango esperado. - Reporte de resultados con desviaciones. | L | PRC-06 |
| **QA-02** | Como **QA engineer**, quiero tests de boundary para cada factor del motor de pricing para que los edge cases no produzcan resultados absurdos. | - Casos: año 1990 (mínimo), año 2030 (máximo/futuro), km = 0, km = 999,999, score = 0, score = 100, marca desconocida, ciudad sin datos. - Ningún caso debe producir precio < 0 o > 2,000M COP. - El factor nunca debe ser < 0 o > 2.0. - Todos los edge cases retornan warnings apropiados. | M | PRC-06 |
| **QA-03** | Como **QA engineer**, quiero tests de integración que validen el flujo completo desde ingestión hasta valuación para que la cadena de datos funcione end-to-end. | - Test e2e: ingestión RUNT mock → normalización → valuación → response. - Test e2e: importación CSV → normalización → valuación → response. - Test e2e: subasta completada → actualización market data → nueva valuación refleja el dato. - Todos los tests corren contra una base de datos de test (no producción). | L | ING-02, NOR-02, PRC-06 |
| **QA-04** | Como **QA engineer**, quiero tests de performance para el endpoint de valuación para que pueda garantizar los SLAs de latencia. | - Benchmark con k6 o Artillery. - Escenarios: 1 usuario secuencial, 10 concurrentes, 50 concurrentes. - Métrica: p95 < 500ms con 10 usuarios concurrentes. - Identificar bottleneck: ¿DB? ¿cálculo? ¿cache miss? - Reporte guardado en repositorio. | M | API-01 |
| **QA-05** | Como **product owner**, quiero una validación humana de las primeras 100 valuaciones en producción para que pueda calibrar el motor con datos reales. | - Checklist de validación: ¿el precio es razonable? ¿los factores tienen sentido? ¿la confianza refleja la realidad? - Registro de cada validación en spreadsheet compartido. - Feedback loop: ajustar parámetros basado en validaciones. - Criterio de éxito: >70% de valuaciones "razonables" según criterio del equipo. | M | API-01, PNL-01 |

---

### Épica 9: Seguridad y Compliance (Sprint 1–8, continuo)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **SEC-01** | Como **ingeniero de seguridad**, quiero que todos los datos PII (placa, NIT, teléfono, email) estén cifrados at-rest en la base de datos para cumplir con la Ley 1581 de 2012. | - Cifrado a nivel de columna para: `placa`, `nit`, `telefono`, `email` en tablas de datos externos. - Uso de `pgcrypto` o cifrado a nivel aplicación (AES-256). - Key management: clave en AWS Secrets Manager, rotación cada 90 días. - Datos descifrados solo en el servicio, nunca en queries directas a DB. | L | Ninguna |
| **SEC-02** | Como **ingeniero de seguridad**, quiero que el acceso a datos de pricing esté controlado por roles para que solo los usuarios autorizados vean información sensible. | - `SUPERADMIN`: acceso completo (config, overrides, export, datos raw). - `DEALER`: solo valuación de sus propios vehículos, comparables anonimizados. - `PERITO`: solo lectura de valuaciones de vehículos que ha inspeccionado. - `RECOMPRADOR`: sin acceso a pricing (solo ve el precio publicado en subasta). - Middleware de autorización en cada endpoint. | M | API-01 |
| **SEC-03** | Como **compliance officer**, quiero un registro de consentimiento para el uso de datos de cada vehículo para que cumpla con habeas data. | - Campo `data_consent` en el flujo de registro de vehículo. - Texto de consentimiento claro: "Autorizo el uso de los datos de mi vehículo para generar valuaciones de mercado". - Registro: `consent_id`, `user_id`, `vehicle_id`, `consent_text_version`, `granted_at`, `ip_address`. - Sin consentimiento: el vehículo se valúa pero los datos NO se usan para entrenar/mejorar el modelo. | M | Ninguna |
| **SEC-04** | Como **compliance officer**, quiero un proceso de derecho de eliminación (habeas data) para que los usuarios puedan solicitar la eliminación de sus datos de pricing. | - Endpoint interno `DELETE /api/pricing/data/:userId` (solo `SUPERADMIN`). - Proceso: anonimizar datos en `pricing_audit_log` (reemplazar userId, vehicleId con hashes). - Datos agregados (market data) se mantienen (no son PII). - Log de solicitud de eliminación con: `requestDate`, `processedDate`, `processedBy`. - SLA: procesamiento en máximo 15 días hábiles (Ley 1581). | M | PRC-08 |
| **SEC-05** | Como **ingeniero de seguridad**, quiero rate limiting y protección contra abuso en los endpoints de pricing para que el servicio sea resiliente. | - Rate limiting por usuario: 60 req/min en valuación individual, 5 req/min en batch. - Rate limiting por IP: 120 req/min global. - Respuesta 429 con header `Retry-After`. - Logging de intentos bloqueados. - Protección contra enumeración: no revelar si un `vehicleId` existe o no en el response de error. | S | API-01 |
| **SEC-06** | Como **ingeniero de seguridad**, quiero que las conexiones a fuentes de datos externas usen mTLS o API keys rotables para que las credenciales estén protegidas. | - API keys de RUNT, Fasecolda almacenadas en AWS Secrets Manager. - Rotación trimestral de credenciales. - Timeout de conexión: 30s. - Circuit breaker: después de 5 errores consecutivos, dejar de intentar por 5 minutos. - Fallback: si la fuente externa no está disponible, usar último dato en cache. | M | ING-02, ING-03 |

---

### Épica 10: Despliegue y Monitoreo (Sprint 8)

| ID | Historia | Criterios de Aceptación | Estimación | Dependencias |
|----|----------|------------------------|------------|--------------|
| **DEP-01** | Como **DevOps engineer**, quiero un plan de migración de base de datos para las nuevas tablas de pricing para que el despliegue no tenga downtime. | - Migraciones Prisma para todas las tablas nuevas (10+). - Script de seed para datos iniciales (catálogo, ciudades, precios base). - Rollback plan para cada migración. - Prueba de migración en staging antes de producción. - Tiempo estimado de migración: < 5 minutos. | M | Todas las épicas de DB |
| **DEP-02** | Como **DevOps engineer**, quiero feature flags para cada componente nuevo del motor de pricing para que pueda activar/desactivar funcionalidades independientemente. | - Feature flags: `PRICING_V2_ENABLED`, `FASECOLDA_ENABLED`, `CITY_ADJUSTMENT_ENABLED`, `DOC_SCORING_ENABLED`, `MARKET_MEDIAN_ENABLED`. - Almacenados en `.env` (MVP) o tabla `feature_flags` (V2). - Si el flag está desactivado, el sistema usa el comportamiento anterior. - No hay impacto de performance por evaluar flags (lectura de variable en memoria). | S | PRC-06 |
| **DEP-03** | Como **DevOps engineer**, quiero dashboards de monitoreo para el motor de pricing para que pueda detectar problemas en producción rápidamente. | - Dashboard CloudWatch con: latencia de endpoints, error rate, CPU/memoria del servicio. - Alarmas: latencia p95 > 1s, error rate > 5%, memoria > 80%. - Logs estructurados con correlation ID. - Retención de logs: 30 días en CloudWatch, 90 días en S3. | M | DEP-01 |
| **DEP-04** | Como **DevOps engineer**, quiero un runbook de operaciones para el motor de pricing para que el equipo pueda resolver incidentes sin depender de una sola persona. | - Documentación: cómo reiniciar el servicio, cómo hacer rollback de una migración, cómo invalidar cache, cómo desactivar una fuente de datos. - Playbooks para incidentes comunes: fuente externa caída, precio absurdo publicado, cache corrupto. - Contactos de escalación. | S | DEP-01, DEP-03 |
| **DEP-05** | Como **product owner**, quiero un plan de rollout gradual (canary) para que el nuevo motor de pricing se valide con un subset de usuarios antes del lanzamiento general. | - Fase 1: solo `SUPERADMIN` puede ver el nuevo pricing (1 semana). - Fase 2: 10% de dealers ven el nuevo pricing como "precio sugerido alternativo" junto al actual (2 semanas). - Fase 3: 50% de dealers (1 semana). - Fase 4: 100% de dealers, pricing anterior deprecado. - En cada fase: medir accuracy rate y recoger feedback. - Criterio de avance: accuracy rate > 60% y no más de 5 escalaciones por semana. | M | DEP-02, QA-05 |

---

## 16. STACK TÉCNICO SUGERIDO

### Tabla resumen

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| **Backend** | NestJS 11 (existente) | Ya es el framework del proyecto. Módulos de NestJS permiten encapsular el pricing engine sin crear un servicio separado. La inyección de dependencias facilita el patrón Strategy para evolucionar la fórmula. No tiene sentido introducir otro framework. |
| **Base de datos transaccional** | PostgreSQL (existente) + Prisma 7.5 | Ya almacena todo el modelo de negocio. Las nuevas tablas de pricing (catálogo, auditoría, configuración) son extensiones naturales del esquema. Prisma genera tipos TypeScript que mantienen type-safety end-to-end. PostgreSQL soporta JSON, `pgcrypto`, vistas materializadas y funciones window que necesitaremos. |
| **Data warehouse / analytics** | PostgreSQL + vistas materializadas (MVP) → ClickHouse (V3, si se necesita) | **Por qué no ClickHouse desde el inicio:** con < 10,000 subastas/mes, PostgreSQL con vistas materializadas es suficiente. Agregar ClickHouse implica: nuevo servidor, ETL pipeline, otro ORM, nuevo punto de falla. **Cuándo migrar:** cuando las queries analíticas tarden > 5s o el volumen supere 100,000 registros/mes. **Costo MVP:** $0 adicional (ya está pagando PostgreSQL). **Costo ClickHouse:** ~$150–300 USD/mes en ClickHouse Cloud. |
| **Cola / Event bus** | `EventEmitter2` (MVP) → BullMQ + Redis (V2) | **MVP:** NestJS tiene `EventEmitter2` integrado. Suficiente para emitir eventos de pricing internamente y procesarlos en el mismo proceso. **Cuándo agregar BullMQ:** cuando haya procesamiento batch (>10 valuaciones simultáneas), jobs de ingestión que tarden > 30s, o necesidad de retry con backoff. **Costo Redis:** $15–50 USD/mes en ElastiCache (t3.micro). **Alternativa descartada:** SQS (más caro, más latencia, overkill para el volumen actual). |
| **Caché** | In-memory cache (`@nestjs/cache-manager` con store en memoria, MVP) → Redis (V2) | **MVP:** `cache-manager` con store local. Cachear: configuración de pricing (1h TTL), datos Fasecolda (24h TTL), market aggregates (1h TTL). **Por qué no Redis ahora:** agregar Redis solo para cache no justifica la complejidad operacional. El servicio corre en un solo instance. **Cuándo migrar:** al escalar a múltiples instancias del backend, o cuando se agregue BullMQ (Redis ya estaría disponible). **Invalidación:** TTL-based (simple) → event-based (V2). |
| **Storage de imágenes/reportes** | AWS S3 (existente) | Ya se usa para fotos de vehículos. Los reportes PDF de pricing se almacenarían en el mismo bucket con un prefix `/pricing-reports/`. Los CSVs de exportación se generan on-demand y se guardan temporalmente (TTL 24h con lifecycle rule). Sin costo adicional significativo. |
| **Feature store** | Tabla PostgreSQL `vehicle_features` (MVP) → Redis hash (V2) → Feature store dedicado (V3) | **MVP:** tabla con features pre-calculadas por vehículo: `depreciation_factor`, `market_position`, `doc_score`, `mechanical_score`. Se actualiza cuando cambian los datos del vehículo. **Por qué no un feature store dedicado:** Feast, Tecton, etc. son para equipos de ML con cientos de features y modelos en producción. No es el caso aún. **Cuándo migrar:** al implementar modelos ML que necesiten features en tiempo real con latencia < 10ms. |
| **Model serving** | In-process TypeScript (MVP) → Módulo NestJS separado (V2) → Servicio Python/FastAPI (V3) | **MVP:** la lógica de pricing es una clase TypeScript con el patrón Strategy. No hay modelo ML, solo reglas de negocio. Ejecutar in-process evita latencia de red y complejidad operacional. **V2:** cuando la lógica crezca, extraer a un módulo NestJS con su propio controller (pero mismo proceso). **V3:** si se implementa ML (gradient boosting, neural nets), mover a Python/FastAPI como microservicio. Comunicación vía HTTP interno o gRPC. **Cuándo:** cuando tengan > 50,000 transacciones históricas para entrenar un modelo. |
| **Monitoreo** | Structured logging con `winston`/`pino` → CloudWatch (MVP) → Grafana + Prometheus (V2) | **MVP:** logging estructurado JSON ya es el estándar. CloudWatch Logs ya se usa en AWS (presumiblemente). Agregar métricas custom con `putMetricData`. **Costo MVP:** incluido en CloudWatch free tier (hasta cierto volumen). **V2:** si necesitan dashboards custom, alerting avanzado, o métricas de negocio en tiempo real, agregar Grafana Cloud (~$0 free tier, $49/mes pro) o self-hosted con Prometheus. |
| **Auth** | JWT con `passport-jwt` (existente) | No hay razón para cambiar. El pricing engine se protege con los mismos guards (`JwtAuthGuard`, `RolesGuard`) y decoradores (`@Roles`, `@CurrentUser`) que el resto del sistema. Se agregan roles específicos de pricing en los decoradores existentes. |
| **Infra cloud** | AWS (existente) | ECS/Fargate para el backend, RDS para PostgreSQL, S3 para storage. Todo existente. Las únicas adiciones serían: ElastiCache (cuando se necesite Redis), Secrets Manager (para API keys de fuentes externas), y CloudWatch dashboards adicionales. **Costo incremental estimado (MVP):** ~$50–100 USD/mes (Secrets Manager + CloudWatch adicional). |
| **Scraping / ETL** | Módulos NestJS custom + `@nestjs/schedule` (existente) → Dedicated worker (V2) | **MVP:** jobs cron con `@nestjs/schedule` (ya se usa para reconciliación de subastas). Jobs de ingestión corren en el mismo proceso. **Por qué no Scrapy/Playwright:** el scraping de TuCarro/MercadoLibre tiene riesgos legales significativos (ver Sección 17). La estrategia recomendada es: API oficial (RUNT via proveedor), datos con licencia (Fasecolda), importación manual (Revista Motor). **Cuándo agregar worker dedicado:** si los jobs de ingestión tardan > 60s y bloquean el event loop. |

### Diagrama de evolución del stack

```
MVP (Sprint 1-4)              V2 (Sprint 5-8)              V3 (6+ meses)
─────────────────             ─────────────────             ─────────────────
NestJS monolito               NestJS monolito               NestJS + microservicio ML
PostgreSQL                    PostgreSQL + materialized      PostgreSQL + ClickHouse
In-memory cache               Redis (cache + BullMQ)         Redis cluster
EventEmitter2                 BullMQ                         BullMQ + EventBridge
Console logging               CloudWatch + alertas           Grafana + Prometheus
$0 adicional/mes              ~$80-150 USD/mes adicional     ~$400-800 USD/mes adicional
```

### Consideraciones de costo mensual estimado (incremental sobre infraestructura actual)

| Fase | Componentes nuevos | Costo estimado USD/mes |
|------|-------------------|----------------------|
| MVP | Secrets Manager, CloudWatch extra | $30–50 |
| V2 | + ElastiCache Redis (t3.micro), CloudWatch dashboards | $80–150 |
| V3 | + ClickHouse Cloud, Grafana Cloud Pro, instancia ML | $400–800 |

---

## 17. SEGURIDAD Y CUMPLIMIENTO

### 17.1 Manejo de PII (Información Personal Identificable)

#### Definición de PII en el contexto Mubis

| Dato | Clasificación | Justificación |
|------|--------------|---------------|
| **Placa del vehículo** | PII — Alta sensibilidad | Identificador único vinculado a persona natural. La SIC (Superintendencia de Industria y Comercio) ha establecido en concepto que la placa puede considerarse dato personal cuando se asocia a información del titular. |
| **NIT / Cédula** | PII — Alta sensibilidad | Identificador tributario/personal. Regulado directamente por Ley 1581. |
| **Teléfono** | PII — Media sensibilidad | Dato de contacto personal. Requiere consentimiento para uso comercial. |
| **Email** | PII — Media sensibilidad | Dato de contacto personal. Ya gestionado por el sistema de auth existente. |
| **Nombre del dealer** | PII — Baja sensibilidad | En contexto B2B es dato comercial, pero sigue siendo dato personal del representante. |
| **Dirección de sucursal** | No PII | Dato comercial público de la empresa, no de persona natural. |
| **Historial de precios (agregado)** | No PII | Datos estadísticos sin identificación de persona. |

#### Cifrado

**En tránsito:**
- TLS 1.3 para todas las conexiones (ya configurado en AWS/NestJS).
- Conexiones a PostgreSQL vía SSL (`sslmode=require` en connection string).
- API keys de fuentes externas transmitidas solo via HTTPS.

**At-rest:**
- PostgreSQL RDS con cifrado de volumen habilitado (AES-256, gestionado por AWS KMS).
- Cifrado a nivel de columna para campos PII en tablas de datos externos:
  ```
  placa        → pgp_sym_encrypt(placa, key) / cifrado AES en aplicación
  nit          → pgp_sym_encrypt(nit, key)
  raw_response → cifrado AES-256 a nivel aplicación (puede contener PII)
  ```
- Clave de cifrado almacenada en AWS Secrets Manager, nunca en código ni en `.env`.
- Rotación de clave cada 90 días con re-cifrado gradual (background job).

#### Control de acceso por rol

| Dato | SUPERADMIN | DEALER | PERITO | RECOMPRADOR |
|------|-----------|--------|--------|-------------|
| Placa descifrada | Lectura | Solo sus vehículos | Solo vehículos asignados | Nunca |
| Valuación completa | Lectura/Escritura | Solo sus vehículos | Solo lectura (asignados) | Nunca |
| Pricing config | Lectura/Escritura | Nunca | Nunca | Nunca |
| Override de precio | Escritura | Nunca | Nunca | Nunca |
| Datos raw de fuentes | Lectura | Nunca | Nunca | Nunca |
| Comparables | Lectura | Lectura (anonimizados) | Nunca | Nunca |
| Export de datos | Escritura | Nunca | Nunca | Nunca |
| Audit log | Lectura | Nunca | Nunca | Nunca |

#### Minimización de datos

- **Principio:** recopilar solo los datos necesarios para la valuación.
- La placa se usa para consulta RUNT; una vez obtenidos los datos técnicos, la placa se almacena cifrada y solo se descifra para re-consultas.
- Los comparables que se muestran a dealers NO incluyen: placa, nombre del vendedor, NIT, ciudad exacta (solo departamento).
- Los datos raw de fuentes externas se eliminan después de 90 días; solo se mantienen los datos derivados (normalizados).
- En exports CSV: los campos PII se excluyen automáticamente. Si se necesitan, requieren autorización explícita de SUPERADMIN con registro de motivo.

---

### 17.2 Trazabilidad de fuentes

#### Regla fundamental
> **Todo dato que influya en una valuación debe tener: fuente, timestamp, y nivel de confianza.**

#### Modelo de metadata por dato

```
{
  "source": "RUNT" | "FASECOLDA" | "INTERNAL_HISTORY" | "MANUAL_IMPORT" | "OVERRIDE",
  "fetched_at": "2026-03-25T14:30:00Z",
  "confidence": 0.95,          // 0.0 a 1.0
  "expires_at": "2026-04-25T14:30:00Z",
  "provider": "DataCrédito",   // proveedor específico si aplica
  "raw_hash": "sha256:abc...", // hash del dato original para verificación
  "version": "v1.2"            // versión del adapter que procesó el dato
}
```

#### Audit trail de valuaciones

Tabla `pricing_audit_log` (APPEND-ONLY, nunca UPDATE/DELETE):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID | Identificador único |
| `tenant_id` | String | Tenant |
| `vehicle_id` | String | Vehículo evaluado |
| `auction_id` | String? | Subasta asociada (si aplica) |
| `requested_by` | String | Usuario que solicitó la valuación |
| `request_context` | Enum | `MANUAL`, `AUCTION_PUBLISH`, `BATCH`, `API` |
| `input` | JSON | Datos de entrada usados |
| `output` | JSON | Resultado completo (precio, rango, confianza) |
| `breakdown` | JSON | Desglose de factores y su impacto |
| `data_sources` | JSON | Array de fuentes consultadas con metadata |
| `strategy_name` | String | Nombre de la estrategia usada |
| `strategy_version` | String | Versión de la fórmula |
| `config_version` | String | Versión de la configuración de pesos |
| `duration_ms` | Int | Tiempo de procesamiento |
| `created_at` | Timestamp | Fecha de creación (inmutable) |

**Política de inmutabilidad:**
- La tabla no tiene trigger de UPDATE/DELETE.
- En Prisma, el modelo se expone solo con método `create()` en el servicio; no se expone `update()` ni `delete()`.
- Si se necesita "corregir" una valuación, se crea un nuevo registro con `request_context = 'CORRECTION'` que referencia al registro original via `correction_of_id`.

---

### 17.3 Auditoría de decisiones

#### Override tracking

Tabla `pricing_override_log`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | CUID | Identificador único |
| `tenant_id` | String | Tenant |
| `audit_log_id` | String | Referencia al `pricing_audit_log` original |
| `vehicle_id` | String | Vehículo |
| `original_price` | BigInt | Precio calculado por el motor |
| `override_price` | BigInt | Precio manual establecido |
| `deviation_pct` | Float | % de desviación respecto al original |
| `reason` | String | Justificación (mínimo 20 caracteres) |
| `category` | Enum | `MARKET_KNOWLEDGE`, `DATA_ERROR`, `SPECIAL_CONDITION`, `NEGOTIATION`, `OTHER` |
| `approved_by` | String? | Si la desviación > 30%, requiere aprobación de otro SUPERADMIN |
| `approved_at` | Timestamp? | Fecha de aprobación |
| `user_id` | String | Quién hizo el override |
| `created_at` | Timestamp | Cuándo se hizo |

#### Workflow de aprobación

```
Desviación < 15%  → Override directo, solo log
Desviación 15-30% → Override directo + notificación a todos los SUPERADMIN
Desviación > 30%  → Requiere aprobación de un segundo SUPERADMIN antes de aplicarse
Desviación > 50%  → Bloqueado. Se requiere justificación extensa + aprobación + revisión posterior
```

#### Política de retención

| Tipo de dato | Retención | Justificación |
|-------------|-----------|---------------|
| `pricing_audit_log` | 3 años | Cumplimiento tributario colombiano (art. 632 del Estatuto Tributario). |
| `pricing_override_log` | 3 años | Misma justificación + auditoría interna. |
| `pricing_event_log` | 1 año | Datos operacionales, no regulatorios. |
| `raw_response` (fuentes externas) | 90 días | Minimización de datos. Solo se necesitan para debug. |
| Datos de configuración (historial) | Indefinido | Necesario para reproducir valuaciones históricas. |
| `consent_log` | Mientras dure la relación + 5 años | Requisito de Ley 1581 para demostrar consentimiento. |

---

### 17.4 Límites de uso de datos externos

#### RUNT (Registro Único Nacional de Tránsito)

| Aspecto | Detalle |
|---------|---------|
| **Acceso** | No hay API pública directa. Se accede vía proveedores autorizados (ej: DataCrédito Experian, Infolaft, Certicámara). |
| **Costo** | $800–3,000 COP por consulta según el proveedor y el volumen. |
| **Términos** | Los datos son del Ministerio de Transporte. El proveedor autorizado define los términos de uso comercial. Típicamente: uso solo para el fin declarado (valuación de vehículos), no redistribución, no almacenamiento masivo. |
| **Riesgos** | El proveedor puede revocar acceso si detecta uso no autorizado. Cambios de precio unilaterales. |
| **Recomendación** | Firmar contrato con proveedor autorizado. Definir volumen mensual esperado (estimar 500–2,000 consultas/mes inicialmente). Almacenar solo datos derivados, no la respuesta raw del RUNT más allá de 90 días. |

#### Fasecolda (Federación de Aseguradores Colombianos)

| Aspecto | Detalle |
|---------|---------|
| **Acceso** | Guía de valores publicada en fasecolda.com. No hay API pública. Algunos proveedores ofrecen acceso automatizado bajo licencia. |
| **Costo** | La consulta manual es gratuita (web pública). El acceso automatizado/bulk requiere acuerdo comercial (~$2M–5M COP/mes según volumen). |
| **Términos** | Los datos son propiedad de Fasecolda. Uso comercial requiere licencia explícita. No se pueden redistribuir los valores como propios. |
| **Riesgos** | Sin licencia, usar datos de Fasecolda de forma automatizada puede generar un reclamo legal. Los valores se actualizan anualmente, pero pueden cambiar sin aviso. |
| **Recomendación** | Fase 1: importación manual mensual (CSV del equipo). Fase 2: negociar acuerdo de licenciamiento con Fasecolda o proveedor intermediario. Siempre atribuir: "Valor de referencia basado en guía Fasecolda". |

#### TuCarro / MercadoLibre

| Aspecto | Detalle |
|---------|---------|
| **Acceso** | MercadoLibre tiene API pública (`api.mercadolibre.com`) con datos de listados. TuCarro (propiedad de OLX/Autos.com) no tiene API pública. |
| **Términos** | Los ToS de MercadoLibre prohíben explícitamente el scraping. La API tiene rate limits y requiere registro de app. Los datos de precios de listados son "asking prices" (no precios de venta real), lo que limita su utilidad para valuación. |
| **Riesgos legales** | Scraping: violación de ToS → bloqueo de IP, posible acción legal. En Colombia, el scraping no está explícitamente regulado, pero podría constituir competencia desleal (Ley 256 de 1996) o violación de derechos de autor sobre la base de datos (Decisión 351 CAN). |
| **Alternativas** | 1. API oficial de MercadoLibre (limitada pero legal). 2. Partnership comercial con TuCarro/OLX. 3. No usar estos datos y enfocarse en datos propios + RUNT + Fasecolda. |
| **Recomendación** | **No hacer scraping.** Explorar API de MercadoLibre para datos complementarios (no como fuente principal). Priorizar datos internos de Mubis que son más valiosos (precios reales de transacción vs. asking prices). |

#### Revista Motor

| Aspecto | Detalle |
|---------|---------|
| **Acceso** | Contenido editorial publicado en revistamotor.com.co. Guía de precios publicada periódicamente. |
| **Términos** | Contenido protegido por derechos de autor. Uso comercial de los precios publicados requeriría licencia de El Tiempo Casa Editorial. |
| **Costo** | Licencia comercial: negociable, probablemente $3M–10M COP/mes. |
| **Recomendación** | Fase 1: el equipo puede consultar manualmente como referencia de calibración (uso personal/interno). Fase 2: si los precios de Revista Motor mejoran significativamente la precisión, negociar licencia. No automatizar extracción sin licencia. |

---

### 17.5 Riesgos de scraping

#### Análisis de riesgos legales en Colombia

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| **Violación de ToS** → bloqueo de IP/cuenta | Alta | Medio | No hacer scraping. Usar APIs oficiales o partnerships. |
| **Acción legal por competencia desleal** (Ley 256/1996) | Media | Alto | Evitar extracción masiva de datos de competidores directos. |
| **Reclamo por derechos de autor sobre base de datos** (Decisión 351 CAN) | Baja-Media | Alto | Las bases de datos tienen protección sui generis en la CAN. No copiar bases de datos completas. |
| **Bloqueo técnico** (WAF, CAPTCHA, rate limiting) | Alta | Bajo | No depender de scraping como fuente principal. |
| **Datos de baja calidad** (asking prices ≠ selling prices) | Alta | Medio | Los precios de listados de portales son "deseados", no transaccionales. Introducen sesgo al alza. |
| **Habeas data** si se scraping datos personales de vendedores | Media | Alto | Nunca scrapear datos personales (nombre, teléfono, email) de vendedores en portales. |

#### Alternativas al scraping

1. **Datos internos de Mubis** (fuente principal): precios reales de transacción. Crecen con cada subasta completada. Son la fuente más valiosa a mediano plazo.
2. **Proveedores de datos autorizados**: DataCrédito, Infolaft ofrecen datos RUNT bajo licencia.
3. **Importación manual**: el equipo de operaciones importa datos de referencia mensuales de fuentes públicas.
4. **Partnerships**: negociar acceso a datos con TuCarro/OLX a cambio de algo (ej: flujo de leads).
5. **API oficial MercadoLibre**: datos limitados pero legales. Útil como señal complementaria (no como fuente principal).

---

### 17.6 Privacidad y retención

#### Cumplimiento Ley 1581 de 2012

| Obligación legal | Implementación en Mubis |
|-----------------|------------------------|
| **Principio de finalidad** (art. 4) | Los datos se recopilan exclusivamente para valuación de vehículos. No se usan para marketing, perfilamiento, ni se comparten con terceros sin consentimiento. |
| **Principio de libertad** (art. 4) | El consentimiento se obtiene explícitamente al registrar el vehículo (checkbox + texto legal). El usuario puede revocar el consentimiento en cualquier momento. |
| **Principio de veracidad** (art. 4) | Los datos de fuentes externas se validan (ver NOR-05). Los datos del usuario se pueden actualizar por el usuario mismo. |
| **Principio de transparencia** (art. 4) | Política de privacidad accesible que explica qué datos se recopilan, para qué, y cómo se protegen. |
| **Principio de acceso y circulación restringida** (art. 4) | Control de acceso por roles (ver tabla 17.1). Datos PII accesibles solo por personal autorizado. |
| **Principio de seguridad** (art. 4) | Cifrado at-rest y in-transit. Control de acceso. Logging de acceso a datos PII. |
| **Principio de confidencialidad** (art. 4) | Los datos de valuación de un dealer no son visibles para otros dealers (solo comparables anonimizados). |
| **Derecho de consulta** (art. 14) | El dealer puede consultar todas las valuaciones de sus vehículos via API/UI. |
| **Derecho de queja** (art. 14) | El usuario puede presentar queja ante la SIC. Mubis debe responder en 15 días hábiles. |
| **Derecho de supresión** (art. 14) | Implementado vía SEC-04: anonimización de datos en logs de pricing cuando el usuario lo solicite. |

#### Períodos de retención

| Categoría de dato | Retención | Base legal | Acción al vencer |
|-------------------|-----------|-----------|-----------------|
| Datos de valuación (audit log) | 3 años | Estatuto Tributario art. 632 | Anonimizar (reemplazar IDs con hashes) |
| Consentimiento | Vigencia de la relación + 5 años | Ley 1581 art. 14 | Archivar (no eliminar — es evidencia) |
| Datos PII en tablas externas | 1 año | Minimización | Eliminar registros con PII descifrable |
| Raw responses de APIs | 90 días | Minimización | Eliminar |
| Datos agregados/estadísticos | Indefinido | No contienen PII | N/A |
| Overrides y decisiones manuales | 3 años | Auditoría interna | Anonimizar |
| Logs operacionales | 90 días | Operación | Eliminar |

#### Transferencia internacional de datos

- **Situación actual:** AWS tiene data centers en la región `us-east-1` (Virginia) y `sa-east-1` (São Paulo). Si los datos residen fuera de Colombia, aplica transferencia internacional.
- **Requisito legal:** La transferencia internacional requiere que el país receptor tenga un nivel adecuado de protección de datos, o que el titular autorice expresamente.
- **Recomendación:** Usar `us-east-1` (EE.UU.) está permitido con consentimiento explícito del titular. Incluir cláusula en términos de servicio: "Sus datos pueden ser almacenados en servidores de Amazon Web Services ubicados en Estados Unidos, país que cuenta con normativa de protección de datos".
- **Alternativa (mayor cumplimiento):** Usar `sa-east-1` (São Paulo) como región primaria. Brasil y Colombia son miembros de la CAN y tienen acuerdos de adecuación de datos.

---

### 17.7 Licenciamiento

#### Componentes open source utilizados

| Componente | Licencia | Riesgo | Acción requerida |
|-----------|---------|--------|-----------------|
| NestJS | MIT | Ninguno | Libre para uso comercial. |
| Prisma | Apache 2.0 | Ninguno | Libre para uso comercial. |
| PostgreSQL | PostgreSQL License (permisiva) | Ninguno | Libre para uso comercial. |
| Redis | BSD-3 (hasta v7.0) / SSPL (v7.2+) | Bajo | Redis v7.0 (BSD) o Valkey (BSD) son seguros. SSPL afecta solo si se ofrece Redis como servicio. ElastiCache de AWS usa Valkey. |
| BullMQ | MIT | Ninguno | Libre para uso comercial. |
| Jest | MIT | Ninguno | No aplica en producción. |
| TypeScript | Apache 2.0 | Ninguno | Compilador, no se distribuye. |
| `class-validator` | MIT | Ninguno | Libre para uso comercial. |
| `cache-manager` | MIT | Ninguno | Libre para uso comercial. |

#### APIs y datos de terceros — términos comerciales

| Proveedor | Tipo de costo | Estimación | Negociación recomendada |
|-----------|--------------|-----------|----------------------|
| **Proveedor RUNT** (ej: DataCrédito) | Por consulta | $800–3,000 COP/consulta. Con 1,000 consultas/mes: $800K–3M COP/mes (~$200–750 USD). | Negociar volumen. Paquete de 1,000 consultas/mes con descuento. |
| **Fasecolda** (acceso automatizado) | Mensual | $2M–5M COP/mes (~$500–1,250 USD). | Empezar con importación manual gratuita. Negociar licencia solo cuando el volumen lo justifique. |
| **MercadoLibre API** | Gratis (con límites) | $0 (rate limits aplican). | Registrar app oficial. Respetar rate limits. |
| **Revista Motor** (licencia datos) | Mensual | $3M–10M COP/mes (~$750–2,500 USD). | Solo si mejora significativamente la precisión. Validar con datos internos primero. |
| **AWS Secrets Manager** | Por secreto/mes + por consulta | ~$0.40/secreto/mes + $0.05/10,000 consultas. Total: < $5 USD/mes. | Incluido en costos de infraestructura. |

#### Costo total estimado de datos externos (mensual)

| Escenario | Fuentes | Costo mensual COP | Costo mensual USD |
|-----------|---------|-------------------|-------------------|
| **MVP (mínimo)** | Datos internos + importación manual Fasecolda | $0 | $0 |
| **Fase 2** | + Proveedor RUNT (500 consultas/mes) | $400K–1.5M | $100–375 |
| **Fase 3** | + Licencia Fasecolda automatizada | $2.4M–6.5M | $600–1,625 |
| **Fase 4 (completo)** | + Revista Motor (si se justifica) | $5.4M–16.5M | $1,350–4,125 |

---

## 20. RECOMENDACIÓN FINAL

### 20.1 Arquitectura recomendada para comenzar rápido

La recomendación es **evolucionar el `PricingService` existente** en el monolito NestJS actual, no construir un sistema nuevo desde cero.

**Punto de partida concreto:** el archivo `src/pricing/pricing.service.ts` actual tiene ~165 líneas con una fórmula funcional que ya:
- Calcula precio base por marca.
- Aplica depreciación por año y km.
- Integra score de inspección.
- Consulta historial de mercado interno.
- Retorna rango de precio con nivel de confianza.

**Lo que se debe agregar de forma incremental:**

```
Semana 1-2:  Mover BRAND_BASE a tabla configurable (PRC-01)
             Crear pricing_audit_log (PRC-08)
             → Ya se tiene trazabilidad de cada decisión

Semana 3-4:  Curvas de depreciación no lineales (PRC-02)
             Ajuste por ciudad (PRC-04)
             → La valuación mejora un ~20% en precisión

Semana 5-6:  Scoring de documentación (SCR-01)
             Mediana + ponderación por recencia (PRC-05)
             → La valuación refleja riesgo documental y datos recientes

Semana 7-8:  Panel interno con overrides (PNL-01, PNL-02)
             → El equipo puede intervenir y calibrar

Semana 9-12: Integración RUNT (ING-02)
             Catálogo normalizado (NOR-01)
             → Datos de referencia mejoran la base
```

**Infraestructura nueva requerida para empezar: NINGUNA.** Todo corre en el mismo PostgreSQL, el mismo NestJS, el mismo deploy.

---

### 20.2 Tradeoffs explícitos

#### Velocidad vs. Precisión

| Opción | Ventaja | Desventaja | Recomendación |
|--------|---------|-----------|---------------|
| **Reglas de negocio (actual → V2)** | Implementable en días. Transparente. Debuggeable. El equipo entiende cada factor. | Precisión limitada. No captura patrones complejos. Requiere ajuste manual constante. | **Empezar aquí.** Las reglas bien calibradas con datos de Fasecolda + historial interno pueden alcanzar accuracy >70%. |
| **ML (gradient boosting, V3+)** | Captura patrones no lineales. Mejora con más datos. Menos sesgo humano. | Requiere >50,000 datos de entrenamiento. Modelo opaco. Necesita MLOps. Más caro de operar. | **No antes de tener 50K transacciones.** Con el volumen actual de Mubis, un modelo ML estaría sobreajustado o subentrenado. |

#### Construir vs. Comprar

| Componente | Construir | Comprar/Licenciar | Recomendación |
|-----------|----------|------------------|---------------|
| **Lógica de valuación** | Diferenciador de negocio. Control total. Sin costo de licencia. | Servicios como "Autocom" o "InfoAuto" (no disponibles en Colombia con la cobertura necesaria). | **Construir.** Es el core del negocio. |
| **Datos de referencia** | Historial interno crece con cada subasta. | RUNT, Fasecolda, Revista Motor: datos que no se pueden generar internamente. | **Licenciar datos, construir lógica.** Los datos de referencia externos son complementos necesarios pero no son el core. |
| **Infraestructura ML** | NestJS in-process es suficiente para reglas. | SageMaker, Vertex AI para ML futuro. | **No comprar aún.** Cuando se necesite ML, evaluar costo de SageMaker (~$100–500 USD/mes) vs. servicio Python propio (~$50–100 USD/mes en Fargate). |

#### Monolito vs. Microservicios

| Fase | Arquitectura | Justificación |
|------|-------------|---------------|
| **Ahora (MVP–V2)** | Monolito NestJS con módulo `PricingModule` bien encapsulado | Un solo deployment. Un solo repo. Un solo equipo. Sin overhead de red, service discovery, ni coordenación de deploys. El `PricingModule` ya tiene boundaries claros (su propio controller, service, DTOs). |
| **Cuando extraer (V3+)** | Microservicio de pricing solo SI: hay equipo dedicado de pricing (>2 personas), o se necesita escalar el pricing independientemente del resto, o se implementa modelo ML en Python. | Señales de que es momento: el módulo de pricing tiene > 20 archivos, releases de pricing bloquean releases del resto, o se necesita un stack diferente (Python). |

#### Desafíos específicos de datos en Colombia

| Desafío | Impacto | Mitigación |
|---------|---------|-----------|
| **No hay MLS centralizado** (a diferencia de EE.UU.) | No hay fuente única de precios de transacción de vehículos usados en Colombia. | Construir base de datos propia con las transacciones de Mubis. Cada subasta completada es un data point valioso. |
| **Fasecolda es para seguros, no para compraventa** | Los valores de Fasecolda reflejan valor asegurable, no valor de mercado real. Puede haber desviación del 10–30%. | Usar Fasecolda como ancla de referencia, no como precio definitivo. Ponderar con datos internos. |
| **Mercado fragmentado por ciudad** | Un Corolla en Bogotá puede costar 15% más que en Bucaramanga. Los datos nacionales son poco útiles sin ajuste regional. | Implementar ajuste por ciudad desde la V1 (PRC-04). Clasificar ciudades por tier y aplicar factores. |
| **Informalidad del mercado** | Una proporción significativa de transacciones de vehículos usados ocurre de manera informal (sin registro). | Aceptar que los datos de Mubis representan el segmento formal/concesionario. No extrapolar al mercado informal. |
| **Variabilidad por especificación** | El mismo modelo puede tener versiones con diferencia de precio del 40% (ej: Corolla base vs. Corolla SEG). | Incorporar "línea" o "versión" además de marca/modelo en el catálogo maestro (NOR-01). Requiere dato de RUNT o input del usuario. |

---

### 20.3 Cómo evitar sobreingeniería

**Principio rector: no construyas infraestructura para problemas que aún no tienes.**

| Tentación | Por qué evitarla | Cuándo sí hacerlo |
|-----------|-----------------|-------------------|
| "Implementemos ML desde el día 1" | No hay datos suficientes. Un modelo entrenado con 500 subastas será peor que reglas manuales bien calibradas. Costo de MLOps no se justifica. | Cuando tengas >50,000 transacciones históricas Y las reglas manuales no logren accuracy >70% Y haya un ingeniero ML disponible. |
| "Agreguemos Redis para cache" | El servicio actual atiende pocas requests/segundo. `cache-manager` en memoria es suficiente. Redis agrega: costo ($15–50/mes), punto de falla, complejidad operacional. | Cuando tengas múltiples instancias del backend (horizontal scaling), o cuando las queries de pricing tarden >200ms consistentemente, o cuando se agregue BullMQ (Redis ya estaría disponible). |
| "Necesitamos un data warehouse" | Con <10,000 subastas/mes, PostgreSQL con vistas materializadas maneja las queries analíticas en <2 segundos. ClickHouse/Redshift son para millones de registros. | Cuando las queries analíticas tarden >5 segundos, el volumen supere 100K registros/mes, o necesites queries OLAP complejas que PostgreSQL no optimice bien. |
| "Integremos RUNT + Fasecolda + TuCarro + Revista Motor de una vez" | Cada integración tiene costo de desarrollo, mantenimiento, y licenciamiento. El ROI de cada fuente es diferente y no está validado. | Una fuente a la vez. Empezar con datos internos (gratis). Agregar RUNT cuando el contrato esté firmado. Agregar Fasecolda cuando la importación manual muestre valor. |
| "Construyamos un sistema de feature flags con UI" | Para 5 feature flags, variables de entorno son suficientes. Un sistema de feature flags con UI tiene semanas de desarrollo. | Cuando tengas >15 flags o necesites cambiar flags sin deploy (ej: en producción). Considerar LaunchDarkly ($10/mes) antes de construir propio. |
| "Hagamos microservicios desde el inicio" | Un solo equipo de 2–4 personas no necesita coordinación de microservicios. El overhead operacional es mayor que el beneficio. | Cuando haya equipos separados trabajando en pricing vs. subastas, o cuando se necesite escalar pricing independientemente. |

---

### 20.4 Qué construir primero para validar el negocio

**Orden de prioridad basado en impacto/esfuerzo:**

#### 1. Mejorar el servicio de pricing existente con curvas de depreciación por segmento
- **Esfuerzo:** 3–5 días.
- **Impacto:** las curvas exponenciales por segmento (premium, mainstream, economy) son más precisas que el 8% lineal actual. Esto mejora inmediatamente la calidad de los precios sugeridos sin ninguna integración externa.
- **Validación:** comparar los nuevos precios sugeridos con los precios finales de las últimas 100 subastas completadas. Si la desviación promedio baja de >25% a <15%, está funcionando.
- **Archivo a modificar:** `src/pricing/pricing.service.ts`.

#### 2. Agregar scoring de documentación como factor de riesgo
- **Esfuerzo:** 5–8 días.
- **Impacto:** vehículos con documentación incompleta o prendas activas tienen riesgo real que hoy no se refleja en el precio. Un `docFactor` de 0.7–1.0 le da al concesionario una señal clara.
- **Validación:** ¿los vehículos con `docFactor < 0.85` tienen más casos de soporte post-venta?
- **Dato disponible:** el campo `documentation` (JSON) ya existe en `Vehicle` y `Auction`.

#### 3. Agregar ajuste por ciudad
- **Esfuerzo:** 2–3 días.
- **Impacto:** el mercado colombiano tiene diferencias regionales significativas. Bogotá, Medellín y Cali concentran la demanda. Un factor por ciudad mejora la relevancia del precio para cada concesionario.
- **Validación:** comparar precios finales de subastas de misma marca/modelo/año entre ciudades tier 1 y tier 3.
- **Dato disponible:** `city` ya existe en `Vehicle` y `Auction`.

#### 4. Construir búsqueda interna de comparables
- **Esfuerzo:** 3–5 días.
- **Impacto:** el dealer quiere ver "¿a cuánto se vendieron vehículos similares?". Hoy el `getMarketData()` existe pero no se expone de forma útil. Un endpoint de comparables anonimizados da confianza al dealer.
- **Validación:** ¿los dealers que ven comparables publican subastas con precios de inicio más cercanos al mercado?
- **Dato disponible:** tabla `Auction` con `status = 'ENDED'` ya tiene todo lo necesario.

#### 5. Crear audit trail de pricing
- **Esfuerzo:** 3–5 días.
- **Impacto:** sin trazabilidad, no se puede medir si el motor mejora o empeora. El `pricing_audit_log` es el fundamento para toda iteración futura. También cumple requisitos de compliance.
- **Validación:** después de 30 días, ¿se puede responder "cuántas valuaciones se hicieron, cuál fue la accuracy, cuántos overrides hubo"?
- **Requisito:** tabla nueva + insert en cada llamada a `suggestPrice()`.

#### 6. LUEGO integrar fuentes externas
- **Esfuerzo:** 2–4 semanas (incluyendo negociación de contratos).
- **Impacto:** mejora la precisión del precio base (reemplazar `BRAND_BASE` hardcodeado con valores Fasecolda reales). Pero requiere inversión de tiempo y dinero.
- **Validación:** ¿el accuracy rate mejora >10 puntos porcentuales con datos de Fasecolda?
- **Secuencia:** primero Fasecolda (más impacto en precio base), luego RUNT (más impacto en validación de datos del vehículo).

---

## APÉNDICE A: SUPUESTOS EXPLÍCITOS

Los siguientes supuestos se hicieron durante el diseño de este documento. Cada uno debe ser validado con el equipo fundador antes de la implementación.

1. **El volumen actual de subastas es < 1,000/mes.** Esto justifica que PostgreSQL sea suficiente como único motor de datos sin necesidad de data warehouse. Si el volumen es significativamente mayor, las estimaciones de performance deben revisarse.

2. **El equipo de desarrollo es de 2–4 personas.** Esto justifica la decisión de mantener un monolito. Con más de 6 desarrolladores trabajando simultáneamente en pricing, la extracción a microservicio se justificaría antes.

3. **La infraestructura corre en AWS.** Las recomendaciones de servicios (ElastiCache, Secrets Manager, CloudWatch) asumen AWS. Si se usa otro proveedor, los equivalentes deben identificarse.

4. **No existe contrato vigente con proveedores de RUNT ni Fasecolda.** Las estimaciones de costo y timeline de integración asumen que la negociación de contratos empieza desde cero.

5. **El campo `documentation` (JSON) en `Vehicle` contiene datos estructurados sobre SOAT, tecnomecánica, y prendas.** Si la estructura actual es diferente, los criterios de aceptación de SCR-01 deben ajustarse.

6. **El `scoreGlobal` de la inspección es un número 0–100 confiable.** Si el scoring de inspección tiene problemas de calidad (ej: peritos que siempre califican 80), el factor de score en la valuación es menos útil.

7. **Los datos de subastas completadas (`Auction` con `status = 'ENDED'` y `winnerId IS NOT NULL`) reflejan precios reales de mercado.** Si hay subastas fraudulentas, de prueba, o con precios manipulados en los datos, los cálculos de mercado estarán contaminados.

8. **El corretaje es fijo en 250,000 COP por vehículo y no afecta el precio sugerido.** Si el corretaje se vuelve variable o porcentual, la fórmula de pricing debe considerar este costo.

9. **El pricing sugerido es una recomendación, no un precio obligatorio.** El dealer puede publicar la subasta con un precio de inicio diferente al sugerido. Si el pricing se vuelve obligatorio, los requisitos de precisión y auditoría son más estrictos.

10. **Se asume que el deploy es continuo (CI/CD funcional).** Las feature flags y el rollout gradual asumen que se puede deployar a producción varias veces por sprint.

11. **Los roles actuales (`SUPERADMIN`, `DEALER`, `PERITO`, `RECOMPRADOR`) son estables.** La introducción de "Admin de Empresa" y "Admin de Sucursal" (proyecto en curso) puede requerir ajustes en los permisos de pricing.

12. **El sistema multi-tenant funciona correctamente y cada tenant tiene datos aislados.** Las queries de pricing siempre filtran por `tenantId`. Si se necesita pricing cross-tenant (benchmarking entre concesionarios de diferentes plataformas), el diseño cambia significativamente.

13. **Las subastas en Mubis son del tipo C2B (consumidor vende, concesionario compra).** El modelo de pricing asume que el "vendedor" es una persona natural y el "comprador" es un concesionario profesional. Si se agrega B2B o B2C, las fórmulas y factores pueden ser diferentes.

14. **La moneda es siempre COP (pesos colombianos).** No se consideran transacciones en dólares ni conversiones de moneda.

15. **No hay regulación de precios mínimos/máximos para vehículos usados en Colombia.** El motor puede sugerir cualquier precio. Si surgiera regulación de precios (improbable pero posible), se necesitarían validaciones adicionales.

16. **El email service es placeholder (console.log).** Las notificaciones de pricing (alertas al SUPERADMIN, reportes mensuales) dependen de que el servicio de email sea implementado. Mientras tanto, las notificaciones se almacenan en la tabla `Notification` existente y se muestran en la UI.

---

## APÉNDICE B: PREGUNTAS ABIERTAS

Las siguientes preguntas deben ser respondidas por el fundador y/o equipo de producto antes de avanzar con la implementación.

1. **¿Cuál es el nivel de precisión aceptable para el MVP?** ¿Es suficiente que el precio final de subasta esté dentro del rango [minPrice, maxPrice] en el 60% de los casos? ¿O se necesita mayor precisión para que los dealers confíen en el sistema?

2. **¿El precio sugerido es visible para los recompradores (compradores en la subasta)?** Si los recompradores ven el precio sugerido, esto puede anclar las ofertas y afectar la dinámica de subasta. Si solo lo ve el dealer que publica, el impacto es diferente.

3. **¿Se quiere que el motor de pricing sugiera también el precio MÍNIMO de aceptación para el dealer?** Es decir, no solo "publique a X", sino también "no acepte ofertas por debajo de Y". Esto cambia el alcance del motor.

4. **¿Hay presupuesto aprobado para licenciamiento de datos externos (RUNT, Fasecolda)?** Las integraciones con fuentes externas tienen costo recurrente mensual. Si el presupuesto no está aprobado, el plan debe ajustarse para depender solo de datos internos en el corto plazo.

5. **¿Qué sucede cuando el motor no tiene suficientes datos para un modelo/marca específico?** Opciones: (a) mostrar el precio con advertencia de baja confianza, (b) no mostrar precio y pedir input manual, (c) usar solo el precio base genérico. Cada opción tiene implicaciones UX diferentes.

6. **¿Se necesita valuación en tiempo real durante la subasta (pricing dinámico)?** El diseño actual asume que la valuación ocurre al momento de publicar la subasta. Si se necesita re-valuación en tiempo real (ej: "el precio sugerido cambió porque se vendió un vehículo similar hace 5 minutos"), la arquitectura de eventos y cache cambia significativamente.

7. **¿Los datos de pricing se deben compartir con las empresas/concesionarios como parte de un servicio premium?** Si en el futuro se quiere monetizar el pricing como servicio (ej: "suscripción a datos de mercado para concesionarios"), el diseño de API, permisos y licenciamiento de datos cambia.

8. **¿Hay peritos que operan de forma independiente o todos son empleados/contratistas de Mubis?** Si los peritos son independientes, sus scores de inspección pueden tener sesgo que afecte la valuación. Podría necesitarse calibración por perito.

9. **¿Se quiere soportar valuación de motos, camiones, o maquinaria en el futuro?** El modelo actual asume vehículos livianos (automóviles y camionetas). Otros tipos de vehículos tienen mercados y factores de depreciación completamente diferentes.

10. **¿Cómo se maneja la situación cuando el precio sugerido por el motor es significativamente diferente de la expectativa del dealer?** ¿El dealer puede ignorarlo libremente? ¿Se registra como feedback para calibración? ¿Se le pide justificación?

11. **¿Existe un equipo de operaciones/datos que pueda hacer importaciones manuales mensuales de Fasecolda y Revista Motor?** Si no hay personal dedicado, la estrategia de "importación manual como puente" no es viable y se necesita automatización antes.

12. **¿Cuál es la política de la empresa sobre almacenamiento de datos en la nube fuera de Colombia?** Esto afecta la elección de región AWS y los textos de consentimiento de datos.

---

## APÉNDICE C: DECISIONES QUE EL FUNDADOR DEBE TOMAR

### Decisión 1: Alcance del pricing en V1

| Opción | Implicación |
|--------|-------------|
| **A) Solo precio sugerido de publicación** | Alcance limitado. El motor solo recomienda a qué precio publicar la subasta. Rápido de implementar. |
| **B) Precio de publicación + precio mínimo de aceptación** | Más valor para el dealer. Pero requiere calibrar dos outputs (precio inicio y precio piso). Mayor complejidad en la fórmula. |
| **C) Pricing completo (publicación + piso + predicción de cierre)** | Máximo valor pero mayor complejidad. Predecir precio de cierre requiere datos de comportamiento de subastas que se tardan en acumular. |
| **Recomendación** | Opción A para las primeras 4 semanas, luego B. Opción C solo cuando haya >5,000 subastas completadas. |

### Decisión 2: Fuentes de datos externas

| Opción | Costo mensual | Timeline |
|--------|-------------|----------|
| **A) Solo datos internos** | $0 | Inmediato |
| **B) Internos + RUNT** | $200–750 USD | 4–6 semanas (incluye contratación con proveedor) |
| **C) Internos + RUNT + Fasecolda** | $700–2,000 USD | 6–10 semanas |
| **D) Todas las fuentes** | $1,350–4,125 USD | 3–4 meses |
| **Recomendación** | Empezar con A, avanzar a B cuando el contrato esté listo. C solo si el accuracy rate con A+B es < 65%. |

### Decisión 3: Visibilidad del pricing para diferentes roles

| Opción | Implicación |
|--------|-------------|
| **A) Solo SUPERADMIN ve el pricing completo** | Control total. Los dealers ven solo el precio sugerido sin desglose. Menor riesgo de manipulación. |
| **B) DEALER ve pricing completo de sus vehículos** | Mayor transparencia. El dealer entiende por qué el precio es lo que es. Puede generar cuestionamientos o confianza. |
| **C) Todos ven comparables** | Máxima transparencia. Los recompradores ven precios de mercado, lo que puede nivelar el terreno. |
| **Recomendación** | Opción B. La transparencia genera confianza. Los comparables se muestran anonimizados. |

### Decisión 4: Política de override

| Opción | Implicación |
|--------|-------------|
| **A) Override libre por SUPERADMIN** | Flexibilidad total. Riesgo: overrides sin control pueden distorsionar el mercado. |
| **B) Override con aprobación según desviación** | Balance entre flexibilidad y control. Desviación >30% requiere segundo aprobador. |
| **C) Sin override manual** | El motor es ley. Máxima consistencia. Pero si el motor se equivoca, no hay corrección rápida. |
| **Recomendación** | Opción B. Permite correcciones rápidas pero deja registro y requiere justificación. |

### Decisión 5: Estrategia de rollout

| Opción | Implicación |
|--------|-------------|
| **A) Big bang — reemplazar el pricing actual de golpe** | Rápido. Pero si el nuevo motor es peor, afecta a todos los dealers. |
| **B) Canary — rollout gradual por % de dealers** | Más seguro. Permite calibrar. Pero requiere mantener dos versiones durante la transición. |
| **C) Shadow mode — el nuevo motor corre en paralelo sin afectar la producción** | Mínimo riesgo. Se comparan resultados sin impacto. Pero tarda más en validar (no hay feedback real de dealers). |
| **Recomendación** | Opción C por 2 semanas (shadow mode), luego B con 10% → 50% → 100%. |

### Decisión 6: Inversión en team

| Opción | Implicación |
|--------|-------------|
| **A) El equipo actual implementa todo** | Sin costo adicional de contratación. Pero compite con otros features del roadmap. |
| **B) Contratar 1 ingeniero de datos part-time** | ~$3–5M COP/mes. Se encarga de integraciones con RUNT, Fasecolda, normalización. El equipo core se enfoca en la lógica. |
| **C) Contratar equipo dedicado de pricing (2–3 personas)** | $10–15M COP/mes. Delivery más rápido. Pero el volumen actual puede no justificar el costo. |
| **Recomendación** | Opción A para las primeras 8 semanas (los items 1–5 del plan). Opción B cuando se inicien las integraciones externas (item 6). |

### Decisión 7: Retención de datos y compliance

| Opción | Implicación |
|--------|-------------|
| **A) Mínimo legal (según Ley 1581 y Estatuto Tributario)** | 3 años para datos tributarios, 1 año para datos personales post-relación. Menor costo de almacenamiento. |
| **B) Retención extendida para analytics** | 5+ años de historial de pricing. Más datos para entrenar modelos ML en el futuro. Mayor costo y riesgo de compliance. |
| **Recomendación** | Opción A con anonimización. Datos agregados (sin PII) se mantienen indefinidamente para analytics. Datos con PII se anonimizan a los 3 años. |

### Decisión 8: Manejo de modelos/versiones desconocidos

| Opción | Implicación |
|--------|-------------|
| **A) Usar precio genérico por marca** | Siempre se retorna un precio. Pero puede ser muy impreciso para versiones premium o especiales. |
| **B) Retornar error si no se reconoce el modelo** | Mayor precisión (no da precios falsos). Pero bloquea el flujo del dealer si el modelo no está en catálogo. |
| **C) Precio genérico + warning prominente** | Balance: el dealer recibe un precio pero sabe que es aproximado. El sistema solicita más datos para mejorar. |
| **Recomendación** | Opción C. Nunca bloquear al dealer. Siempre dar un precio, pero con `confidence: 'low'` y warning claro. |

### Decisión 9: Integración con el flujo de subasta

| Opción | Implicación |
|--------|-------------|
| **A) Pricing solo como sugerencia informativa** | El dealer puede ignorar completamente el precio sugerido. Mínima fricción. Máxima libertad. |
| **B) Pricing como default con posibilidad de cambiar** | El precio sugerido se pre-llena en el campo de precio inicial. El dealer puede modificarlo. Nudge behavior. |
| **C) Pricing obligatorio con límites** | El dealer debe publicar dentro del rango [minPrice, maxPrice]. Si quiere salirse, necesita justificación. Máximo control de calidad. |
| **Recomendación** | Opción B. El pre-llenado es un nudge poderoso sin ser restrictivo. Registrar cuando el dealer cambia el precio para calibración. |

### Decisión 10: Métricas de éxito del motor de pricing

| Métrica | Target V1 | Target V2 |
|---------|----------|----------|
| **Accuracy rate** (precio final dentro del rango sugerido) | >60% | >75% |
| **Desviación promedio** (diferencia % entre sugerido y final) | <20% | <12% |
| **Adopción** (% de dealers que usan el precio sugerido sin modificar) | >40% | >60% |
| **Override rate** (% de valuaciones con override manual) | <25% | <10% |
| **Latencia** (p95 del endpoint de valuación) | <500ms | <200ms |
| **Disponibilidad** (% uptime del servicio de pricing) | >99% | >99.5% |

**El fundador debe aprobar estos targets antes de empezar.** Son la definición de "éxito" del motor de pricing y determinan cuánto esfuerzo invertir en cada área.

---

> **Nota final:** Este documento es un plan de diseño, no una especificación inmutable. Cada épica debe ser refinada por el equipo en la planificación de sprint. Las estimaciones son indicativas (S=1–2 días, M=3–5 días, L=5–10 días, XL=10+ días) y deben ajustarse según la velocidad real del equipo.
