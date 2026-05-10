import { test, expect } from '@playwright/test';
import { setupApiMocks, setupAuthenticatedPage, mockUser } from './fixtures';

test.describe('Autenticação', () => {
  test('exibe formulário de login ao acessar sem sessão', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('input[placeholder="MATRÍCULA"]')).toBeVisible();
    await expect(page.locator('input[placeholder="SENHA"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('login com credenciais válidas redireciona para home', async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');

    await page.locator('input[placeholder="MATRÍCULA"]').fill('180');
    await page.locator('input[placeholder="SENHA"]').fill('123456');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
  });

  test('login com credenciais inválidas exibe mensagem de erro', async ({ page }) => {
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        json: { message: 'Matrícula ou senha incorretos.' },
      })
    );
    await page.goto('/');

    await page.locator('input[placeholder="MATRÍCULA"]').fill('000');
    await page.locator('input[placeholder="SENHA"]').fill('errada');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/matrícula ou senha/i)).toBeVisible();
  });

  test('exibe estado de carregamento durante o login', async ({ page }) => {
    // Set up delayed auth mock LAST so it takes precedence
    await page.route('**/api/resources', (route) =>
      route.fulfill({ status: 200, json: [] })
    );
    await page.route('**/api/reservations**', (route) =>
      route.fulfill({ status: 200, json: [] })
    );
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((r) => setTimeout(r, 600));
      route.fulfill({
        status: 200,
        json: { user: { id: 'user123', nome: 'Álvaro Belarmino', matricula: '180', role: 'user' } },
      });
    });
    await page.goto('/');

    await page.locator('input[placeholder="MATRÍCULA"]').fill('180');
    await page.locator('input[placeholder="SENHA"]').fill('123456');
    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByRole('button', { name: /entrando/i })).toBeVisible();
  });

  test('sessão persiste após recarregar a página', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
    await expect(page.locator('input[placeholder="MATRÍCULA"]')).not.toBeVisible();
  });

  test('logout redireciona para tela de login', async ({ page }) => {
    await setupAuthenticatedPage(page);

    // Open profile dropdown
    await page.locator('nav').locator('button').first().click();
    await expect(page.getByText('Sair')).toBeVisible();
    await page.getByText('Sair').click();

    // Should show login form again
    await expect(page.locator('input[placeholder="MATRÍCULA"]')).toBeVisible();
    await expect(page.locator('input[placeholder="SENHA"]')).toBeVisible();
  });

  test('logout limpa a sessão do usuário', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.locator('nav').locator('button').first().click();
    await page.getByText('Sair').click();

    // Verify sessionStorage was cleared (avoid reload — addInitScript would reinject the user)
    const stored = await page.evaluate(() => window.sessionStorage.getItem('smartreserve_user'));
    expect(stored).toBeNull();
  });

  test('campos de login têm os tipos corretos', async ({ page }) => {
    await page.goto('/');

    const matriculaInput = page.locator('input[placeholder="MATRÍCULA"]');
    const senhaInput = page.locator('input[placeholder="SENHA"]');

    await expect(matriculaInput).toHaveAttribute('inputMode', 'numeric');
    await expect(senhaInput).toHaveAttribute('type', 'password');
  });
});
