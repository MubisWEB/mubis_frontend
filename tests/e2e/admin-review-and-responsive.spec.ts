import { expect, Page, test } from '@playwright/test';

const apiURL = process.env.E2E_API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
const tenantSlug = process.env.E2E_TENANT || 'mubis-demo';
const password = process.env.E2E_PASSWORD || 'Password123';

async function loginAs(page: Page, request: any, email: string) {
  const response = await request.post(`${apiURL}/auth/login`, {
    data: { email, password, tenantSlug },
  });

  expect(response.ok(), `login ${email}`).toBeTruthy();

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

  return payload;
}

async function expectNoHorizontalOverflow(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => ({
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.docClientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.docClientWidth + 1);
}

test.describe('admin verification review ui', () => {
  test('superadmin can waitlist, reject, approve and delete from AdminSolicitudes', async ({ page, request }) => {
    await loginAs(page, request, 'superadmin@mubis.co');

    let users = [
      {
        id: 'pending-user-ui',
        role: 'dealer',
        nombre: 'Usuario Pendiente Largo Mubis',
        email: 'usuario.pendiente.largo@mubis.co',
        telefono: '3001234567',
        ciudad: 'Bogota',
        company: 'Autoniza Demo',
        branch: 'Autoniza 170',
        nit: '900123456-7',
        verification_status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'waitlisted-user-ui',
        role: 'recomprador',
        nombre: 'Usuario En Espera',
        email: 'espera@mubis.co',
        telefono: '3007654321',
        ciudad: 'Medellin',
        company: 'CompraMax',
        branch: '',
        nit: '',
        verification_status: 'WAITLISTED',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rejected-user-ui',
        role: 'perito',
        nombre: 'Usuario Rechazado',
        email: 'rechazado@mubis.co',
        telefono: '3010000000',
        ciudad: 'Cali',
        company: 'Autoniza Demo',
        branch: 'Autoniza Cali',
        nit: '',
        verification_status: 'REJECTED',
        createdAt: new Date().toISOString(),
      },
    ];

    await page.route('**/api/users**', async (route) => {
      const url = new URL(route.request().url());
      const method = route.request().method();

      if (method === 'GET' && url.pathname.endsWith('/users/pending')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(users.filter((user) => user.verification_status === 'PENDING')),
        });
        return;
      }

      if (method === 'GET' && url.pathname.endsWith('/users')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(users),
        });
        return;
      }

      const verifyMatch = url.pathname.match(/\/users\/([^/]+)\/verify$/);
      if (method === 'PATCH' && verifyMatch) {
        const body = route.request().postDataJSON() as { status: string };
        users = users.map((user) => (
          user.id === verifyMatch[1]
            ? { ...user, verification_status: body.status }
            : user
        ));
        const updated = users.find((user) => user.id === verifyMatch[1]);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updated),
        });
        return;
      }

      const deleteMatch = url.pathname.match(/\/users\/([^/]+)$/);
      if (method === 'DELETE' && deleteMatch) {
        users = users.filter((user) => user.id !== deleteMatch[1]);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ deleted: true }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/AdminSolicitudes', { waitUntil: 'domcontentloaded' });

    const userCardTitle = page.getByRole('heading', { name: 'Usuario Pendiente Largo Mubis' });
    const userCard = page.locator('div.rounded-xl.border').filter({ has: userCardTitle }).first();
    const waitlistedTitle = page.getByRole('heading', { name: 'Usuario En Espera' });
    const waitlistedCard = page.locator('div.rounded-xl.border').filter({ has: waitlistedTitle }).first();

    await expect(userCardTitle).toBeVisible();
    await userCard.getByRole('button', { name: /^Espera$/i }).click();

    await page.getByRole('button', { name: /Lista de espera/i }).click();
    await expect(userCardTitle).toBeVisible();
    await expect(waitlistedTitle).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await waitlistedCard.getByRole('button', { name: /Eliminar/i }).click();
    await expect(waitlistedTitle).toHaveCount(0);

    await userCard.getByRole('button', { name: /^Rechazar$/i }).click();

    await page.getByRole('button', { name: /Rechazadas/i }).click();
    await expect(userCardTitle).toBeVisible();
    await userCard.getByRole('button', { name: /^Aprobar$/i }).click();

    await expect(userCardTitle).toHaveCount(0);
  });
});

