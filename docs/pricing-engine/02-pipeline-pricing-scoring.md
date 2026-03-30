# Pricing Engine - Pipeline, Pricing y Scoring

**Proyecto:** Mubis - Motor de Pricing para marketplace automotriz C2B
**Fecha:** 2026-03-25
**Stack:** NestJS 11, Prisma 7.5, PostgreSQL
**Moneda:** COP (Pesos Colombianos)

---

## 5. PIPELINE DE DATOS

### 5.1 Diagrama de Flujo General

```
                              ┌─────────────────────┐
                              │   FUENTES EXTERNAS   │
                              └──────────┬──────────┘
                                         │
              ┌──────────────┬───────────┼───────────┬──────────────┐
              ▼              ▼           ▼           ▼              ▼
        ┌───────────┐  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌───────────┐
        │   RUNT    │  │Fasecolda │ │TuCarro │ │ Revista  │ │  Mubis    │
        │  (API 3ro)│  │(API 3ro) │ │(scrape)│ │  Motor   │ │ Historial │
        └─────┬─────┘  └────┬─────┘ └───┬────┘ └────┬─────┘ └─────┬─────┘
              │              │           │           │              │
              ▼              ▼           ▼           ▼              ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                  RAW DATA STAGING                          │
        │  (pricing_raw_imports: source, payload, fetched_at)        │
        └──────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │VALIDACION│  │DEDUPLICA-│  │NORMALIZACION │
              │de calidad│  │  CION    │  │marca/linea/  │
              │          │  │          │  │  version     │
              └────┬─────┘  └────┬─────┘  └──────┬───────┘
                   │             │               │
                   ▼             ▼               ▼
        ┌─────────────────────────────────────────────────────────────┐
        │              RECONCILIACION DE FUENTES                      │
        │  Prioridad: RUNT > Fasecolda > Mercado > Editorial         │
        └──────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                    FEATURE STORE                            │
        │  (pricing_vehicle_features: vehicleId, features JSON,      │
        │   computed_at, version, confidence)                         │
        └──────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │  PRICING │  │ SCORING  │  │    API       │
              │  ENGINE  │  │  ENGINE  │  │  RESPONSE    │
              └──────────┘  └──────────┘  └──────────────┘
```

### 5.2 Ingestion por API (RUNT, Fasecolda via Terceros)

#### 5.2.1 RUNT (Registro Unico Nacional de Transito)

El RUNT no ofrece API publica directa. Se accede mediante proveedores autorizados (ej: Infotrack, DataCredito, Certihuella).

**Datos obtenidos:**
- Numero de placa, VIN, numero de motor
- Marca, linea, modelo (version), ano de fabricacion
- Cilindraje, tipo de combustible, tipo de carroceria, color
- Estado actual: activo, suspendido, cancelado
- Historial de propietarios (cantidad de traspasos)
- Gravamenes/prendas vigentes
- Siniestros reportados (perdida total o parcial)
- Comparendos pendientes
- Fecha de matricula, organismo de transito
- Estado SOAT (vigente, vencido, sin registro)
- Estado Tecnomecanica (vigente, vencida, no aplica)

**Implementacion:**

```typescript
// src/pricing/sources/runt.source.ts

interface RuntResponse {
  placa: string;
  vin: string;
  marca: string;
  linea: string;
  modelo: number;          // ano
  cilindraje: number;
  combustible: string;
  color: string;
  carroceria: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'CANCELADO';
  numPropietarios: number;
  prendas: PrendaInfo[];
  siniestros: SiniestroInfo[];
  comparendos: ComparendoInfo[];
  soat: { vigente: boolean; vencimiento: string | null };
  tecno: { vigente: boolean; vencimiento: string | null };
  fechaMatricula: string;
}

async function fetchRunt(placa: string): Promise<RuntResponse> {
  // 1. Llamar API del proveedor tercero (ej: Infotrack)
  const response = await httpClient.post(RUNT_PROVIDER_URL, {
    apiKey: process.env.RUNT_API_KEY,
    placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  });

  // 2. Guardar raw en staging
  await prisma.pricingRawImport.create({
    data: {
      source: 'RUNT',
      key: placa,
      payload: response.data,
      fetchedAt: new Date(),
      tenantId,
    },
  });

  // 3. Parsear y retornar estructura normalizada
  return mapRuntResponse(response.data);
}
```

**Politica de cache:** Los datos RUNT cambian con poca frecuencia. Cache de 72 horas para placa ya consultada. Invalidacion forzada al publicar subasta.

**Costo estimado:** $2,000 - $5,000 COP por consulta (varia segun proveedor). Presupuestar maximo 3 consultas por vehiculo (ingreso + publicacion + refresh).

#### 5.2.2 Fasecolda (Precios de Referencia de Seguros)

Fasecolda publica tablas de precios de referencia para seguros vehiculares. Acceso via proveedores autorizados o convenios.

**Datos obtenidos:**
- Precio de referencia por marca/linea/modelo/ano
- Codigo Fasecolda (identificador unico por version)
- Clase de vehiculo
- Rango de precios (minimo, medio, maximo)

**Implementacion:**

```typescript
// src/pricing/sources/fasecolda.source.ts

interface FasecolaResponse {
  codigoFasecolda: string;
  marca: string;
  linea: string;
  modelo: number;
  precioMinimo: number;    // COP
  precioMedio: number;     // COP
  precioMaximo: number;    // COP
  clase: string;           // AUTOMOVIL, CAMIONETA, SUV, etc.
}

async function fetchFasecolda(
  marca: string,
  linea: string,
  modelo: number,
): Promise<FasecolaResponse | null> {
  // 1. Buscar primero en cache local (tabla pricing_fasecolda_cache)
  const cached = await prisma.pricingFasecoldaCache.findFirst({
    where: {
      marca: { equals: marca, mode: 'insensitive' },
      linea: { equals: linea, mode: 'insensitive' },
      modelo,
      fetchedAt: { gte: subDays(new Date(), 30) },  // cache 30 dias
    },
  });
  if (cached) return cached.data as FasecolaResponse;

  // 2. Consultar API tercero
  const response = await httpClient.get(FASECOLDA_PROVIDER_URL, {
    params: { marca, linea, modelo, apiKey: process.env.FASECOLDA_API_KEY },
  });

  // 3. Guardar en cache
  if (response.data) {
    await prisma.pricingFasecoldaCache.upsert({
      where: { marca_linea_modelo: { marca, linea, modelo } },
      update: { data: response.data, fetchedAt: new Date() },
      create: { marca, linea, modelo, data: response.data, fetchedAt: new Date(), tenantId },
    });
  }

  return response.data ?? null;
}
```

**Politica de cache:** Precios Fasecolda se actualizan mensualmente. Cache de 30 dias. Batch nocturno para refrescar vehiculos activos.

### 5.3 Scraping o Conectores Alternos (TuCarro, Revista Motor)

#### 5.3.1 TuCarro (Marketplace Online)

TuCarro (propiedad de MercadoLibre) no ofrece API publica oficial.

**Opciones tecnicas (en orden de preferencia):**

1. **API de MercadoLibre (recomendada):** MercadoLibre tiene API publica para listados. TuCarro comparte infraestructura. Revisar si la categoria "Vehiculos" en `api.mercadolibre.com.co` cubre los datos necesarios.
   - Endpoint: `GET /sites/MCO/search?category=MCO1744&q={marca}+{modelo}+{ano}`
   - Limitaciones: rate limiting, datos parciales, no incluye vehiculos vendidos.

2. **Scraping controlado (alternativa):** Si la API de ML no es suficiente.
   - Herramientas: Puppeteer/Playwright headless
   - Frecuencia: 1 scrape diario nocturno por marca/modelo activo
   - Datos a extraer: precio publicado, km, ano, ciudad, fecha de publicacion, URL

3. **Importacion manual/CSV:** Archivo CSV mensual con precios de referencia.

**Notas legales sobre scraping:**

> **IMPORTANTE - Consideraciones Legales:**
> - El scraping de TuCarro puede violar sus Terminos de Servicio. Antes de implementar, **consultar con asesoria legal**.
> - La Ley 1581 de 2012 (Proteccion de Datos Personales de Colombia) **no aplica** a datos de precios de vehiculos publicados, pero si a datos de vendedores.
> - Alternativa legal preferida: **convenio comercial** con MercadoLibre/TuCarro para acceso a datos agregados de pricing.
> - Si se implementa scraping: NO almacenar datos personales de vendedores, solo datos del vehiculo y precio.
> - Respetar `robots.txt`, implementar rate limiting conservador (max 1 req/seg), usar User-Agent identificable.
> - Mantener documentacion del proposito legitimo: analisis de precios de mercado para valoracion, no competencia desleal.

**Datos a extraer:**

```typescript
interface TuCarroListing {
  externalId: string;       // ID del listing en TuCarro
  marca: string;
  modelo: string;
  version: string;
  ano: number;
  km: number;
  precio: number;           // COP - precio publicado (no necesariamente de venta)
  ciudad: string;
  combustible: string;
  transmision: string;
  fechaPublicacion: Date;
  diasPublicado: number;    // proxy de liquidez
  url: string;              // para auditoria
  scrapedAt: Date;
}
```

#### 5.3.2 Revista Motor

Revista Motor (El Tiempo) publica guias de precios usados y nuevos, referente del mercado colombiano.

**Opciones tecnicas:**

1. **Licenciamiento de datos (preferido):** Contactar a Revista Motor / Casa Editorial El Tiempo para licencia de acceso a su base de datos de precios. Costo estimado: $2M - $10M COP/mes.

2. **Digitalizacion manual:** Equipo operativo ingresa precios de la revista impresa/digital mensualmente en un CSV estandarizado.

3. **Scraping de revistamotor.com.co (ultimo recurso):** Mismas consideraciones legales que TuCarro.

**Datos a extraer:**

```typescript
interface RevistaMotorPrice {
  marca: string;
  linea: string;
  version: string;
  ano: number;
  precioNuevo: number | null;    // COP
  precioUsado: number | null;    // COP
  mesPublicacion: string;        // YYYY-MM
  fuente: 'REVISTA_DIGITAL' | 'MANUAL_IMPORT' | 'API_LICENCIA';
}
```

### 5.4 Validacion de Calidad

Cada registro que entra al pipeline pasa por validacion antes de ser aceptado.

```typescript
// src/pricing/pipeline/validators.ts

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completenessScore: number;  // 0.0 - 1.0
}

function validateVehicleData(data: RawVehicleData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // ── Completitud: campos obligatorios ──
  const required = ['marca', 'modelo', 'ano', 'km'];
  for (const field of required) {
    if (data[field] === null || data[field] === undefined || data[field] === '') {
      errors.push({ field, code: 'REQUIRED', message: `${field} es obligatorio` });
    }
  }

  // ── Rangos validos ──
  if (data.ano && (data.ano < 1980 || data.ano > CURRENT_YEAR + 1)) {
    errors.push({ field: 'ano', code: 'OUT_OF_RANGE', message: `Ano ${data.ano} fuera de rango [1980, ${CURRENT_YEAR + 1}]` });
  }

  if (data.km !== undefined && (data.km < 0 || data.km > 999_999)) {
    errors.push({ field: 'km', code: 'OUT_OF_RANGE', message: `Km ${data.km} fuera de rango [0, 999999]` });
  }

  if (data.precio !== undefined && (data.precio < 5_000_000 || data.precio > 2_000_000_000)) {
    errors.push({ field: 'precio', code: 'OUT_OF_RANGE', message: `Precio ${data.precio} COP fuera de rango razonable` });
  }

  // ── Formato de placa colombiana ──
  if (data.placa) {
    const placaRegex = /^[A-Z]{3}\d{3,4}$/;
    if (!placaRegex.test(data.placa.toUpperCase().replace(/[\s-]/g, ''))) {
      warnings.push({ field: 'placa', code: 'INVALID_FORMAT', message: 'Formato de placa no reconocido' });
    }
  }

  // ── Consistencia ano vs km ──
  if (data.ano && data.km !== undefined) {
    const age = CURRENT_YEAR - data.ano;
    const avgKmPerYear = age > 0 ? data.km / age : data.km;
    if (avgKmPerYear > 60_000) {
      warnings.push({
        field: 'km',
        code: 'HIGH_MILEAGE_FOR_AGE',
        message: `Promedio ${Math.round(avgKmPerYear)} km/ano es inusualmente alto`,
      });
    }
    if (age > 2 && data.km < 1_000) {
      warnings.push({
        field: 'km',
        code: 'LOW_MILEAGE_FOR_AGE',
        message: `${data.km} km para un vehiculo de ${age} anos es sospechosamente bajo`,
      });
    }
  }

  // ── Consistencia precio vs segmento ──
  if (data.precio && data.marca) {
    const segment = getSegment(data.marca);
    const expectedRange = SEGMENT_PRICE_RANGES[segment];
    if (data.precio < expectedRange.min * 0.5 || data.precio > expectedRange.max * 1.5) {
      warnings.push({
        field: 'precio',
        code: 'PRICE_SEGMENT_MISMATCH',
        message: `Precio fuera del rango esperado para segmento ${segment}`,
      });
    }
  }

  // ── Calcular completenessScore ──
  const allFields = ['marca', 'modelo', 'ano', 'km', 'placa', 'color', 'combustible',
                     'transmision', 'cilindraje', 'ciudad', 'precio', 'version'];
  const presentCount = allFields.filter(f => data[f] !== null && data[f] !== undefined && data[f] !== '').length;
  const completenessScore = presentCount / allFields.length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completenessScore,
  };
}
```

**Reglas de validacion por fuente:**

| Campo | RUNT | Fasecolda | TuCarro | Rev. Motor | Mubis Interno |
|-------|------|-----------|---------|------------|---------------|
| marca | Obligatorio, confiable | Obligatorio | Obligatorio, puede variar | Obligatorio | Obligatorio |
| modelo/linea | Obligatorio | Obligatorio | Puede ser impreciso | Obligatorio | Obligatorio |
| ano | Obligatorio | Obligatorio | Obligatorio | Obligatorio | Obligatorio |
| km | No disponible | No disponible | Obligatorio, auto-reportado | No aplica | Obligatorio |
| precio | No aplica | Ref. seguros | Precio publicado (inflado ~10-20%) | Guia editorial | Precio de subasta real |
| placa | Confiable | No disponible | No confiable | No aplica | Confiable |
| estado legal | Autoritativo | No aplica | No disponible | No aplica | Via RUNT |

### 5.5 Deduplicacion

La deduplicacion se aplica en tres niveles:

```typescript
// src/pricing/pipeline/deduplication.ts

enum DeduplicationStrategy {
  EXACT_PLACA = 'EXACT_PLACA',           // Mismo vehiculo fisico
  VIN_MATCH = 'VIN_MATCH',              // Mismo vehiculo por VIN
  FUZZY_LISTING = 'FUZZY_LISTING',      // Posible duplicado de listing externo
}

async function deduplicateVehicle(data: NormalizedVehicleData): Promise<{
  isDuplicate: boolean;
  strategy: DeduplicationStrategy | null;
  existingId: string | null;
  action: 'MERGE' | 'SKIP' | 'CREATE' | 'FLAG_REVIEW';
}> {

  // ── Nivel 1: Placa exacta (maxima confianza) ──
  if (data.placa) {
    const existing = await prisma.pricingVehicleRecord.findFirst({
      where: { placa: data.placa.toUpperCase() },
    });
    if (existing) {
      return {
        isDuplicate: true,
        strategy: DeduplicationStrategy.EXACT_PLACA,
        existingId: existing.id,
        action: 'MERGE',  // Actualizar datos existentes con la fuente mas reciente
      };
    }
  }

  // ── Nivel 2: VIN exacto ──
  if (data.vin) {
    const existing = await prisma.pricingVehicleRecord.findFirst({
      where: { vin: data.vin.toUpperCase() },
    });
    if (existing) {
      return {
        isDuplicate: true,
        strategy: DeduplicationStrategy.VIN_MATCH,
        existingId: existing.id,
        action: 'MERGE',
      };
    }
  }

  // ── Nivel 3: Fuzzy match (marca + modelo + ano + km cercano + ciudad) ──
  if (data.marca && data.modelo && data.ano && data.km !== undefined) {
    const candidates = await prisma.pricingVehicleRecord.findMany({
      where: {
        marca: { equals: data.marca, mode: 'insensitive' },
        modelo: { equals: data.modelo, mode: 'insensitive' },
        ano: data.ano,
        km: { gte: data.km - 5000, lte: data.km + 5000 },
        ciudad: data.ciudad ? { equals: data.ciudad, mode: 'insensitive' } : undefined,
        source: { not: data.source },  // Solo comparar contra otras fuentes
      },
    });

    if (candidates.length > 0) {
      return {
        isDuplicate: true,
        strategy: DeduplicationStrategy.FUZZY_LISTING,
        existingId: candidates[0].id,
        action: 'FLAG_REVIEW',  // Requiere revision humana
      };
    }
  }

  return { isDuplicate: false, strategy: null, existingId: null, action: 'CREATE' };
}
```

