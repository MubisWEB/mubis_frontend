const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const subscriptionsApi = {
  getPlans: () =>
    fetch(`${BASE}/subscriptions/plans`).then(handleResponse),

  getMySubscription: () =>
    fetch(`${BASE}/subscriptions/my-subscription`, { headers: authHeaders() }).then(handleResponse),

  createCheckout: (plan) =>
    fetch(`${BASE}/subscriptions/checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ plan }),
    }).then(handleResponse),

  getMyHistory: () =>
    fetch(`${BASE}/subscriptions/my-history`, { headers: authHeaders() }).then(handleResponse),
};
