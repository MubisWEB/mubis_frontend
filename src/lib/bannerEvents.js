export const BANNERS_UPDATED_EVENT = 'mubis:banners-updated';
export const BANNERS_UPDATED_STORAGE_KEY = 'mubis:banners:last-update';

export function notifyBannersUpdated() {
  const timestamp = String(Date.now());
  localStorage.setItem(BANNERS_UPDATED_STORAGE_KEY, timestamp);
  window.dispatchEvent(new CustomEvent(BANNERS_UPDATED_EVENT, { detail: { timestamp } }));
}
