# ECOTRACK — Tests end-to-end (Playwright)

Scénarios couverts (parcours utilisateur critiques) :

| Fichier | Use case CDC |
|---|---|
| `tests/login.spec.ts` | UC-T01 — authentification |
| `tests/dashboard.spec.ts` | UC-G01 (TSP) · UC-G02 (monitoring) |
| `tests/citizen.spec.ts` | UC-C02 · UC-C03 (gamification + défis) |
| `tests/agent.spec.ts` | UC-A01 — réception de tournée |
| `tests/admin.spec.ts` | UC-AD01 — gestion des utilisateurs |

## Lancer en local

```bash
# 1. Démarrer la stack (dans app/)
cd .. && docker compose up -d

# 2. Installer Playwright + ses navigateurs
cd e2e
npm install
npx playwright install --with-deps chromium

# 3. Lancer les tests
npm test
# ou en mode visuel :
npm run test:headed
# rapport HTML après exécution :
npm run report
```

## Variables
- `BASE_URL` (par défaut `http://localhost:5173`) — l'URL du frontend à tester.

## En intégration continue
Les E2E sont exécutés automatiquement par GitHub Actions (`.github/workflows/ci.yml`,
job **e2e**) après les jobs de build du back et du front. Le rapport Playwright est
publié comme artefact.