**Reglas de merge por prioridad de fuente:**

| Conflicto | Resolucion |
|-----------|-----------|
| Marca/modelo difiere entre RUNT y TuCarro | Usar RUNT (autoritativo) |
| Km difiere entre Mubis y TuCarro | Usar Mubis (inspeccion presencial) |
| Precio RUNT no existe, Fasecolda si | Usar Fasecolda como base |
| Dos listings TuCarro del mismo carro | Mantener el mas reciente, marcar anterior como historico |

### 5.6 Normalizacion de Marca/Linea/Version

El problema principal: cada fuente nombra los vehiculos de forma distinta.

**Ejemplos de inconsistencia real:**

| Fuente | Lo que dice | Lo que deberia ser |
|--------|------------|-------------------|
| RUNT | "HYUNDAI TUCSON IX-35 2.0 4X2 AT" | Hyundai / Tucson / ix35 2.0 4x2 AT |
| Fasecolda | "HYUNDAI TUCSON IX35 GL 2.0" | Hyundai / Tucson / ix35 GL 2.0 |
| TuCarro | "Hyundai Tucson ix 35" | Hyundai / Tucson / ix35 |
| Mubis user | "tucson" | Hyundai / Tucson / (sin version) |

**Solucion: Catalogo Maestro + Fuzzy Matching**

```typescript
// src/pricing/pipeline/normalizer.ts

// ── Tabla: pricing_master_catalog ──
// Contiene el universo canonico de marca/linea/version
interface MasterCatalogEntry {
  id: string;
  codigoFasecolda: string | null;
  marca: string;              // "Hyundai"
  linea: string;              // "Tucson"
  version: string;            // "ix35 2.0 4x2 AT"
  segmento: string;           // "SUV_COMPACTO"
  anoInicio: number;          // 2010
  anoFin: number | null;      // 2015 (null = vigente)
  aliases: string[];          // ["ix-35", "ix 35", "IX35"]
}

// ── Tabla: pricing_brand_aliases ──
// Mapeo de aliases de marcas
const BRAND_ALIASES: Record<string, string> = {
  'chevrolet': 'Chevrolet',
  'chevy': 'Chevrolet',
  'chev': 'Chevrolet',
  'mercedes benz': 'Mercedes-Benz',
  'mercedes': 'Mercedes-Benz',
  'mb': 'Mercedes-Benz',
  'vw': 'Volkswagen',
  'volkswagen': 'Volkswagen',
  'land rover': 'Land Rover',
  'landrover': 'Land Rover',
  // ... ~50 alias para marcas colombianas comunes
};

async function normalizeBrandModelVersion(
  rawBrand: string,
  rawModel: string,
  rawVersion: string | null,
  ano: number,
): Promise<{
  marca: string;
  linea: string;
  version: string | null;
  catalogId: string | null;
  matchConfidence: number;  // 0.0 - 1.0
}> {
  // 1. Normalizar marca via aliases
  const cleanBrand = rawBrand.trim().toLowerCase();
  const normalizedBrand = BRAND_ALIASES[cleanBrand] ?? titleCase(cleanBrand);

  // 2. Buscar en catalogo maestro (match exacto)
  let catalogEntry = await prisma.pricingMasterCatalog.findFirst({
    where: {
      marca: { equals: normalizedBrand, mode: 'insensitive' },
      linea: { equals: rawModel.trim(), mode: 'insensitive' },
      anoInicio: { lte: ano },
      OR: [{ anoFin: null }, { anoFin: { gte: ano } }],
    },
  });

  if (catalogEntry) {
    return {
      marca: catalogEntry.marca,
      linea: catalogEntry.linea,
      version: matchVersion(catalogEntry, rawVersion),
      catalogId: catalogEntry.id,
      matchConfidence: 1.0,
    };
  }

  // 3. Fuzzy matching si no hay match exacto
  const candidates = await prisma.pricingMasterCatalog.findMany({
    where: {
      marca: { equals: normalizedBrand, mode: 'insensitive' },
      anoInicio: { lte: ano + 1 },
      OR: [{ anoFin: null }, { anoFin: { gte: ano - 1 } }],
    },
  });

  const bestMatch = findBestFuzzyMatch(rawModel, rawVersion, candidates);
  // Usa distancia Levenshtein + matching de tokens

  if (bestMatch && bestMatch.score >= 0.7) {
    return {
      marca: bestMatch.entry.marca,
      linea: bestMatch.entry.linea,
      version: bestMatch.matchedVersion,
      catalogId: bestMatch.entry.id,
      matchConfidence: bestMatch.score,
    };
  }

  // 4. Sin match: guardar como-es y marcar para revision
  return {
    marca: normalizedBrand,
    linea: titleCase(rawModel.trim()),
    version: rawVersion?.trim() ?? null,
    catalogId: null,
    matchConfidence: 0.0,  // Flag: requiere mapeo manual
  };
}
```

**Mantenimiento del catalogo:**
- Carga inicial desde Fasecolda (~15,000 registros con codigo Fasecolda)
- Actualizacion trimestral con nuevos modelos
- Cola de revision para marcas/modelos no mapeados (alerta a operaciones)
- Dashboard SuperAdmin: "Vehiculos sin catalogo" con accion de mapeo manual

### 5.7 Reconciliacion de Fuentes Inconsistentes

Cuando multiples fuentes proveen datos del mismo vehiculo, se aplica la siguiente jerarquia de prioridad:

```
PRIORIDAD DE FUENTES (mayor a menor):

1. RUNT (autoritativo para datos legales y tecnicos)
   - Marca, linea, ano, cilindraje, combustible, color: DEFINITIVOS
   - Prendas, siniestros, comparendos: DEFINITIVOS
   - Precio: NO DISPONIBLE

2. FASECOLDA (autoritativo para precios de referencia)
   - Precio de referencia: ALTA CONFIANZA
   - Codigo Fasecolda: DEFINITIVO
   - Segmento/clase: ALTA CONFIANZA

3. MUBIS HISTORIAL (datos transaccionales reales)
   - Precio de venta real (current_bid de subastas ENDED): ALTA CONFIANZA
   - Km: ALTA CONFIANZA (verificado en inspeccion)
   - Estado fisico: ALTA CONFIANZA (inspeccion presencial)

4. TUCARRO / MERCADO (datos de mercado)
   - Precio publicado: MEDIA CONFIANZA (inflado ~10-20% sobre precio real)
   - Km: BAJA CONFIANZA (auto-reportado, puede ser alterado)
   - Dias en mercado: ALTA CONFIANZA (proxy de liquidez)

5. REVISTA MOTOR (editorial)
   - Precio guia: MEDIA CONFIANZA (referencia general, no especifica por condicion)
   - Solo cubre marca/modelo/ano, no version especifica
```

```typescript
// src/pricing/pipeline/reconciliation.ts

function reconcileSources(sources: SourceData[]): ReconciledVehicleData {
  const sorted = sources.sort((a, b) => SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source]);

  const result: ReconciledVehicleData = {};
  const conflicts: ConflictLog[] = [];

  for (const field of ALL_FIELDS) {
    const values = sorted
      .filter(s => s.data[field] !== null && s.data[field] !== undefined)
      .map(s => ({ source: s.source, value: s.data[field], priority: SOURCE_PRIORITY[s.source] }));

    if (values.length === 0) {
      result[field] = null;
      result[`${field}_source`] = null;
      continue;
    }

    // Usar el valor de mayor prioridad
    result[field] = values[0].value;
    result[`${field}_source`] = values[0].source;

    // Registrar conflictos si hay valores diferentes
    const uniqueValues = [...new Set(values.map(v => String(v.value)))];
    if (uniqueValues.length > 1) {
      conflicts.push({
        field,
        values: values.map(v => ({ source: v.source, value: v.value })),
        resolved: values[0].value,
        resolvedSource: values[0].source,
      });
    }
  }

  // Caso especial: PRECIO - combinar fuentes con pesos
  result.precioReferencia = reconcilePrice(sources);

  result._conflicts = conflicts;
  result._sourceCount = sources.length;

  return result;
}

function reconcilePrice(sources: SourceData[]): {
  precioBase: number;
  fuente: string;
  preciosFuentes: Record<string, number>;
  confianza: number;
} {
  const prices: Record<string, number> = {};

  // Recopilar precios de cada fuente
  for (const s of sources) {
    if (s.source === 'FASECOLDA' && s.data.precioMedio) {
      prices.fasecolda = s.data.precioMedio;
    }
    if (s.source === 'REVISTA_MOTOR' && s.data.precioUsado) {
      prices.revistaMotor = s.data.precioUsado;
    }
    if (s.source === 'MUBIS_HISTORIAL' && s.data.precioVentaPromedio) {
      prices.mubisHistorial = s.data.precioVentaPromedio;
    }
    if (s.source === 'TUCARRO' && s.data.precioPublicado) {
      // Ajustar TuCarro: precios publicados estan inflados ~15%
      prices.tucarroAjustado = Math.round(s.data.precioPublicado * 0.85);
    }
  }

  // Seleccionar precio base por prioridad
  let precioBase: number;
  let fuente: string;
  let confianza: number;

  if (prices.fasecolda) {
    precioBase = prices.fasecolda;
    fuente = 'FASECOLDA';
    confianza = 0.85;
  } else if (prices.revistaMotor) {
    precioBase = prices.revistaMotor;
    fuente = 'REVISTA_MOTOR';
    confianza = 0.75;
  } else if (prices.mubisHistorial) {
    precioBase = prices.mubisHistorial;
    fuente = 'MUBIS_HISTORIAL';
    confianza = 0.80;
  } else if (prices.tucarroAjustado) {
    precioBase = prices.tucarroAjustado;
    fuente = 'TUCARRO_AJUSTADO';
    confianza = 0.60;
  } else {
    precioBase = 0;  // Sin precio de referencia -> usar tabla interna
    fuente = 'NONE';
    confianza = 0.0;
  }

  return { precioBase, fuente, preciosFuentes: prices, confianza };
}
```

### 5.8 Manejo de Datos Faltantes

```typescript
// src/pricing/pipeline/missing-data.ts

interface MissingDataStrategy {
  field: string;
  fallbackChain: FallbackStep[];
  canImpute: boolean;
  imputationMethod: string | null;
  defaultValue: any;
  flag: string;
}

const MISSING_DATA_STRATEGIES: MissingDataStrategy[] = [
  {
    field: 'precioBase',
    fallbackChain: [
      { source: 'FASECOLDA', method: 'API_LOOKUP' },
      { source: 'REVISTA_MOTOR', method: 'TABLE_LOOKUP' },
      { source: 'MUBIS_HISTORIAL', method: 'SIMILAR_VEHICLES_AVG' },
      { source: 'TABLA_INTERNA', method: 'BRAND_BASE_PRICES' },
    ],
    canImpute: true,
    imputationMethod: 'BRAND_SEGMENT_MEDIAN',
    defaultValue: null,  // NUNCA usar default para precio
    flag: 'PRICE_IMPUTED',
  },
  {
    field: 'km',
    fallbackChain: [
      { source: 'INSPECCION_MUBIS', method: 'DIRECT_READ' },
      { source: 'USUARIO_INPUT', method: 'FORM_VALUE' },
    ],
    canImpute: true,
    imputationMethod: 'AVG_KM_FOR_AGE',  // edad * 15,000 km/ano promedio Colombia
    defaultValue: null,
    flag: 'KM_IMPUTED',
  },
  {
    field: 'ciudad',
    fallbackChain: [
      { source: 'VEHICULO_MUBIS', method: 'VEHICLE_CITY' },
      { source: 'DEALER_BRANCH', method: 'BRANCH_CITY' },
      { source: 'RUNT', method: 'ORGANISMO_TRANSITO_CITY' },
    ],
    canImpute: false,
    imputationMethod: null,
    defaultValue: 'Bogota',  // Default conservador (ciudad mas cara -> precio no sobreestimado)
    flag: 'CITY_DEFAULT',
  },
  {
    field: 'scoreGlobal',
    fallbackChain: [
      { source: 'INSPECCION_MUBIS', method: 'LATEST_COMPLETED' },
    ],
    canImpute: true,
    imputationMethod: 'MEDIAN_SCORE_FOR_AGE_KM',  // Mediana historica por edad+km
    defaultValue: 65,  // Score conservador por defecto
    flag: 'SCORE_IMPUTED',
  },
  {
    field: 'combustible',
    fallbackChain: [
      { source: 'RUNT', method: 'DIRECT' },
      { source: 'CATALOGO_MAESTRO', method: 'DEFAULT_FOR_VERSION' },
    ],
    canImpute: false,
    imputationMethod: null,
    defaultValue: 'GASOLINA',
    flag: 'FUEL_DEFAULT',
  },
  {
    field: 'color',
    fallbackChain: [
      { source: 'RUNT', method: 'DIRECT' },
      { source: 'VEHICULO_MUBIS', method: 'FORM_VALUE' },
    ],
    canImpute: false,
    imputationMethod: null,
    defaultValue: null,  // Color no afecta significativamente, puede ser null
    flag: 'COLOR_MISSING',
  },
  {
    field: 'transmision',
    fallbackChain: [
      { source: 'RUNT', method: 'DIRECT' },
      { source: 'CATALOGO_MAESTRO', method: 'DEFAULT_FOR_VERSION' },
    ],
    canImpute: false,
    imputationMethod: null,
    defaultValue: 'MANUAL',
    flag: 'TRANSMISSION_DEFAULT',
  },
];

function resolveField(
  field: string,
  availableData: Record<string, any>,
): { value: any; source: string; isImputed: boolean; flag: string | null } {
  const strategy = MISSING_DATA_STRATEGIES.find(s => s.field === field);
  if (!strategy) return { value: availableData[field], source: 'DIRECT', isImputed: false, flag: null };

  // Recorrer cadena de fallback
  for (const fallback of strategy.fallbackChain) {
    const value = availableData[`${field}_${fallback.source}`] ?? availableData[field];
    if (value !== null && value !== undefined) {
      return { value, source: fallback.source, isImputed: false, flag: null };
    }
  }

  // Sin dato directo: intentar imputacion
  if (strategy.canImpute && strategy.imputationMethod) {
    const imputed = imputeValue(field, strategy.imputationMethod, availableData);
    if (imputed !== null) {
      return { value: imputed, source: 'IMPUTED', isImputed: true, flag: strategy.flag };
    }
  }

  // Ultimo recurso: valor por defecto
  return {
    value: strategy.defaultValue,
    source: 'DEFAULT',
    isImputed: strategy.defaultValue !== null,
    flag: strategy.flag,
  };
}
```

**Flags de datos faltantes en la respuesta:**

| Flag | Significado | Impacto en confianza |
|------|-------------|---------------------|
| `PRICE_IMPUTED` | Precio base estimado por segmento, sin fuente directa | -30 puntos confianza |
| `KM_IMPUTED` | Km estimado por edad promedio | -20 puntos confianza |
| `SCORE_IMPUTED` | Score de condicion estimado, sin inspeccion | -15 puntos confianza |
| `CITY_DEFAULT` | Ciudad asumida como Bogota | -5 puntos confianza |
| `FUEL_DEFAULT` | Combustible asumido como gasolina | -3 puntos confianza |
| `COLOR_MISSING` | Color no disponible (impacto minimo) | -1 punto confianza |
| `TRANSMISSION_DEFAULT` | Transmision asumida como manual | -3 puntos confianza |
| `NO_RUNT` | Sin datos RUNT (riesgo documental desconocido) | -25 puntos confianza |

### 5.9 Actualizacion de Precios de Mercado

#### Batch Nocturno (Cron)

