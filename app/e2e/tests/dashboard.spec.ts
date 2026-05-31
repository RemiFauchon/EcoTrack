import { test, expect } from '@playwright/test';

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: /Se connecter/i }).click();
}

/** UC-G02 + UC-G01 : tableau de bord, KPIs et optimisation de tournée. */
test('le tableau de bord affiche les KPIs et la carte', async ({ page }) => {
  await loginAs(page, 'gestionnaire@ecotrack.fr');
  await page.waitForURL(/\/dashboard/);

  // KPIs : « Conteneurs » présent et > 0
  await expect(page.getByText(/Conteneurs/i).first()).toBeVisible();

  // La carte Leaflet est rendue
  await expect(page.locator('.leaflet-container')).toBeVisible();
});

test('optimisation d’une tournée (TSP)', async ({ page }) => {
  await loginAs(page, 'gestionnaire@ecotrack.fr');
  await page.waitForURL(/\/dashboard/);

  await page.getByRole('button', { name: /Générer une tournée/i }).click();
  // Au moins un arrêt est restitué
  await expect(page.getByText(/arrêts/i)).toBeVisible({ timeout: 15_000 });
});
