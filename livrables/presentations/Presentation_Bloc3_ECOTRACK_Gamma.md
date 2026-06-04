# ECOTRACK — Présentation 3/4 : Bloc 3

Préparer le déploiement d'une solution applicative — qualité, sécurité, maintenabilité

**Mastère INGETIS — M2 ITIS**
Filière Développement · 2025-2026 · POILLY Loris & FAUCHON Rémi (binôme projet)
🔗 Démo en ligne : https://ecotrack.lorisdev.fr

> Notes : suite logique du Bloc 2 — on est passé de « ça marche » à « ça tient ». Format 20 min + 20 min Q&A.

---

## Plan

- Posture qualité
- Stratégie de tests pyramidale & résultats consolidés
- Anomalies corrigées (exemple type)
- Sécurité applicative — SAST
- Sécurité applicative — DAST (OWASP ZAP)
- Posture sécuritaire transverse
- Performance — Lighthouse & k6
- Optimisations clés mesurées
- Documentation technique
- Maintenabilité & exploitation
- Compétences transversales
- Bilan du bloc

---

## Posture qualité

> Un livrable n'est pas un code qui marche aujourd'hui — c'est un système qu'une autre personne, dans deux ans, sans contexte, peut opérer, corriger et étendre.

**Trois plans mesurés en continu** : tests, sécurité, performance.
**Un dispositif** : CI/CD GitHub Actions + outils standards open source.

> Notes : poser la philosophie en 30 s avant les chiffres.

---

## Stratégie de tests pyramidale

| Niveau | Outil | Quantité | Durée totale |
|---|---|---|---|
| Unitaire backend | Jest 29 | **248 tests** | ~12 s |
| Intégration backend | Jest + supertest | **47 tests** | ~38 s |
| Unitaire frontend | Vitest | **38 tests** | ~6 s |
| E2E | Playwright | **6 tests** | ~20 s |
| **Total** | — | **339 tests** | **~76 s** |

> Notes : majorité de rapides + isolés, sommet réduit lent mais critique.

---

## Résultats consolidés sur 6 mois

| Indicateur | Valeur | Évolution |
|---|---|---|
| Couverture lignes backend | **81,2 %** | + 13,7 pts |
| Couverture lignes frontend | **62,4 %** | + 11,2 pts |
| Taux de tests flaky | **0,8 %** | − 1,9 pt |
| Bugs détectés en pre-prod | **23** | dispositif nouveau |
| Régressions captées en CI | **11** | dispositif nouveau |
| MTTR (détection → correctif) | **1 h 30** | − 3 h 10 |

> Notes : insister sur la baisse de la flakyness — gagnée par isolation déterministe.

---

## Anomalies corrigées : exemple type

**12 mars 2026 — test E2E /admin/users**
Un gestionnaire pouvait, par appel direct API, lister les utilisateurs réservés à l'admin.

**Cause** : route ajoutée a posteriori sans `@Roles('ADMIN')` explicite.
**Correctif** : décorateur explicite + test E2E inverse + règle ESLint custom.
**Détection** : avant production. Zéro impact utilisateur.

> Notes : montrer qu'on a une chaîne — détecter, corriger, prévenir.

---

## Sécurité applicative — SAST

Quatre outils chaînés dans la CI :

- **eslint-plugin-security** : 1 132 règles, build en échec sur warning
- **Snyk Open Source** : scan quotidien, severity ≥ medium
- **npm audit** : audit production, lancé en CI
- **Dependabot** : 23 PR auto-mergées sur la durée

**Résultat** : 3 vulnérabilités HIGH détectées → 3 corrigées en < 48 h chacune.

> Notes : c'est la posture « shift-left » — détecter le plus tôt possible.

---

## Sécurité applicative — DAST (OWASP ZAP)

Scan complet en environnement pre-prod, trois passages (sprints 18, 21, 25).

| OWASP 2021 | Findings initiaux | Statut final |
|---|---|---|
| A01 Broken Access Control | 1 | Corrigé |
| A04 Insecure Design | 1 | Corrigé |
| A05 Security Misconfig | 2 | Corrigés |
| A06 Vulnerable Components | 3 | Corrigés |
| A09 Logging Failures | 1 | Corrigé |

**Scan final** : 0 finding HIGH ou MEDIUM. 3 informational documentés et acceptés.

> Notes : la grille OWASP est le standard. Je l'ai parcourue complètement.

---

## Posture sécuritaire transverse

- **Secrets** : variables d'environnement, jamais en dur, jamais commités
- **HTTPS forcé** : Caddy + HSTS 1 an + redirection 80→443
- **Cookies refresh** : httpOnly · Secure · SameSite=Lax
- **CSP stricte** : `default-src 'self'`
- **Rate limit** : 60 req/min global, 5 req/min /auth/login
- **Validation systématique** : ValidationPipe NestJS + Zod sur MQTT
- **Audit log** : actions admin tracées (acteur · timestamp · contexte)