```typescript
// src/pricing/jobs/market-update.cron.ts

// Ejecutar diariamente a las 2:00 AM COT (UTC-5)
@Cron('0 7 * * *')  // 7:00 UTC = 2:00 AM COT
async handleMarketUpdate() {
  const logger = new Logger('MarketUpdateCron');
  logger.log('Iniciando actualizacion nocturna de precios de mercado');

  // 1. Obtener vehiculos activos (en subasta o con inspeccion reciente)
  const activeVehicles = await this.prisma.vehicle.findMany({
    where: {
      OR: [
        { status: 'READY_FOR_AUCTION' },
        { auctions: { some: { status: 'ACTIVE' } } },
        { inspections: { some: { completedAt: { gte: subDays(new Date(), 30) } } } },
      ],
    },
    select: { id: true, brand: true, model: true, year: true, placa: true },
  });

  // 2. Agrupar por marca+modelo+ano para evitar consultas duplicadas
  const groups = groupBy(activeVehicles, v => `${v.brand}|${v.model}|${v.year}`);

  // 3. Para cada grupo, actualizar precios de mercado
  for (const [key, vehicles] of Object.entries(groups)) {
    const [brand, model, yearStr] = key.split('|');
    const year = parseInt(yearStr);

    try {
      // a. Consultar TuCarro (si habilitado)
      const tucarroListings = await this.tucarroSource.fetchListings(brand, model, year);

      // b. Actualizar cache de precios de mercado
      const avgMarketPrice = calculateMarketAverage(tucarroListings);
      const medianMarketPrice = calculateMedian(tucarroListings.map(l => l.precio));
      const daysOnMarket = calculateAvgDaysOnMarket(tucarroListings);

      await this.prisma.pricingMarketSnapshot.upsert({
        where: { marca_modelo_ano: { marca: brand, modelo: model, ano: year } },
        update: {
          precioPromedioMercado: avgMarketPrice,
          precioMedianaMercado: medianMarketPrice,
          diasPromedioMercado: daysOnMarket,
          cantidadListings: tucarroListings.length,
          updatedAt: new Date(),
        },
        create: {
          marca: brand,
          modelo: model,
          ano: year,
          precioPromedioMercado: avgMarketPrice,
          precioMedianaMercado: medianMarketPrice,
          diasPromedioMercado: daysOnMarket,
          cantidadListings: tucarroListings.length,
        },
      });

      // c. Recalcular features de vehiculos afectados
      for (const vehicle of vehicles) {
        await this.featureStore.recompute(vehicle.id);
      }
    } catch (error) {
      logger.error(`Error actualizando ${key}: ${error.message}`);
      // Continuar con el siguiente grupo, no bloquear todo el batch
    }
  }

  logger.log(`Actualizacion nocturna completada. ${activeVehicles.length} vehiculos procesados.`);
}
```

#### On-Demand (al solicitar valuacion)

```typescript
// Cuando se solicita POST /pricing/suggest:
// 1. Verificar si el feature store tiene datos frescos (< 24h)
// 2. Si no, recalcular en tiempo real (max 5 segundos timeout)
// 3. Si timeout, usar datos stale con flag WARNING_STALE_DATA

async function ensureFreshFeatures(vehicleId: string): Promise<VehicleFeatures> {
  const cached = await prisma.pricingVehicleFeatures.findUnique({
    where: { vehicleId },
  });

  const isFresh = cached && differenceInHours(new Date(), cached.computedAt) < 24;

  if (isFresh) return cached.features as VehicleFeatures;

  // Recalcular con timeout
  try {
    const features = await withTimeout(
      computeVehicleFeatures(vehicleId),
      5000,  // 5 segundos max
    );
    return features;
  } catch (error) {
    if (cached) {
      // Usar datos stale con warning
      return { ...cached.features as VehicleFeatures, _warning: 'STALE_DATA' };
    }
    throw new Error('No se pueden calcular features del vehiculo');
  }
}
```

### 5.10 Feature Store

Tabla de features pre-computadas que alimenta el pricing engine:

```sql
-- Tabla: pricing_vehicle_features
CREATE TABLE pricing_vehicle_features (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      TEXT UNIQUE NOT NULL REFERENCES vehicles(id),
  tenant_id       TEXT NOT NULL REFERENCES tenants(id),

  -- Identidad
  placa           TEXT,
  vin             TEXT,
  catalog_id      TEXT,          -- FK a pricing_master_catalog
  marca           TEXT NOT NULL,
  linea           TEXT NOT NULL,
  version         TEXT,
  ano             INTEGER NOT NULL,
  segmento        TEXT,          -- SUV, SEDAN, HATCHBACK, PICKUP, etc.

  -- Condicion
  km              INTEGER NOT NULL,
  km_per_year     FLOAT,         -- km / edad
  score_global    FLOAT,         -- 0-100
  score_motor     FLOAT,
  score_carroceria FLOAT,
  score_interior  FLOAT,
  score_mecanica  FLOAT,
  score_electrica FLOAT,
  has_inspection  BOOLEAN DEFAULT FALSE,

  -- Precios de referencia
  precio_fasecolda     BIGINT,
  precio_revista_motor BIGINT,
  precio_mubis_avg     BIGINT,    -- Promedio subastas similares Mubis
  precio_mercado_avg   BIGINT,    -- Promedio TuCarro ajustado
  precio_mercado_median BIGINT,

  -- Legal / Documental
  tiene_prenda         BOOLEAN DEFAULT FALSE,
  tiene_siniestro      BOOLEAN DEFAULT FALSE,
  siniestro_tipo       TEXT,      -- PARCIAL, TOTAL, null
  comparendos_count    INTEGER DEFAULT 0,
  soat_vigente         BOOLEAN,
  tecno_vigente        BOOLEAN,
  num_propietarios     INTEGER,

  -- Mercado / Liquidez
  dias_promedio_mercado INTEGER,   -- dias en TuCarro de comparables
  listings_activos     INTEGER,    -- cantidad de listings comparables activos
  demanda_pujas_avg    FLOAT,      -- promedio de pujas en subastas similares Mubis

  -- Contexto
  ciudad               TEXT,
  region               TEXT,       -- CENTRO, COSTA, ANTIOQUIA, EJE_CAFETERO, etc.
  combustible          TEXT,
  transmision          TEXT,
  color                TEXT,
  cilindraje           INTEGER,

  -- Factores pre-calculados
  factor_ano           FLOAT,      -- Depreciacion por edad
  factor_km            FLOAT,      -- Ajuste por kilometraje
  factor_condicion     FLOAT,      -- Ajuste por score inspeccion
  factor_region        FLOAT,      -- Ajuste por ciudad/region
  factor_combustible   FLOAT,      -- Ajuste por tipo combustible
  factor_color         FLOAT,      -- Ajuste por color
  factor_documental    FLOAT,      -- Ajuste por estado legal
  factor_estacionalidad FLOAT,     -- Ajuste por mes del ano
  factor_liquidez      FLOAT,      -- Ajuste por dias en mercado

  -- Metadata
  data_flags           TEXT[],     -- ['PRICE_IMPUTED', 'KM_IMPUTED', etc.]
  source_count         INTEGER DEFAULT 0,
  completeness_score   FLOAT,      -- 0.0 - 1.0
  computed_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  version              INTEGER DEFAULT 1,

  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pvf_tenant ON pricing_vehicle_features(tenant_id);
CREATE INDEX idx_pvf_marca_modelo ON pricing_vehicle_features(marca, linea, ano);
CREATE INDEX idx_pvf_computed ON pricing_vehicle_features(computed_at);
```

---

## 6. LOGICA DE PRICING

El motor de pricing opera en 3 capas secuenciales. Cada capa toma el resultado de la anterior y aplica ajustes.

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA A                                    │
│              Precio Base de Referencia                       │
│  Input: marca, linea, version, ano                          │
│  Output: precioBase (COP)                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA B                                    │
│           Ajustes por Condicion y Liquidez                   │
│  Input: precioBase + features del vehiculo                  │
│  Output: precioAjustado (COP) + factores aplicados          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA C                                    │
│             Score Final y Rango Recomendado                  │
│  Input: precioAjustado + scores + confianza                 │
│  Output: ValuationResult completo                           │
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Capa A: Precio Base de Referencia

El precio base es el valor de referencia de un vehiculo **en condicion promedio**, antes de aplicar ajustes individuales. Se obtiene de la mejor fuente disponible.

**Jerarquia de fuentes:**

```
1. Fasecolda (precioMedio)       → confianza: 0.85
2. Revista Motor (precioUsado)   → confianza: 0.75
3. Historial Mubis (promedio)    → confianza: 0.80 (si >= 3 transacciones)
4. Tabla Interna (BRAND_BASE)    → confianza: 0.40
```

**Formula:**

```
precioBase = fuente_disponible_de_mayor_prioridad(marca, linea, version, ano)
```

**Normalizacion por version/equipamiento:**

Dentro de una misma linea, las versiones pueden variar significativamente en precio.

```typescript
// Tabla de ajuste por nivel de equipamiento
const VERSION_TIER_FACTORS: Record<string, number> = {
  'BASICO':    0.85,   // Version base / entry-level
  'COMFORT':   0.92,   // Version media-baja
  'MEDIO':     1.00,   // Version de referencia (Fasecolda suele usar esta)
  'FULL':      1.10,   // Full equipo
  'PREMIUM':   1.20,   // Tope de linea / edicion especial
  'UNKNOWN':   0.95,   // No se conoce la version -> asumir ligeramente bajo
};

// Ejemplo: Hyundai Tucson 2020
// Fasecolda dice: $95,000,000 (version media)
// Si el vehiculo es "Tucson Limited 4x4" (PREMIUM): $95M * 1.20 = $114,000,000
// Si el vehiculo es "Tucson GL 2.0 MT" (BASICO): $95M * 0.85 = $80,750,000
```

**Pseudocodigo completo Capa A:**

```typescript
async function computeBasePrice(features: VehicleFeatures): Promise<{
  precioBase: number;
  fuente: string;
  confianza: number;
  versionTier: string;
  versionFactor: number;
}> {
  let precioBase: number;
  let fuente: string;
  let confianza: number;

  // ── 1. Intentar Fasecolda ──
  if (features.precio_fasecolda) {
    precioBase = features.precio_fasecolda;
    fuente = 'FASECOLDA';
    confianza = 0.85;
  }
  // ── 2. Intentar Revista Motor ──
  else if (features.precio_revista_motor) {
    precioBase = features.precio_revista_motor;
    fuente = 'REVISTA_MOTOR';
    confianza = 0.75;
  }
  // ── 3. Intentar historial Mubis ──
  else if (features.precio_mubis_avg && features.demanda_pujas_avg >= 3) {
    precioBase = features.precio_mubis_avg;
    fuente = 'MUBIS_HISTORIAL';
    confianza = 0.80;
  }
  // ── 4. Tabla interna (fallback) ──
  else {
    precioBase = getBrandBasePrice(features.marca, features.ano);
    fuente = 'TABLA_INTERNA';
    confianza = 0.40;
  }

  // ── Ajuste por version/equipamiento ──
  const versionTier = classifyVersionTier(features.version, features.linea);
  const versionFactor = VERSION_TIER_FACTORS[versionTier];
  precioBase = Math.round(precioBase * versionFactor);

  return { precioBase, fuente, confianza, versionTier, versionFactor };
}

// ── Tabla interna mejorada (reemplaza BRAND_BASE actual) ──
function getBrandBasePrice(marca: string, ano: number): number {
  const base = BRAND_BASE_PRICES[marca.toLowerCase()] ?? BRAND_BASE_PRICES.default;

  // Depreciacion basica para calcular precio de referencia del ano especifico
  const age = Math.max(0, CURRENT_YEAR - ano);
  const depreciationFactor = computeDepreciation(age);

  return Math.round(base * depreciationFactor);
}

// ── Tabla de precios base interna (COP, vehiculo nuevo) ──
const BRAND_BASE_PRICES: Record<string, number> = {
  // Lujo
  'porsche':      550_000_000,
  'land rover':   480_000_000,
  'bmw':          320_000_000,
  'mercedes-benz': 340_000_000,
  'audi':         300_000_000,
  'volvo':        250_000_000,
  'lexus':        280_000_000,
  'jaguar':       350_000_000,
  // Premium accesible
  'mini':         180_000_000,
  'subaru':       160_000_000,
  'jeep':         170_000_000,
  // Mainstream
  'toyota':       140_000_000,
  'honda':        130_000_000,
  'mazda':        120_000_000,
  'volkswagen':   125_000_000,
  'ford':         115_000_000,
  'nissan':       110_000_000,
  'hyundai':      105_000_000,
  'kia':          100_000_000,
  'chevrolet':    105_000_000,
  'peugeot':      100_000_000,
  'citroën':       95_000_000,
  // Economico
  'renault':       85_000_000,
  'suzuki':        80_000_000,
  'mitsubishi':    95_000_000,
  'fiat':          75_000_000,
  'chery':         65_000_000,
  'jac':           60_000_000,
  'dfsk':          55_000_000,
  'changhe':       45_000_000,
  'hafei':         40_000_000,
  // Default
  'default':       90_000_000,
};
```

### 6.2 Capa B: Ajustes por Condicion y Liquidez

Cada factor de ajuste es un multiplicador que se aplica al precio base. El precio ajustado es:

```
precioAjustado = precioBase
                 * factorAno
                 * factorKm
                 * factorCondicion
                 * factorRegion
                 * factorCombustible
                 * factorColor
                 * factorDocumental
                 * factorEstacionalidad
                 * factorLiquidez
```

#### 6.2.1 Factor Ano / Depreciacion

La depreciacion NO es lineal. Los vehiculos se deprecian rapidamente los primeros 3 anos, luego se estabiliza.

**Curva de depreciacion para Colombia:**

```
Ano 0 (nuevo):           1.00  (100%)
Ano 1:                   0.80  (pierde 20% al salir del concesionario)
Ano 2:                   0.72  (pierde 10% adicional)
Ano 3:                   0.65  (pierde 10% adicional)
Ano 4:                   0.60  (pierde 8% -> comienza a estabilizarse)
Ano 5:                   0.55  (pierde 8%)
Ano 6-10:                -5% por ano
Ano 11-15:               -4% por ano
Ano 16-20:               -3% por ano
Ano 21+:                 -2% por ano (piso: 0.10)
```

```typescript
function computeDepreciation(age: number): number {
  if (age <= 0) return 1.00;
  if (age === 1) return 0.80;
  if (age === 2) return 0.72;
  if (age === 3) return 0.65;
  if (age === 4) return 0.60;
  if (age === 5) return 0.55;

  let factor = 0.55;

  // Ano 6-10: -5% anual
  const years6to10 = Math.min(age, 10) - 5;
  if (years6to10 > 0) factor -= years6to10 * 0.05;

  // Ano 11-15: -4% anual
  const years11to15 = Math.min(age, 15) - 10;
  if (years11to15 > 0) factor -= years11to15 * 0.04;

  // Ano 16-20: -3% anual
  const years16to20 = Math.min(age, 20) - 15;
  if (years16to20 > 0) factor -= years16to20 * 0.03;

  // Ano 21+: -2% anual
  const years21plus = Math.max(0, age - 20);
  if (years21plus > 0) factor -= years21plus * 0.02;

  return Math.max(0.10, factor);  // Piso: 10% del valor nuevo
}
```

**Tabla de referencia rapida:**

| Edad (anos) | Factor | Ejemplo: Carro base $100M |
|-------------|--------|--------------------------|
| 0 | 1.00 | $100,000,000 |
| 1 | 0.80 | $80,000,000 |
| 2 | 0.72 | $72,000,000 |
| 3 | 0.65 | $65,000,000 |
| 5 | 0.55 | $55,000,000 |
| 8 | 0.40 | $40,000,000 |
| 10 | 0.30 | $30,000,000 |
| 15 | 0.10 | $10,000,000 |
| 20+ | 0.10 | $10,000,000 (piso) |

**Excepciones por segmento (aplicar multiplicador adicional):**

| Segmento | Modificador de depreciacion | Razon |
|----------|----------------------------|-------|
| Toyota Land Cruiser, Hilux | x0.85 (deprecia menos) | Alta demanda, retencion de valor |
| Porsche 911, Cayenne | x0.85 | Marca de lujo con alta retencion |
| Suzuki Jimny | x0.80 | Demanda excepcional en Colombia |
| Chevrolet Spark, Renault Kwid | x1.10 (deprecia mas) | Economia, alta competencia |
| Chinos (Chery, JAC, DFSK) | x1.15 | Percepcion de menor durabilidad, repuestos |

#### 6.2.2 Factor Kilometraje

El impacto del kilometraje es NO lineal. Los primeros kilometros afectan poco; despues de 100,000 km el impacto se acelera.

