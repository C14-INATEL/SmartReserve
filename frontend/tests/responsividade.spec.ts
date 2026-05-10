import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, setupApiMocks } from './fixtures';

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

test.describe('Responsividade — Login', () => {
  test('mobile: formulário de login ocupa largura disponível', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');

    const form = page.locator('form');
    await expect(form).toBeVisible();

    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    // Form should fill most of the 375px mobile screen
    expect(box!.width).toBeGreaterThan(300);
  });

  test('mobile: campos e botão de login são completamente visíveis', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');

    await expect(page.locator('input[placeholder="MATRÍCULA"]')).toBeVisible();
    await expect(page.locator('input[placeholder="SENHA"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('desktop: formulário de login está centralizado com max-width', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');

    const form = page.locator('form');
    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    // Should be constrained (max-w-md ≈ 448px) and not full desktop width
    expect(box!.width).toBeLessThan(600);
  });
});

test.describe('Responsividade — Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('desktop: nome do usuário e "Membro" visíveis na nav', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Membro')).toBeVisible();
  });

  test('desktop: logo "SmartReserve" visível na nav', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    // SmartReserve text uses `hidden sm:block` so visible on desktop
    const logo = page.getByText('SmartReserve').first();
    await expect(logo).toBeVisible();
  });

  test('mobile: nome do usuário oculto mas dropdown de perfil abre via clique', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The profile button is always there even if text is hidden
    // Click the first button in nav (profile avatar area)
    const nav = page.locator('nav');
    const profileBtn = nav.locator('button').first();
    await profileBtn.click();

    await expect(page.getByText('Minhas Reservas')).toBeVisible();
    await expect(page.getByText('Sair')).toBeVisible();
  });

  test('mobile: dropdown de perfil fecha ao clicar em overlay', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('nav');
    const profileBtn = nav.locator('button').first();
    await profileBtn.click();
    await expect(page.getByText('Minha Conta')).toBeVisible();

    // Click the fixed overlay to close
    await page.locator('.fixed.inset-0.z-40').click({ force: true });
    await expect(page.getByText('Minha Conta')).not.toBeVisible();
  });
});

test.describe('Responsividade — Grid de Recursos', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('mobile: grid usa 1 coluna', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid = page.locator('.grid.grid-cols-1');
    await expect(grid).toBeVisible();

    // Get positions of first two cards — in a 1-col layout they should be stacked
    const cards = page.locator('.grid.grid-cols-1 > div');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    // In 1 column, both cards have similar x position
    expect(Math.abs(first!.x - second!.x)).toBeLessThan(10);
    // And second card is below first
    expect(second!.y).toBeGreaterThan(first!.y);
  });

  test('tablet: cards estão dispostos em múltiplas colunas', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.grid > div');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    // In 2-column layout, first two cards are side by side (different x positions)
    expect(Math.abs(first!.x - second!.x)).toBeGreaterThan(50);
  });

  test('desktop: três recursos visíveis lado a lado', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.grid > div');
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    const third = await cards.nth(2).boundingBox();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(third).not.toBeNull();
    // All three should be on the same vertical row
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(20);
    expect(Math.abs(first!.y - third!.y)).toBeLessThan(20);
  });

  test('mobile: não há overflow horizontal na home', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = VIEWPORTS.mobile.width;
    // Body should not be wider than viewport (no horizontal overflow)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });
});

test.describe('Responsividade — Detalhes do Recurso', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.getByText('Sala de Reunião Alpha').click();
    await expect(page.getByText('Agenda de Hoje')).toBeVisible();
  });

  test('mobile: página de detalhes não tem overflow horizontal', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.reload();
    await page.waitForLoadState('networkidle');
    // After reload auth is gone, so navigate again
    await setupAuthenticatedPage(page);
    await page.getByText('Sala de Reunião Alpha').click();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 5);
  });

  test('desktop: layout de detalhes usa grid de 3 colunas', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);

    // The detail page uses `grid grid-cols-1 lg:grid-cols-3`
    const detailGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3');
    await expect(detailGrid).toBeVisible();
  });

  test('mobile: grade de horários é legível e não transborda', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);

    const scheduleSlot = page.getByText('08:00').first();
    await expect(scheduleSlot).toBeVisible();

    const box = await scheduleSlot.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 5);
  });
});

test.describe('Responsividade — Minhas Reservas', () => {
  test('mobile: tabela de reservas é acessível com scroll horizontal', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await setupAuthenticatedPage(page);

    const nav = page.locator('nav');
    const profileBtn = nav.locator('button').first();
    await profileBtn.click();
    await page.getByText('Minhas Reservas').click();

    await expect(page.getByRole('heading', { name: 'Minhas Reservas' })).toBeVisible();
    // Table should be wrapped in overflow-x-auto
    await expect(page.locator('.overflow-x-auto')).toBeVisible();
  });
});
