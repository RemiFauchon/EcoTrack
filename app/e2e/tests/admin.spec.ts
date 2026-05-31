import { test, expect } from '@playwright/test';

/** UC-AD01 : administrateur — gestion des utilisateurs. */
test('connexion admin et accès à la gestion des utilisateurs', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('admin@ecotrack.fr');
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await page.waitForURL(/\/dashboard/);

  // L'administrateur a un lien Admin dans la nav
  await page.getByRole('link', { name: /Admin/i }).first().click();
  await page.waitForURL(/\/admin/);

  await expect(page.getByRole('heading', { name: /Administration/i })).toBeVisible();
  await expect(page.getByText(/Utilisateurs/i).first()).toBeVisible();
});