```typescript
function computeKmFactor(km: number, age: number): number {
  // Kilometraje esperado para la edad (15,000 km/ano promedio Colombia)
  const expectedKm = age * 15_000;
  const kmRatio = expectedKm > 0 ? km / expectedKm : 1.0;

  // Ajuste base por kilometraje absoluto (curva no lineal)
  let absoluteFactor: number;
  if (km <= 10_000)       absoluteFactor = 1.05;   // Casi nuevo, premium
  else if (km <= 30_000)  absoluteFactor = 1.02;
  else if (km <= 50_000)  absoluteFactor = 1.00;   // Referencia
  else if (km <= 80_000)  absoluteFactor = 0.97;
  else if (km <= 100_000) absoluteFactor = 0.93;
  else if (km <= 130_000) absoluteFactor = 0.88;
  else if (km <= 160_000) absoluteFactor = 0.82;
  else if (km <= 200_000) absoluteFactor = 0.75;
  else if (km <= 250_000) absoluteFactor = 0.65;
  else if (km <= 300_000) absoluteFactor = 0.55;
  else                    absoluteFactor = 0.45;   // Piso

  // Ajuste relativo: penalizar km alto para la edad, premiar km bajo
  let relativeFactor = 1.0;
  if (kmRatio < 0.5)      relativeFactor = 1.05;   // Muy bajo km para la edad -> premium
  else if (kmRatio < 0.8) relativeFactor = 1.02;
  else if (kmRatio < 1.2) relativeFactor = 1.00;   // Normal
  else if (kmRatio < 1.5) relativeFactor = 0.97;   // Algo alto
  else if (kmRatio < 2.0) relativeFactor = 0.93;   // Alto
  else                    relativeFactor = 0.88;   // Muy alto -> sospechoso

  return Math.max(0.40, absoluteFactor * relativeFactor);
}
```

**Tabla de factor km absoluto:**

| Rango km | Factor | Descripcion |
|----------|--------|-------------|
| 0 - 10,000 | 1.05 | Casi nuevo |
| 10,001 - 30,000 | 1.02 | Bajo kilometraje |
| 30,001 - 50,000 | 1.00 | Referencia |
| 50,001 - 80,000 | 0.97 | Normal |
| 80,001 - 100,000 | 0.93 | Normal-alto |
| 100,001 - 130,000 | 0.88 | Alto |
| 130,001 - 160,000 | 0.82 | Muy alto |
| 160,001 - 200,000 | 0.75 | Excesivo |
| 200,001 - 250,000 | 0.65 | Critico |
| 250,001 - 300,000 | 0.55 | Limite |
| 300,001+ | 0.45 | Piso |

#### 6.2.3 Factor Condicion Fisica (Inspeccion)

Basado en el `scoreGlobal` de la inspeccion Mubis (0-100) y los scores individuales.

```typescript
function computeConditionFactor(
  scoreGlobal: number | null,
  scores: InspectionScores | null,
): number {
  // Sin inspeccion: factor neutro con penalizacion leve por incertidumbre
  if (scoreGlobal === null) return 0.95;

  // Factor base del score global
  // Score 0-100 mapea a factor [0.70, 1.10]
  // Score 50 = 0.90 (condicion regular)
  // Score 75 = 1.00 (condicion promedio-buena)
  // Score 100 = 1.10 (condicion excelente)
  let baseFactor = 0.70 + (scoreGlobal / 100) * 0.40;

  // Ajuste por scores criticos individuales (si disponibles)
  if (scores) {
    // Motor en mal estado penaliza fuertemente
    if (scores.motor !== undefined && scores.motor < 40) {
      baseFactor *= 0.90;  // -10% adicional si motor esta mal
    }
    // Carroceria con danos significativos
    if (scores.carroceria !== undefined && scores.carroceria < 30) {
      baseFactor *= 0.92;  // -8% adicional
    }
    // Electricos/mecanicos criticos
    if (scores.mecanica !== undefined && scores.mecanica < 30) {
      baseFactor *= 0.93;  // -7% adicional
    }
  }

  return Math.max(0.50, Math.min(1.15, baseFactor));
}
```

**Tabla de factor condicion:**

| Score Global | Factor | Clasificacion |
|-------------|--------|--------------|
| 90 - 100 | 1.06 - 1.10 | Excelente |
| 75 - 89 | 1.00 - 1.06 | Bueno |
| 60 - 74 | 0.94 - 1.00 | Aceptable |
| 45 - 59 | 0.88 - 0.94 | Regular |
| 30 - 44 | 0.82 - 0.88 | Deficiente |
| 0 - 29 | 0.70 - 0.82 | Critico |
| Sin inspeccion | 0.95 | Indeterminado (penalizacion leve) |

#### 6.2.4 Factor Region / Ciudad

Los precios varian significativamente por ciudad en Colombia. Bogota es el mercado de referencia (factor 1.00), y las demas ciudades se ajustan relativamente.

```typescript
const CITY_FACTORS: Record<string, number> = {
  // Mercado premium (alta demanda, precios mas altos)
  'bogota':           1.00,   // Referencia
  'medellin':         0.98,
  'cali':             0.95,
  'barranquilla':     0.93,
  'cartagena':        0.94,
  // Ciudades intermedias
  'bucaramanga':      0.92,
  'pereira':          0.91,
  'manizales':        0.90,
  'armenia':          0.89,
  'ibague':           0.90,
  'villavicencio':    0.91,
  'neiva':            0.89,
  'pasto':            0.87,
  'popayan':          0.87,
  'santa marta':      0.92,
  'cucuta':           0.88,
  'monteria':         0.89,
  'tunja':            0.88,
  'valledupar':       0.87,
  // Ciudades pequenas / zonas rurales
  'default_small':    0.85,
  'default':          0.90,
};

function computeRegionFactor(ciudad: string | null): number {
  if (!ciudad) return CITY_FACTORS.default;

  const normalized = ciudad.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // quitar tildes

  return CITY_FACTORS[normalized] ?? CITY_FACTORS.default;
}
```

**Notas sobre regiones:**
- **Bogota:** Prima del 5-10% por ser el mercado mas grande y liquido.
- **Medellin:** Segundo mercado, precios solo 2% por debajo de Bogota.
- **Costa Caribe (Barranquilla, Cartagena, Santa Marta):** Preferencia por camionetas/SUV. Sedan de lujo tiene menor demanda.
- **Eje Cafetero:** Mercado estable pero mas pequeno. Preferencia por vehiculos compactos.
- **Frontera (Cucuta):** Volatilidad por tasa de cambio con Venezuela. Precios mas bajos.

#### 6.2.5 Factor Tipo de Combustible

```typescript
const FUEL_FACTORS: Record<string, number> = {
  'gasolina':          1.00,   // Referencia
  'diesel':            1.02,   // Ligero premium (durabilidad, torque, uso profesional)
  'hibrido':           1.08,   // Premium creciente en Colombia
  'electrico':         1.05,   // Premium menor por infraestructura limitada de carga
  'hibrido_enchufable': 1.07,  // Plug-in hybrid
  'gas_natural':       0.92,   // Descuento: conversion percibida como desgaste
  'gas_glp':           0.90,   // Mayor descuento que GNV
  'flex':              0.97,   // Poco comun en Colombia
  'default':           1.00,
};

function computeFuelFactor(combustible: string | null): number {
  if (!combustible) return FUEL_FACTORS.default;
  const normalized = combustible.toLowerCase().trim()
    .replace(/[áàâ]/g, 'a').replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o')
    .replace(/[úùû]/g, 'u');

  // Mapeo de variaciones comunes
  if (normalized.includes('hibrido') || normalized.includes('hybrid')) {
    if (normalized.includes('enchufable') || normalized.includes('plug')) return FUEL_FACTORS.hibrido_enchufable;
    return FUEL_FACTORS.hibrido;
  }
  if (normalized.includes('electrico') || normalized.includes('electric')) return FUEL_FACTORS.electrico;
  if (normalized.includes('diesel')) return FUEL_FACTORS.diesel;
  if (normalized.includes('gas') && normalized.includes('natural')) return FUEL_FACTORS.gas_natural;
  if (normalized.includes('glp') || normalized.includes('propano')) return FUEL_FACTORS.gas_glp;
  if (normalized.includes('gasolina') || normalized.includes('nafta')) return FUEL_FACTORS.gasolina;

  return FUEL_FACTORS.default;
}
```

#### 6.2.6 Factor Color

El color tiene impacto menor pero real en la liquidez y precio.

```typescript
const COLOR_FACTORS: Record<string, number> = {
  // Colores neutros (alta demanda, maxima liquidez)
  'blanco':     1.00,
  'gris':       1.00,
  'plata':      1.00,
  'negro':      1.00,

  // Colores aceptables
  'azul':       0.99,
  'rojo':       0.98,
  'azul oscuro': 0.99,

  // Colores de menor demanda
  'verde':      0.96,
  'amarillo':   0.95,
  'naranja':    0.95,
  'morado':     0.95,
  'cafe':       0.97,
  'beige':      0.97,
  'dorado':     0.97,

  // Default
  'default':    0.97,  // Color no estandar -> ligero descuento
};

function computeColorFactor(color: string | null): number {
  if (!color) return 1.00;  // Sin dato de color, no penalizar
  const normalized = color.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mapeo de variaciones
  if (normalized.includes('blanc') || normalized.includes('white')) return COLOR_FACTORS.blanco;
  if (normalized.includes('negro') || normalized.includes('black')) return COLOR_FACTORS.negro;
  if (normalized.includes('gris') || normalized.includes('gray') || normalized.includes('grey')) return COLOR_FACTORS.gris;
  if (normalized.includes('plat') || normalized.includes('silver')) return COLOR_FACTORS.plata;
  if (normalized.includes('azul') || normalized.includes('blue')) return COLOR_FACTORS.azul;
  if (normalized.includes('rojo') || normalized.includes('red')) return COLOR_FACTORS.rojo;
  if (normalized.includes('verde') || normalized.includes('green')) return COLOR_FACTORS.verde;
  if (normalized.includes('amarill') || normalized.includes('yellow')) return COLOR_FACTORS.amarillo;

  return COLOR_FACTORS.default;
}
```

#### 6.2.7 Factor Historial Documental

El estado legal y documental impacta directamente el precio y la viabilidad de la transaccion.

```typescript
function computeDocumentFactor(features: VehicleFeatures): number {
  let factor = 1.00;

  // ── Prenda (gravamen / leasing) ──
  if (features.tiene_prenda) {
    factor *= 0.90;  // -10%: el comprador debe tramitar levantamiento
  }

  // ── Siniestro ──
  if (features.tiene_siniestro) {
    if (features.siniestro_tipo === 'TOTAL') {
      factor *= 0.60;   // -40%: perdida total declarada, valor residual
    } else if (features.siniestro_tipo === 'PARCIAL') {
      factor *= 0.80;   // -20%: siniestro parcial reparado
    } else {
      factor *= 0.75;   // -25%: siniestro tipo desconocido, asumir peor caso
    }
  }

  // ── Comparendos pendientes ──
  if (features.comparendos_count > 0) {
    // Descuento escalonado por cantidad
    const comparendoDiscount = Math.min(0.10, features.comparendos_count * 0.02);
    factor *= (1 - comparendoDiscount);  // Max -10%
  }

  // ── SOAT vencido ──
  if (features.soat_vigente === false) {
    factor *= 0.98;  // -2%: costo de renovacion ~$600K-1.5M
  }

  // ── Tecnomecanica vencida ──
  if (features.tecno_vigente === false) {
    factor *= 0.97;  // -3%: puede implicar reparaciones para pasar revision
  }

  // ── Numero de propietarios ──
  if (features.num_propietarios !== null && features.num_propietarios !== undefined) {
    if (features.num_propietarios === 1) {
      factor *= 1.02;  // +2%: unico dueno, premium
    } else if (features.num_propietarios >= 4) {
      factor *= 0.97;  // -3%: muchos duenos, percepcion negativa
    }
    // 2-3 duenos: factor neutro (1.00)
  }

  return Math.max(0.45, factor);  // Piso: 45% en peor caso (prenda + siniestro total + comparendos)
}
```

**Tabla de impacto documental:**

| Condicion | Factor | Ejemplo en vehiculo de $80M |
|-----------|--------|---------------------------|
| Limpio (sin hallazgos) | 1.00 | $80,000,000 |
| Unico dueno | 1.02 | $81,600,000 |
| Prenda vigente | 0.90 | $72,000,000 |
| Siniestro parcial | 0.80 | $64,000,000 |
| Siniestro total | 0.60 | $48,000,000 |
| 3 comparendos | 0.94 | $75,200,000 |
| SOAT vencido | 0.98 | $78,400,000 |
| Tecno vencida | 0.97 | $77,600,000 |
| 5+ duenos | 0.97 | $77,600,000 |
| Peor caso combinado | ~0.45 | $36,000,000 |

#### 6.2.8 Factor Estacionalidad

El mercado automotriz colombiano tiene patrones estacionales claros.

```typescript
const MONTHLY_SEASONALITY: Record<number, number> = {
  1:  0.94,   // Enero: post-navidad, poca liquidez, cuesta de enero
  2:  0.96,   // Febrero: comienza reactivacion
  3:  0.98,   // Marzo: mercado activo
  4:  0.99,   // Abril: Semana Santa puede afectar
  5:  1.00,   // Mayo: referencia, mercado estable
  6:  1.01,   // Junio: primas salariales, liquidez alta
  7:  1.00,   // Julio: estable
  8:  0.99,   // Agosto: leve baja
  9:  0.99,   // Septiembre: estable
  10: 1.01,   // Octubre: reactivacion pre-fin de ano
  11: 1.03,   // Noviembre: alta demanda, preparacion navidad
  12: 1.05,   // Diciembre: pico de demanda, primas, fin de ano
};

function computeSeasonalityFactor(): number {
  const month = new Date().getMonth() + 1;  // 1-12
  return MONTHLY_SEASONALITY[month] ?? 1.00;
}
```

**Tabla de estacionalidad Colombia:**

| Mes | Factor | Razon |
|-----|--------|-------|
| Enero | 0.94 (-6%) | Cuesta de enero, post-navidad |
| Febrero | 0.96 (-4%) | Reactivacion lenta |
| Marzo | 0.98 (-2%) | Mercado activo |
| Abril | 0.99 (-1%) | Semana Santa variable |
| Mayo | 1.00 (ref.) | Base |
| Junio | 1.01 (+1%) | Prima de mitad de ano |
| Julio | 1.00 (ref.) | Estable |
| Agosto | 0.99 (-1%) | Leve baja |
| Septiembre | 0.99 (-1%) | Estable |
| Octubre | 1.01 (+1%) | Pre-fin de ano |
| Noviembre | 1.03 (+3%) | Alta demanda |
| Diciembre | 1.05 (+5%) | Pico: primas + fin de ano |

#### 6.2.9 Factor Liquidez del Mercado

Mide que tan rapido se venden vehiculos comparables. Si comparables pasan muchos dias en el mercado, el vehiculo es menos liquido y se ajusta a la baja.

```typescript
function computeLiquidityFactor(features: VehicleFeatures): number {
  const daysOnMarket = features.dias_promedio_mercado;
  const activeListings = features.listings_activos;
  const avgBids = features.demanda_pujas_avg;

  // Sin datos de mercado: factor neutro
  if (daysOnMarket === null || daysOnMarket === undefined) return 1.00;

  // Factor por dias en mercado de comparables
  let domFactor: number;
  if (daysOnMarket <= 15)      domFactor = 1.05;   // Muy liquido: se vende rapido
  else if (daysOnMarket <= 30) domFactor = 1.02;   // Liquido
  else if (daysOnMarket <= 45) domFactor = 1.00;   // Normal
  else if (daysOnMarket <= 60) domFactor = 0.97;   // Lento
  else if (daysOnMarket <= 90) domFactor = 0.93;   // Muy lento
  else                         domFactor = 0.88;   // Estancado

  // Factor por competencia (listings activos similares)
  let competitionFactor = 1.00;
  if (activeListings !== null && activeListings !== undefined) {
    if (activeListings <= 3)       competitionFactor = 1.03;   // Poca oferta -> premio
    else if (activeListings <= 10) competitionFactor = 1.00;   // Normal
    else if (activeListings <= 20) competitionFactor = 0.98;   // Mucha oferta
    else                           competitionFactor = 0.95;   // Saturado
  }

  // Factor por demanda en Mubis (promedio de pujas)
  let demandFactor = 1.00;
  if (avgBids !== null && avgBids !== undefined) {
    if (avgBids >= 8)       demandFactor = 1.05;   // Alta demanda
    else if (avgBids >= 5)  demandFactor = 1.02;
    else if (avgBids >= 3)  demandFactor = 1.00;   // Normal
    else if (avgBids >= 1)  demandFactor = 0.97;
    else                    demandFactor = 0.93;   // Sin interes
  }

  return Math.max(0.80, domFactor * competitionFactor * demandFactor);
}
```

**Tabla de liquidez:**

