import { test, expect } from '@playwright/test';

/** UC-A01 : agent reçoit ses tournées. */
test('connexion agent et accès aux tournées', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('agent@ecotrack.fr');
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await page.waitForURL(/\/agent/);

  await expect(page.getByRole('heading', { name: /tournées/i })).toBeVisible();
});
