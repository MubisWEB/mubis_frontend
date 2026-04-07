import api, { publicApi } from './client';

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const authApi = {
  getTenants: async () => {
    const { data } = await publicApi.get('/auth/tenants');
    return data;
  },

  getCompanies: async (tenantSlug) => {
    const params = tenantSlug ? `?tenantSlug=${tenantSlug}` : '';
    const { data } = await publicApi.get(`/auth/companies${params}`);
    return data;
  },

  setPassword: async (token, password) => {
    const { data } = await publicApi.post('/auth/set-password', { token, password });
    return data;
  },

  login: async (email, password, tenantSlug) => {
    const payload = { email, password };
    if (tenantSlug) payload.tenantSlug = tenantSlug;
    const { data } = await publicApi.post('/auth/login', payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  },

  register: async (userData) => {
    const { data } = await publicApi.post('/auth/register', userData);
    return data;
  },

  forgotPassword: async (email, tenantSlug) => {
    const payload = { email };
    if (tenantSlug) payload.tenantSlug = tenantSlug;
    const { data } = await publicApi.post('/auth/forgot-password', payload);
    return data;
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  updateProfile: async (nombre, currentPassword) => {
    const { data } = await api.patch('/auth/profile', { nombre, currentPassword });
    return data;
  },

  requestPhoneVerification: async (telefono) => {
    const { data } = await api.post('/auth/phone/request-verification', { telefono });
    return data;
  },

  verifyPhone: async (telefono, code) => {
    const { data } = await api.post('/auth/phone/verify', { telefono, code });
    return data;
  },
};

// ── USERS (superadmin) ───────────────────────────────────────────────────────

export const usersApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.company) params.append('company', filters.company);
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.role) params.append('role', filters.role);
    if (filters.verification_status) params.append('verification_status', filters.verification_status);
    const query = params.toString();
    return (await api.get(`/users${query ? `?${query}` : ''}`)).data;
  },
  getById: async (id) => (await api.get(`/users/${id}`)).data,
  update: async (id, updates) => (await api.patch(`/users/${id}`, updates)).data,
  verify: async (id, status) => (await api.patch(`/users/${id}/verify`, { status })).data,
  getStats: async () => (await api.get('/users/stats')).data,
  // Filtrado automático por scope del admin (ADMIN_SUCURSAL / ADMIN_GENERAL / SUPERADMIN)
  getPending: async () => (await api.get('/users/pending')).data,
  // Crear ADMIN_SUCURSAL (roles: ADMIN_GENERAL, SUPERADMIN)
  createAdmin: async (data) => (await api.post('/users/create-admin', data)).data,
};

// ── VEHICLES ──────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  create: async (vehicleData) => (await api.post('/vehicles', vehicleData)).data,
  getMine: async () => (await api.get('/vehicles')).data,
  getById: async (id) => (await api.get(`/vehicles/${id}`)).data,
  update: async (id, updates) => (await api.patch(`/vehicles/${id}`, updates)).data,
};

// ── INSPECTIONS ───────────────────────────────────────────────────────────────

export const inspectionsApi = {
  getPending: async () => (await api.get('/inspections/pending')).data,
  getHistory: async () => (await api.get('/inspections/history')).data,
  getByVehicle: async (vehicleId) => (await api.get(`/inspections/vehicle/${vehicleId}`)).data,
  getById: async (id) => (await api.get(`/inspections/${id}`)).data,
  getAll: async () => (await api.get('/inspections')).data,
  take: async (id) => (await api.post(`/inspections/${id}/take`)).data,
  release: async (id) => (await api.post(`/inspections/${id}/release`)).data,
  complete: async (id, body) => (await api.post(`/inspections/${id}/complete`, body)).data,
  reject: async (id, body) => (await api.post(`/inspections/${id}/reject`, body)).data,
};

// ── AUCTIONS ──────────────────────────────────────────────────────────────────

export const auctionsApi = {
  getActive: async () => (await api.get('/auctions')).data,
  getMine: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.branchId) qs.append('branchId', params.branchId);
    if (params.dealerId) qs.append('dealerId', params.dealerId);
    const q = qs.toString();
    return (await api.get(`/auctions/mine${q ? `?${q}` : ''}`)).data;
  },
  getWon: async () => (await api.get('/auctions/won')).data,
  getById: async (id) => (await api.get(`/auctions/${id}`)).data,
  getAll: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    const q = qs.toString();
    return (await api.get(`/admin/auctions${q ? `?${q}` : ''}`)).data;
  },
  incrementView: async (id) => api.post(`/auctions/${id}/view`),
  accept: async (id) => (await api.patch(`/auctions/${id}/accept`)).data,
  reject: async (id) => (await api.patch(`/auctions/${id}/reject`)).data,
  acceptPrevious: async (id) => (await api.patch(`/auctions/${id}/accept-previous`)).data,
  relist: async (id) => (await api.post(`/auctions/${id}/relist`)).data,
  // Aprueba precio y publica la subasta (ADMIN_SUCURSAL / ADMIN_GENERAL / SUPERADMIN)
  approvePrice: async (vehicleId, approvedPrice) =>
    (await api.post('/auctions/approve-price', { vehicleId, approvedPrice })).data,
};