| Dias en mercado (comparables) | Factor DOM | Descripcion |
|-------------------------------|-----------|-------------|
| 0 - 15 | 1.05 | Muy liquido |
| 16 - 30 | 1.02 | Liquido |
| 31 - 45 | 1.00 | Normal |
| 46 - 60 | 0.97 | Lento |
| 61 - 90 | 0.93 | Muy lento |
| 90+ | 0.88 | Estancado |

#### 6.2.10 Pseudocodigo Completo Capa B

```typescript
interface AdjustmentResult {
  precioAjustado: number;
  factores: {
    factorAno: number;
    factorKm: number;
    factorCondicion: number;
    factorRegion: number;
    factorCombustible: number;
    factorColor: number;
    factorDocumental: number;
    factorEstacionalidad: number;
    factorLiquidez: number;
    productoFactores: number;  // Producto de todos los factores
  };
}

function applyAdjustments(precioBase: number, features: VehicleFeatures): AdjustmentResult {
  const age = Math.max(0, CURRENT_YEAR - features.ano);

  const factorAno           = computeDepreciation(age);
  const factorKm            = computeKmFactor(features.km, age);
  const factorCondicion     = computeConditionFactor(features.score_global, features.scores);
  const factorRegion        = computeRegionFactor(features.ciudad);
  const factorCombustible   = computeFuelFactor(features.combustible);
  const factorColor         = computeColorFactor(features.color);
  const factorDocumental    = computeDocumentFactor(features);
  const factorEstacionalidad = computeSeasonalityFactor();
  const factorLiquidez      = computeLiquidityFactor(features);

  // NOTA: factorAno ya esta aplicado en el precioBase si viene de tabla interna.
  // Si viene de Fasecolda/Revista Motor, el precio ya incluye depreciacion por ano.
  // Solo aplicar factorAno si la fuente es TABLA_INTERNA.
  // Para Fasecolda/Revista Motor: el precio ya es para ese ano especifico.

  const productoFactores = factorKm
    * factorCondicion
    * factorRegion
    * factorCombustible
    * factorColor
    * factorDocumental
    * factorEstacionalidad
    * factorLiquidez;

  const precioAjustado = Math.round(precioBase * productoFactores);

  return {
    precioAjustado,
    factores: {
      factorAno,
      factorKm,
      factorCondicion,
      factorRegion,
      factorCombustible,
      factorColor,
      factorDocumental,
      factorEstacionalidad,
      factorLiquidez,
      productoFactores,
    },
  };
}
```

### 6.3 Capa C: Score Final y Rango Recomendado

La Capa C combina el precio ajustado con los scores de confianza para generar el resultado final.

#### 6.3.1 Intervalo de Confianza

El ancho del rango depende de la confianza en la valuacion.

```typescript
function computeConfidenceInterval(
  precioAjustado: number,
  confidenceScore: number,  // 0-100 (del Valuation Confidence Score, seccion 8)
): { min: number; base: number; max: number; spreadPct: number } {
  // A mayor confianza, menor spread (rango mas estrecho)
  // Confianza 100 -> spread ±5%
  // Confianza 75  -> spread ±10%
  // Confianza 50  -> spread ±15%
  // Confianza 25  -> spread ±22%
  // Confianza 0   -> spread ±30%

  const maxSpread = 0.30;   // 30%
  const minSpread = 0.05;   // 5%
  const spreadPct = maxSpread - (confidenceScore / 100) * (maxSpread - minSpread);

  return {
    min: Math.round(precioAjustado * (1 - spreadPct)),
    base: precioAjustado,
    max: Math.round(precioAjustado * (1 + spreadPct)),
    spreadPct: Math.round(spreadPct * 100),
  };
}
```

**Tabla de spread por confianza:**

| Confianza | Spread | Ejemplo: Precio base $80M |
|-----------|--------|--------------------------|
| 90-100 | +/- 5-7% | $74.4M - $85.6M |
| 75-89 | +/- 8-12% | $70.4M - $89.6M |
| 50-74 | +/- 13-18% | $65.6M - $94.4M |
| 25-49 | +/- 19-24% | $60.8M - $99.2M |
| 0-24 | +/- 25-30% | $56.0M - $104.0M |

#### 6.3.2 Generacion de Rangos: Conservador / Base / Agresivo

```typescript
interface PriceRange {
  conservador: number;   // Precio seguro, se vende rapido
  base: number;          // Precio justo de mercado
  agresivo: number;      // Precio optimista, puede demorar en venderse
  recomendadoSubasta: number;  // Precio sugerido para iniciar subasta
}

function generatePriceRanges(
  precioAjustado: number,
  confidenceScore: number,
  liquidityScore: number,
): PriceRange {
  const interval = computeConfidenceInterval(precioAjustado, confidenceScore);

  // Conservador: cuartil inferior del intervalo
  // Para mercado C2B (consumidor vende a dealer), el conservador es mas relevante
  const conservador = Math.round(interval.min + (interval.base - interval.min) * 0.3);

  // Agresivo: cuartil superior
  const agresivo = Math.round(interval.base + (interval.max - interval.base) * 0.7);

  // Precio de inicio de subasta: conservador ajustado por liquidez
  // En mercado liquido: iniciar mas cerca del base
  // En mercado iliquido: iniciar mas bajo para atraer pujas
  const liquidityAdjust = liquidityScore >= 70 ? 0.95 : liquidityScore >= 40 ? 0.90 : 0.85;
  const recomendadoSubasta = Math.round(conservador * liquidityAdjust);

  return {
    conservador,
    base: interval.base,
    agresivo,
    recomendadoSubasta,
  };
}
```

#### 6.3.3 Logica de Accion Recomendada

Basada en la combinacion de scores, el sistema recomienda una accion.

```typescript
type RecommendedAction = 'SUBASTAR' | 'COMPRA_RAPIDA' | 'REVISAR' | 'DESCARTAR';

interface ActionRecommendation {
  action: RecommendedAction;
  reason: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  alerts: string[];
}

function computeRecommendedAction(
  confidenceScore: number,     // 0-100
  liquidityScore: number,      // 0-100
  documentRiskScore: number,   // 0-100 (mayor = mas riesgo)
  conditionScore: number,      // 0-100
): ActionRecommendation {

  const alerts: string[] = [];

  // ── DESCARTAR: riesgo documental alto o condicion critica ──
  if (documentRiskScore >= 80) {
    return {
      action: 'DESCARTAR',
      reason: 'Riesgo documental critico: posible siniestro total, prendas multiples o estado legal comprometido',
      priority: 'ALTA',
      alerts: ['RIESGO_DOCUMENTAL_CRITICO'],
    };
  }
  if (conditionScore < 20) {
    return {
      action: 'DESCARTAR',
      reason: 'Condicion fisica critica: vehiculo requiere reparaciones mayores',
      priority: 'ALTA',
      alerts: ['CONDICION_CRITICA'],
    };
  }

  // ── REVISAR: confianza baja o datos incompletos ──
  if (confidenceScore < 40) {
    alerts.push('BAJA_CONFIANZA_VALUACION');
    return {
      action: 'REVISAR',
      reason: 'Confianza en la valuacion insuficiente. Se requieren mas datos o validacion manual.',
      priority: 'MEDIA',
      alerts,
    };
  }
  if (documentRiskScore >= 50 && documentRiskScore < 80) {
    alerts.push('RIESGO_DOCUMENTAL_MODERADO');
    return {
      action: 'REVISAR',
      reason: 'Riesgo documental moderado. Verificar estado de prenda/comparendos antes de subastar.',
      priority: 'MEDIA',
      alerts,
    };
  }

  // ── COMPRA RAPIDA: alta confianza + alta liquidez + buen estado + bajo riesgo ──
  if (confidenceScore >= 75 && liquidityScore >= 70 && conditionScore >= 70 && documentRiskScore < 20) {
    return {
      action: 'COMPRA_RAPIDA',
      reason: 'Vehiculo con alta demanda, buen estado y bajo riesgo. Candidato para compra directa.',
      priority: 'ALTA',
      alerts: [],
    };
  }

  // ── SUBASTAR: caso por defecto cuando los scores son aceptables ──
  if (conditionScore < 50) alerts.push('CONDICION_REGULAR');
  if (liquidityScore < 40) alerts.push('BAJA_LIQUIDEZ');
  if (documentRiskScore >= 30) alerts.push('REVISAR_DOCUMENTOS');

  return {
    action: 'SUBASTAR',
    reason: 'Vehiculo apto para subasta. Publicar con precio sugerido.',
    priority: liquidityScore >= 50 ? 'ALTA' : 'MEDIA',
    alerts,
  };
}
```

**Matriz de decision:**

| Confianza | Liquidez | Riesgo Doc. | Condicion | Accion |
|-----------|----------|-------------|-----------|--------|
| >= 75 | >= 70 | < 20 | >= 70 | COMPRA RAPIDA |
| >= 40 | >= 40 | < 50 | >= 50 | SUBASTAR |
| >= 40 | < 40 | < 50 | >= 50 | SUBASTAR (alerta baja liquidez) |
| < 40 | cualquier | < 80 | >= 20 | REVISAR |
| cualquier | cualquier | >= 80 | cualquier | DESCARTAR |
| cualquier | cualquier | cualquier | < 20 | DESCARTAR |
| cualquier | cualquier | 50-79 | cualquier | REVISAR |

---

## 7. FEATURES DEL MODELO

### 7.1 MVP (Obligatorias) - Release 1

| # | Feature | Fuente | Tipo | Signal Strength | Computacion |
|---|---------|--------|------|----------------|-------------|
| 1 | `marca` | Vehicle.brand | Categorica | **HIGH** | Directo. Normalizar via catalogo maestro. |
| 2 | `linea` | Vehicle.model | Categorica | **HIGH** | Normalizar via catalogo maestro + fuzzy match. |
| 3 | `ano` | Vehicle.year | Numerica | **HIGH** | Directo. Calcular `edad = CURRENT_YEAR - ano`. |
| 4 | `km` | Vehicle.km | Numerica | **HIGH** | Directo. Calcular `km_per_year = km / max(1, edad)`. |
| 5 | `precio_fasecolda` | Fasecolda API | Numerica (COP) | **HIGH** | Consulta API tercero por codigo Fasecolda. Cache 30 dias. |
| 6 | `score_global` | Inspection.scoreGlobal | Numerica (0-100) | **HIGH** | Ultima inspeccion COMPLETED del vehiculo. |
| 7 | `ciudad` | Vehicle.city | Categorica | **HIGH** | Mapear a factor regional via tabla CITY_FACTORS. |
| 8 | `combustible` | Vehicle.combustible | Categorica | MEDIUM | Mapear a factor via FUEL_FACTORS. |
| 9 | `transmision` | Vehicle.transmision | Categorica | MEDIUM | Automatica vs manual. AT +3% en segmentos economy. |
| 10 | `tiene_prenda` | RUNT | Booleana | **HIGH** | Consulta RUNT. TRUE = gravamen vigente. |
| 11 | `tiene_siniestro` | RUNT | Booleana | **HIGH** | Consulta RUNT. Incluir tipo (parcial/total). |
| 12 | `color` | Vehicle.color | Categorica | LOW | Normalizar y mapear a COLOR_FACTORS. |
| 13 | `historial_mubis_avg` | Auctions (ENDED) | Numerica (COP) | **HIGH** | Promedio de current_bid de subastas similares finalizadas (mismo marca+modelo, ano +-2). |
| 14 | `historial_mubis_count` | Auctions (ENDED) | Numerica | MEDIUM | Cantidad de subastas comparables. Proxy de confianza. |
| 15 | `version_tier` | Catalogo maestro | Categorica | **HIGH** | Clasificar version en BASICO/COMFORT/MEDIO/FULL/PREMIUM. |

### 7.2 V2 (Recomendadas) - Release 2

| # | Feature | Fuente | Tipo | Signal Strength | Computacion |
|---|---------|--------|------|----------------|-------------|
| 16 | `precio_revista_motor` | Revista Motor | Numerica (COP) | **HIGH** | Import manual/API. Precio guia usados. |
| 17 | `precio_mercado_tucarro` | TuCarro scraping | Numerica (COP) | MEDIUM | Mediana de listings activos comparables. Ajustar -15%. |
| 18 | `dias_en_mercado` | TuCarro scraping | Numerica | **HIGH** | Promedio de dias publicados de comparables. Proxy de liquidez. |
| 19 | `listings_activos` | TuCarro scraping | Numerica | MEDIUM | Cantidad de vehiculos similares en venta. Proxy de oferta/competencia. |
| 20 | `comparendos_count` | RUNT | Numerica | MEDIUM | Cantidad de comparendos pendientes. |
| 21 | `soat_vigente` | RUNT | Booleana | MEDIUM | Estado del SOAT. Vencido = costo adicional al comprador. |
| 22 | `tecno_vigente` | RUNT | Booleana | MEDIUM | Estado de tecnomecanica. Vencida = riesgo de reparaciones. |
| 23 | `num_propietarios` | RUNT | Numerica | MEDIUM | Historial de propiedad. 1 dueno = premium. |
| 24 | `cilindraje` | Vehicle.cilindraje | Numerica | LOW | Motor grande vs pequeno. Impacto en impuestos y seguro. |
| 25 | `estacionalidad_mes` | Sistema (fecha) | Numerica (1-12) | MEDIUM | Mes actual. Mapear a MONTHLY_SEASONALITY. |

### 7.3 V3 (Avanzadas con IA) - Release 3

| # | Feature | Fuente | Tipo | Signal Strength | Computacion |
|---|---------|--------|------|----------------|-------------|
| 26 | `photo_condition_score` | Vehicle.photos[] | Numerica (0-100) | **HIGH** | Modelo de vision (CNN/ViT) entrenado para evaluar condicion exterior/interior desde fotos. Detectar rayones, abolladuras, desgaste de interior. |
| 27 | `photo_consistency` | Vehicle.photos[] | Numerica (0-1) | MEDIUM | Verificar que las fotos corresponden al vehiculo descrito (marca/modelo/color coherentes). Detectar fotos de stock/genericas. |
| 28 | `nlp_inspection_severity` | Inspection.comments | Numerica (0-100) | **HIGH** | NLP sobre comentarios del perito para extraer severidad de hallazgos. Detectar keywords: "golpe fuerte", "motor con fuga", "pintura original", etc. |
| 29 | `demand_prediction_30d` | Historial Mubis + mercado | Numerica (probabilidad) | **HIGH** | Modelo predictivo: probabilidad de que el vehiculo reciba >= 3 pujas en 30 dias. Inputs: marca, modelo, ano, ciudad, precio, estacionalidad. |
| 30 | `price_trend_segment` | Historial temporal | Categorica | MEDIUM | Tendencia de precios del segmento en ultimos 90 dias: SUBIENDO / ESTABLE / BAJANDO. Time series del promedio de subastas por marca+modelo. |
| 31 | `dealer_willingness_to_pay` | Historial bids por dealer | Numerica (COP) | MEDIUM | Precio promedio que dealers similares han pagado por vehiculos comparables. Personalizado por dealer si hay historial suficiente. |
| 32 | `impuesto_vehicular_estimate` | Cilindraje + ciudad + ano | Numerica (COP) | LOW | Estimacion del impuesto vehicular anual. Afecta el costo total de propiedad y, por tanto, la disposicion de pago. |
| 33 | `comparable_velocity` | Historial Mubis + TuCarro | Numerica (dias) | **HIGH** | Tiempo estimado para vender este vehiculo especifico, basado en velocidad de venta de comparables ponderado por similitud. |

---

## 8. SISTEMA DE SCORING

### 8.1 Valuation Confidence Score (VCS)

**Escala:** 0 - 100 (mayor = mas confiable)
**Proposito:** Medir que tan confiable es la estimacion de precio.

**Formula:**

```
VCS = w_completeness * completenessScore
    + w_sources     * sourceCountScore
    + w_market      * marketSampleScore
    + w_features    * featureCoverageScore
    + w_freshness   * dataFreshnessScore
    - penalties
```

**Pesos e inputs:**

| Input | Peso (w) | Calculo | Rango |
|-------|----------|---------|-------|
| `completenessScore` | 0.20 | Porcentaje de campos no-nulos del feature store. `presentFields / totalFields`. | 0-100 |
| `sourceCountScore` | 0.20 | Cuantas fuentes independientes aportan datos. `min(100, sourceCount * 25)`. 1 fuente = 25, 4 fuentes = 100. | 0-100 |
| `marketSampleScore` | 0.25 | Cantidad de transacciones comparables en Mubis. `min(100, mubisComparables * 12.5)`. 0 = 0, 8+ = 100. | 0-100 |
| `featureCoverageScore` | 0.15 | Porcentaje de features MVP (seccion 7.1) disponibles. `availableMVP / 15 * 100`. | 0-100 |
| `dataFreshnessScore` | 0.20 | Antiguedad de los datos. `max(0, 100 - daysSinceLastUpdate * 2)`. Datos de hoy = 100, 50+ dias = 0. | 0-100 |

