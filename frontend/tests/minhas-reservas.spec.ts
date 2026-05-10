import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, mockBookingsApi, mockResourcesApi } from './fixtures';

test.describe('Minhas Reservas — Visualização e Cancelamento', () => {
  async function openMyBookings(page: import('@playwright/test').Page) {
    // Open profile dropdown and navigate to my bookings
    await page.locator('nav').locator('button').first().click();
    await expect(page.getByText('Minhas Reservas')).toBeVisible();
    await page.getByText('Minhas Reservas').click();
    await expect(page.getByRole('heading', { name: 'Minhas Reservas' })).toBeVisible();
  }

  test.describe('com reservas existentes', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedPage(page);
      await openMyBookings(page);
    });

    test('exibe título "Minhas Reservas"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Minhas Reservas' })).toBeVisible();
    });

    test('exibe tabela com todas as colunas esperadas', async ({ page }) => {
      // Use getByRole('columnheader') to avoid strict mode violations from partial text matches
      await expect(page.getByRole('columnheader', { name: 'Recurso' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Data' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Horário' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Ações' })).toBeVisible();
    });

    test('exibe o recurso da reserva na tabela', async ({ page }) => {
      // Booking is for res1 = Sala de Reunião Alpha
      await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    });

    test('exibe o horário da reserva (10:00 - 11:00)', async ({ page }) => {
      await expect(page.getByText('10:00 - 11:00')).toBeVisible();
    });

    test('exibe badge "Confirmado" com estilo verde', async ({ page }) => {
      const badge = page.getByText('Confirmado');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveClass(/text-emerald/);
    });

    test('exibe botão "Cancelar" para cada reserva', async ({ page }) => {
      await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
    });

    test('cancelar reserva remove-a da tabela', async ({ page }) => {
      // After DELETE, mock GET reservations to return empty
      await page.route('**/api/reservations**', (route) => {
        const method = route.request().method();
        if (method === 'DELETE') {
          route.fulfill({ status: 200, json: { message: 'Cancelado' } });
        } else if (method === 'GET') {
          route.fulfill({ status: 200, json: [] });
        } else {
          route.continue();
        }
      });

      await page.getByRole('button', { name: /cancelar/i }).click();
      await expect(page.getByText('Você ainda não possui nenhuma reserva realizada.')).toBeVisible();
    });
  });

  test.describe('sem reservas', () => {
    test.beforeEach(async ({ page }) => {
      // Setup with empty bookings
      await page.addInitScript((userData) => {
        window.sessionStorage.setItem('smartreserve_user', JSON.stringify(userData));
      }, { id: 'user123', name: 'Álvaro Belarmino', matricula: '180', role: 'user' });

      await page.route('**/api/resources', (route) =>
        route.fulfill({ status: 200, json: [] })
      );
      await page.route('**/api/reservations**', (route) =>
        route.fulfill({ status: 200, json: [] })
      );

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await openMyBookings(page);
    });

    test('exibe mensagem de estado vazio quando não há reservas', async ({ page }) => {
      await expect(
        page.getByText('Você ainda não possui nenhuma reserva realizada.')
      ).toBeVisible();
    });
  });

  test.describe('navegação', () => {
    test('menu de perfil abre e fecha corretamente', async ({ page }) => {
      await setupAuthenticatedPage(page);

      // Open dropdown
      await page.locator('nav').locator('button').first().click();
      await expect(page.getByText('Minha Conta')).toBeVisible();

      // Close by clicking the fixed overlay that covers the screen
      await page.locator('.fixed.inset-0.z-40').click({ force: true });
      await expect(page.getByText('Minha Conta')).not.toBeVisible();
    });

    test('menu de perfil inclui link para Configurações', async ({ page }) => {
      await setupAuthenticatedPage(page);
      await page.locator('nav').locator('button').first().click();
      await expect(page.getByText('Configurações')).toBeVisible();
    });

    test('navegar para Configurações via menu de perfil', async ({ page }) => {
      await setupAuthenticatedPage(page);
      await page.locator('nav').locator('button').first().click();
      await page.getByText('Configurações').click();

      await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
      await expect(page.getByText('Perfil do Usuário')).toBeVisible();
    });

    test('botão Home retorna à lista de recursos', async ({ page }) => {
      await setupAuthenticatedPage(page);
      await openMyBookings(page);

      // Click the Home icon button
      await page.getByTitle('Início').click();
      await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
    });
  });
});
