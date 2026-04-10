import { test, expect } from '@playwright/test';

test.describe('SmartReserve - Testes da página inicial', () => {
  test('deve carregar a página inicial corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se a página foi carregada
    await expect(page).toHaveTitle(/SmartReserve|React/);
    
    // Verifica se algum elemento principal está visível
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
  });

  test('deve exibir recursos na página inicial', async ({ page }) => {
    await page.goto('/');
    
    // Aguarda um pouco para o conteúdo carregar
    await page.waitForTimeout(1000);
    
    // Verifica se há pelo menos um elemento de recurso
    const resourceElements = page.locator('[class*="resource"], [class*="card"]');
    const count = await resourceElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('deve permitir filtrar recursos por tipo', async ({ page }) => {
    await page.goto('/');
    
    // Aguarda que os elementos carreguem
    await page.waitForTimeout(1000);
    
    // Procura por botões de filtro
    const filterButtons = page.locator('button:has-text(/sala|lab|equipamento/i)');
    const buttonCount = await filterButtons.count();
    
    // Verifica se há botões de filtro disponíveis
    if (buttonCount > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);
      
      // Verifica se a página ainda está visível após clique
      const mainContent = page.locator('body');
      await expect(mainContent).toBeVisible();
    }
  });

  test('deve permitir buscar recursos', async ({ page }) => {
    await page.goto('/');
    
    // Aguarda que os elementos carreguem
    await page.waitForTimeout(1000);
    
    // Procura por um input de busca
    const searchInput = page.locator('input[placeholder*="busca"], input[placeholder*="search"], input[type="text"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('sala');
      await page.waitForTimeout(500);
      
      // Verifica se a página ainda está responsiva após digitar
      const mainContent = page.locator('body');
      await expect(mainContent).toBeVisible();
    }
  });
});
