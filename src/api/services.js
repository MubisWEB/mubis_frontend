import api, { publicApi } from './client';

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const authApi = {
  getTenants: async () => {
    const { data } = await publicApi.get('/auth/tenants');
    return data;
  },

  login: async (email, password, tenantSlug) => {
    const { data } = await publicApi.post('/auth/login', { email, password, tenantSlug });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  },

  register: async (userData) => {
    const { data } = await publicApi.post('/auth/register', userData);
    return data;
  },

  forgotPassword: async (email, tenantSlug) => {
    const { data } = await publicApi.post('/auth/forgot-password', { email, tenantSlug });
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

// ── USERS (admin) ─────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: async () => (await api.get('/users')).data,
  getById: async (id) => (await api.get(`/users/${id}`)).data,
  update: async (id, updates) => (await api.patch(`/users/${id}`, updates)).data,
  verify: async (id, status) => (await api.patch(`/users/${id}/verify`, { status })).data,
  getStats: async () => (await api.get('/users/stats')).data,
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
  getMine: async () => (await api.get('/auctions/mine')).data,
  getWon: async () => (await api.get('/auctions/won')).data,
  getById: async (id) => (await api.get(`/auctions/${id}`)).data,
  getAll: async () => (await api.get('/admin/auctions')).data,
  incrementView: async (id) => api.post(`/auctions/${id}/view`),
  accept: async (id) => (await api.patch(`/auctions/${id}/accept`)).data,
  reject: async (id) => (await api.patch(`/auctions/${id}/reject`)).data,
  acceptPrevious: async (id) => (await api.patch(`/auctions/${id}/accept-previous`)).data,
};

// ── BIDS ──────────────────────────────────────────────────────────────────────

export const bidsApi = {
  place: async (auctionId, maxAmount) => (await api.post('/bids', { auctionId, maxAmount })).data,
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
  recharge: async (userId, quantity) => (await api.post('/publications/recharge', { userId, quantity })).data,
};

// ── PRONTO PAGO ───────────────────────────────────────────────────────────────

export const prontoPagoApi = {
  request: async (body) => (await api.post('/pronto-pago', body)).data,
  getMine: async () => (await api.get('/pronto-pago/mine')).data,
  getByAuction: async (auctionId) => (await api.get(`/pronto-pago/auction/${auctionId}`)).data,
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: async () => (await api.get('/admin/stats')).data,
  getDealers: async () => (await api.get('/admin/dealers')).data,
  getSolicitudes: async () => (await api.get('/admin/solicitudes')).data,
  getAuctions: async () => (await api.get('/admin/auctions')).data,
  getMovements: async () => (await api.get('/admin/movements')).data,
  getAnalytics: async () => (await api.get('/admin/analytics')).data,
  getCases: async () => (await api.get('/support/cases')).data,
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
};

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export const branchesApi = {
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

// ── PRICING ───────────────────────────────────────────────────────────────────

export const pricingApi = {
  getByVehicle: async (id) => (await api.get(`/pricing/vehicle/${id}`)).data,
  estimate: async (params) => (await api.get('/pricing', { params })).data,
};

// ── MEDIA ─────────────────────────────────────────────────────────────────────

export const mediaApi = {
  upload: async (files) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return (await api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};
