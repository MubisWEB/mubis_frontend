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
};

// ── Admin whitelist ──
export const ADMIN_EMAILS = [
  'admin@mubis.com',
  'admin2@mubis.com',
  'superadmin@mubis.com',
];

// ── Seed data ──
const SEED_USERS = [
  { id: 'u-admin-1', email: 'admin@mubis.com', password: 'admin123', role: 'admin', nombre: 'Admin Mubis', company: 'Mubis', branch: 'Principal', telefono: '3000000000', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-dealer-1', email: 'dealer@test.com', password: 'dealer123', role: 'dealer', nombre: 'Autonal Colombia', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3001112233', ciudad: 'Bogotá', nit: '900123456-7', verification_status: 'VERIFIED' },
  { id: 'u-dealer-2', email: 'dealer2@test.com', password: 'dealer123', role: 'dealer', nombre: 'Los Coches', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3159998877', ciudad: 'Medellín', nit: '900234567-8', verification_status: 'VERIFIED' },
  { id: 'u-perito-1', email: 'perito@test.com', password: 'perito123', role: 'perito', nombre: 'Carlos Peritaje', company: 'Autonal', branch: 'Bogotá Norte', telefono: '3201234567', ciudad: 'Bogotá', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-perito-2', email: 'perito2@test.com', password: 'perito123', role: 'perito', nombre: 'María Inspección', company: 'Los Coches', branch: 'Medellín Centro', telefono: '3107654321', ciudad: 'Medellín', nit: '', verification_status: 'VERIFIED' },
  { id: 'u-recomprador-1', email: 'recomprador@test.com', password: 'recomprador123', role: 'recomprador', nombre: 'CarMax Colombia', company: 'CarMax', branch: 'Cali Sur', telefono: '3114567890', ciudad: 'Cali', nit: '900345678-9', verification_status: 'VERIFIED' },
];

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function ensureSeeded() {
  if (!load(KEYS.users)) {
    save(KEYS.users, SEED_USERS);
  }
  if (!load(KEYS.vehicles)) save(KEYS.vehicles, []);
  if (!load(KEYS.inspections)) save(KEYS.inspections, []);
  if (!load(KEYS.bids)) save(KEYS.bids, []);
  if (!load(KEYS.auctions)) {
    const legacy = load('mubis_my_auctions');
    save(KEYS.auctions, legacy || []);
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
  return getAuctions().filter(a => a.status === 'active');
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