test.describe('mobile responsive smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('registro has no horizontal overflow', async ({ page }, testInfo) => {
    await page.goto('/registro', { waitUntil: 'domcontentloaded' });
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /Recomprador/i }).click();

    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('registro-mobile.png'), fullPage: true });
  });

  test('AdminSolicitudes has no horizontal overflow on mobile', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'superadmin@mubis.co');

    const users = [
      {
        id: 'pending-mobile-ui',
        role: 'dealer',
        nombre: 'Usuario Con Nombre Muy Largo Para Revisar Layout Mobile',
        email: 'usuario.con.un.email.muy.largo.para.mobile@mubis.co',
        telefono: '300123456789000',
        ciudad: 'Barranquilla',
        company: 'Concesionario Muy Largo Mubis Demo',
        branch: 'Sucursal Demo Norte',
        nit: '900123456-7',
        verification_status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    ];

    await page.route('**/api/users**', async (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === 'GET' && url.pathname.endsWith('/users/pending')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(users) });
        return;
      }
      if (route.request().method() === 'GET' && url.pathname.endsWith('/users')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(users) });
        return;
      }
      await route.continue();
    });

    await page.goto('/AdminSolicitudes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Usuario Con Nombre Muy Largo/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('admin-solicitudes-mobile.png'), fullPage: true });
  });

  test('Ganados has no horizontal overflow on mobile', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'comprador1@mubis.co');

    await page.route('**/api/auctions/won', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'auction-won-mobile',
            brand: 'Toyota',
            model: 'Fortuner',
            year: 2024,
            mileage: 15000,
            city: 'Bogota',
            current_bid: 2300000000,
            status: 'ENDED',
            winnerId: 'user-mobile',
            photos: ['https://picsum.photos/seed/ganados-mobile/900/600'],
          },
        ]),
      });
    });

    await page.route('**/api/interest-requests/mine', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'interest-mobile',
            status: 'EN_NEGOCIACION',
            vehicleLabel: 'Mazda CX-30 Grand Touring LX AWD',
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            vehicleDetails: { year: 2023, km: 22000 },
            branch: {
              name: 'Sucursal Demo Con Nombre Largo',
              city: 'Medellin',
              phone: '3001112233445566',
            },
            dealer: {
              telefono: '300000000000999',
            },
          },
        ]),
      });
    });

    await page.goto('/Ganados', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Ganadas' })).toBeVisible();
    await expect(page.getByText(/Mazda CX-30 Grand Touring LX AWD/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('ganados-mobile.png'), fullPage: true });
  });

  test('DetalleSubasta has no horizontal overflow on mobile with high value', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'comprador1@mubis.co');

    const auction = {
      id: 'auction-detail-mobile',
      auctionId: 'auction-detail-mobile',
      vehicleId: 'vehicle-detail-mobile',
      status: 'ACTIVE',
      brand: 'Mercedes-Benz',
      model: 'GLE 450 4MATIC Coupe',
      year: 2025,
      city: 'Bogota',
      mileage: 9000,
      km: 9000,
      current_bid: 2300000000,
      bids_count: 3,
      leaderId: null,
      ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      photos: ['https://picsum.photos/seed/detail-mobile/900/600'],
      specs: {
        transmission: 'Automatica',
        steering: 'Electrica progresiva',
        passengers: 5,
      },
      inspection: {
        status: 'COMPLETED',
        scoreGlobal: 9,
        scores: { motor: 9, carroceria: 9, interior: 8 },
      },
      documentation: {
        soat: { status: 'vigente', fecha: '2030-12-31' },
        tecno: { status: 'vigente', fecha: '2030-12-31' },
      },
    };

    await page.route('**/api/auctions/auction-detail-mobile/view', async (route) => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.route('**/api/auctions/auction-detail-mobile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(auction) });
    });
    await page.route('**/api/audit/entity/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/pronto-pago/auction/auction-detail-mobile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
    });
    await page.route('**/api/support/cases/mine', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/watchlist/auction-detail-mobile/check', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ inWatchlist: false }) });
    });
    await page.route('**/api/bids/auction/auction-detail-mobile', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/DetalleSubasta/auction-detail-mobile', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Mercedes-Benz GLE 450/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('detalle-subasta-mobile.png'), fullPage: true });
  });

  test('SeBusca has no horizontal overflow on mobile', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'comprador1@mubis.co');

    await page.route('**/api/branch-inventory/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'branch-vehicle-mobile',
            brand: 'Mercedes-Benz',
            model: 'GLE 450 4MATIC Coupe',
            version: 'Grand Touring Largo AWD Performance',
            year: 2024,
            km: 12000,
            daysInInventory: 42,
            branch: { name: 'Sucursal Demo Norte con Nombre Largo', city: 'Medellin' },
          },
        ]),
      });
    });

    await page.goto('/SeBusca', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await expect(page.getByText(/Mercedes-Benz GLE 450/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('se-busca-mobile.png'), fullPage: true });
  });

  test('Deseados has no horizontal overflow on mobile', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'dealer1@mubis.co');

    await page.route('**/api/interest-requests/incoming', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'incoming-mobile',
            status: 'EN_NEGOCIACION',
            vehicleLabel: 'Mercedes-Benz GLE 450 4MATIC Coupe Grand Touring Performance',
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            vehicleDetails: {
              year: 2024,
              km: 12000,
              branchCity: 'Bogota',
              version: 'Performance AWD',
            },
            branch: { name: 'Autoniza 170 con nombre amplio', city: 'Bogota' },
            requester: { nombre: 'Comprador con nombre bastante largo Mubis', telefono: '30012345678999' },
          },
        ]),
      });
    });

    await page.goto('/Deseados', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Mercedes-Benz GLE 450/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('deseados-mobile.png'), fullPage: true });
  });

  test('Cuenta has no horizontal overflow on mobile', async ({ page, request }, testInfo) => {
    await loginAs(page, request, 'dealer1@mubis.co');

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'notif-mobile',
            title: 'Notificacion de prueba',
            body: 'Mensaje de prueba',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    });
    await page.route('**/api/publications/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ balance: 500 }),
      });
    });

    await page.goto('/Cuenta', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Mubis Soporte - Casos/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('cuenta-mobile.png'), fullPage: true });
  });
});
