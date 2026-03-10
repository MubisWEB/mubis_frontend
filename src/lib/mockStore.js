/**
 * Central mock store for Mubis multi-role simulation.
 * All data lives in localStorage under "mubis_store_*" keys.
 */

const KEYS = {
  users: 'mubis_store_users',
  vehicles: 'mubis_store_vehicles',
  inspections: 'mubis_store_inspections',
  auctions: 'mubis_store_auctions',
  bids: 'mubis_store_bids',
  notifications: 'mubis_store_notifications',
  supportTickets: 'mubis_store_support_tickets',
  auditEvents: 'mubis_store_audit_events',
};

// ── Admin whitelist ──
export const ADMIN_EMAILS = [
  'admin@mubis.com',
  'admin2@mubis.com',
  'superadmin@mubis.com',
];

// ── Photo URLs for demo ──
const PHOTOS = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=400&fit=crop',
];

// ── Seed data ──
const SEED_USERS = [
  { id: 'u-admin-1', email: 'admin@mubis.com', password: 'admin123', role: 'admin', nombre: 'Admin Mubis', company: 'Mubis', branch: 'Principal', telefono: '3000000000', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-dealer-1', email: 'dealer@test.com', password: 'dealer123', role: 'dealer', nombre: 'Autonal Colombia', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3001112233', ciudad: 'Bogotá', nit: '900123456-7', verification_status: 'VERIFIED' },
  { id: 'u-dealer-2', email: 'dealer2@test.com', password: 'dealer123', role: 'dealer', nombre: 'Los Coches', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3159998877', ciudad: 'Medellín', nit: '900234567-8', verification_status: 'VERIFIED' },
  { id: 'u-dealer-3', email: 'dealer3@test.com', password: 'dealer123', role: 'dealer', nombre: 'Motor Uno', company: 'Motor Uno', branch: 'Bogotá Norte', telefono: '3201234000', ciudad: 'Bogotá', nit: '900444555-1', verification_status: 'VERIFIED' },
  { id: 'u-dealer-4', email: 'dealer4@test.com', password: 'dealer123', role: 'dealer', nombre: 'CarHouse Cali', company: 'CarHouse', branch: 'Cali Sur', telefono: '3164567890', ciudad: 'Cali', nit: '900555666-2', verification_status: 'PENDING' },
  { id: 'u-dealer-5', email: 'dealer5@test.com', password: 'dealer123', role: 'dealer', nombre: 'Importados Premium', company: 'Importados Premium', branch: 'Barranquilla Centro', telefono: '3178889900', ciudad: 'Barranquilla', nit: '900666777-3', verification_status: 'PENDING' },
  { id: 'u-perito-1', email: 'perito@test.com', password: 'perito123', role: 'perito', nombre: 'Carlos Peritaje', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3201234567', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-perito-2', email: 'perito2@test.com', password: 'perito123', role: 'perito', nombre: 'María Inspección', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3107654321', ciudad: 'Medellín', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-perito-3', email: 'perito3@test.com', password: 'perito123', role: 'perito', nombre: 'Jorge Técnico', company: 'CarHouse', branch: 'Cali Sur', telefono: '3189876543', ciudad: 'Cali', nit: '', verification_status: 'PENDING' },
  { id: 'u-recomprador-1', email: 'recomprador@test.com', password: 'recomprador123', role: 'recomprador', nombre: 'CarMax Colombia', company: 'CarMax', branch: 'Cali Sur', telefono: '3114567890', ciudad: 'Cali', nit: '900345678-9', verification_status: 'VERIFIED' },
  { id: 'u-recomprador-2', email: 'recomprador2@test.com', password: 'recomprador123', role: 'recomprador', nombre: 'AutoCompra SAS', company: 'AutoCompra', branch: 'Bogotá Norte', telefono: '3125556677', ciudad: 'Bogotá', nit: '900456789-0', verification_status: 'VERIFIED' },
  { id: 'u-recomprador-3', email: 'recomprador3@test.com', password: 'recomprador123', role: 'recomprador', nombre: 'VehíCompra', company: 'VehíCompra', branch: 'Medellín Centro', telefono: '3136667788', ciudad: 'Medellín', nit: '900567890-1', verification_status: 'VERIFIED' },
  { id: 'u-recomprador-4', email: 'recomprador4@test.com', password: 'recomprador123', role: 'recomprador', nombre: 'TuCarro Express', company: 'TuCarro Express', branch: 'Barranquilla Centro', telefono: '3147778899', ciudad: 'Barranquilla', nit: '900678901-2', verification_status: 'PENDING' },
];

const CAR_DATA = [
  { brand: 'Mazda', model: '3', year: 2023, km: 12000, city: 'Bogotá', placa: 'ABC123', color: 'Rojo', combustible: 'Gasolina', transmision: '4x2', cilindraje: '2000cc' },
  { brand: 'Toyota', model: 'Corolla', year: 2022, km: 25000, city: 'Bogotá', placa: 'DEF456', color: 'Blanco', combustible: 'Híbrido', transmision: 'FWD', cilindraje: '1800cc' },
  { brand: 'Kia', model: 'Sportage', year: 2023, km: 8000, city: 'Medellín', placa: 'GHI789', color: 'Gris', combustible: 'Gasolina', transmision: '4x4', cilindraje: '2000cc' },
  { brand: 'Chevrolet', model: 'Tracker', year: 2022, km: 32000, city: 'Medellín', placa: 'JKL012', color: 'Negro', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1400cc' },
  { brand: 'Renault', model: 'Duster', year: 2021, km: 45000, city: 'Bogotá', placa: 'MNO345', color: 'Plata', combustible: 'Gasolina', transmision: '4x2', cilindraje: '1600cc' },
  { brand: 'Hyundai', model: 'Tucson', year: 2023, km: 5000, city: 'Cali', placa: 'PQR678', color: 'Azul', combustible: 'Diésel', transmision: '4x4', cilindraje: '2000cc' },
  { brand: 'Nissan', model: 'Kicks', year: 2022, km: 18000, city: 'Bogotá', placa: 'STU901', color: 'Blanco', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1600cc' },
  { brand: 'Volkswagen', model: 'Taos', year: 2023, km: 3500, city: 'Medellín', placa: 'VWX234', color: 'Negro', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '1400cc' },
  { brand: 'Suzuki', model: 'Vitara', year: 2021, km: 40000, city: 'Cali', placa: 'YZA567', color: 'Rojo', combustible: 'Gasolina', transmision: '4x4', cilindraje: '1600cc' },
  { brand: 'Ford', model: 'Escape', year: 2022, km: 22000, city: 'Bogotá', placa: 'BCD890', color: 'Gris', combustible: 'Híbrido', transmision: 'AWD', cilindraje: '2500cc' },
  { brand: 'BMW', model: 'X1', year: 2023, km: 6000, city: 'Bogotá', placa: 'EFG123', color: 'Blanco', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '2000cc' },
  { brand: 'Mercedes-Benz', model: 'GLA', year: 2022, km: 15000, city: 'Medellín', placa: 'HIJ456', color: 'Negro', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1300cc' },
  { brand: 'Audi', model: 'Q3', year: 2021, km: 35000, city: 'Bogotá', placa: 'KLM789', color: 'Gris', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '2000cc' },
  { brand: 'Toyota', model: 'RAV4', year: 2023, km: 9000, city: 'Cali', placa: 'NOP012', color: 'Verde', combustible: 'Híbrido', transmision: '4x4', cilindraje: '2500cc' },
  { brand: 'Mazda', model: 'CX-5', year: 2022, km: 28000, city: 'Medellín', placa: 'QRS345', color: 'Rojo', combustible: 'Gasolina', transmision: '4x2', cilindraje: '2000cc' },
  // Extended pool for auto-replenishment
  { brand: 'Chevrolet', model: 'Onix', year: 2023, km: 11000, city: 'Bogotá', placa: 'TUV678', color: 'Blanco', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1000cc' },
  { brand: 'Renault', model: 'Koleos', year: 2022, km: 19000, city: 'Medellín', placa: 'WXY901', color: 'Negro', combustible: 'Gasolina', transmision: '4x4', cilindraje: '2500cc' },
  { brand: 'Hyundai', model: 'Creta', year: 2023, km: 7500, city: 'Cali', placa: 'ZAB234', color: 'Azul', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1500cc' },
  { brand: 'Kia', model: 'Seltos', year: 2022, km: 21000, city: 'Bogotá', placa: 'CDE567', color: 'Gris', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '1600cc' },
  { brand: 'Toyota', model: 'Hilux', year: 2021, km: 55000, city: 'Barranquilla', placa: 'FGH890', color: 'Blanco', combustible: 'Diésel', transmision: '4x4', cilindraje: '2800cc' },
  { brand: 'Ford', model: 'Bronco Sport', year: 2023, km: 4200, city: 'Bogotá', placa: 'IJK123', color: 'Verde', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '2000cc' },
  { brand: 'Mazda', model: 'CX-30', year: 2023, km: 9800, city: 'Medellín', placa: 'LMN456', color: 'Rojo', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '2000cc' },
  { brand: 'Nissan', model: 'Qashqai', year: 2022, km: 16000, city: 'Cali', placa: 'OPQ789', color: 'Plata', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '2000cc' },
  { brand: 'Volkswagen', model: 'T-Cross', year: 2023, km: 6500, city: 'Bogotá', placa: 'RST012', color: 'Blanco', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1000cc' },
  { brand: 'Subaru', model: 'Forester', year: 2022, km: 24000, city: 'Bogotá', placa: 'UVW345', color: 'Azul', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '2500cc' },
  { brand: 'Jeep', model: 'Renegade', year: 2021, km: 38000, city: 'Medellín', placa: 'XYZ678', color: 'Negro', combustible: 'Gasolina', transmision: '4x4', cilindraje: '1800cc' },
  { brand: 'Peugeot', model: '2008', year: 2023, km: 5500, city: 'Bogotá', placa: 'AAB901', color: 'Gris', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1200cc' },
  { brand: 'Chevrolet', model: 'Captiva', year: 2022, km: 29000, city: 'Cali', placa: 'BBC234', color: 'Plata', combustible: 'Gasolina', transmision: 'FWD', cilindraje: '1500cc' },
  { brand: 'Hyundai', model: 'Santa Fe', year: 2023, km: 8500, city: 'Barranquilla', placa: 'CCD567', color: 'Blanco', combustible: 'Diésel', transmision: '4x4', cilindraje: '2200cc' },
  { brand: 'Kia', model: 'Sorento', year: 2022, km: 31000, city: 'Bogotá', placa: 'DDE890', color: 'Negro', combustible: 'Gasolina', transmision: 'AWD', cilindraje: '2500cc' },
];

function generateDocumentation(i) {
  const soatMonths = [3, 6, 9, 12];
  const tecnoMonths = [2, 5, 8, 11];
  const soatDate = new Date(Date.now() + soatMonths[i % 4] * 30 * 86400000);
  const tecnoDate = new Date(Date.now() + tecnoMonths[i % 4] * 30 * 86400000);
  return {
    soat: { status: 'vigente', fecha: soatDate.toISOString().split('T')[0] },
    tecno: { status: 'vigente', fecha: tecnoDate.toISOString().split('T')[0] },
    multas: { tiene: i % 5 === 0 ? 'si' : 'no', descripcion: i % 5 === 0 ? 'Fotomulta por exceso de velocidad - $450,000' : '' },
  };
}

function buildSeedVehicles() {
  const dealers = ['u-dealer-1', 'u-dealer-2', 'u-dealer-3'];
  const branches = { 'u-dealer-1': 'Bogotá Norte', 'u-dealer-2': 'Medellín Centro', 'u-dealer-3': 'Bogotá Norte' };
  const companies = { 'u-dealer-1': 'Autonal', 'u-dealer-2': 'Los Coches', 'u-dealer-3': 'Motor Uno' };

  return CAR_DATA.map((car, i) => {
    const dealerId = dealers[i % dealers.length];
    return {
      id: `v-seed-${i + 1}`,
      ...car,
      mileage: car.km,
      transmission: car.transmision,
      fuel_type: car.combustible,
      traction: car.transmision,
      dealerId,
      dealerBranch: branches[dealerId],
      dealerCompany: companies[dealerId],
      photos: [PHOTOS[i % PHOTOS.length], PHOTOS[(i + 3) % PHOTOS.length]],
      documentation: generateDocumentation(i),
      status: i < 12 ? 'READY_FOR_AUCTION' : 'PENDING_INSPECTION',
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    };
  });
}

function buildSeedInspections(vehicles) {
  const inspections = [];
  vehicles.forEach((v, i) => {
    if (v.status === 'READY_FOR_AUCTION') {
      const peritoId = v.dealerBranch === 'Bogotá Norte' ? 'u-perito-1' : 'u-perito-2';
      inspections.push({
        id: `insp-seed-${i + 1}`,
        vehicleId: v.id,
        dealerBranch: v.dealerBranch,
        dealerCompany: v.dealerCompany,
        peritoId,
        lockedByPeritoId: peritoId,
        status: 'COMPLETED',
        scoreGlobal: 70 + Math.floor(Math.random() * 25),
        scores: { motor: 80, transmision: 75, suspension: 82, frenos: 78, carroceria: 85, interior: 90, electrica: 77, llantas: 72 },
        comments: 'Vehículo en buen estado general. Sin observaciones mayores.',
        createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        completedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    } else if (v.status === 'PENDING_INSPECTION') {
      inspections.push({
        id: `insp-seed-${i + 1}`,
        vehicleId: v.id,
        dealerBranch: v.dealerBranch,
        dealerCompany: v.dealerCompany,
        status: 'PENDING',
        lockedByPeritoId: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        brand: v.brand, model: v.model, year: v.year, km: v.km, placa: v.placa,
      });
    }
  });
  return inspections;
}

function buildSeedAuctions(vehicles) {
  const readyVehicles = vehicles.filter(v => v.status === 'READY_FOR_AUCTION');
  return readyVehicles.map((v, i) => {
    const basePrice = 30000000 + Math.floor(Math.random() * 70000000);
    const bidsCount = 3 + Math.floor(Math.random() * 15);
    const currentBid = basePrice + bidsCount * 100000;
    // Stagger active auctions across the next 60 minutes so they expire at different times
    const isActive = i < 10;
    const isEnded = !isActive;
    return {
      id: `auc-seed-${i + 1}`,
      vehicleId: v.id,
      dealerId: v.dealerId,
      brand: v.brand,
      model: v.model,
      year: v.year,
      km: v.km,
      mileage: v.mileage || v.km,
      city: v.city,
      color: v.color,
      combustible: v.combustible,
      transmission: v.transmission || v.transmision,
      traction: v.traction || v.transmision,
      fuel_type: v.fuel_type || v.combustible,
      cilindraje: v.cilindraje,
      placa: v.placa,
      photos: v.photos,
      documentation: v.documentation,
      dealerCompany: v.dealerCompany,
      dealerBranch: v.dealerBranch,
      starting_price: basePrice,
      current_bid: currentBid,
      bids_count: bidsCount,
      views: 20 + Math.floor(Math.random() * 200),
      status: isActive ? 'active' : 'ended',
      winnerId: isEnded ? (i % 2 === 0 ? 'u-recomprador-1' : 'u-recomprador-2') : null,
      ends_at: isActive
        ? new Date(Date.now() + (3 + i * 7) * 60000).toISOString()  // stagger 3-66 min
        : new Date(Date.now() - (i - 9) * 86400000).toISOString(),
      createdAt: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
    };
  });
}

function buildSeedBids(auctions) {
  const bidders = ['u-recomprador-1', 'u-recomprador-2', 'u-recomprador-3', 'u-dealer-1', 'u-dealer-2'];
  const bids = [];
  let bidIdx = 0;
  auctions.forEach(a => {
    const count = a.bids_count || 3;
    for (let j = 0; j < count; j++) {
      const userId = bidders[(j + auctions.indexOf(a)) % bidders.length];
      if (userId === a.dealerId) continue;
      bids.push({
        id: `bid-seed-${++bidIdx}`,
        auctionId: a.id,
        userId,
        amount: a.starting_price + (j + 1) * 100000,
        createdAt: new Date(Date.now() - (count - j) * 3600000).toISOString(),
      });
    }
  });
  return bids;
}

function buildSeedAuditEvents(vehicles, inspections, auctions, bids) {
  const events = [];
  let idx = 0;
  vehicles.forEach(v => {
    events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: v.id, type: 'vehicle_created', message: `Vehículo ${v.brand} ${v.model} ${v.year} registrado`, createdAt: v.createdAt, actorUserId: v.dealerId, actorRole: 'dealer' });
  });
  inspections.forEach(insp => {
    const v = vehicles.find(x => x.id === insp.vehicleId);
    const vLabel = v ? `${v.brand} ${v.model} ${v.year}` : insp.vehicleId;
    events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: insp.vehicleId, type: 'inspection_requested', message: `Peritaje solicitado para ${vLabel}`, createdAt: insp.createdAt, actorUserId: v?.dealerId || '', actorRole: 'dealer' });
    if (insp.status === 'COMPLETED' || insp.status === 'IN_PROGRESS') {
      events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: insp.vehicleId, type: 'inspection_taken', message: `Peritaje tomado por perito`, createdAt: new Date(new Date(insp.createdAt).getTime() + 3600000).toISOString(), actorUserId: insp.peritoId || '', actorRole: 'perito' });
    }
    if (insp.status === 'COMPLETED') {
      events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: insp.vehicleId, type: 'inspection_completed', message: `Peritaje completado — Score: ${insp.scoreGlobal}/100`, createdAt: insp.completedAt || insp.createdAt, actorUserId: insp.peritoId || '', actorRole: 'perito' });
    }
    if (insp.status === 'REJECTED') {
      events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: insp.vehicleId, type: 'inspection_rejected', message: `Peritaje rechazado`, createdAt: insp.completedAt || insp.createdAt, actorUserId: insp.peritoId || '', actorRole: 'perito' });
    }
  });
  auctions.forEach(a => {
    events.push({ id: `audit-seed-${++idx}`, entityType: 'auction', entityId: a.id, type: 'auction_published', message: `Subasta publicada: ${a.brand} ${a.model} ${a.year}`, createdAt: a.createdAt, actorUserId: a.dealerId, actorRole: 'system' });
    // Also link to vehicle
    events.push({ id: `audit-seed-${++idx}`, entityType: 'vehicle', entityId: a.vehicleId, type: 'auction_published', message: `Subasta publicada: ${a.brand} ${a.model} ${a.year}`, createdAt: a.createdAt, actorUserId: a.dealerId, actorRole: 'system' });
    if (a.status === 'ended' || a.status === 'closed') {
      events.push({ id: `audit-seed-${++idx}`, entityType: 'auction', entityId: a.id, type: 'auction_ended', message: `Subasta finalizada`, createdAt: a.ends_at, actorUserId: '', actorRole: 'system' });
      if (a.winnerId) {
        events.push({ id: `audit-seed-${++idx}`, entityType: 'auction', entityId: a.id, type: 'winner_set', message: `Ganador asignado`, createdAt: a.ends_at, actorUserId: a.winnerId, actorRole: 'recomprador' });
      }
    }
  });
  // Sample bids as audit events
  bids.slice(0, 30).forEach(b => {
    const a = auctions.find(x => x.id === b.auctionId);
    if (!a) return;
    events.push({ id: `audit-seed-${++idx}`, entityType: 'auction', entityId: b.auctionId, type: 'bid_created', message: `Nueva puja: $${(b.amount / 1000000).toFixed(1)}M en ${a.brand} ${a.model} ${a.year}`, createdAt: b.createdAt, actorUserId: b.userId, actorRole: 'recomprador' });
  });
  events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return events;
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded() {
  const seedVersion = localStorage.getItem('mubis_seed_version');
  if (seedVersion !== 'v7') {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('mubis_seed_version', 'v7');
  }

  if (!load(KEYS.users)) {
    save(KEYS.users, SEED_USERS);
  }
  if (!load(KEYS.vehicles)) {
    const vehicles = buildSeedVehicles();
    save(KEYS.vehicles, vehicles);

    const inspections = buildSeedInspections(vehicles);
    save(KEYS.inspections, inspections);

    const auctions = buildSeedAuctions(vehicles);
    save(KEYS.auctions, auctions);

    const bids = buildSeedBids(auctions);
    save(KEYS.bids, bids);

    const auditEvents = buildSeedAuditEvents(vehicles, inspections, auctions, bids);
    save(KEYS.auditEvents, auditEvents);
  } else {
    if (!load(KEYS.inspections)) save(KEYS.inspections, []);
    if (!load(KEYS.bids)) save(KEYS.bids, []);
    if (!load(KEYS.auctions)) save(KEYS.auctions, []);
    if (!load(KEYS.auditEvents)) save(KEYS.auditEvents, []);
  }
}

ensureSeeded();

// ── Users ──
export function getUsers() { return load(KEYS.users) || []; }
export function getUserByEmail(email) { return getUsers().find(u => u.email === email); }
export function getUserById(id) { return getUsers().find(u => u.id === id); }
export function getVerifiedUsers() { return getUsers().filter(u => u.verification_status === 'VERIFIED' && u.role !== 'admin'); }
export function getUsersByRole(role) { return getUsers().filter(u => u.role === role); }
export function getUsersByStatus(status) { return getUsers().filter(u => u.verification_status === status && u.role !== 'admin'); }

export function registerUser(userData) {
  const users = getUsers();
  const user = { id: `u-${Date.now()}`, ...userData, createdAt: new Date().toISOString(), verification_status: 'PENDING' };
  users.push(user);
  save(KEYS.users, users);
  return user;
}
export function updateUser(id, updates) {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  save(KEYS.users, users);
  return users.find(u => u.id === id);
}

// ── Vehicles ──
export function getVehicles() { return load(KEYS.vehicles) || []; }
export function addVehicle(vehicle) {
  const vehicles = getVehicles();
  const v = { id: `v-${Date.now()}`, createdAt: new Date().toISOString(), ...vehicle };
  vehicles.unshift(v);
  save(KEYS.vehicles, vehicles);
  addAuditEvent({ entityType: 'vehicle', entityId: v.id, type: 'vehicle_created', message: `Vehículo ${v.brand} ${v.model} ${v.year} registrado`, actorUserId: v.dealerId || '', actorRole: 'dealer' });
  return v;
}
export function getVehicleById(id) { return getVehicles().find(v => v.id === id); }
export function updateVehicle(id, updates) {
  const vehicles = getVehicles().map(v => v.id === id ? { ...v, ...updates } : v);
  save(KEYS.vehicles, vehicles);
  return vehicles.find(v => v.id === id);
}

// ── Inspections ──
export function getInspections() { return load(KEYS.inspections) || []; }
export function addInspection(inspection) {
  const list = getInspections();
  const item = { id: `insp-${Date.now()}`, createdAt: new Date().toISOString(), ...inspection };
  list.unshift(item);
  save(KEYS.inspections, list);
  addAuditEvent({ entityType: 'vehicle', entityId: item.vehicleId, type: 'inspection_requested', message: `Peritaje solicitado`, actorUserId: '', actorRole: 'dealer' });
  return item;
}
export function getInspectionById(id) { return getInspections().find(i => i.id === id); }
export function getInspectionByVehicleId(vehicleId) { return getInspections().find(i => i.vehicleId === vehicleId); }
export function updateInspection(id, updates) {
  const list = getInspections().map(i => i.id === id ? { ...i, ...updates } : i);
  save(KEYS.inspections, list);
  const updated = list.find(i => i.id === id);

  if (updated && updates.status) {
    const vehicle = getVehicleById(updated.vehicleId);
    const vLabel = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : updated.vehicleId;

    if (updates.status === 'IN_PROGRESS' && updated.peritoId) {
      addNotification({ userId: updated.peritoId, type: 'inspection_taken', title: 'Peritaje tomado', body: `Tomaste el peritaje de ${vLabel}${vehicle?.placa ? ` (${vehicle.placa})` : ''}.` });
      addAuditEvent({ entityType: 'vehicle', entityId: updated.vehicleId, type: 'inspection_taken', message: `Peritaje tomado por perito`, actorUserId: updated.peritoId, actorRole: 'perito' });
    }
    if (updates.status === 'COMPLETED') {
      if (updated.peritoId) {
        addNotification({ userId: updated.peritoId, type: 'inspection_completed', title: 'Peritaje finalizado', body: `Finalizaste el peritaje de ${vLabel}.` });
      }
      if (vehicle?.dealerId) {
        addNotification({ userId: vehicle.dealerId, type: 'auction_published', title: 'Vehículo publicado en subasta', body: `${vLabel} ya está en subasta.` });
      }
      addAuditEvent({ entityType: 'vehicle', entityId: updated.vehicleId, type: 'inspection_completed', message: `Peritaje completado — Score: ${updates.scoreGlobal || updated.scoreGlobal || '?'}/100`, actorUserId: updated.peritoId || '', actorRole: 'perito' });
    }
    if (updates.status === 'REJECTED') {
      if (vehicle?.dealerId) {
        addNotification({ userId: vehicle.dealerId, type: 'inspection_rejected', title: 'Peritaje rechazado', body: `El peritaje de ${vLabel} fue rechazado.${updates.comments ? ` Razón: ${updates.comments}` : ''}` });
      }
      addAuditEvent({ entityType: 'vehicle', entityId: updated.vehicleId, type: 'inspection_rejected', message: `Peritaje rechazado${updates.comments ? `: ${updates.comments}` : ''}`, actorUserId: updated.peritoId || '', actorRole: 'perito' });
    }
  }

  return updated;
}
export function getPendingInspectionsByBranch(branch) {
  return getInspections().filter(i => i.dealerBranch === branch && i.status === 'PENDING');
}

// ── Auctions ──
export function getAuctions() { return load(KEYS.auctions) || []; }
export function addAuction(auction) {
  const list = getAuctions();
  const item = { id: `auc-${Date.now()}`, createdAt: new Date().toISOString(), ...auction };
  list.unshift(item);
  save(KEYS.auctions, list);
  addAuditEvent({ entityType: 'auction', entityId: item.id, type: 'auction_published', message: `Subasta publicada: ${item.brand} ${item.model} ${item.year}`, actorUserId: item.dealerId || '', actorRole: 'system' });
  addAuditEvent({ entityType: 'vehicle', entityId: item.vehicleId, type: 'auction_published', message: `Subasta publicada: ${item.brand} ${item.model} ${item.year}`, actorUserId: item.dealerId || '', actorRole: 'system' });
  return item;
}
export function getAuctionById(id) { return getAuctions().find(a => a.id === id); }
export function updateAuction(id, updates) {
  const list = getAuctions().map(a => a.id === id ? { ...a, ...updates } : a);
  save(KEYS.auctions, list);
  return list.find(a => a.id === id);
}
export function getAuctionsByDealerId(dealerId) {
  return getAuctions().filter(a => a.dealerId === dealerId);
}
export function getActiveAuctions() {
  reconcileAuctionStatuses();
  const inspections = getInspections();
  return getAuctions().filter(a => {
    if (a.status !== 'active') return false;
    const insp = inspections.find(i => i.vehicleId === a.vehicleId);
    return insp && insp.status === 'COMPLETED';
  });
}

const MIN_ACTIVE_AUCTIONS = 8;
let _spawnCounter = 0;

function spawnNewAuction() {
  const dealers = ['u-dealer-1', 'u-dealer-2', 'u-dealer-3'];
  const branches = { 'u-dealer-1': 'Bogotá Norte', 'u-dealer-2': 'Medellín Centro', 'u-dealer-3': 'Bogotá Norte' };
  const companies = { 'u-dealer-1': 'Autonal', 'u-dealer-2': 'Los Coches', 'u-dealer-3': 'Motor Uno' };

  const carIdx = _spawnCounter % CAR_DATA.length;
  const car = CAR_DATA[carIdx];
  const dealerId = dealers[_spawnCounter % dealers.length];
  const ts = Date.now();
  const uid = `${ts}-${Math.random().toString(36).slice(2, 6)}`;
  _spawnCounter++;

  // Create vehicle
  const vehicle = {
    id: `v-auto-${uid}`,
    ...car,
    km: car.km + Math.floor(Math.random() * 5000),
    mileage: car.km + Math.floor(Math.random() * 5000),
    transmission: car.transmision,
    fuel_type: car.combustible,
    traction: car.transmision,
    dealerId,
    dealerBranch: branches[dealerId],
    dealerCompany: companies[dealerId],
    photos: [PHOTOS[carIdx % PHOTOS.length], PHOTOS[(carIdx + 4) % PHOTOS.length]],
    documentation: generateDocumentation(carIdx),
    status: 'READY_FOR_AUCTION',
    createdAt: new Date().toISOString(),
  };
  const vehicles = getVehicles();
  vehicles.unshift(vehicle);
  save(KEYS.vehicles, vehicles);

  // Create inspection
  const peritoId = vehicle.dealerBranch === 'Bogotá Norte' ? 'u-perito-1' : 'u-perito-2';
  const inspection = {
    id: `insp-auto-${uid}`,
    vehicleId: vehicle.id,
    dealerBranch: vehicle.dealerBranch,
    dealerCompany: vehicle.dealerCompany,
    peritoId,
    lockedByPeritoId: peritoId,
    status: 'COMPLETED',
    scoreGlobal: 70 + Math.floor(Math.random() * 25),
    scores: { motor: 80, transmision: 75, suspension: 82, frenos: 78, carroceria: 85, interior: 90, electrica: 77, llantas: 72 },
    comments: 'Vehículo en buen estado general.',
    createdAt: new Date(ts - 86400000).toISOString(),
    completedAt: new Date(ts - 3600000).toISOString(),
  };
  const inspections = getInspections();
  inspections.unshift(inspection);
  save(KEYS.inspections, inspections);

  // Create auction with random duration 15-55 min
  const durationMin = 15 + Math.floor(Math.random() * 40);
  const basePrice = 30000000 + Math.floor(Math.random() * 70000000);
  const bidsCount = 2 + Math.floor(Math.random() * 6);
  const currentBid = basePrice + bidsCount * 100000;

  const auction = {
    id: `auc-auto-${uid}`,
    vehicleId: vehicle.id,
    dealerId,
    brand: car.brand,
    model: car.model,
    year: car.year,
    km: vehicle.km,
    mileage: vehicle.mileage,
    city: car.city,
    color: car.color,
    combustible: car.combustible,
    transmission: car.transmision,
    traction: car.transmision,
    fuel_type: car.combustible,
    cilindraje: car.cilindraje,
    placa: car.placa,
    photos: vehicle.photos,
    documentation: vehicle.documentation,
    dealerCompany: vehicle.dealerCompany,
    dealerBranch: vehicle.dealerBranch,
    starting_price: basePrice,
    current_bid: currentBid,
    bids_count: bidsCount,
    views: 5 + Math.floor(Math.random() * 50),
    status: 'active',
    winnerId: null,
    ends_at: new Date(ts + durationMin * 60000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  const auctions = getAuctions();
  auctions.unshift(auction);
  save(KEYS.auctions, auctions);

  // Seed some bids for it
  const bidders = ['u-recomprador-1', 'u-recomprador-2', 'u-recomprador-3', 'u-dealer-1', 'u-dealer-2'];
  const bids = getBids();
  for (let j = 0; j < bidsCount; j++) {
    const bidderId = bidders[(j + carIdx) % bidders.length];
    if (bidderId === dealerId) continue;
    bids.unshift({
      id: `bid-auto-${uid}-${j}`,
      auctionId: auction.id,
      userId: bidderId,
      amount: basePrice + (j + 1) * 100000,
      createdAt: new Date(ts - (bidsCount - j) * 120000).toISOString(),
    });
  }
  save(KEYS.bids, bids);

  return auction;
}

export function reconcileAuctionStatuses() {
  const auctions = getAuctions();
  let changed = false;
  const now = new Date();
  const allBids = getBids();
  const updated = auctions.map(a => {
    if (a.status === 'active' && new Date(a.ends_at) < now) {
      changed = true;
      const auctionBids = allBids.filter(b => b.auctionId === a.id).sort((x, y) => y.amount - x.amount);
      const winnerId = auctionBids.length > 0 ? auctionBids[0].userId : null;
      const ended = { ...a, status: 'ended', winnerId };
      addAuditEvent({ entityType: 'auction', entityId: a.id, type: 'auction_ended', message: `Subasta finalizada: ${a.brand} ${a.model} ${a.year}`, actorUserId: '', actorRole: 'system' });
      if (winnerId) {
        addAuditEvent({ entityType: 'auction', entityId: a.id, type: 'winner_set', message: `Ganador asignado`, actorUserId: winnerId, actorRole: 'recomprador' });
        addNotification({ userId: winnerId, type: 'auction_won', title: '¡Ganaste una subasta!', body: `Ganaste la subasta de ${a.brand} ${a.model} ${a.year}.` });
        if (a.dealerId) {
          addNotification({ userId: a.dealerId, type: 'auction_ended', title: 'Subasta finalizada', body: `Tu ${a.brand} ${a.model} ${a.year} fue vendido.` });
        }
      }
      return ended;
    }
    return a;
  });
  if (changed) save(KEYS.auctions, updated);

  // Auto-replenish: ensure there are always enough active auctions
  const activeCount = (changed ? updated : auctions).filter(a => a.status === 'active' && new Date(a.ends_at) > now).length;
  if (activeCount < MIN_ACTIVE_AUCTIONS) {
    const toCreate = MIN_ACTIVE_AUCTIONS - activeCount;
    for (let i = 0; i < toCreate; i++) {
      spawnNewAuction();
    }
  }
}

// ── Bids ──
export function getBids() { return load(KEYS.bids) || []; }
export function addBid(bid) {
  const list = getBids();
  const item = { id: `bid-${Date.now()}`, createdAt: new Date().toISOString(), ...bid };
  list.unshift(item);
  save(KEYS.bids, list);

  const auction = getAuctionById(bid.auctionId);
  if (auction) {
    const vLabel = `${auction.brand} ${auction.model} ${auction.year}`;
    const amountStr = `$${(bid.amount / 1000000).toFixed(1)}M`;
    if (auction.dealerId && auction.dealerId !== bid.userId) {
      addNotification({ userId: auction.dealerId, type: 'new_bid', title: 'Nueva puja en tu subasta', body: `Puja de ${amountStr} en tu ${vLabel}.` });
    }
    addNotification({ userId: bid.userId, type: 'bid_placed', title: 'Puja registrada', body: `Pujaste ${amountStr} en ${vLabel}.` });
    addAuditEvent({ entityType: 'auction', entityId: bid.auctionId, type: 'bid_created', message: `Nueva puja: ${amountStr} en ${vLabel}`, actorUserId: bid.userId, actorRole: 'recomprador' });
  }

  return item;
}
export function getBidsByAuctionId(auctionId) { return getBids().filter(b => b.auctionId === auctionId); }
export function getBidsByUserId(userId) { return getBids().filter(b => b.userId === userId); }
export function getWonAuctionsByUserId(userId) {
  return getAuctions().filter(a => a.winnerId === userId);
}

// ── Auth helpers ──
export function loginUser(email, password) {
  if (ADMIN_EMAILS.includes(email)) {
    const admin = getUserByEmail(email);
    if (admin && admin.password === password) return admin;
    if (password === 'admin123') {
      return { id: 'u-admin-1', email, role: 'admin', nombre: 'Admin Mubis', company: 'Mubis', branch: 'Principal', verification_status: 'VERIFIED' };
    }
    return null;
  }
  const user = getUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

export function setCurrentUser(user) {
  localStorage.setItem('mubis_authenticated', 'true');
  localStorage.setItem('mubis_user_role', user.role);
  localStorage.setItem('mubis_user_email', user.email);
  localStorage.setItem('mubis_user_id', user.id);
  localStorage.setItem('mubis_user_company', user.company || '');
  localStorage.setItem('mubis_user_branch', user.branch || '');
  localStorage.setItem('mubis_user_name', user.nombre || '');
  localStorage.setItem('mubis_user_verification', user.verification_status || 'PENDING');
}

export function getCurrentUser() {
  const id = localStorage.getItem('mubis_user_id');
  if (!id) return null;
  return getUserById(id) || {
    id,
    email: localStorage.getItem('mubis_user_email') || '',
    role: localStorage.getItem('mubis_user_role') || '',
    company: localStorage.getItem('mubis_user_company') || '',
    branch: localStorage.getItem('mubis_user_branch') || '',
    nombre: localStorage.getItem('mubis_user_name') || '',
    verification_status: localStorage.getItem('mubis_user_verification') || 'PENDING',
  };
}

export function logoutUser() {
  ['mubis_authenticated', 'mubis_user_role', 'mubis_user_email', 'mubis_user_id',
   'mubis_user_company', 'mubis_user_branch', 'mubis_user_name', 'mubis_user_verification'].forEach(k => localStorage.removeItem(k));
}

export function isAuthenticated() {
  return localStorage.getItem('mubis_authenticated') === 'true';
}

export function getUserRole() {
  return localStorage.getItem('mubis_user_role') || '';
}

export function getVerificationStatus() {
  return localStorage.getItem('mubis_user_verification') || 'PENDING';
}

export function getRedirectForRole(role) {
  switch (role) {
    case 'admin': return '/AdminDashboard';
    case 'perito': return '/PeritajesPendientes';
    case 'recomprador': return '/Comprar';
    case 'dealer': return '/Comprar';
    default: return '/login';
  }
}

// ── Admin stats ──
export function getAdminStats() {
  const users = getUsers().filter(u => u.role !== 'admin');
  const auctions = getAuctions();
  const inspections = getInspections();

  const byRole = (role) => users.filter(u => u.role === role);
  const byStatus = (list, status) => list.filter(u => u.verification_status === status);

  return {
    dealers: { total: byRole('dealer').length, verified: byStatus(byRole('dealer'), 'VERIFIED').length, pending: byStatus(byRole('dealer'), 'PENDING').length, rejected: byStatus(byRole('dealer'), 'REJECTED').length },
    peritos: { total: byRole('perito').length, verified: byStatus(byRole('perito'), 'VERIFIED').length, pending: byStatus(byRole('perito'), 'PENDING').length, rejected: byStatus(byRole('perito'), 'REJECTED').length },
    recompradores: { total: byRole('recomprador').length, verified: byStatus(byRole('recomprador'), 'VERIFIED').length, pending: byStatus(byRole('recomprador'), 'PENDING').length, rejected: byStatus(byRole('recomprador'), 'REJECTED').length },
    auctions: { total: auctions.length, active: auctions.filter(a => a.status === 'active').length, ended: auctions.filter(a => a.status === 'ended' || a.status === 'closed').length, withWinner: auctions.filter(a => (a.status === 'ended' || a.status === 'closed') && a.winnerId).length },
    inspections: { total: inspections.length, pending: inspections.filter(i => i.status === 'PENDING').length, completed: inspections.filter(i => i.status === 'COMPLETED').length },
  };
}

export function resetAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('mubis_seed_version');
  ensureSeeded();
}

// ── Notifications ──
export function getNotifications() { return load(KEYS.notifications) || []; }
export function getNotificationsByUserId(userId) {
  return getNotifications().filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function addNotification(notification) {
  const list = getNotifications();
  const item = { id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, read: false, createdAt: new Date().toISOString(), ...notification };
  list.unshift(item);
  save(KEYS.notifications, list);
  return item;
}
export function markNotificationRead(id) {
  const list = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  save(KEYS.notifications, list);
}
export function markAllNotificationsRead(userId) {
  const list = getNotifications().map(n => n.userId === userId ? { ...n, read: true } : n);
  save(KEYS.notifications, list);
}

// ── Seed notifications ──
function ensureSeedNotifications() {
  if (load(KEYS.notifications)) return;
  const auctions = getAuctions();
  const inspections = getInspections();
  const notifs = [];

  auctions.forEach((a, i) => {
    notifs.push({ id: `notif-seed-pub-${i}`, userId: a.dealerId, type: 'auction_published', title: 'Vehículo en subasta', body: `Tu ${a.brand} ${a.model} ${a.year} fue publicado en subasta.`, createdAt: a.createdAt, read: i > 2 });
  });

  const bids = getBids();
  const seen = new Set();
  bids.slice(0, 20).forEach((b, i) => {
    const auction = auctions.find(a => a.id === b.auctionId);
    if (!auction || seen.has(b.auctionId)) return;
    seen.add(b.auctionId);
    notifs.push({ id: `notif-seed-bid-${i}`, userId: auction.dealerId, type: 'new_bid', title: 'Nueva puja recibida', body: `Puja de $${(b.amount / 1000000).toFixed(1)}M en tu ${auction.brand} ${auction.model}.`, createdAt: b.createdAt, read: i > 3 });
  });

  inspections.filter(i => i.status === 'COMPLETED').slice(0, 5).forEach((insp, i) => {
    notifs.push({ id: `notif-seed-insp-${i}`, userId: insp.peritoId, type: 'inspection_completed', title: 'Peritaje completado', body: `Has finalizado el peritaje del vehículo ${insp.vehicleId}. Score: ${insp.scoreGlobal}/100.`, createdAt: insp.completedAt || insp.createdAt, read: i > 1 });
  });

  notifs.push({ id: 'notif-seed-admin-1', userId: 'u-admin-1', type: 'user_approved', title: 'Nuevo usuario registrado', body: 'CarHouse Cali se registró y está pendiente de verificación.', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false });

  save(KEYS.notifications, notifs);
}
ensureSeedNotifications();

// ── Notification helpers ──
export function getUnreadCount(userId) {
  return getNotificationsByUserId(userId).filter(n => !n.read).length;
}

// ── Support Tickets ──
export function getSupportTickets() { return load(KEYS.supportTickets) || []; }
export function addSupportTicket(ticket) {
  const list = getSupportTickets();
  const item = { id: `ticket-${Date.now()}`, status: 'OPEN', createdAt: new Date().toISOString(), ...ticket };
  list.unshift(item);
  save(KEYS.supportTickets, list);
  return item;
}
export function getSupportTicketsByUserId(userId) {
  return getSupportTickets().filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function updateSupportTicket(id, updates) {
  const list = getSupportTickets().map(t => t.id === id ? { ...t, ...updates } : t);
  save(KEYS.supportTickets, list);
  return list.find(t => t.id === id);
}

// ── Audit Events ──
export function getAuditEvents() { return load(KEYS.auditEvents) || []; }
export function addAuditEvent(event) {
  const list = getAuditEvents();
  const item = { id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString(), ...event };
  list.push(item);
  save(KEYS.auditEvents, list);
  return item;
}
export function getAuditEventsByEntity(entityType, entityId) {
  return getAuditEvents()
    .filter(e => e.entityType === entityType && e.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ── Live activity feed from audit events ──
export function getRecentAuctionActivity(limit = 5) {
  const activityTypes = ['bid_created', 'auction_published', 'inspection_completed', 'inspection_rejected'];
  return getAuditEvents()
    .filter(e => activityTypes.includes(e.type))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

// ── Watchlist ──
const WATCHLIST_KEY = 'mubis_store_watchlist';
function getWatchlistItems() { return load(WATCHLIST_KEY) || []; }
function saveWatchlistItems(items) { save(WATCHLIST_KEY, items); }

export function toggleWatchlist(userId, auctionId) {
  const items = getWatchlistItems();
  const idx = items.findIndex(w => w.userId === userId && w.auctionId === auctionId);
  if (idx >= 0) {
    items.splice(idx, 1);
    saveWatchlistItems(items);
    return false; // removed
  }
  items.push({ id: `wl-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, userId, auctionId, createdAt: new Date().toISOString() });
  saveWatchlistItems(items);
  return true; // added
}

export function isInWatchlist(userId, auctionId) {
  return getWatchlistItems().some(w => w.userId === userId && w.auctionId === auctionId);
}

export function getWatchlistByUserId(userId) {
  const items = getWatchlistItems().filter(w => w.userId === userId);
  const auctions = getAuctions();
  return items.map(w => auctions.find(a => a.id === w.auctionId)).filter(Boolean);
}

export function getWatchlistCountByAuctionId(auctionId) {
  return new Set(getWatchlistItems().filter(w => w.auctionId === auctionId).map(w => w.userId)).size;
}

// ── Unique bidders ──
export function getUniqueBidderCountByAuctionId(auctionId) {
  const bids = getBidsByAuctionId(auctionId);
  return new Set(bids.map(b => b.userId)).size;
}

// ── Pronto Pago ──
const PRONTO_PAGO_KEY = 'mubis_store_pronto_pago';
function getProntoPagoItems() { return load(PRONTO_PAGO_KEY) || []; }
function saveProntoPagoItems(items) { save(PRONTO_PAGO_KEY, items); }

const PRONTO_PAGO_COMMISSION = 0.05; // 5%
const PRONTO_PAGO_MAX_PERCENT = 0.10; // 10% of car value

export function getProntoPagoConfig() {
  return { commission: PRONTO_PAGO_COMMISSION, maxPercent: PRONTO_PAGO_MAX_PERCENT };
}

export function requestProntoPago({ userId, auctionId, requestedAmount, vehicleValue }) {
  const items = getProntoPagoItems();
  const existing = items.find(p => p.userId === userId && p.auctionId === auctionId);
  if (existing) return existing;

  const maxAmount = vehicleValue * PRONTO_PAGO_MAX_PERCENT;
  const amount = Math.min(requestedAmount, maxAmount);
  const commission = amount * PRONTO_PAGO_COMMISSION;

  const item = {
    id: `pp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    auctionId,
    requestedAmount: amount,
    commission,
    netAmount: amount - commission,
    vehicleValue,
    status: 'APPROVED', // instant approval in prototype
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  saveProntoPagoItems(items);

  addAuditEvent({ entityType: 'auction', entityId: auctionId, type: 'pronto_pago_requested', message: `Pronto Pago solicitado: $${(amount / 1000000).toFixed(1)}M (comisión: $${(commission / 1000000).toFixed(2)}M)`, actorUserId: userId, actorRole: 'recomprador' });
  addNotification({ userId, type: 'pronto_pago', title: 'Pronto Pago aprobado', body: `Tu adelanto de $${(amount / 1000000).toFixed(1)}M fue aprobado. Recibirás $${((amount - commission) / 1000000).toFixed(1)}M.` });

  return item;
}

export function getProntoPagoByUserAndAuction(userId, auctionId) {
  return getProntoPagoItems().find(p => p.userId === userId && p.auctionId === auctionId) || null;
}

export function getProntoPagoByUserId(userId) {
  return getProntoPagoItems().filter(p => p.userId === userId);
}