**Penalizaciones (se restan del total):**

| Condicion | Penalizacion |
|-----------|-------------|
| `PRICE_IMPUTED` (precio base estimado) | -30 |
| `NO_RUNT` (sin datos RUNT) | -25 |
| `KM_IMPUTED` | -20 |
| `SCORE_IMPUTED` (sin inspeccion) | -15 |
| `CITY_DEFAULT` | -5 |
| `FUEL_DEFAULT` | -3 |
| `NO_FASECOLDA` (sin precio Fasecolda) | -10 |
| `CATALOG_UNMATCHED` (marca/modelo sin catalogo) | -15 |

```typescript
function computeValuationConfidenceScore(features: VehicleFeatures): {
  score: number;
  level: 'EXCELENTE' | 'BUENO' | 'ACEPTABLE' | 'BAJO';
  breakdown: Record<string, number>;
} {
  const completeness = (features.completeness_score ?? 0) * 100;
  const sourceCount = Math.min(100, (features.source_count ?? 0) * 25);

  const mubisComps = features.demanda_pujas_avg ?? 0;  // proxy: usar cantidad de subastas similares
  const marketSample = Math.min(100, mubisComps * 12.5);

  const mvpFields = ['marca', 'linea', 'ano', 'km', 'precio_fasecolda', 'score_global',
                     'ciudad', 'combustible', 'transmision', 'tiene_prenda', 'tiene_siniestro',
                     'color', 'historial_mubis_avg', 'historial_mubis_count', 'version_tier'];
  const availableMVP = mvpFields.filter(f => features[f] !== null && features[f] !== undefined).length;
  const featureCoverage = (availableMVP / mvpFields.length) * 100;

  const daysSinceUpdate = features.computed_at
    ? differenceInDays(new Date(), features.computed_at)
    : 999;
  const freshness = Math.max(0, 100 - daysSinceUpdate * 2);

  // Calcular score bruto
  let score = completeness * 0.20
            + sourceCount * 0.20
            + marketSample * 0.25
            + featureCoverage * 0.15
            + freshness * 0.20;

  // Aplicar penalizaciones
  const flags = features.data_flags ?? [];
  if (flags.includes('PRICE_IMPUTED'))      score -= 30;
  if (flags.includes('NO_RUNT'))            score -= 25;
  if (flags.includes('KM_IMPUTED'))         score -= 20;
  if (flags.includes('SCORE_IMPUTED'))      score -= 15;
  if (flags.includes('CITY_DEFAULT'))       score -= 5;
  if (flags.includes('FUEL_DEFAULT'))       score -= 3;
  if (!features.precio_fasecolda)           score -= 10;
  if (!features.catalog_id)                 score -= 15;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const level = score >= 80 ? 'EXCELENTE'
              : score >= 60 ? 'BUENO'
              : score >= 40 ? 'ACEPTABLE'
              : 'BAJO';

  return {
    score,
    level,
    breakdown: {
      completeness: Math.round(completeness * 0.20),
      sourceCount: Math.round(sourceCount * 0.20),
      marketSample: Math.round(marketSample * 0.25),
      featureCoverage: Math.round(featureCoverage * 0.15),
      freshness: Math.round(freshness * 0.20),
    },
  };
}
```

**Umbrales y decision:**

| Nivel | Score | Significado | Impacto |
|-------|-------|-------------|---------|
| EXCELENTE | 80-100 | Alta confianza. Multiples fuentes, datos completos y frescos. | Rango estrecho (+/-5-8%). Valuacion confiable para compra rapida. |
| BUENO | 60-79 | Confianza aceptable. Faltan algunas fuentes pero hay datos suficientes. | Rango moderado (+/-9-15%). Apto para subasta. |
| ACEPTABLE | 40-59 | Confianza limitada. Datos incompletos o stale. | Rango amplio (+/-16-22%). Revisar antes de publicar. |
| BAJO | 0-39 | Confianza insuficiente. Datos criticos faltantes. | Rango muy amplio (+/-23-30%). Requiere validacion manual obligatoria. |

### 8.2 Market Liquidity Score (MLS)

**Escala:** 0 - 100 (mayor = mas liquido, se vende mas rapido)
**Proposito:** Predecir que tan rapido se vendera este vehiculo.

**Formula:**

```
MLS = w_dom       * domScore
    + w_demand    * demandScore
    + w_supply    * supplyScore
    + w_bid_freq  * bidFrequencyScore
    + w_season    * seasonScore
```

**Pesos e inputs:**

| Input | Peso (w) | Calculo | Rango |
|-------|----------|---------|-------|
| `domScore` | 0.30 | Dias en mercado de comparables en TuCarro. `max(0, 100 - (diasMercado * 1.1))`. 0 dias = 100, 90 dias = 1. | 0-100 |
| `demandScore` | 0.25 | Promedio de pujas en subastas similares Mubis. `min(100, avgBids * 10)`. 10+ pujas = 100. | 0-100 |
| `supplyScore` | 0.20 | Inverso de listings activos comparables. `max(0, 100 - listingsActivos * 4)`. 0 listings = 100, 25+ = 0. Menos oferta = mas liquido. | 0-100 |
| `bidFrequencyScore` | 0.15 | Frecuencia de pujas en subastas similares recientes. `min(100, (totalBids / totalAuctions) * 15)`. | 0-100 |
| `seasonScore` | 0.10 | Factor estacional mapeado a 0-100. `(MONTHLY_SEASONALITY[mes] - 0.90) / 0.15 * 100`. Diciembre (1.05) = 100, Enero (0.94) = 27. | 0-100 |

```typescript
function computeMarketLiquidityScore(features: VehicleFeatures): {
  score: number;
  level: 'MUY_LIQUIDO' | 'LIQUIDO' | 'MODERADO' | 'ILIQUIDO';
  estimatedDaysToSell: number;
  breakdown: Record<string, number>;
} {
  // DOM Score
  const dom = features.dias_promedio_mercado ?? 45;  // Default: 45 dias si no hay dato
  const domScore = Math.max(0, 100 - dom * 1.1);

  // Demand Score
  const avgBids = features.demanda_pujas_avg ?? 0;
  const demandScore = Math.min(100, avgBids * 10);

  // Supply Score (inverso)
  const listings = features.listings_activos ?? 10;  // Default: 10
  const supplyScore = Math.max(0, 100 - listings * 4);

  // Bid Frequency Score
  // Necesita datos agregados de subastas del segmento
  const bidFreqScore = Math.min(100, avgBids * 15);  // Simplificado

  // Season Score
  const month = new Date().getMonth() + 1;
  const seasonFactor = MONTHLY_SEASONALITY[month] ?? 1.00;
  const seasonScore = Math.max(0, Math.min(100, ((seasonFactor - 0.90) / 0.15) * 100));

  const score = Math.round(
    domScore * 0.30
    + demandScore * 0.25
    + supplyScore * 0.20
    + bidFreqScore * 0.15
    + seasonScore * 0.10
  );

  const finalScore = Math.max(0, Math.min(100, score));

  // Estimar dias para vender
  let estimatedDaysToSell: number;
  if (finalScore >= 80) estimatedDaysToSell = 7;
  else if (finalScore >= 60) estimatedDaysToSell = 15;
  else if (finalScore >= 40) estimatedDaysToSell = 30;
  else if (finalScore >= 20) estimatedDaysToSell = 60;
  else estimatedDaysToSell = 90;

  const level = finalScore >= 75 ? 'MUY_LIQUIDO'
              : finalScore >= 50 ? 'LIQUIDO'
              : finalScore >= 25 ? 'MODERADO'
              : 'ILIQUIDO';

  return {
    score: finalScore,
    level,
    estimatedDaysToSell,
    breakdown: {
      domScore: Math.round(domScore * 0.30),
      demandScore: Math.round(demandScore * 0.25),
      supplyScore: Math.round(supplyScore * 0.20),
      bidFreqScore: Math.round(bidFreqScore * 0.15),
      seasonScore: Math.round(seasonScore * 0.10),
    },
  };
}
```

**Umbrales y decision:**

| Nivel | Score | Dias estimados | Impacto |
|-------|-------|---------------|---------|
| MUY LIQUIDO | 75-100 | 7-10 dias | Candidato a COMPRA RAPIDA. Precio puede ser mas agresivo. |
| LIQUIDO | 50-74 | 15-25 dias | Subasta estandar. Precio en rango base. |
| MODERADO | 25-49 | 30-50 dias | Subasta con precio conservador. Alerta al dealer. |
| ILIQUIDO | 0-24 | 60-90+ dias | Considerar descuento agresivo o descartar. Alerta prioritaria. |

### 8.3 Document Risk Score (DRS)

**Escala:** 0 - 100 (mayor = MAS riesgo)
**Proposito:** Cuantificar el riesgo legal y documental del vehiculo.

**Formula:**

```
DRS = prendaPenalty
    + siniestroApplied
    + comparendoPenalty
    + soatPenalty
    + tecnoPenalty
    + propietariosPenalty
    + estadoVehiculoPenalty
```

Es aditiva: cada hallazgo suma puntos de riesgo.

```typescript
function computeDocumentRiskScore(features: VehicleFeatures): {
  score: number;
  level: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO';
  alerts: DocumentAlert[];
  breakdown: Record<string, number>;
} {
  let score = 0;
  const alerts: DocumentAlert[] = [];
  const breakdown: Record<string, number> = {};

  // ── Prenda / Gravamen ──
  if (features.tiene_prenda) {
    score += 25;
    breakdown.prenda = 25;
    alerts.push({
      type: 'PRENDA',
      severity: 'HIGH',
      message: 'Vehiculo con gravamen/prenda vigente. Requiere levantamiento antes de traspaso.',
    });
  } else {
    breakdown.prenda = 0;
  }

  // ── Siniestro ──
  if (features.tiene_siniestro) {
    if (features.siniestro_tipo === 'TOTAL') {
      score += 45;
      breakdown.siniestro = 45;
      alerts.push({
        type: 'SINIESTRO_TOTAL',
        severity: 'CRITICAL',
        message: 'Vehiculo reportado como perdida total. Valor residual. Considerar DESCARTAR.',
      });
    } else if (features.siniestro_tipo === 'PARCIAL') {
      score += 20;
      breakdown.siniestro = 20;
      alerts.push({
        type: 'SINIESTRO_PARCIAL',
        severity: 'MEDIUM',
        message: 'Vehiculo con siniestro parcial reportado. Verificar reparacion y estado actual.',
      });
    } else {
      score += 30;  // Tipo desconocido -> asumir peor
      breakdown.siniestro = 30;
      alerts.push({
        type: 'SINIESTRO_DESCONOCIDO',
        severity: 'HIGH',
        message: 'Siniestro reportado de tipo desconocido. Requiere investigacion.',
      });
    }
  } else {
    breakdown.siniestro = 0;
  }

  // ── Comparendos ──
  const comparendos = features.comparendos_count ?? 0;
  if (comparendos > 0) {
    const comparendoPenalty = Math.min(15, comparendos * 3);
    score += comparendoPenalty;
    breakdown.comparendos = comparendoPenalty;
    alerts.push({
      type: 'COMPARENDOS',
      severity: comparendos >= 3 ? 'HIGH' : 'LOW',
      message: `${comparendos} comparendo(s) pendiente(s). Valor: ~$${(comparendos * 500_000).toLocaleString()} COP estimados.`,
    });
  } else {
    breakdown.comparendos = 0;
  }

  // ── SOAT ──
  if (features.soat_vigente === false) {
    score += 5;
    breakdown.soat = 5;
    alerts.push({
      type: 'SOAT_VENCIDO',
      severity: 'LOW',
      message: 'SOAT vencido. Costo de renovacion: $600K - $1.5M COP.',
    });
  } else {
    breakdown.soat = 0;
  }

  // ── Tecnomecanica ──
  if (features.tecno_vigente === false) {
    score += 8;
    breakdown.tecno = 8;
    alerts.push({
      type: 'TECNO_VENCIDA',
      severity: 'MEDIUM',
      message: 'Tecnomecanica vencida. Puede requerir reparaciones para pasar revision.',
    });
  } else {
    breakdown.tecno = 0;
  }

  // ── Propietarios ──
  const propietarios = features.num_propietarios ?? 0;
  if (propietarios >= 5) {
    score += 7;
    breakdown.propietarios = 7;
    alerts.push({
      type: 'MUCHOS_PROPIETARIOS',
      severity: 'LOW',
      message: `${propietarios} propietarios registrados. Historial de propiedad extenso.`,
    });
  } else {
    breakdown.propietarios = 0;
  }

  // ── Estado RUNT (suspendido/cancelado) ──
  // Este dato vendria del campo estado del RUNT
  // Si no tenemos datos RUNT, sumar riesgo por incertidumbre
  if (features.data_flags?.includes('NO_RUNT')) {
    score += 15;
    breakdown.sinRunt = 15;
    alerts.push({
      type: 'SIN_VERIFICACION_RUNT',
      severity: 'HIGH',
      message: 'No se pudo verificar el vehiculo en RUNT. Estado legal desconocido.',
    });
  } else {
    breakdown.sinRunt = 0;
  }

  const finalScore = Math.min(100, score);

  const level = finalScore >= 70 ? 'CRITICO'
              : finalScore >= 40 ? 'ALTO'
              : finalScore >= 15 ? 'MODERADO'
              : 'BAJO';

  return { score: finalScore, level, alerts, breakdown };
}
```

**Umbrales y decision:**

| Nivel | Score | Significado | Impacto |
|-------|-------|-------------|---------|
| BAJO | 0-14 | Sin hallazgos significativos. Documentacion limpia. | Sin restriccion. Factor documental = 1.00+. |
| MODERADO | 15-39 | Hallazgos menores (SOAT vencido, pocos comparendos). | Alerta informativa. Factor documental ~0.95-0.98. |
| ALTO | 40-69 | Hallazgos importantes (prenda, siniestro parcial, multiples comparendos). | Accion REVISAR. Factor documental ~0.80-0.92. |
| CRITICO | 70-100 | Hallazgos criticos (siniestro total, prenda + comparendos, estado suspendido). | Accion DESCARTAR. Factor documental ~0.45-0.70. |

### 8.4 Physical Condition Score (PCS)

**Escala:** 0 - 100 (mayor = mejor condicion)
**Proposito:** Evaluar la condicion fisica del vehiculo basada en la inspeccion.

**Formula:**

```
PCS = w_global      * scoreGlobal
    + w_motor       * scoreMotor
    + w_carroceria  * scoreCarroceria
    + w_interior    * scoreInterior
    + w_mecanica    * scoreMecanica
    + w_electrica   * scoreElectrica
    + penaltyKmForAge
```

**Pesos e inputs:**

| Input | Peso (w) | Fuente | Rango |
|-------|----------|--------|-------|
| `scoreGlobal` | 0.30 | Inspection.scoreGlobal | 0-100 |
| `scoreMotor` | 0.20 | Inspection.scores.motor | 0-100 |
| `scoreCarroceria` | 0.15 | Inspection.scores.carroceria | 0-100 |
| `scoreInterior` | 0.10 | Inspection.scores.interior | 0-100 |
| `scoreMecanica` | 0.15 | Inspection.scores.mecanica | 0-100 |
| `scoreElectrica` | 0.10 | Inspection.scores.electrica | 0-100 |

