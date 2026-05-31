import { test, expect } from '@playwright/test';

/** UC-T01 : authentification — connexion gestionnaire (comptes démo pré-remplis). */
test('connexion gestionnaire et redirection vers le tableau de bord', async ({ page }) => {
  await page.goto('/login');
  // La page affiche la marque ECOTRACK
  await expect(page.getByText('ECOTRACK').first()).toBeVisible();
  // Mot de passe et email gestionnaire pré-remplis -> on soumet directement
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /Pilotage/i })).toBeVisible();
});

test('rejet d’identifiants invalides', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="password"]').fill('mauvais-mdp');
  await page.getByRole('button', { name: /Se connecter/i }).click();
  await expect(page.getByText(/invalid|incorrec/i)).toBeVisible();
});
