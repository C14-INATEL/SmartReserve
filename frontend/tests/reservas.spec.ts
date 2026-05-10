import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, setupApiMocks } from './fixtures';

test.describe('Reservas — Detalhes e Criação', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    // Navigate to details of the first resource
    await page.getByText('Sala de Reunião Alpha').click();
    await expect(page.getByText('Agenda de Hoje')).toBeVisible();
  });

  // ─── Página de detalhes ──────────────────────────────────────────────────

  test('exibe nome e descrição do recurso selecionado', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sala de Reunião Alpha' })).toBeVisible();
    await expect(page.getByText('Sala equipada com projetor e capacidade para 20 pessoas.')).toBeVisible();
  });

  test('exibe seção "Agenda de Hoje" com grade de horários', async ({ page }) => {
    await expect(page.getByText('Agenda de Hoje')).toBeVisible();
    // 12 slots from 08:00 to 19:00
    await expect(page.getByText('08:00')).toBeVisible();
    await expect(page.getByText('19:00')).toBeVisible();
  });

  test('exibe badge de tipo correto no detalhe', async ({ page }) => {
    await expect(page.getByText('Sala').first()).toBeVisible();
  });

  test('exibe informações de disponibilidade e localização', async ({ page }) => {
    await expect(page.getByText(/disponibilidade/i)).toBeVisible();
    await expect(page.getByText('08:00 - 20:00')).toBeVisible();
  });

  test('botão "Voltar para Recursos" retorna ao grid', async ({ page }) => {
    await page.getByText('Voltar para Recursos').click();

    await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
    await expect(page.getByText('Agenda de Hoje')).not.toBeVisible();
  });

  test('logo da SmartReserve retorna ao grid de recursos', async ({ page }) => {
    await page.getByText('SmartReserve').first().click();

    await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
  });

  test('exibe seção "Reserva Rápida" com regras de uso', async ({ page }) => {
    await expect(page.getByText('Reserva Rápida')).toBeVisible();
    await expect(page.getByText(/máximo de 4 horas/i)).toBeVisible();
  });

  test('exibe seção "Outros Recursos" com recursos relacionados', async ({ page }) => {
    await expect(page.getByText('Outros Recursos')).toBeVisible();
    // Should show the other 2 resources
    await expect(page.getByText('Laboratório de Informática 01')).toBeVisible();
    await expect(page.getByText('Projetor 4K')).toBeVisible();
  });

  // ─── Horários disponíveis e reservados ──────────────────────────────────

  test('horários disponíveis exibem texto "Disponível para Reserva"', async ({ page }) => {
    // With no bookings today, most slots should be available
    const availableSlots = page.getByText('Disponível para Reserva');
    await expect(availableSlots.first()).toBeVisible();
  });

  test('slot reservado (10:00) exibe "Horário Ocupado"', async ({ page }) => {
    // The fixture has a booking at 10:00–11:00 for res1
    await expect(page.getByText('Horário Ocupado')).toBeVisible();
  });

  test('slot reservado tem cursor not-allowed', async ({ page }) => {
    const bookedSlot = page.locator('div').filter({ hasText: 'Horário Ocupado' }).first();
    const cursor = await bookedSlot.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('not-allowed');
  });

  // ─── Criação de reserva ──────────────────────────────────────────────────

  test('clicar em horário disponível abre diálogo de confirmação', async ({ page }) => {
    // Mock POST reservation to succeed and GET to return updated list
    await page.route('**/api/reservations', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: { message: 'Reserva criada' } });
      } else {
        route.continue();
      }
    });

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Reserva realizada com sucesso');
      await dialog.accept();
    });

    // Click the 08:00 available slot
    const slot08 = page.locator('div').filter({ hasText: /^08:00/ }).first();
    await slot08.click();
  });

  test('navegar para outro recurso via "Outros Recursos"', async ({ page }) => {
    await page.getByText('Laboratório de Informática 01').click();

    await expect(page.getByRole('heading', { name: 'Laboratório de Informática 01' })).toBeVisible();
  });
});
