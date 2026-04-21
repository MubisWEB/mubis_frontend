import { promises as fs } from 'node:fs';
import { expect, Page, test } from '@playwright/test';

const apiURL = process.env.E2E_API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
const tenantSlug = process.env.E2E_TENANT || 'mubis-demo';
const password = process.env.E2E_PASSWORD || 'Password123';

const USERS = {
  dealer: 'dealer1@mubis.co',
  perito: 'perito1@mubis.co',
  recomprador: 'comprador1@mubis.co',
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

async function selectDialogCombobox(page: Page, label: string | RegExp, optionName: string | RegExp) {
  await page.getByRole('dialog').getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: optionName }).click();
}

async function writeUploadFixtures(testInfo) {
  const imagePath = testInfo.outputPath('fixture-vehicle.png');
  const pdfPath = testInfo.outputPath('fixture-report.pdf');

  await fs.writeFile(
    imagePath,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p94AAAAASUVORK5CYII=',
      'base64',
    ),
  );
  await fs.writeFile(pdfPath, Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n'));

  return { imagePath, pdfPath };
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

    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(/Enviar vehiculo|Enviar vehículo/i);
    await dialog.getByPlaceholder('ABC123').fill('UIT123');
    await dialog.getByPlaceholder('1234567890').fill('1010101010');
    await dialog.getByPlaceholder(/Ej: Toyota, Renault/i).fill('Mazda');
    await dialog.getByPlaceholder(/Ej: X3, Sportage/i).fill('3');
    await dialog.locator('input[type="number"]').first().fill('2023');
    await dialog.getByPlaceholder('45000').fill('22000');
    await dialog.getByPlaceholder('Negro').fill('Rojo');
    await dialog.getByPlaceholder(/2000cc/i).fill('2000cc');
    await selectDialogCombobox(page, /Combustible/i, 'Gasolina');
    await selectDialogCombobox(page, /Transmisi/i, /Manual/i);
    await selectDialogCombobox(page, /Ciudad/i, /Bogot/i);
    await dialog.getByPlaceholder(/Juan P/i).fill('Juan Perez');
    await dialog.getByPlaceholder('juan@email.com').fill('juan.perez@example.com');
    await dialog.getByPlaceholder('3001234567').fill('3001234567');

    await dialog.getByRole('button', { name: /Enviar a peritaje/i }).click();

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

  test('perito completes an inspection from the UI and publishes the auction', async ({ page, request }, testInfo) => {
    await loginAs(page, request, USERS.perito);
    const { imagePath, pdfPath } = await writeUploadFixtures(testInfo);
    let completePayload: any = null;
    let uploadCall = 0;

    const inspection = {
      id: 'inspection-complete-ui',
      status: 'IN_PROGRESS',
      dealerCompany: 'AutoNiza',
      requestedAt: new Date().toISOString(),
      vehicle: {
        id: 'vehicle-complete-ui',
        brand: 'Mazda',
        model: '3',
        year: 2024,
        placa: 'FIN123',
        mileage: 12000,
        km: 12000,
        city: 'Bogota',
        specs: { _startingPrice: 50000000 },
      },
    };

    await page.route('**/api/inspections/inspection-complete-ui/complete', async (route) => {
      completePayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...inspection, status: 'COMPLETED', ...completePayload }),
      });
    });

    await page.route('**/api/inspections/inspection-complete-ui', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(inspection),
      });
    });

    await page.route('**/api/media/upload?folder=vehicles', async (route) => {
      uploadCall += 1;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          urls: uploadCall === 1
            ? ['https://cdn.mubis.co/e2e/vehicle-photo.jpg', 'https://cdn.mubis.co/e2e/tarjeta.jpg']
            : ['https://cdn.mubis.co/e2e/peritaje.pdf'],
        }),
      });
    });

    await page.goto('/PeritajeDetalle/inspection-complete-ui', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Mazda 3/i)).toBeVisible();

    await page.locator('input[aria-label="Fotos del vehiculo"]').setInputFiles(imagePath);
    await page.locator('input[aria-label="Foto tarjeta de propiedad"]').setInputFiles(imagePath);
    await page.getByRole('button', { name: /Siguiente/i }).click();

    await page.getByRole('combobox', { name: /SOAT estado/i }).click();
    await page.getByRole('option', { name: 'Vigente' }).click();
    await page.locator('input[type="date"]').nth(0).fill('2030-12-31');
    await page.getByRole('combobox', { name: /Tecnomecanica estado/i }).click();
    await page.getByRole('option', { name: 'Vigente' }).click();
    await page.locator('input[type="date"]').nth(1).fill('2030-12-31');
    await page.getByRole('combobox', { name: /Multas/i }).click();
    await page.getByRole('option', { name: 'No' }).click();
    await page.getByRole('button', { name: /Siguiente/i }).click();

    await page.locator('input[aria-label="PDF del peritaje"]').setInputFiles(pdfPath);
    const scoreInputs = page.locator('input[type="number"]');
    for (let i = 0; i < 8; i += 1) {
      await scoreInputs.nth(i).fill('85');
    }
    await page.getByRole('button', { name: /Siguiente/i }).click();

    await page.getByRole('spinbutton', { name: /Precio recomendado/i }).fill('52000000');
    await page.getByRole('button', { name: /^Finalizar$/i }).click();

    await expect.poll(() => completePayload).not.toBeNull();
    expect(completePayload).toMatchObject({
      startingPrice: 52000000,
      reportPdfUrl: 'https://cdn.mubis.co/e2e/peritaje.pdf',
      vehiclePhotos: ['https://cdn.mubis.co/e2e/vehicle-photo.jpg', 'https://cdn.mubis.co/e2e/tarjeta.jpg'],
      documentation: {
        soat: { status: 'vigente', fecha: '2030-12-31' },
        tecno: { status: 'vigente', fecha: '2030-12-31' },
        multas: { tiene: false, descripcion: '' },
      },
    });
    expect(completePayload.scores.motor).toBe(9);
    await expect(page).toHaveURL(/\/PeritajesPendientes/i);
  });

  test('buyer places a real bid from auction detail UI', async ({ page, request }) => {
    const login = await loginAs(page, request, USERS.recomprador);
    let bidPayload: any = null;

    const auction = {
      id: 'auction-bid-ui',
      auctionId: 'auction-bid-ui',
      vehicleId: 'vehicle-bid-ui',
      status: 'ACTIVE',
      pipelineStatus: 'active',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      placa: 'BID123',
      mileage: 9000,
      km: 9000,
      city: 'Bogota',
      current_bid: 50000000,
      starting_price: 50000000,
      bids_count: 0,
      leaderId: null,
      ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      photos: ['https://picsum.photos/seed/bid-ui/900/600'],
      specs: { transmission: 'Automatica' },
      documentation: {},
      inspection: { scores: { motor: 9, carroceria: 9, interior: 9 } },
    };

    await page.route('**/api/auctions/auction-bid-ui/view', async (route) => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.route('**/api/auctions/auction-bid-ui', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(auction) });
    });
    await page.route('**/api/audit/entity/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/pronto-pago/auction/auction-bid-ui', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
    });
    await page.route('**/api/support/cases/mine', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/watchlist/auction-bid-ui/check', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ inWatchlist: false }) });
    });
    await page.route('**/api/bids', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      bidPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          visibleBid: 50000000,
          currentBid: 50000000,
          bidsCount: 1,
          leaderId: login.user.id,
        }),
      });
    });

    await page.goto('/DetalleSubasta/auction-bid-ui', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Toyota Corolla/i)).toBeVisible();
    await page.getByRole('button', { name: /Pujar ahora/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.locator('input').fill('52000000');
    await dialog.getByRole('button', { name: /Establecer puja/i }).click();

    await expect.poll(() => bidPayload).not.toBeNull();
    expect(bidPayload).toMatchObject({
      auctionId: 'auction-bid-ui',
      maxAmount: 52000000,
      isDirect: false,
    });
    await expect(dialog.getByText(/Lideras la puja/i)).toBeVisible();
  });

  test('seller accepts the winning bid from decision UI', async ({ page, request }) => {
    await loginAs(page, request, USERS.dealer);
    let accepted = false;

    const pendingAuction = {
      id: 'auction-decision-ui',
      auctionId: 'auction-decision-ui',
      vehicleId: 'vehicle-decision-ui',
      status: 'PENDING_DECISION',
      pipelineStatus: 'decision',
      brand: 'Mazda',
      model: 'CX-30',
      year: 2023,
      placa: 'DEC123',
      mileage: 18000,
      km: 18000,
      city: 'Bogota',
      current_bid: 55000000,
      currentBid: 55000000,
      highestBidAmount: 55000000,
      starting_price: 50000000,
      startingPrice: 50000000,
      bids_count: 2,
      bidsCount: 2,
      views: 12,
      ends_at: new Date(Date.now() - 60 * 1000).toISOString(),
      photos: ['https://picsum.photos/seed/decision-ui/900/600'],
      specs: { transmission: 'Automatica' },
      documentation: {},
      inspection: { scores: { motor: 9, carroceria: 8, interior: 9 } },
    };

    const endedAuction = {
      ...pendingAuction,
      status: 'ENDED',
      pipelineStatus: 'finalized',
      hasWinner: true,
      winnerName: 'Comprador Demo',
      transactionStatus: 'PENDING',
    };

    await page.route('**/api/auctions/auction-decision-ui', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(accepted ? endedAuction : pendingAuction),
      });
    });
    await page.route('**/api/bids/auction/auction-decision-ui', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'bid-1', userId: 'buyer-1', amount: 55000000, createdAt: new Date().toISOString() },
          { id: 'bid-2', userId: 'buyer-2', amount: 53000000, createdAt: new Date().toISOString() },
        ]),
      });
    });
    await page.route('**/api/audit/entity/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/auctions/auction-decision-ui/accept', async (route) => {
      accepted = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(endedAuction) });
    });

    await page.goto('/DetalleSubastaVendedor/auction-decision-ui', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Tu subasta finalizo|Tu subasta finaliz/i)).toBeVisible();
    await page.getByRole('button', { name: /Aceptar puja/i }).click();

    await expect.poll(() => accepted).toBe(true);
    await expect(page.getByText(/Subasta finalizada con ganador/i)).toBeVisible();
    await expect(page.getByText(/Comprador Demo/i)).toBeVisible();
  });
});