```typescript
function computePhysicalConditionScore(
  features: VehicleFeatures,
): {
  score: number;
  level: 'EXCELENTE' | 'BUENO' | 'ACEPTABLE' | 'DEFICIENTE';
  hasInspection: boolean;
  criticalAreas: string[];
  breakdown: Record<string, number>;
} {
  const criticalAreas: string[] = [];

  // Sin inspeccion: estimar por edad y km
  if (!features.has_inspection || features.score_global === null) {
    const age = CURRENT_YEAR - features.ano;
    const kmPerYear = age > 0 ? features.km / age : features.km;

    // Estimacion conservadora sin inspeccion
    let estimated = 70;  // Base
    if (age > 10) estimated -= 15;
    else if (age > 5) estimated -= 8;
    if (kmPerYear > 25_000) estimated -= 10;
    if (features.km > 150_000) estimated -= 10;

    estimated = Math.max(20, Math.min(85, estimated));  // Max 85 sin inspeccion

    return {
      score: estimated,
      level: estimated >= 70 ? 'BUENO'
           : estimated >= 50 ? 'ACEPTABLE'
           : 'DEFICIENTE',
      hasInspection: false,
      criticalAreas: [],
      breakdown: { estimated, note: 'Sin inspeccion - score estimado' } as any,
    };
  }

  // Con inspeccion: calcular score ponderado
  const global     = features.score_global ?? 0;
  const motor      = features.score_motor ?? global;
  const carroceria = features.score_carroceria ?? global;
  const interior   = features.score_interior ?? global;
  const mecanica   = features.score_mecanica ?? global;
  const electrica  = features.score_electrica ?? global;

  let score = global * 0.30
            + motor * 0.20
            + carroceria * 0.15
            + interior * 0.10
            + mecanica * 0.15
            + electrica * 0.10;

  // Penalizacion por areas criticas (score < 40 en area importante)
  if (motor < 40) {
    criticalAreas.push('MOTOR');
    score -= 5;
  }
  if (mecanica < 40) {
    criticalAreas.push('MECANICA');
    score -= 5;
  }
  if (carroceria < 30) {
    criticalAreas.push('CARROCERIA');
    score -= 3;
  }

  // Penalizacion por km alto para la edad
  const age = CURRENT_YEAR - features.ano;
  const expectedKm = age * 15_000;
  if (features.km > expectedKm * 1.8) {
    score -= 5;  // Km excesivo para la edad
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  const level = finalScore >= 80 ? 'EXCELENTE'
              : finalScore >= 60 ? 'BUENO'
              : finalScore >= 40 ? 'ACEPTABLE'
              : 'DEFICIENTE';

  return {
    score: finalScore,
    level,
    hasInspection: true,
    criticalAreas,
    breakdown: {
      global: Math.round(global * 0.30),
      motor: Math.round(motor * 0.20),
      carroceria: Math.round(carroceria * 0.15),
      interior: Math.round(interior * 0.10),
      mecanica: Math.round(mecanica * 0.15),
      electrica: Math.round(electrica * 0.10),
    },
  };
}
```

**Umbrales y decision:**

| Nivel | Score | Significado | Impacto en pricing |
|-------|-------|-------------|-------------------|
| EXCELENTE | 80-100 | Vehiculo en excelente estado. Minimo desgaste. | Factor condicion 1.06-1.10. |
| BUENO | 60-79 | Buen estado general. Desgaste normal para la edad. | Factor condicion 0.94-1.06. |
| ACEPTABLE | 40-59 | Estado regular. Desgaste visible, posibles reparaciones menores. | Factor condicion 0.82-0.94. |
| DEFICIENTE | 0-39 | Estado deficiente. Areas criticas comprometidas. | Factor condicion 0.50-0.82. Considerar REVISAR o DESCARTAR. |

### 8.5 Dealer Fit Score (DFS) - Opcional

**Escala:** 0 - 100 (mayor = mejor match con el dealer)
**Proposito:** Personalizar la relevancia de un vehiculo para un dealer especifico, basado en su historial de compras.

**Formula:**

```
DFS = w_brand     * brandMatchScore
    + w_price     * priceRangeMatchScore
    + w_segment   * segmentMatchScore
    + w_geo       * geoProximityScore
    + w_age       * agePreferenceScore
```

**Pesos e inputs:**

| Input | Peso (w) | Calculo | Rango |
|-------|----------|---------|-------|
| `brandMatchScore` | 0.30 | Si el dealer ha comprado esta marca antes: porcentaje de sus compras que son de esta marca. `(comprasDeMarca / totalCompras) * 100`. | 0-100 |
| `priceRangeMatchScore` | 0.25 | Que tan cerca esta el precio del rango habitual del dealer. Si cae dentro del p10-p90 = 100. Fuera pero dentro de 1.5x = 50. Fuera = 0. | 0-100 |
| `segmentMatchScore` | 0.20 | Si el dealer compra vehiculos de este segmento (SUV, sedan, etc.). Igual que brandMatch. | 0-100 |
| `geoProximityScore` | 0.15 | Proximidad geografica del vehiculo a la sucursal del dealer. Misma ciudad = 100. Misma region = 70. Otra region = 30. | 0-100 |
| `agePreferenceScore` | 0.10 | Si la edad del vehiculo esta dentro del rango habitual del dealer. `1 - abs(ageVehicle - avgAgeDealer) / 10 * 100`. | 0-100 |

```typescript
async function computeDealerFitScore(
  features: VehicleFeatures,
  dealerId: string,
  tenantId: string,
): Promise<{
  score: number;
  level: 'IDEAL' | 'BUEN_FIT' | 'NEUTRAL' | 'MAL_FIT';
  insights: string[];
  breakdown: Record<string, number>;
} | null> {
  // Obtener historial del dealer (ultimos 12 meses)
  const dealerHistory = await prisma.transaction.findMany({
    where: {
      buyerId: dealerId,
      tenantId,
      status: 'COMPLETED',
      completedAt: { gte: subMonths(new Date(), 12) },
    },
    include: { auction: { select: { brand: true, model: true, year: true, city: true, current_bid: true } } },
  });

  // Minimo 5 transacciones para calcular patron
  if (dealerHistory.length < 5) return null;

  const insights: string[] = [];

  // ── Brand Match ──
  const brandCounts: Record<string, number> = {};
  for (const tx of dealerHistory) {
    const b = tx.auction.brand.toLowerCase();
    brandCounts[b] = (brandCounts[b] ?? 0) + 1;
  }
  const totalTx = dealerHistory.length;
  const vehicleBrand = features.marca.toLowerCase();
  const brandPct = ((brandCounts[vehicleBrand] ?? 0) / totalTx) * 100;
  const brandMatchScore = Math.min(100, brandPct * 2);  // 50%+ de compras en esta marca = 100
  if (brandPct > 30) insights.push(`Dealer compra frecuentemente ${features.marca} (${Math.round(brandPct)}%)`);

  // ── Price Range Match ──
  const prices = dealerHistory.map(tx => Number(tx.auction.current_bid)).sort((a, b) => a - b);
  const p10 = prices[Math.floor(prices.length * 0.10)];
  const p90 = prices[Math.floor(prices.length * 0.90)];
  const vehiclePrice = features.precio_fasecolda ?? features.precio_mubis_avg ?? 0;

  let priceRangeScore: number;
  if (vehiclePrice >= p10 && vehiclePrice <= p90) {
    priceRangeScore = 100;
  } else if (vehiclePrice >= p10 * 0.7 && vehiclePrice <= p90 * 1.3) {
    priceRangeScore = 50;
  } else {
    priceRangeScore = 10;
    insights.push('Precio fuera del rango habitual del dealer');
  }

  // ── Segment Match ──
  const segmentCounts: Record<string, number> = {};
  for (const tx of dealerHistory) {
    const seg = getSegment(tx.auction.brand);
    segmentCounts[seg] = (segmentCounts[seg] ?? 0) + 1;
  }
  const vehicleSegment = features.segmento ?? 'DESCONOCIDO';
  const segPct = ((segmentCounts[vehicleSegment] ?? 0) / totalTx) * 100;
  const segmentMatchScore = Math.min(100, segPct * 2);

  // ── Geo Proximity ──
  const dealerCities = [...new Set(dealerHistory.map(tx => tx.auction.city.toLowerCase()))];
  const vehicleCity = (features.ciudad ?? '').toLowerCase();
  let geoScore: number;
  if (dealerCities.includes(vehicleCity)) {
    geoScore = 100;
  } else if (dealerCities.some(c => sameRegion(c, vehicleCity))) {
    geoScore = 70;
  } else {
    geoScore = 30;
    insights.push('Vehiculo en ciudad fuera del area habitual del dealer');
  }

  // ── Age Preference ──
  const avgAge = dealerHistory.reduce((sum, tx) => sum + (CURRENT_YEAR - tx.auction.year), 0) / totalTx;
  const vehicleAge = CURRENT_YEAR - features.ano;
  const ageDiff = Math.abs(vehicleAge - avgAge);
  const ageScore = Math.max(0, 100 - ageDiff * 15);

  // ── Score final ──
  const score = Math.round(
    brandMatchScore * 0.30
    + priceRangeScore * 0.25
    + segmentMatchScore * 0.20
    + geoScore * 0.15
    + ageScore * 0.10
  );

  const finalScore = Math.max(0, Math.min(100, score));

  const level = finalScore >= 80 ? 'IDEAL'
              : finalScore >= 60 ? 'BUEN_FIT'
              : finalScore >= 35 ? 'NEUTRAL'
              : 'MAL_FIT';

  return {
    score: finalScore,
    level,
    insights,
    breakdown: {
      brandMatch: Math.round(brandMatchScore * 0.30),
      priceRange: Math.round(priceRangeScore * 0.25),
      segmentMatch: Math.round(segmentMatchScore * 0.20),
      geoProximity: Math.round(geoScore * 0.15),
      agePreference: Math.round(ageScore * 0.10),
    },
  };
}
```

**Umbrales y uso:**

| Nivel | Score | Significado | Uso |
|-------|-------|-------------|-----|
| IDEAL | 80-100 | Vehiculo encaja perfecto en el patron de compra del dealer. | Notificacion proactiva al dealer. Priorizar en feed. |
| BUEN FIT | 60-79 | Buen match, aunque no exacto en todas las dimensiones. | Mostrar en sugerencias. |
| NEUTRAL | 35-59 | No hay match claro, pero tampoco hay desajuste. | Mostrar en listado general sin destacar. |
| MAL FIT | 0-34 | Vehiculo fuera del perfil del dealer. | No notificar. Mostrar solo si el dealer busca activamente. |

---

## 18. PSEUDOCODIGO

### Flujo Principal: `valuateVehicle`