// ── BIDS ──────────────────────────────────────────────────────────────────────

export const bidsApi = {
  place: async (auctionId, maxAmount, isDirect = false) => (await api.post('/bids', { auctionId, maxAmount, isDirect })).data,
  getMine: async () => (await api.get('/bids/mine')).data,
  getByAuction: async (auctionId) => (await api.get(`/bids/auction/${auctionId}`)).data,
  getAll: async () => (await api.get('/admin/movements')).data,
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: async () => (await api.get('/notifications')).data,
  markRead: async (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: async () => api.patch('/notifications/read-all'),
};

// ── WATCHLIST ─────────────────────────────────────────────────────────────────

export const watchlistApi = {
  toggle: async (auctionId) => (await api.post(`/watchlist/${auctionId}`)).data,
  getAll: async () => (await api.get('/watchlist')).data,
  check: async (auctionId) => (await api.get(`/watchlist/${auctionId}/check`)).data,
};

// ── SUPPORT TICKETS ───────────────────────────────────────────────────────────

export const ticketsApi = {
  create: async (body) => (await api.post('/support/tickets', body)).data,
  getMine: async () => (await api.get('/support/tickets/mine')).data,
  update: async (id, updates) => (await api.patch(`/support/tickets/${id}`, updates)).data,
};

// ── SUPPORT CASES ─────────────────────────────────────────────────────────────

export const casesApi = {
  create: async (body) => (await api.post('/support/cases', body)).data,
  getMine: async () => (await api.get('/support/cases/mine')).data,
  getAll: async () => (await api.get('/support/cases')).data,
  getById: async (id) => (await api.get(`/support/cases/${id}`)).data,
  sendMessage: async (id, text) => (await api.post(`/support/cases/${id}/messages`, { text })).data,
  update: async (id, updates) => (await api.patch(`/support/cases/${id}`, updates)).data,
};

// ── PUBLICATIONS ──────────────────────────────────────────────────────────────

export const publicationsApi = {
  getBalance: async () => (await api.get('/publications/balance')).data,
  recharge: async (userId, amount) => (await api.post('/publications/recharge', { userId, amount })).data,
  createCheckout: async (quantity) => (await api.post('/publications/checkout', { quantity })).data,
  getTransactionStatus: async (reference) => (await api.get(`/publications/transaction/${reference}`)).data,
};

// ── PRONTO PAGO ───────────────────────────────────────────────────────────────

export const prontoPagoApi = {
  request: async (body) => (await api.post('/pronto-pago', body)).data,
  getMine: async () => (await api.get('/pronto-pago/mine')).data,
  getByAuction: async (auctionId) => (await api.get(`/pronto-pago/auction/${auctionId}`)).data,
};

// ── ADMIN (legacy) ───────────────────────────────────────────────────────────

export const adminApi = {
  getStats: async () => (await api.get('/admin/stats')).data,
  getDealers: async () => (await api.get('/admin/dealers')).data,
  getSolicitudes: async () => (await api.get('/admin/solicitudes')).data,
  getAuctions: async () => (await api.get('/admin/auctions')).data,
  getMovements: async () => (await api.get('/admin/movements')).data,
  getAnalytics: async () => (await api.get('/admin/analytics')).data,
  getCases: async () => (await api.get('/support/cases')).data,
};

// ── COMPANIES ────────────────────────────────────────────────────────────────

export const companiesApi = {
  getAll: async () => (await api.get('/companies')).data,
  getById: async (id) => (await api.get(`/companies/${id}`)).data,
  create: async (name) => (await api.post('/companies', { name })).data,
  update: async (id, updates) => (await api.patch(`/companies/${id}`, updates)).data,
  remove: async (id) => (await api.delete(`/companies/${id}`)).data,
};

// ── SUPERADMIN ───────────────────────────────────────────────────────────────

export const superadminApi = {
  getDashboard: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.period) qs.append('period', params.period);
    if (params.year) qs.append('year', params.year);
    if (params.month) qs.append('month', params.month);
    if (params.companyId) qs.append('companyId', params.companyId);
    const query = qs.toString();
    return (await api.get(`/superadmin/dashboard${query ? `?${query}` : ''}`)).data;
  },
  bulkUpload: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return (await api.post('/superadmin/bulk-upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
};

// ── AUDIT / ACTIVITY ──────────────────────────────────────────────────────────

export const auditApi = {
  getActivity: async (limit = 10) => (await api.get(`/audit/activity?limit=${limit}`)).data,
  getAll: async () => (await api.get('/audit')).data,
  getByEntity: async (type, id) => (await api.get(`/audit/entity/${type}/${id}`)).data,
};

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────

export const transactionsApi = {
  getMine: async () => (await api.get('/transactions')).data,
  getAll: async () => (await api.get('/transactions/all')).data,
  getById: async (id) => (await api.get(`/transactions/${id}`)).data,
  complete: async (id) => (await api.patch(`/transactions/${id}/complete`)).data,
  cancel: async (id) => (await api.patch(`/transactions/${id}/cancel`)).data,
};

// ── INVENTORY ─────────────────────────────────────────────────────────────────

export const inventoryApi = {
  getMine: async () => (await api.get('/inventory')).data,
  getAll: async () => (await api.get('/inventory/all')).data,
  getById: async (id) => (await api.get(`/inventory/${id}`)).data,
  confirmPayment: async (id, data) => (await api.patch(`/inventory/${id}/payment`, data)).data,
  requestDocs: async (id) => (await api.patch(`/inventory/${id}/docs-requested`)).data,
  receiveDocs: async (id) => (await api.patch(`/inventory/${id}/docs-received`)).data,
  dispatch: async (id) => (await api.patch(`/inventory/${id}/dispatch`)).data,
  deliver: async (id) => (await api.patch(`/inventory/${id}/deliver`)).data,
  addNote: async (id, data) => (await api.post(`/inventory/${id}/notes`, data)).data,
};

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

export const analyticsApi = {
  overview: async () => (await api.get('/analytics/overview')).data,
  dealers: async () => (await api.get('/analytics/dealers')).data,
  market: async () => (await api.get('/analytics/market')).data,
  myPerformance: async () => (await api.get('/analytics/my')).data,
  inventoryPipeline: async () => (await api.get('/analytics/inventory')).data,
  // Dashboard para ADMIN_GENERAL (ve su concesionario completo)
  companyDashboard: async (companyId) => {
    const params = companyId ? `?companyId=${companyId}` : '';
    return (await api.get(`/analytics/company-dashboard${params}`)).data;
  },
  // Dashboard para ADMIN_SUCURSAL (ve su sucursal); branchId opcional para admin_general
  branchDashboard: async (branchId) => {
    const query = branchId ? `?branchId=${branchId}` : '';
    return (await api.get(`/analytics/branch-dashboard${query}`)).data;
  },
};

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export const branchesApi = {
  // Public endpoint for registration
  getBranchesByCity: async (city, tenantSlug) => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (tenantSlug) params.append('tenantSlug', tenantSlug);
    const { data } = await publicApi.get(`/branches/by-city?${params.toString()}`);
    return data;
  },
  // Authenticated endpoints
  getAll: async () => (await api.get('/branches')).data,
  getById: async (id) => (await api.get(`/branches/${id}`)).data,
  create: async (data) => (await api.post('/branches', data)).data,
  update: async (id, data) => (await api.patch(`/branches/${id}`, data)).data,
  deactivate: async (id) => (await api.delete(`/branches/${id}`)).data,
  assignUser: async (branchId, userId) => (await api.post(`/branches/${branchId}/users/${userId}`)).data,
  removeUser: async (branchId, userId) => (await api.delete(`/branches/${branchId}/users/${userId}`)).data,
};

