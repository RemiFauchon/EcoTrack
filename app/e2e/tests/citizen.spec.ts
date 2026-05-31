import { test, expect } from '@playwright/test';

/** UC-C02 + UC-C03 : espace citoyen, points, badges, défis collectifs. */
test('connexion citoyen et affichage de la gamification', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('citoyen@ecotrack.fr');
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await page.waitForURL(/\/citoyen/);

  // Le bloc de gamification
  await expect(page.getByText(/Mes points/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Classement/i })).toBeVisible();
  // Les défis collectifs
  await expect(page.getByRole('heading', { name: /Défis collectifs/i })).toBeVisible();
});