```typescript
// src/pricing/pricing-engine.service.ts

interface ValuationOptions {
  includeMarketData?: boolean;    // default: true
  includeDealerFit?: boolean;     // default: false
  dealerId?: string;              // requerido si includeDealerFit = true
  forceRefresh?: boolean;         // default: false - ignorar cache
  mode?: 'FULL' | 'QUICK';       // default: FULL
}

interface ValuationResult {
  // Identidad
  vehicleId: string;
  placa: string | null;
  marca: string;
  linea: string;
  version: string | null;
  ano: number;
  km: number;

  // Precios
  precioBase: number;
  precioBaseFuente: string;
  precioAjustado: number;
  rangos: {
    conservador: number;
    base: number;
    agresivo: number;
    recomendadoSubasta: number;
  };

  // Factores aplicados
  factores: {
    factorAno: number;
    factorKm: number;
    factorCondicion: number;
    factorRegion: number;
    factorCombustible: number;
    factorColor: number;
    factorDocumental: number;
    factorEstacionalidad: number;
    factorLiquidez: number;
    productoTotal: number;
  };

  // Scores
  scores: {
    valuationConfidence: { score: number; level: string };
    marketLiquidity: { score: number; level: string; estimatedDaysToSell: number };
    documentRisk: { score: number; level: string; alerts: DocumentAlert[] };
    physicalCondition: { score: number; level: string; hasInspection: boolean };
    dealerFit?: { score: number; level: string; insights: string[] } | null;
  };

  // Recomendacion
  recommendation: {
    action: 'SUBASTAR' | 'COMPRA_RAPIDA' | 'REVISAR' | 'DESCARTAR';
    reason: string;
    priority: 'ALTA' | 'MEDIA' | 'BAJA';
    alerts: string[];
  };

  // Metadata
  metadata: {
    valuationId: string;
    computedAt: string;
    dataFlags: string[];
    sourceCount: number;
    completenessScore: number;
    processingTimeMs: number;
    engineVersion: string;
  };
}

async function valuateVehicle(
  placaOrVehicleId: string,
  tenantId: string,
  options: ValuationOptions = {},
): Promise<ValuationResult> {
  const startTime = Date.now();
  const valuationId = generateCuid();
  const opts = {
    includeMarketData: true,
    includeDealerFit: false,
    forceRefresh: false,
    mode: 'FULL',
    ...options,
  };

  // ═══════════════════════════════════════════════════════════════
  // PASO 1: RESOLVER IDENTIDAD DEL VEHICULO
  // ═══════════════════════════════════════════════════════════════
  let vehicle: Vehicle | null = null;
  let placa: string | null = null;

  // Determinar si es placa o vehicleId
  const isPlaca = /^[A-Z]{3}\d{3,4}$/i.test(placaOrVehicleId.replace(/[\s-]/g, ''));

  if (isPlaca) {
    placa = placaOrVehicleId.toUpperCase().replace(/[\s-]/g, '');

    // Buscar vehiculo por placa en Mubis
    vehicle = await prisma.vehicle.findFirst({
      where: { placa, tenantId },
      include: {
        inspections: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Si no existe en Mubis, se puede valuar solo con datos externos
    if (!vehicle) {
      logger.log(`Vehiculo con placa ${placa} no encontrado en Mubis. Valuando con fuentes externas.`);
    }
  } else {
    // Es vehicleId
    vehicle = await prisma.vehicle.findFirst({
      where: { id: placaOrVehicleId, tenantId },
      include: {
        inspections: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehiculo ${placaOrVehicleId} no encontrado`);
    }

    placa = vehicle.placa;
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 2: OBTENER DATOS DE FUENTES (EN PARALELO)
  // ═══════════════════════════════════════════════════════════════
  const dataFlags: string[] = [];
  const sources: SourceData[] = [];

  // Definir marca/modelo/ano desde vehiculo Mubis o desde RUNT
  let marca: string;
  let modelo: string;
  let ano: number;
  let km: number;

  try {
    // Lanzar consultas en paralelo con timeout individual
    const [runtResult, fasecoldaResult, marketResult, mubisHistoryResult] = await Promise.allSettled([
      // 2a. RUNT (3 segundos timeout)
      placa
        ? withTimeout(fetchRunt(placa), 3000).catch(err => {
            logger.warn(`RUNT timeout/error para ${placa}: ${err.message}`);
            dataFlags.push('NO_RUNT');
            return null;
          })
        : Promise.resolve(null),

      // 2b. Fasecolda (2 segundos timeout)
      // Se resuelve despues de tener marca/modelo/ano
      Promise.resolve(null),  // placeholder, se llama despues

      // 2c. Datos de mercado - TuCarro (3 segundos timeout, solo modo FULL)
      opts.includeMarketData && opts.mode === 'FULL'
        ? withTimeout(fetchMarketData(vehicle?.brand ?? '', vehicle?.model ?? '', vehicle?.year ?? 0), 3000)
            .catch(err => {
              logger.warn(`Market data error: ${err.message}`);
              return null;
            })
        : Promise.resolve(null),

      // 2d. Historial Mubis
      vehicle
        ? getMarketData(vehicle.brand, vehicle.model, vehicle.year, tenantId)
        : Promise.resolve({ marketAvg: null, marketCount: 0 }),
    ]);

    // Procesar RUNT
    const runtData = runtResult.status === 'fulfilled' ? runtResult.value : null;
    if (runtData) {
      sources.push({ source: 'RUNT', data: runtData });
      marca = runtData.marca;
      modelo = runtData.linea;
      ano = runtData.modelo;
    }

    // Usar datos de Mubis si RUNT no disponible
    if (!runtData && vehicle) {
      marca = vehicle.brand;
      modelo = vehicle.model;
      ano = vehicle.year;
      km = vehicle.km;
    } else if (!runtData && !vehicle) {
      throw new BadRequestException(
        'No se puede valuar: vehiculo no encontrado en Mubis ni en RUNT. Proporcione vehicleId o placa valida.',
      );
    }

    // km: preferir Mubis (inspeccion presencial) sobre cualquier otra fuente
    km = vehicle?.km ?? runtData?.km ?? 0;
    if (km === 0 && !vehicle) {
      dataFlags.push('KM_IMPUTED');
      const age = Math.max(1, CURRENT_YEAR - ano);
      km = age * 15_000;  // Imputar: 15,000 km/ano promedio Colombia
    }

    // 2b bis: Ahora si llamar Fasecolda con marca/modelo/ano conocidos
    let fasecoldaData: FasecolaResponse | null = null;
    try {
      fasecoldaData = await withTimeout(
        fetchFasecolda(marca!, modelo!, ano!),
        2000,
      );
      if (fasecoldaData) {
        sources.push({ source: 'FASECOLDA', data: fasecoldaData });
      }
    } catch (err) {
      logger.warn(`Fasecolda error: ${err.message}`);
    }

    // Procesar market data
    const marketData = marketResult.status === 'fulfilled' ? marketResult.value : null;
    if (marketData) {
      sources.push({ source: 'TUCARRO', data: marketData });
    }

    // Procesar historial Mubis
    const mubisHistory = mubisHistoryResult.status === 'fulfilled' ? mubisHistoryResult.value : null;
    if (mubisHistory && mubisHistory.marketAvg) {
      sources.push({
        source: 'MUBIS_HISTORIAL',
        data: { precioVentaPromedio: mubisHistory.marketAvg, count: mubisHistory.marketCount },
      });
    }

  } catch (error) {
    // Error critico en obtencion de fuentes
    if (!vehicle) throw error;
    // Si tenemos vehiculo Mubis, continuar con datos limitados
    marca = vehicle.brand;
    modelo = vehicle.model;
    ano = vehicle.year;
    km = vehicle.km;
    logger.error(`Error obteniendo fuentes externas: ${error.message}. Continuando con datos internos.`);
    dataFlags.push('EXTERNAL_SOURCES_ERROR');
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 3: NORMALIZAR DATOS
  // ═══════════════════════════════════════════════════════════════
  // 3a. Normalizar marca/linea/version via catalogo maestro
  const normalized = await normalizeBrandModelVersion(marca!, modelo!, null, ano!);
  if (normalized.matchConfidence < 0.7) {
    dataFlags.push('CATALOG_UNMATCHED');
  }

  // 3b. Validar datos
  const validation = validateVehicleData({
    marca: normalized.marca,
    modelo: normalized.linea,
    ano: ano!,
    km,
    placa,
  });

  if (!validation.isValid) {
    logger.error(`Validacion fallida: ${JSON.stringify(validation.errors)}`);
    throw new BadRequestException({
      message: 'Datos del vehiculo no pasaron validacion',
      errors: validation.errors,
    });
  }

  // 3c. Reconciliar fuentes si hay multiples
  const reconciled = sources.length > 1
    ? reconcileSources(sources)
    : sources[0]?.data ?? {};

  // ═══════════════════════════════════════════════════════════════
  // PASO 4: CONSTRUIR / ACTUALIZAR FEATURE STORE
  // ═══════════════════════════════════════════════════════════════
  const inspection = vehicle?.inspections?.[0] ?? null;
  let inspectionScores: InspectionScores | null = null;
  if (inspection?.scores) {
    try {
      inspectionScores = typeof inspection.scores === 'string'
        ? JSON.parse(inspection.scores)
        : inspection.scores as InspectionScores;
    } catch { inspectionScores = null; }
  }

  const features: VehicleFeatures = {
    // Identidad
    placa,
    vin: reconciled.vin ?? null,
    catalog_id: normalized.catalogId,
    marca: normalized.marca,
    linea: normalized.linea,
    version: normalized.version,
    ano: ano!,
    segmento: reconciled.segmento ?? null,

    // Condicion
    km,
    km_per_year: Math.max(1, CURRENT_YEAR - ano!) > 0 ? km / (CURRENT_YEAR - ano!) : km,
    score_global: inspection?.scoreGlobal ?? null,
    score_motor: inspectionScores?.motor ?? null,
    score_carroceria: inspectionScores?.carroceria ?? null,
    score_interior: inspectionScores?.interior ?? null,
    score_mecanica: inspectionScores?.mecanica ?? null,
    score_electrica: inspectionScores?.electrica ?? null,
    has_inspection: !!inspection,

    // Precios de referencia
    precio_fasecolda: reconciled.precioMedio ?? null,
    precio_revista_motor: reconciled.precioUsado ?? null,
    precio_mubis_avg: reconciled.precioVentaPromedio ?? null,
    precio_mercado_avg: reconciled.precioPublicado
      ? Math.round(reconciled.precioPublicado * 0.85)
      : null,
    precio_mercado_median: null,

    // Legal / Documental
    tiene_prenda: reconciled.prendas?.length > 0 ?? false,
    tiene_siniestro: reconciled.siniestros?.length > 0 ?? false,
    siniestro_tipo: reconciled.siniestros?.[0]?.tipo ?? null,
    comparendos_count: reconciled.comparendos?.length ?? 0,
    soat_vigente: reconciled.soat?.vigente ?? null,
    tecno_vigente: reconciled.tecno?.vigente ?? null,
    num_propietarios: reconciled.numPropietarios ?? null,

    // Mercado / Liquidez
    dias_promedio_mercado: reconciled.diasMercado ?? null,
    listings_activos: reconciled.listingsActivos ?? null,
    demanda_pujas_avg: reconciled.count ?? null,

    // Contexto
    ciudad: vehicle?.city ?? reconciled.ciudad ?? null,
    region: mapCityToRegion(vehicle?.city ?? reconciled.ciudad ?? null),
    combustible: vehicle?.combustible ?? reconciled.combustible ?? null,
    transmision: vehicle?.transmision ?? reconciled.transmision ?? null,
    color: vehicle?.color ?? reconciled.color ?? null,
    cilindraje: parseInt(vehicle?.cilindraje ?? '0') || null,

    // Metadata
    data_flags: dataFlags,
    source_count: sources.length,
    completeness_score: validation.completenessScore,
    computed_at: new Date(),
  };

  // Persistir en feature store (si hay vehicleId)
  if (vehicle) {
    await prisma.pricingVehicleFeatures.upsert({
      where: { vehicleId: vehicle.id },
      update: { ...featuresToDb(features), updatedAt: new Date() },
      create: { vehicleId: vehicle.id, tenantId, ...featuresToDb(features) },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 5: APLICAR LOGICA DE PRICING (CAPAS A, B, C)
  // ═══════════════════════════════════════════════════════════════

  // ── CAPA A: Precio Base ──
  const capA = await computeBasePrice(features);

  // ── CAPA B: Ajustes ──
  // Si la fuente es Fasecolda o Revista Motor, el precio ya incluye
  // depreciacion por ano. Solo aplicar factorAno si es TABLA_INTERNA.
  let precioParaAjustar = capA.precioBase;
  if (capA.fuente === 'TABLA_INTERNA') {
    // El precio de tabla interna YA tiene depreciacion aplicada en getBrandBasePrice()
    // No aplicar factorAno nuevamente
  }
  // Fasecolda y Revista Motor dan precio para el ano especifico
  // No necesitan ajuste de ano adicional

  const capB = applyAdjustments(precioParaAjustar, features);

  // ═══════════════════════════════════════════════════════════════
  // PASO 6: GENERAR SCORES
  // ═══════════════════════════════════════════════════════════════

  const confidenceScore = computeValuationConfidenceScore(features);
  const liquidityScore = computeMarketLiquidityScore(features);
  const documentRiskScore = computeDocumentRiskScore(features);
  const conditionScore = computePhysicalConditionScore(features);

  // Dealer Fit Score (opcional)
  let dealerFitScore = null;
  if (opts.includeDealerFit && opts.dealerId) {
    dealerFitScore = await computeDealerFitScore(features, opts.dealerId, tenantId);
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 7: CAPA C - GENERAR RESULTADO FINAL
  // ═══════════════════════════════════════════════════════════════

  // Generar rangos de precio
  const rangos = generatePriceRanges(
    capB.precioAjustado,
    confidenceScore.score,
    liquidityScore.score,
  );

  // Generar recomendacion de accion
  const recommendation = computeRecommendedAction(
    confidenceScore.score,
    liquidityScore.score,
    documentRiskScore.score,
    conditionScore.score,
  );

  // ═══════════════════════════════════════════════════════════════
  // PASO 8: REGISTRAR AUDIT TRAIL
  // ═══════════════════════════════════════════════════════════════

  const processingTimeMs = Date.now() - startTime;

  // Registrar en audit log
  await prisma.pricingAuditLog.create({
    data: {
      id: valuationId,
      tenantId,
      vehicleId: vehicle?.id ?? null,
      placa,
      marca: normalized.marca,
      linea: normalized.linea,
      ano: ano!,
      km,
      // Resultado
      precioBase: capA.precioBase,
      precioBaseFuente: capA.fuente,
      precioAjustado: capB.precioAjustado,
      rangos: rangos as any,
      factores: capB.factores as any,
      // Scores
      confidenceScore: confidenceScore.score,
      liquidityScore: liquidityScore.score,
      documentRiskScore: documentRiskScore.score,
      conditionScore: conditionScore.score,
      dealerFitScore: dealerFitScore?.score ?? null,
      // Recomendacion
      recommendedAction: recommendation.action,
      // Metadata
      dataFlags,
      sourceCount: sources.length,
      processingTimeMs,
      engineVersion: ENGINE_VERSION,
      requestedBy: opts.dealerId ?? 'SYSTEM',
      createdAt: new Date(),
    },
  });

  // Registrar en AuditEvent del sistema (si hay vehiculo Mubis)
  if (vehicle) {
    await prisma.auditEvent.create({
      data: {
        tenantId,
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        type: 'VEHICLE_CREATED',  // TODO: agregar VEHICLE_VALUATED al enum
        message: `Valuacion generada: ${formatCOP(capB.precioAjustado)} (${recommendation.action})`,
        actorRole: 'SYSTEM',
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RETORNAR RESULTADO
  // ═══════════════════════════════════════════════════════════════

  return {
    vehicleId: vehicle?.id ?? `ext-${placa}`,
    placa,
    marca: normalized.marca,
    linea: normalized.linea,
    version: normalized.version,
    ano: ano!,
    km,

    precioBase: capA.precioBase,
    precioBaseFuente: capA.fuente,
    precioAjustado: capB.precioAjustado,
    rangos,

    factores: capB.factores,

    scores: {
      valuationConfidence: {
        score: confidenceScore.score,
        level: confidenceScore.level,
      },
      marketLiquidity: {
        score: liquidityScore.score,
        level: liquidityScore.level,
        estimatedDaysToSell: liquidityScore.estimatedDaysToSell,
      },
      documentRisk: {
        score: documentRiskScore.score,
        level: documentRiskScore.level,
        alerts: documentRiskScore.alerts,
      },
      physicalCondition: {
        score: conditionScore.score,
        level: conditionScore.level,
        hasInspection: conditionScore.hasInspection,
      },
      dealerFit: dealerFitScore,
    },

    recommendation,

    metadata: {
      valuationId,
      computedAt: new Date().toISOString(),
      dataFlags,
      sourceCount: sources.length,
      completenessScore: validation.completenessScore,
      processingTimeMs,
      engineVersion: ENGINE_VERSION,
    },
  };
}
```

### Funciones Auxiliares

```typescript
// ── Timeout wrapper ──
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${ms}ms`)), ms),
    ),
  ]);
}

// ── Formatear COP ──
function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Mapear ciudad a region ──
function mapCityToRegion(ciudad: string | null): string | null {
  if (!ciudad) return null;
  const c = ciudad.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const REGIONS: Record<string, string[]> = {
    'CENTRO': ['bogota', 'tunja', 'villavicencio', 'ibague', 'neiva'],
    'ANTIOQUIA': ['medellin', 'rionegro', 'envigado', 'itagui', 'bello'],
    'COSTA': ['barranquilla', 'cartagena', 'santa marta', 'monteria', 'valledupar', 'sincelejo'],
    'SUROCCIDENTE': ['cali', 'popayan', 'pasto', 'palmira', 'buenaventura'],
    'EJE_CAFETERO': ['pereira', 'manizales', 'armenia'],
    'SANTANDERES': ['bucaramanga', 'cucuta', 'floridablanca', 'giron'],
  };

  for (const [region, cities] of Object.entries(REGIONS)) {
    if (cities.some(city => c.includes(city))) return region;
  }
  return 'OTRA';
}

// ── Clasificar version en tier ──
function classifyVersionTier(version: string | null, linea: string): string {
  if (!version) return 'UNKNOWN';

  const v = version.toLowerCase();

  // Keywords de cada tier
  if (/limited|platinum|titanium|gt[\s-]line|prestige|premium|r[\s-]?line|amg|m[\s-]?sport/.test(v)) return 'PREMIUM';
  if (/full|4x4|awd|plus|high|top|luxury/.test(v)) return 'FULL';
  if (/comfort|mid|se[\s$]|ex[\s$]|style/.test(v)) return 'COMFORT';
  if (/active|gl[\s$]|base|entry|life|access|zen/.test(v)) return 'BASICO';

  // Heuristica: si tiene muchos tokens, probablemente es version alta
  const tokens = v.split(/[\s-]+/).length;
  if (tokens >= 4) return 'FULL';
  if (tokens >= 2) return 'MEDIO';

  return 'MEDIO';
}

// ── Constantes ──
const ENGINE_VERSION = '2.0.0';
const CURRENT_YEAR = new Date().getFullYear();
```

### Manejo de Errores y Casos Borde

```typescript
// ── Errores esperados y como manejarlos ──

// 1. Placa no encontrada en RUNT ni en Mubis
//    -> Si no hay vehicleId: lanzar BadRequestException
//    -> Si hay vehicleId: continuar con datos internos + flag NO_RUNT

// 2. Timeout en fuentes externas (RUNT, Fasecolda, TuCarro)
//    -> Registrar warning, continuar con fuentes disponibles
//    -> Agregar flag correspondiente (NO_RUNT, NO_FASECOLDA, etc.)
//    -> Confianza del resultado baja automaticamente

// 3. Marca/modelo no encontrado en catalogo maestro
//    -> Usar datos raw normalizados basicamente
//    -> Agregar flag CATALOG_UNMATCHED
//    -> Precio base cae a TABLA_INTERNA (confianza 0.40)

// 4. Vehiculo sin inspeccion
//    -> Score de condicion se imputa por edad/km
//    -> Agregar flag SCORE_IMPUTED
//    -> Maximo score condicion: 85 (no puede ser EXCELENTE sin inspeccion)

// 5. Vehiculo muy viejo (>20 anos) o con km extremo (>500,000)
//    -> Aplicar factores con pisos (0.10 para ano, 0.40 para km)
//    -> Agregar alerta en recomendacion
//    -> Posible accion REVISAR

// 6. Sin datos de mercado (0 comparables en Mubis, sin TuCarro)
//    -> No ponderar mercado, usar solo precio base + ajustes
//    -> Agregar flag NO_MARKET_DATA
//    -> Confianza cae a "ACEPTABLE" maximo

// 7. Multiples fuentes con precios muy diferentes (>30% diferencia)
//    -> Registrar conflicto en audit log
//    -> Usar fuente de mayor prioridad pero ampliar intervalo de confianza
//    -> Agregar flag PRICE_CONFLICT

// 8. Vehiculo con siniestro total
//    -> Factor documental aplica 0.60
//    -> Recomendacion automatica: DESCARTAR
//    -> Alerta critica en respuesta

// 9. Rate limiting en APIs externas
//    -> Implementar cola con backoff exponencial
//    -> Cache agresivo (72h RUNT, 30d Fasecolda)
//    -> En modo QUICK, no consultar fuentes externas si hay cache reciente

// 10. Datos inconsistentes del usuario (ej: anno 2024 con 300,000 km)
//     -> Validacion lo detecta como WARNING (no bloquea)
//     -> Flag HIGH_MILEAGE_FOR_AGE
//     -> Confianza reducida
```

### Ejemplo de Respuesta API

```json
{
  "vehicleId": "clx1234567890",
  "placa": "ABC123",
  "marca": "Hyundai",
  "linea": "Tucson",
  "version": "ix35 2.0 4x2 AT",
  "ano": 2019,
  "km": 65000,

  "precioBase": 95000000,
  "precioBaseFuente": "FASECOLDA",
  "precioAjustado": 78450000,
  "rangos": {
    "conservador": 72500000,
    "base": 78450000,
    "agresivo": 84200000,
    "recomendadoSubasta": 69000000
  },

  "factores": {
    "factorAno": 0.60,
    "factorKm": 0.97,
    "factorCondicion": 1.02,
    "factorRegion": 0.98,
    "factorCombustible": 1.00,
    "factorColor": 1.00,
    "factorDocumental": 1.00,
    "factorEstacionalidad": 1.01,
    "factorLiquidez": 1.02,
    "productoTotal": 0.826
  },

  "scores": {
    "valuationConfidence": { "score": 78, "level": "BUENO" },
    "marketLiquidity": { "score": 68, "level": "LIQUIDO", "estimatedDaysToSell": 15 },
    "documentRisk": { "score": 5, "level": "BAJO", "alerts": [] },
    "physicalCondition": { "score": 75, "level": "BUENO", "hasInspection": true },
    "dealerFit": null
  },

  "recommendation": {
    "action": "SUBASTAR",
    "reason": "Vehiculo apto para subasta. Publicar con precio sugerido.",
    "priority": "ALTA",
    "alerts": []
  },

  "metadata": {
    "valuationId": "val_abc123xyz",
    "computedAt": "2026-03-25T14:30:00.000Z",
    "dataFlags": [],
    "sourceCount": 3,
    "completenessScore": 0.87,
    "processingTimeMs": 1250,
    "engineVersion": "2.0.0"
  }
}
```