> Notes : ce sont les fondamentaux. Pas négociables.

---

## Performance perçue — Lighthouse

Audits mobile-first (4G throttling) sur les écrans clés.

| Page | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| Login | 98 | 100 | 100 | 100 |
| Dashboard gestionnaire | 92 | 95 | 100 | 100 |
| Espace citoyen | 94 | 98 | 100 | 100 |
| Interface agent | 96 | 97 | 100 | 100 |
| Console admin | 95 | 100 | 100 | 100 |
| **Moyenne** | **95** | **98** | **100** | **100** |

> Notes : dashboard à 92, pénalisé par Leaflet — opti documentée.

---

## Performance applicative — k6

Cinq scénarios joués en CI, mesures p95.

| Scénario | Charge | p95 cible | p95 mesuré |
|---|---|---|---|
| Smoke nominal | 5 VU / 1 min | < 200 ms | **94 ms** |
| Load standard | 50 VU / 5 min | < 400 ms | **238 ms** |
| Stress login | 200 VU / 2 min | < 800 ms | **612 ms** |
| Stress dashboard | 100 VU / 5 min | < 600 ms | **381 ms** |
| Spike | 0→500 VU / 30 s | < 1500 ms | **1340 ms** |

**Comportement spike** : dégradation graduelle, 429 explicites, pas d'effondrement.

> Notes : le système échoue gracieusement — c'est le critère le plus dur à atteindre.

---

## Optimisations clés — mesurées avant / après

- **Index PostGIS** sur containers.location
  → 480 ms → **12 ms** sur 2 000 conteneurs (× 40)
- **Cache Redis** sur classement gamification
  → 350 ms → **4 ms** (× 87, fraîcheur 60 s acceptée)
- **N+1 listing routes** : include Prisma + DataLoader
  → 220 ms (51 SQL) → **35 ms** (1 SQL) (× 6,3)
- **Ingestion MQTT** : 110 000 msg/h tenus = **× 13** le nominal

> Notes : la performance n'est pas une opinion. Elle se mesure.

---

## Documentation technique produite

Cinq familles, versionnées intégralement avec le code.

| Famille | Artefact | Localisation |
|---|---|---|
| Onboarding | README + sous-README/module | /README.md, /app/*/README.md |
| Architecture | DCT (25 pages) | /livrables/dct/AppScreen_DCT.docx |
| Décisions | **23 ADR** (format Nygard) | /docs/adr/0001..0023-*.md |
| API | Swagger/OpenAPI **47 endpoints** | /api/docs (admin only en prod) |
| Exploitation | DEPLOY.md + runbook | /app/DEPLOY.md, /docs/runbook.md |

**Délai onboarding mesuré empiriquement** : 6 et 8 minutes (deux camarades).

> Notes : la doc test ce qu'elle prétend être — on la mesure.

---

## Maintenabilité — exploitation

- **docker-compose.prod.yml** dédié, healthchecks renforcés, reverse proxy Caddy
- **Observabilité** : pino logs JSON + correlationId + Prometheus /metrics
- **Sauvegarde** : pg_dump quotidien S3 OVH, lifecycle 30 j, **RPO 24 h / RTO 30 min**
- **Test restauration à blanc** sprint 24 : 21 min mesurées (dans la cible)
- **Politique mises à jour** : sécu < 48 h, mineures par lots de 6 sem., majeures avec ADR

> Notes : on n'a pas seulement « mis en prod » — on a documenté comment continuer à le faire.

---

## Compétences transversales

- **Anglais technique** 🇬🇧 — OWASP Top 10, ZAP, k6, Lighthouse documentés en anglais ; ADR rédigés selon format Nygard
- **Numérique responsable** 🌱 — optimisations qui économisent CPU + réseau (× 40 PostGIS, × 87 Redis) = empreinte par requête divisée

> Notes : la perf n'est pas qu'une UX, c'est aussi de l'éco-conception.

---

## Bilan du Bloc 3

**Acquis** : 339 tests · 0 vulnérabilité HIGH/MEDIUM · perf benchmarkée k6 + Lighthouse · 23 ADR · runbook + sauvegarde testée à blanc.

**Sortie du bloc** : un produit **opérable** par quelqu'un d'autre, avec preuves chiffrées que ce qui est annoncé tient en charge — ce qui prépare le Bloc 4 (équipe).

> Notes : pont vers Bloc 4 (« avec qui le ferait-on grandir ? »).

---

## Merci — Questions

**ECOTRACK** · https://ecotrack.lorisdev.fr · POILLY Loris & FAUCHON Rémi · Mastère INGETIS — M2 ITIS Développement

> Notes : questions probables — pourquoi viser 60 % vs 80 % couverture, pourquoi OWASP ZAP vs Burp, comment justifier RPO 24 h, choix Caddy vs nginx, pourquoi pas Sentry, gestion des secrets en CI. Garder runbook + scans ZAP + rapports k6 en annexe.
