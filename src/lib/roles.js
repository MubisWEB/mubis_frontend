export const VALID_ROLES = [
  'superadmin',
  'admin_general',
  'admin_sucursal',
  'dealer',
  'recomprador',
  'perito',
];

export const ADMIN_ROLES = ['superadmin', 'admin_general', 'admin_sucursal'];

export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin_general: 'Admin General',
  admin_sucursal: 'Admin Sucursal',
  dealer: 'Dealer',
  recomprador: 'Recomprador',
  perito: 'Perito',
};

export const ROLE_NAV_LABELS = {
  superadmin: 'Dashboard',
  admin_general: 'Panel General',
  admin_sucursal: 'Panel Sucursal',
  dealer: 'Mis subastas',
  recomprador: 'Comprar',
  perito: 'Peritajes',
};

export const ROLE_BADGE_CLASS = {
  superadmin: 'bg-destructive/10 text-destructive',
  admin_general: 'bg-destructive/10 text-destructive',
  admin_sucursal: 'bg-destructive/10 text-destructive',
  dealer: 'bg-secondary/10 text-secondary',
  recomprador: 'bg-primary/10 text-primary',
  perito: 'bg-secondary/10 text-secondary',
};

export const ROLE_HOME = {
  superadmin: '/AdminDashboard',
  admin_general: '/AdminGeneralDashboard',
  admin_sucursal: '/AdminSucursalDashboard',
  dealer: '/Comprar',
  recomprador: '/Comprar',
  perito: '/PeritajesPendientes',
};

export function normalizeRole(role) {
  const normalized = role?.toLowerCase();
  return VALID_ROLES.includes(normalized) ? normalized : null;
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(normalizeRole(role));
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)] || role || 'Usuario';
}

export function getRoleNavLabel(role) {
  return ROLE_NAV_LABELS[normalizeRole(role)] || getRoleLabel(role);
}

export function getRedirectForRole(role) {
  return ROLE_HOME[normalizeRole(role)] || '/login';
}
