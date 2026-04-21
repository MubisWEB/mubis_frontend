import { expect, test } from '@playwright/test';

const apiURL = process.env.E2E_API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
const tenantSlug = process.env.E2E_TENANT || 'mubis-demo';
const password = process.env.E2E_PASSWORD || 'Password123';

const USERS = {
  superadmin: { email: 'superadmin@mubis.co', home: '/AdminDashboard' },
  admin_general: { email: 'admin.autoniza@mubis.co', home: '/AdminGeneralDashboard' },
  admin_sucursal: { email: 'admin.bogota@mubis.co', home: '/AdminSucursalDashboard' },
  dealer: { email: 'dealer1@mubis.co', home: '/Comprar' },
  recomprador: { email: 'comprador1@mubis.co', home: '/Comprar' },
  perito: { email: 'perito1@mubis.co', home: '/PeritajesPendientes' },
} as const;

type Role = keyof typeof USERS;

const LANDINGS: Array<{ role: Role; path: string; text: RegExp }> = [
  { role: 'superadmin', path: '/AdminDashboard', text: /SuperAdmin|Panel de control/i },
  { role: 'admin_general', path: '/AdminGeneralDashboard', text: /Panel General|Vista del concesionario/i },
  { role: 'admin_sucursal', path: '/AdminSucursalDashboard', text: /Panel de Sucursal|Vista de tu sucursal/i },
  { role: 'dealer', path: '/Comprar', text: /Comprar|Subastas/i },
  { role: 'recomprador', path: '/Comprar', text: /Comprar|Subastas/i },
  { role: 'perito', path: '/PeritajesPendientes', text: /Peritajes|pendientes/i },
];

const PERMISSIONS: Array<{ role: Role; allowed: string[]; denied: string[] }> = [
  {
    role: 'superadmin',
    allowed: ['/AdminDashboard', '/AdminAnaliticas', '/Comprar', '/MisSubastas', '/PeritajesPendientes'],
    denied: [],
  },
  {
    role: 'admin_general',
    allowed: ['/AdminGeneralDashboard', '/AdminSucursalDashboard', '/Comprar', '/MisSubastas', '/AdminAnaliticas', '/AdminInventario'],
    denied: ['/AdminDashboard', '/PeritajesPendientes'],
  },
  {
    role: 'admin_sucursal',
    allowed: ['/AdminSucursalDashboard', '/Comprar', '/MisSubastas', '/AdminAnaliticas', '/AdminInventario'],
    denied: ['/AdminDashboard', '/AdminGeneralDashboard', '/PeritajesPendientes'],
  },
  {
    role: 'dealer',
    allowed: ['/Comprar', '/MisSubastas', '/Movimientos'],
    denied: ['/AdminDashboard', '/AdminAnaliticas', '/PeritajesPendientes'],
  },
  {
    role: 'recomprador',
    allowed: ['/Comprar', '/Movimientos', '/B2BCatalogo'],
    denied: ['/AdminDashboard', '/AdminAnaliticas', '/MisSubastas', '/PeritajesPendientes'],
  },
  {
    role: 'perito',
    allowed: ['/PeritajesPendientes', '/HistorialPeritajes'],
    denied: ['/AdminDashboard', '/AdminAnaliticas', '/Comprar', '/MisSubastas'],
  },
];

async function loginAs(page, request, role: Role) {
  const user = USERS[role];
  const response = await request.post(`${apiURL}/auth/login`, {
    data: { email: user.email, password, tenantSlug },
  });

  expect(response.ok(), `login ${role} (${user.email})`).toBeTruthy();

  const payload = await response.json();
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload.user),
    });
  });
  await page.addInitScript(({ accessToken, refreshToken }) => {
    window.localStorage.setItem('accessToken', accessToken);
    window.localStorage.setItem('refreshToken', refreshToken);
  }, {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ accessToken, refreshToken }) => {
    window.localStorage.setItem('accessToken', accessToken);
    window.localStorage.setItem('refreshToken', refreshToken);
  }, {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
}

function routePattern(path: string) {
  return new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[?#].*)?$`, 'i');
}

async function openAllowedRoute(page, path: string) {
  const apiFailures: string[] = [];
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/') && response.status() >= 400) {
      apiFailures.push(`${response.status()} ${url}`);
    }
  });

  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.locator('.react-loading-skeleton').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(200);

  await expect(page, `allowed route should remain on ${path}`).toHaveURL(routePattern(path));
  await expect(page.locator('#root')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/404|No encontrado|Credenciales incorrectas/i);
  expect(apiFailures, `API failures while opening ${path}`).toEqual([]);
}

test.describe('role landings', () => {
  for (const item of LANDINGS) {
    test(`${item.role} opens ${item.path}`, async ({ page, request }, testInfo) => {
      await loginAs(page, request, item.role);
      await openAllowedRoute(page, item.path);
      await expect(page.locator('body')).toContainText(item.text);
      await page.screenshot({
        path: testInfo.outputPath(`screenshots/${item.role}-landing.png`),
        fullPage: true,
      });
    });
  }
});

test.describe('role permission matrix', () => {
  for (const item of PERMISSIONS) {
    test(`${item.role} allowed routes`, async ({ page, request }, testInfo) => {
      await loginAs(page, request, item.role);

      for (const path of item.allowed) {
        await openAllowedRoute(page, path);
        await page.screenshot({
          path: testInfo.outputPath(`screenshots/${item.role}-${path.slice(1) || 'home'}.png`),
          fullPage: true,
        });
      }
    });

    if (item.denied.length > 0) {
      test(`${item.role} denied routes redirect home`, async ({ page, request }) => {
        await loginAs(page, request, item.role);

        for (const path of item.denied) {
          await page.goto(path, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(800);
          await expect(page, `${item.role} should be redirected away from ${path}`).toHaveURL(routePattern(USERS[item.role].home));
        }
      });
    }
  }
});
