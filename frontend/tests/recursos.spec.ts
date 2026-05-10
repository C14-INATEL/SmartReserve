import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage } from './fixtures';

test.describe('Recursos — Browse, Filtros e Busca', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  // ─── Grid de recursos ────────────────────────────────────────────────────

  test('exibe título "Recursos Disponíveis" na home', async ({ page }) => {
    await expect(page.getByText('Recursos Disponíveis')).toBeVisible();
  });

  test('exibe os três recursos mockados na home', async ({ page }) => {
    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).toBeVisible();
    await expect(page.getByText('Projetor 4K')).toBeVisible();
  });

  test('cada card exibe o badge de tipo correto', async ({ page }) => {
    const badges = page.locator('text=Sala, text=Laboratório, text=Equipamento');
    await expect(page.getByText('Sala').first()).toBeVisible();
    await expect(page.getByText('Laboratório').first()).toBeVisible();
    await expect(page.getByText('Equipamento').first()).toBeVisible();
  });

  // ─── Filtros de tipo ──────────────────────────────────────────────────────

  test('filtro "Salas" mostra apenas salas', async ({ page }) => {
    await page.getByRole('button', { name: 'Salas' }).click();

    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
    await expect(page.getByText('Projetor 4K')).not.toBeVisible();
  });

  test('filtro "Labs" mostra apenas laboratórios', async ({ page }) => {
    await page.getByRole('button', { name: 'Labs' }).click();

    await expect(page.getByText('Laboratório de Informática 01')).toBeVisible();
    await expect(page.getByText('Sala de Reunião Alpha')).not.toBeVisible();
    await expect(page.getByText('Projetor 4K')).not.toBeVisible();
  });

  test('filtro "Equip." mostra apenas equipamentos', async ({ page }) => {
    await page.getByRole('button', { name: 'Equip.' }).click();

    await expect(page.getByText('Projetor 4K')).toBeVisible();
    await expect(page.getByText('Sala de Reunião Alpha')).not.toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
  });

  test('filtro "Todos" restaura todos os recursos', async ({ page }) => {
    // Apply a filter first
    await page.getByRole('button', { name: 'Salas' }).click();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();

    // Reset to all
    await page.getByRole('button', { name: 'Todos' }).click();

    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).toBeVisible();
    await expect(page.getByText('Projetor 4K')).toBeVisible();
  });

  test('botão de filtro ativo tem estilo destacado', async ({ page }) => {
    const salasBtn = page.getByRole('button', { name: 'Salas' });
    await salasBtn.click();

    // Active filter button has bg-black class applied via Tailwind
    await expect(salasBtn).toHaveClass(/bg-black/);
  });

  // ─── Busca por texto ─────────────────────────────────────────────────────

  test('campo de busca é visível', async ({ page }) => {
    await expect(page.locator('input[placeholder="Buscar recurso..."]')).toBeVisible();
  });

  test('busca por "alpha" mostra apenas a sala correspondente', async ({ page }) => {
    // Wait for resources to render before interacting with search
    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();

    await page.locator('input[placeholder="Buscar recurso..."]').fill('alpha');

    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
    await expect(page.getByText('Projetor 4K')).not.toBeVisible();
  });

  test('busca por "4k" mostra apenas o equipamento', async ({ page }) => {
    // Wait for resources to render before interacting with search
    await expect(page.getByText('Projetor 4K')).toBeVisible();

    // Use "4k" — unique to "Projetor 4K" name (sala's description mentions "projetor" too)
    await page.locator('input[placeholder="Buscar recurso..."]').fill('4k');

    await expect(page.getByText('Projetor 4K')).toBeVisible();
    await expect(page.getByText('Sala de Reunião Alpha')).not.toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
  });

  test('busca sem resultado exibe grid vazio', async ({ page }) => {
    await page.locator('input[placeholder="Buscar recurso..."]').fill('xxxxxxxxnaoexiste');

    await expect(page.getByText('Sala de Reunião Alpha')).not.toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
    await expect(page.getByText('Projetor 4K')).not.toBeVisible();
  });

  test('limpar busca restaura todos os recursos', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar recurso..."]');
    await searchInput.fill('alfa');
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();

    await searchInput.clear();
    await expect(page.getByText('Laboratório de Informática 01')).toBeVisible();
  });

  test('busca e filtro funcionam combinados', async ({ page }) => {
    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();

    await page.getByRole('button', { name: 'Salas' }).click();
    await page.locator('input[placeholder="Buscar recurso..."]').fill('alpha');

    await expect(page.getByText('Sala de Reunião Alpha')).toBeVisible();
    await expect(page.getByText('Laboratório de Informática 01')).not.toBeVisible();
  });

  // ─── Navegação para detalhes ─────────────────────────────────────────────

  test('clicar em um card navega para a página de detalhes', async ({ page }) => {
    await page.getByText('Sala de Reunião Alpha').click();

    await expect(page.getByText('Agenda de Hoje')).toBeVisible();
    await expect(page.getByText('Voltar para Recursos')).toBeVisible();
  });
});