// ── GOALS ─────────────────────────────────────────────────────────────────────

export const goalsApi = {
  getAll: async () => (await api.get('/goals')).data,
  getMine: async () => (await api.get('/goals/my')).data,
  getById: async (id) => (await api.get(`/goals/${id}`)).data,
  create: async (data) => (await api.post('/goals', data)).data,
  update: async (id, data) => (await api.patch(`/goals/${id}`, data)).data,
  remove: async (id) => (await api.delete(`/goals/${id}`)).data,
};

// ── B2B ───────────────────────────────────────────────────────────────────────

export const b2bApi = {
  getCatalog: async () => (await api.get('/b2b/catalog')).data,
  createOffer: async (data) => (await api.post('/b2b/offers', data)).data,
  getMyOffers: async () => (await api.get('/b2b/offers')).data,
  getAllOffers: async () => (await api.get('/b2b/offers/all')).data,
  getOfferById: async (id) => (await api.get(`/b2b/offers/${id}`)).data,
  approveOffer: async (id, data) => (await api.patch(`/b2b/offers/${id}/approve`, data)).data,
  rejectOffer: async (id, data) => (await api.patch(`/b2b/offers/${id}/reject`, data)).data,
  getMyCredit: async () => (await api.get('/b2b/credit')).data,
  getAllCredits: async () => (await api.get('/b2b/credit/all')).data,
  setCredit: async (userId, data) => (await api.patch(`/b2b/credit/${userId}`, data)).data,
};

