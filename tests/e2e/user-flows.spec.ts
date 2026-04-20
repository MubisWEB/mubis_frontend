import { expect, Page, test } from '@playwright/test';

const apiURL = process.env.E2E_API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
const tenantSlug = process.env.E2E_TENANT || 'mubis-demo';
const password = process.env.E2E_PASSWORD || 'Password123';

const USERS = {
  dealer: 'dealer1@mubis.co',
  perito: 'perito1@mubis.co',
} as const;

async function loginAs(page: Page, request, email: string) {
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

async function selectDialogCombobox(page: Page, index: number, optionName: string | RegExp) {
  await page.getByRole('dialog').getByRole('combobox').nth(index).click();
  await page.getByRole('option', { name: optionName }).click();
}

test.describe('business user flows', () => {
  test('dealer publishes a vehicle from the UI and sends it to inspection', async ({ page, request }) => {
    await loginAs(page, request, USERS.dealer);

    let createdVehiclePayload: any = null;

    await page.route('**/api/publications/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ balance: 3 }),
      });
    });

    await page.route('**/api/vehicles', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      createdVehiclePayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'vehicle-ui-flow',
          ...createdVehiclePayload,
          status: 'PENDING_INSPECTION',
        }),
      });
    });

    await page.goto('/MisSubastas', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Publicar carro/i }).click();

    await expect(page.getByRole('dialog')).toContainText(/Enviar vehiculo|Enviar vehículo/i);
    await page.getByPlaceholder('ABC123').fill('UIT123');
    await page.getByPlaceholder('1234567890').fill('1010101010');
    await page.getByPlaceholder(/Ej: Toyota, Renault/i).fill('Mazda');
    await page.getByPlaceholder(/Ej: X3, Sportage/i).fill('3');
    await page.getByRole('dialog').locator('input[type="number"]').first().fill('2023');
    await page.getByPlaceholder('45000').fill('22000');
    await page.getByPlaceholder('Negro').fill('Rojo');
    await page.getByPlaceholder(/2000cc/i).fill('2000cc');
    await selectDialogCombobox(page, 0, 'Gasolina');
    await selectDialogCombobox(page, 1, /Manual/i);
    await selectDialogCombobox(page, 2, /Bogot/i);
    await page.getByPlaceholder(/Juan P/i).fill('Juan Perez');
    await page.getByPlaceholder('juan@email.com').fill('juan.perez@example.com');
    await page.getByPlaceholder('3001234567').fill('3001234567');

    await page.getByRole('button', { name: /Enviar a peritaje/i }).click();

    await expect.poll(() => createdVehiclePayload).not.toBeNull();
    expect(createdVehiclePayload).toMatchObject({
      brand: 'Mazda',
      model: '3',
      year: 2023,
      km: 22000,
      placa: 'UIT123',
      startingPrice: 0,
      photos: [],
      documentation: {},
    });
    expect(createdVehiclePayload.specs.seller).toMatchObject({
      cedula: '1010101010',
      nombre: 'Juan Perez',
      email: 'juan.perez@example.com',
      telefono: '3001234567',
    });
    await expect(page.getByText(/Vehiculo enviado a peritaje|Vehículo enviado a peritaje/i)).toBeVisible();
  });

  test('perito can take a pending inspection from the UI', async ({ page, request }) => {
    await loginAs(page, request, USERS.perito);

    await page.route('**/api/inspections/pending', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'inspection-ui-flow',
            status: 'PENDING',
            dealerCompany: 'AutoNiza',
            requestedAt: new Date().toISOString(),
            vehicle: {
              brand: 'Mazda',
              model: '3',
              year: 2023,
              placa: 'UIT456',
              mileage: 18000,
              city: 'Bogota',
            },
          },
        ]),
      });
    });

    await page.route('**/api/inspections/inspection-ui-flow/take', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'inspection-ui-flow', status: 'IN_PROGRESS' }),
      });
    });

    await page.goto('/PeritajesPendientes', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Mazda 3')).toBeVisible();
    await expect(page.getByText(/UIT456/)).toBeVisible();
    await page.getByRole('button', { name: /Tomar peritaje/i }).click();
    await expect(page).toHaveURL(/\/PeritajeDetalle\/inspection-ui-flow/i);
  });

  test('auction detail surfaces same-branch consecutive bid rejection', async ({ page, request }) => {
    const login = await loginAs(page, request, USERS.dealer);
    const auctionsResponse = await request.get(`${apiURL}/auctions`, {
      headers: { Authorization: `Bearer ${login.accessToken}` },
    });
    expect(auctionsResponse.ok()).toBeTruthy();

    const auctions = await auctionsResponse.json();
    const auction = auctions.find((item: any) => item.dealerId !== login.user.id);
    test.skip(!auction, 'No active auction from another seller is available in the seed data');

    await page.route('**/api/bids', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 403,
          message: 'Otro usuario de tu misma sucursal hizo la ultima puja. Espera una puja de otra sucursal o de un recomprador.',
          error: 'Forbidden',
        }),
      });
    });
    await page.route(`**/api/auctions/${auction.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...auction,
          auctionId: auction.id,
          vehicleId: auction.vehicleId || 'vehicle-branch-bid-ui',
          pipelineStatus: 'active',
          inspectionStatus: 'COMPLETED',
          photos: auction.photos?.length ? auction.photos : ['https://picsum.photos/seed/branch-bid-ui/800/500'],
          specs: auction.specs || {},
        }),
      });
    });

    await page.goto(`/DetalleSubasta/${auction.id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(new RegExp(`${auction.brand}\\s+${auction.model}`, 'i'))).toBeVisible();
    await page.getByRole('button', { name: /Pujar ahora|Aumentar puja/i }).click();

    const minBid = Number(auction.current_bid || auction.starting_price || 0) + ((auction.bids_count || 0) > 0 ? 200000 : 0);
    const dialog = page.getByRole('dialog');
    await dialog.locator('input').fill(String(minBid));
    await dialog.getByRole('button', { name: /Establecer puja maxima|Establecer puja máxima/i }).click();

    await expect(dialog.getByText(/misma sucursal/i)).toBeVisible();
  });
});
