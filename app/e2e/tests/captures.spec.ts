import { test, expect, Page } from '@playwright/test';
import path from 'node:path';

const CAPTURES_DIR = path.resolve(__dirname, '../../../livrables/captures');

async function loginAs(page: Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill('Password123');
  await page.getByRole('button', { name: /Se connecter/i }).click();
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(CAPTURES_DIR, `${name}.png`), fullPage: true });
}

test.describe('Captures ECOTRACK pour rapport fil rouge', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('01 — page de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('ECOTRACK').first()).toBeVisible();
    await shot(page, '01_login');
  });

  test('02 — tableau de bord gestionnaire (KPI + carte)', async ({ page }) => {
    await loginAs(page, 'gestionnaire@ecotrack.fr');
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await page.waitForTimeout(2500);
    await shot(page, '02_dashboard_gestionnaire');
  });

  test('03 — optimisation de tournée (TSP)', async ({ page }) => {
    await loginAs(page, 'gestionnaire@ecotrack.fr');
    await page.waitForURL(/\/dashboard/);
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /Générer une tournée/i }).click();
    await expect(page.getByText(/arrêts/i)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);
    await shot(page, '03_optimisation_tournee');
  });

  test('04 — interface agent (tournées du jour)', async ({ page }) => {
    await loginAs(page, 'agent@ecotrack.fr');
    await page.waitForURL(/\/agent/);
    await expect(page.getByRole('heading', { name: /tournées/i })).toBeVisible();
    await page.waitForTimeout(1500);
    await shot(page, '04_agent_tournees');
  });

  test('05 — espace citoyen (gamification + classement)', async ({ page }) => {
    await loginAs(page, 'citoyen@ecotrack.fr');
    await page.waitForURL(/\/citoyen/);
    await expect(page.getByText(/Mes points/i)).toBeVisible();
    await page.waitForTimeout(1500);
    await shot(page, '05_citoyen_gamification');
  });

  test('06 — administration des utilisateurs', async ({ page }) => {
    await loginAs(page, 'admin@ecotrack.fr');
    await page.waitForURL(/\/dashboard/);
    await page.getByRole('link', { name: /Admin/i }).first().click();
    await page.waitForURL(/\/admin/);
    await expect(page.getByRole('heading', { name: /Administration/i })).toBeVisible();
    await page.waitForTimeout(1500);
    await shot(page, '06_admin_users');
  });
});