// ── PARTNERS ──────────────────────────────────────────────────────────────────

export const partnersApi = {
  getRecompradores: async () => (await api.get('/partners/recompradores')).data,
  invite: async (recompradorId) => (await api.post(`/partners/invite/${recompradorId}`)).data,
  getInvitations: async () => (await api.get('/partners/invitations')).data,
  acceptInvitation: async (id) => (await api.patch(`/partners/invitations/${id}/accept`)).data,
  rejectInvitation: async (id) => (await api.patch(`/partners/invitations/${id}/reject`)).data,
  getMyPartners: async () => (await api.get('/partners/my-partners')).data,
  remove: async (id) => (await api.delete(`/partners/${id}`)).data,
  getAll: async (companyId) => (await api.get(`/partners/all${companyId ? `?companyId=${companyId}` : ''}`)).data,
  adminCreate: async (data) => (await api.post('/partners/admin-create', data)).data,
  adminRemove: async (id) => (await api.delete(`/partners/admin/${id}`)).data,
};

// ── PRICING ───────────────────────────────────────────────────────────────────

export const pricingApi = {
  suggest: async (params) => (await api.post('/pricing/suggest', params)).data,
};

// ── MEDIA ─────────────────────────────────────────────────────────────────────

export const mediaApi = {
  upload: async (files, folder = 'vehicles') => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return (await api.post(`/media/upload?folder=${folder}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};

// ── BANNERS ───────────────────────────────────────────────────────────────────

// ── BRANCH INVENTORY (Inventario de sucursal) ────────────────────────────────

export const branchInventoryApi = {
  getAll: async () => (await api.get('/branch-inventory')).data,
  getByBranch: async (branchId) => (await api.get(`/branch-inventory/by-branch/${branchId}`)).data,
  getById: async (id) => (await api.get(`/branch-inventory/${id}`)).data,
  create: async (data) => (await api.post('/branch-inventory', data)).data,
  delete: async (id) => (await api.delete(`/branch-inventory/${id}`)).data,
  search: async (filters) => {
    const params = new URLSearchParams();
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);
    if (filters.version) params.set('version', filters.version);
    if (filters.yearMin) params.set('yearMin', String(filters.yearMin));
    if (filters.yearMax) params.set('yearMax', String(filters.yearMax));
    if (filters.kmMin) params.set('kmMin', String(filters.kmMin));
    if (filters.kmMax) params.set('kmMax', String(filters.kmMax));
    return (await api.get(`/branch-inventory/search?${params.toString()}`)).data;
  },
};

export const bannersApi = {
  // Public endpoint
  getActive: async () => {
    const normalizeBannerResponse = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.banners)) return payload.banners;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    };

    try {
      const response = await publicApi.get('/banners/active');
      const normalized = normalizeBannerResponse(response.data);
      if (normalized.length > 0) return normalized;
    } catch (error) {
      const token = localStorage.getItem('accessToken');
      if (error?.response?.status === 401 && token) {
        const authActive = await api.get('/banners/active');
        const normalized = normalizeBannerResponse(authActive.data);
        if (normalized.length > 0) return normalized;
      } else if (!token) {
        throw error;
      }
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    try {
      const allBanners = await api.get('/banners');
      return normalizeBannerResponse(allBanners.data);
    } catch {
      return [];
    }
  },
  
  // Admin endpoints (SUPERADMIN only)
  getAll: async () => (await api.get('/banners')).data,
  getById: async (id) => (await api.get(`/banners/${id}`)).data,
  create: async (data) => (await api.post('/banners', data)).data,
  update: async (id, data) => (await api.patch(`/banners/${id}`, data)).data,
  toggle: async (id) => (await api.patch(`/banners/${id}/toggle`)).data,
  reorder: async (ids) => (await api.patch('/banners/reorder', { ids })).data,
  delete: async (id) => (await api.delete(`/banners/${id}`)).data,
};
