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
};

// ── Admin whitelist ──
export const ADMIN_EMAILS = [
  'admin@mubis.com',
  'admin2@mubis.com',
  'superadmin@mubis.com',
];

// ── Photo URLs for demo ──
const PHOTOS = [
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
  'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
  'https://images.unsplash.com/photo-1525609004556-c46c6c5104b8?w=600',
];

// ── Seed data ──
const SEED_USERS = [
  { id: 'u-admin-1', email: 'admin@mubis.com', password: 'admin123', role: 'admin', nombre: 'Admin Mubis', company: 'Mubis', branch: 'Principal', telefono: '3000000000', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  // Dealers
  { id: 'u-dealer-1', email: 'dealer@test.com', password: 'dealer123', role: 'dealer', nombre: 'Autonal Colombia', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3001112233', ciudad: 'Bogotá', nit: '900123456-7', verification_status: 'VERIFIED' },
  { id: 'u-dealer-2', email: 'dealer2@test.com', password: 'dealer123', role: 'dealer', nombre: 'Los Coches', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3159998877', ciudad: 'Medellín', nit: '900234567-8', verification_status: 'VERIFIED' },
  { id: 'u-dealer-3', email: 'dealer3@test.com', password: 'dealer123', role: 'dealer', nombre: 'Motor Uno', company: 'Motor Uno', branch: 'Bogotá Norte', telefono: '3201234000', ciudad: 'Bogotá', nit: '900444555-1', verification_status: 'VERIFIED' },
  { id: 'u-dealer-4', email: 'dealer4@test.com', password: 'dealer123', role: 'dealer', nombre: 'CarHouse Cali', company: 'CarHouse', branch: 'Cali Sur', telefono: '3164567890', ciudad: 'Cali', nit: '900555666-2', verification_status: 'PENDING' },
  { id: 'u-dealer-5', email: 'dealer5@test.com', password: 'dealer123', role: 'dealer', nombre: 'Importados Premium', company: 'Importados Premium', branch: 'Barranquilla Centro', telefono: '3178889900', ciudad: 'Barranquilla', nit: '900666777-3', verification_status: 'PENDING' },
  // Peritos
  { id: 'u-perito-1', email: 'perito@test.com', password: 'perito123', role: 'perito', nombre: 'Carlos Peritaje', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3201234567', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-perito-2', email: 'perito2@test.com', password: 'perito123', role: 'perito', nombre: 'María Inspección', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3107654321', ciudad: 'Medellín', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-perito-3', email: 'perito3@test.com', password: 'perito123', role: 'perito', nombre: 'Jorge Técnico', company: 'CarHouse', branch: 'Cali Sur', telefono: '3189876543', ciudad: 'Cali', nit: '', verification_status: 'PENDING' },
  // Recompradores
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
  return vehicles.filter(v => v.status === 'READY_FOR_AUCTION').map((v, i) => {
    const basePrice = 30000000 + Math.floor(Math.random() * 70000000);
    const bidsCount = 3 + Math.floor(Math.random() * 15);
    const currentBid = basePrice + bidsCount * 100000;
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
      starting_price: basePrice,
      current_bid: currentBid,
      bids_count: bidsCount,
      views: 20 + Math.floor(Math.random() * 200),
      status: i < 10 ? 'active' : 'ended',
      winnerId: i >= 10 ? (i % 2 === 0 ? 'u-recomprador-1' : 'u-recomprador-2') : null,
      ends_at: i < 10
        ? new Date(Date.now() + (5 + i * 6) * 60000).toISOString()  // 5min to ~1h from now
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
      if (userId === a.dealerId) continue; // can't bid own
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

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded() {
  // Check if we have the new seed format (v2)
  const seedVersion = localStorage.getItem('mubis_seed_version');
  if (seedVersion !== 'v4') {
    // Clear old data and re-seed
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem('mubis_seed_version', 'v4');
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

    save(KEYS.bids, buildSeedBids(auctions));
  } else {
    if (!load(KEYS.inspections)) save(KEYS.inspections, []);
    if (!load(KEYS.bids)) save(KEYS.bids, []);
    if (!load(KEYS.auctions)) save(KEYS.auctions, []);
  }
}

// Init on import
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
  return item;
}
export function getInspectionById(id) { return getInspections().find(i => i.id === id); }
export function getInspectionByVehicleId(vehicleId) { return getInspections().find(i => i.vehicleId === vehicleId); }
export function updateInspection(id, updates) {
  const list = getInspections().map(i => i.id === id ? { ...i, ...updates } : i);
  save(KEYS.inspections, list);
  return list.find(i => i.id === id);
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
    // Only show if vehicle has a COMPLETED inspection
    const insp = inspections.find(i => i.vehicleId === a.vehicleId);
    return insp && insp.status === 'COMPLETED';
  });
}

/** Reconcile: mark expired active auctions as 'ended' */
export function reconcileAuctionStatuses() {
  const auctions = getAuctions();
  let changed = false;
  const now = new Date();
  const updated = auctions.map(a => {
    if (a.status === 'active' && new Date(a.ends_at) < now) {
      changed = true;
      return { ...a, status: 'ended' };
    }
    return a;
  });
  if (changed) save(KEYS.auctions, updated);
}

// ── Bids ──
export function getBids() { return load(KEYS.bids) || []; }
export function addBid(bid) {
  const list = getBids();
  const item = { id: `bid-${Date.now()}`, createdAt: new Date().toISOString(), ...bid };
  list.unshift(item);
  save(KEYS.bids, list);
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
    auctions: { total: auctions.length, active: auctions.filter(a => a.status === 'active').length },
    inspections: { total: inspections.length, pending: inspections.filter(i => i.status === 'PENDING').length, completed: inspections.filter(i => i.status === 'COMPLETED').length },
  };
}

/** Call this to force re-seed all data (useful for demo reset) */
export function resetAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  ensureSeeded();
}
