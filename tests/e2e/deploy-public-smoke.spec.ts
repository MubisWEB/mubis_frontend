import { expect, test } from '@playwright/test';

function collectPageErrors(page) {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  return pageErrors;
}

test.describe('deploy public smoke', () => {
  test('home, contacto, faq and login render on deployed site', async ({ page, baseURL }) => {
    test.skip(!baseURL?.startsWith('https://'), 'Este smoke solo corre contra un deploy remoto.');
    const pageErrors = collectPageErrors(page);

    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Mubis/i);
    await expect(page.locator('body')).toContainText(/Mubis/i);

    await page.goto('/contacto', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/contacto/i);
    await expect(page.locator('body')).toContainText(/info@mubis\.co/i);

    await page.goto('/preguntas-frecuentes', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/preguntas-frecuentes/i);
    await expect(page.locator('body')).toContainText(/Preguntas Frecuentes/i);

    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/login/i);
    await expect(page.locator('body')).toContainText(/Iniciar|Login|Correo|Email/i);

    expect(pageErrors).toEqual([]);
  });

  test('robots and sitemap are reachable on deployed site', async ({ request, baseURL }) => {
    test.skip(!baseURL?.startsWith('https://'), 'Este smoke solo corre contra un deploy remoto.');

    const robots = await request.get(`${baseURL}/robots.txt`);
    expect(robots.ok()).toBeTruthy();
    await expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get(`${baseURL}/sitemap.xml`);
    expect(sitemap.ok()).toBeTruthy();
    await expect(await sitemap.text()).toContain('<urlset');
  });
});
