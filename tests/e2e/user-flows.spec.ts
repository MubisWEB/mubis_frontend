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
  test('registration as recomprador does not ask for company or branch', async ({ page }) => {
    await page.goto('/registro', { waitUntil: 'domcontentloaded' });

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /Recomprador/i }).click();

    await expect(page.getByText(/Empresa \/ Concesionario/i)).toHaveCount(0);
    await expect(page.getByText(/^Sucursal \*$/i)).toHaveCount(0);
    await expect(page.getByText(/^NIT/i)).toHaveCount(0);
  });

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

  test('recomprador moves a SeBusca match into Ganadas from the UI', async ({ page, request }) => {
    await loginAs(page, request, USERS.recomprador);
    let createdInterestRequest = false;

    await page.route('**/api/branch-inventory/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'branch-vehicle-sebusca-ui',
            brand: 'Mazda',
            model: 'CX-30',
            version: 'Grand Touring LX AWD',
            year: 2023,
            km: 22000,
            daysInInventory: 47,
            branch: {
              name: 'Sucursal Demo Norte',
              city: 'Medellin',
              phone: '3001112233',
            },
          },
        ]),
      });
    });

    await page.route('**/api/interest-requests', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      createdInterestRequest = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'interest-ui-flow',
          status: 'EN_NEGOCIACION',
        }),
      });
    });

    await page.route('**/api/auctions/won', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/interest-requests/mine', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'interest-ui-flow',
            status: 'EN_NEGOCIACION',
            vehicleLabel: 'Mazda CX-30 Grand Touring LX AWD',
            deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            vehicleDetails: {
              year: 2023,
              km: 22000,
            },
            branch: {
              name: 'Sucursal Demo Norte',
              city: 'Medellin',
              phone: '3001112233',
            },
            dealer: {
              telefono: '3019998877',
            },
          },
        ]),
      });
    });

    await page.goto('/SeBusca', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Buscar$/i }).click();

    await expect(page.getByText(/Mazda CX-30/i)).toBeVisible();
    await page.getByText(/Mazda CX-30/i).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/Contacto bloqueado/i)).toBeVisible();
    await expect(dialog.getByText(/desbloquear el contacto/i)).toBeVisible();
    await dialog.getByRole('button', { name: /Me interesa/i }).click();

    await expect.poll(() => createdInterestRequest).toBe(true);
    await expect(page).toHaveURL(/\/Ganados/i);
    await expect(page.getByRole('heading', { name: 'Ganadas' })).toBeVisible();
    await expect(page.getByText(/Mazda CX-30 Grand Touring LX AWD/i)).toBeVisible();
    await expect(page.getByText(/Expira en/i)).toBeVisible();
  });

  test('dealer resolves incoming SeBusca requests from Deseados UI', async ({ page, request }) => {
    await loginAs(page, request, USERS.dealer);

    let incomingLoaded = false;
    let incoming = [
      {
        id: 'incoming-interest-accept',
        status: 'EN_NEGOCIACION',
        vehicleLabel: 'Toyota Corolla Cross XEI',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        vehicleDetails: {
          year: 2023,
          km: 19000,
          branchCity: 'Bogota',
          version: 'XEI',
        },
        branch: { name: 'Autoniza 170', city: 'Bogota' },
        requester: { nombre: 'Comprador Uno', telefono: '3001111111' },
      },
      {
        id: 'incoming-interest-reject',
        status: 'EN_NEGOCIACION',
        vehicleLabel: 'Mazda CX-5 Grand Touring',
        deadline: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
        vehicleDetails: {
          year: 2022,
          km: 28000,
          branchCity: 'Bogota',
          version: 'Grand Touring',
        },
        branch: { name: 'Autoniza 170', city: 'Bogota' },
        requester: { nombre: 'Comprador Dos', telefono: '3002222222' },
      },
    ];

    await page.route('**/api/interest-requests/incoming', async (route) => {
      incomingLoaded = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(incoming),
      });
    });

    await page.route('**/api/interest-requests/*/accept', async (route) => {
      const match = route.request().url().match(/interest-requests\/([^/]+)\/accept/);
      const id = match?.[1];
      incoming = incoming.map((item) => (
        item.id === id ? { ...item, status: 'ACEPTADO' } : item
      ));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(incoming.find((item) => item.id === id)),
      });
    });

    await page.route('**/api/interest-requests/*/reject', async (route) => {
      const match = route.request().url().match(/interest-requests\/([^/]+)\/reject/);
      const id = match?.[1];
      incoming = incoming.map((item) => (
        item.id === id ? { ...item, status: 'RECHAZADO' } : item
      ));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(incoming.find((item) => item.id === id)),
      });
    });

    await page.goto('/Deseados', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => incomingLoaded).toBe(true);
    await expect(page.getByText('Toyota Corolla Cross XEI')).toBeVisible();
    await expect(page.getByText('Mazda CX-5 Grand Touring')).toBeVisible();

    const acceptCard = page.locator('div.rounded-xl.border').filter({ hasText: 'Toyota Corolla Cross XEI' }).first();
    const rejectCard = page.locator('div.rounded-xl.border').filter({ hasText: 'Mazda CX-5 Grand Touring' }).first();

    await expect(acceptCard).toContainText(/Comprador Uno/i);
    await expect(rejectCard).toContainText(/Comprador Dos/i);

    await acceptCard.getByRole('button', { name: /Aceptar/i }).click();
    await expect(acceptCard).toHaveCount(0);

    await rejectCard.getByRole('button', { name: /Rechazar/i }).click();
    await expect(rejectCard).toHaveCount(0);

    await page.getByRole('button', { name: /Resueltos/i }).click();
    await expect(page.getByText('Toyota Corolla Cross XEI')).toBeVisible();
    await expect(page.getByText('Mazda CX-5 Grand Touring')).toBeVisible();
    await expect(page.getByText(/Aceptado/i)).toBeVisible();
    await expect(page.getByText(/Rechazado/i)).toBeVisible();
  });

  test('buyer opens a support case from a won auction and lands on case detail', async ({ page, request }) => {
    const login = await loginAs(page, request, USERS.recomprador);
    let createdPayload: any = null;

    const supportCase = {
      id: 'support-case-ui',
      status: 'OPEN',
      auctionId: 'auction-support-ui',
      vehicleLabel: 'Mazda CX-30 2023',
      createdAt: new Date().toISOString(),
      buyerName: 'Comprador Demo',
      sellerName: 'Dealer Demo',
      messages: [
        {
          id: 'support-msg-1',
          senderId: login.user.id,
          senderRole: 'comprador',
          senderName: 'Comprador Demo',
          text: 'El vehículo no llegó como estaba publicado.',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const auction = {
      id: 'auction-support-ui',
      auctionId: 'auction-support-ui',
      vehicleId: 'vehicle-support-ui',
      status: 'ENDED',
      winnerId: login.user.id,
      mockWonStatus: 'en_proceso',
      brand: 'Mazda',
      model: 'CX-30',
      year: 2023,
      city: 'Bogota',
      mileage: 15000,
      km: 15000,
      current_bid: 54000000,
      bids_count: 2,
      leaderId: 'buyer-ui',
      ends_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      photos: ['https://picsum.photos/seed/support-ui/900/600'],
      dealer: {
        nombre: 'Dealer Demo',
        email: 'dealer.demo@mubis.co',
        telefono: '3003334444',
        company: 'Autoniza',
        branch: 'Autoniza 170',
      },
      specs: { transmission: 'Automatica' },
      documentation: {},
      inspection: { scores: { motor: 9, carroceria: 8, interior: 8 } },
    };

    await page.route('**/api/auctions/auction-support-ui/view', async (route) => {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.route('**/api/auctions/auction-support-ui', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(auction) });
    });
    await page.route('**/api/audit/entity/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/pronto-pago/auction/auction-support-ui', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(null) });
    });
    await page.route('**/api/support/cases/mine', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/watchlist/auction-support-ui/check', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ inWatchlist: false }) });
    });
    await page.route('**/api/bids/auction/auction-support-ui', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/support/cases', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      createdPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(supportCase),
      });
    });
    await page.route('**/api/support/cases/support-case-ui', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(supportCase),
      });
    });

    await page.goto('/DetalleSubasta/auction-support-ui?from=ganados', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /Abrir caso/i })).toBeVisible();
    await page.getByRole('button', { name: /Abrir caso/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder(/Describe el problema/i).fill('El vehículo no llegó como estaba publicado.');
    await dialog.getByRole('button', { name: /^Abrir caso$/i }).click();

    await expect.poll(() => createdPayload).not.toBeNull();
    expect(createdPayload).toMatchObject({
      auctionId: 'auction-support-ui',
      vehicleLabel: 'Mazda CX-30 2023',
      initialMessage: 'El vehículo no llegó como estaba publicado.',
    });

    await expect(page).toHaveURL(/\/SoporteCasos\/support-case-ui/i);
    await expect(page.getByText(/Caso de soporte/i)).toBeVisible();
    await expect(page.getByText(/El vehículo no llegó como estaba publicado\./i)).toBeVisible();
  });
});
