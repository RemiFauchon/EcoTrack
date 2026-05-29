# ECOTRACK — Soutenance Blocs 1 & 2

Plateforme IoT de gestion intelligente des déchets urbains

**Mastère EADL — Expert en Architecture et Développement Logiciel (RNCP 38822)**
Filière Développement · M1 · Année 2025-2026

> Notes orateur : se présenter en 20 s, annoncer le plan (Bloc 1 = cadrage & planification, Bloc 2 = conception & développement), durée 40 min.

---

## Plan de la soutenance

- **Bloc 1 — Planifier et organiser le projet**
  - Contexte & problématique
  - Audit initial (SWOT, risques)
  - Veille technologique
  - Architecture cible & modélisation
  - Planification Agile & pilotage
- **Bloc 2 — Concevoir et développer la solution**
  - Stack & architecture logicielle
  - Front-end, back-end & API
  - Sécurité, tests & qualité
  - Documentation & livrables
- Compétences transversales : anglais technique · numérique responsable

---

# BLOC 1

Planifier et organiser un projet de développement logiciel

---

## Le contexte : ECOTRACK

Une métropole de **500 000 habitants** veut moderniser sa gestion des déchets.

- **2 000 conteneurs** à équiper de capteurs connectés
- **180 millions de mesures/an** à collecter et exploiter
- Aujourd'hui : tournées **fixes**, sans visibilité temps réel

> Notes : poser le décor en 1 min. Insister sur l'échelle (volume) = vrai enjeu d'ingénierie.

---

## La problématique métier

> « Comment passer d'une collecte planifiée à l'aveugle à une collecte **pilotée par la donnée temps réel** ? »

Douleurs actuelles :
- **Collecte inefficace** — tournées non optimisées
- **Débordements** — pas de visibilité sur le niveau de remplissage
- **Coûts élevés** — carburant, main d'œuvre, maintenance
- **Impact environnemental** — émissions CO₂ évitables

---

## Objectifs & indicateurs de succès

| Objectif | Cible |
|---|---|
| Réduction des coûts de collecte | **−20 à −30 %** |
| Débordements de conteneurs | **< 5 %** des incidents |
| Calcul d'une tournée optimisée (50 conteneurs) | **< 30 s** |
| Analytics temps réel pour les gestionnaires | Latence **< 2 s** |

> Notes : ce sont les KPIs métier ; on y reviendra côté technique au Bloc 2.

---

## Audit initial — Analyse SWOT

| Forces | Faiblesses |
|---|---|
| Équipe Agile, stack moderne | Délai serré (16 semaines) |
| Sponsor engagé, budget cohérent | Peu d'expérience IoT initiale |
| Technologies matures | Algorithme TSP complexe |

| Opportunités | Menaces |
|---|---|
| Extension à d'autres villes | Cyberattaques (déni, ransomware) |
| IA prédictive de remplissage | Pannes / vandalisme capteurs |
| Image RSE, Open Data | Adoption faible des chauffeurs |

---

## Cartographie des risques majeurs

- **R1 — Retard sur une fonctionnalité critique** · Criticité ÉLEVÉE
  → MVP simplifié (algo glouton avant génétique), priorisation MoSCoW, buffer 10 %
- **R2 — Latence d'ingestion IoT > seuil** · MOYENNE
  → file MQTT + montée en charge testée dès le sprint 2
- **R3 — Départ d'un membre clé** · MOYENNE
  → documentation continue (ADR, README), pair programming
- **R4 — Dépassement budget cloud** · MOYENNE
  → containerisation, dimensionnement progressif, alertes coûts

> Notes : montrer la méthode (proba × impact = criticité), pas réciter la liste.

---

## Veille technologique — méthode

- **Sources** : GitHub Trending, doc officielle, ANSSI/CNIL/OWASP, conférences
- **Outils** : Feedly (RSS), Google Alerts, veille hebdo structurée (Notion)
- **Sources anglophones** intégrées → *compétence transversale anglais technique*
- **Critères de sélection** : maturité, communauté, adéquation au besoin ECOTRACK

> Notes : insister sur la rigueur de la démarche, pas juste « j'ai lu des articles ».

---

## Veille — choix technologiques argumentés

Comparatif pondéré (note /10 sur 5 critères) :

| Brique | Candidats évalués | Retenu | Pourquoi |
|---|---|---|---|
| Frontend | React · Vue · Angular | **React 18** | Écosystème, communauté, TS |
| Backend | Node/Express · FastAPI · Spring | **FastAPI / Node** | Perf async, productivité |
| Base de données | PostgreSQL · MongoDB · TimescaleDB | **PostgreSQL + PostGIS** | Géospatial + relationnel |

> Notes : le jury veut une *justification*, pas une mode. Relier chaque choix au besoin (géospatial → PostGIS).

---

## Architecture cible (vision haut niveau)

```
[Capteurs IoT] --MQTT--> [Service IoT] --> [PostgreSQL/PostGIS + TimescaleDB]
                                              ^
[Front React] <--REST/WebSocket--> [API] --> [Redis cache]
                                   [Service Optimisation TSP]
                                   [Auth JWT/2FA] [Notifications]
```

- Architecture **microservices** (5 services) · **Docker** · Nginx reverse proxy
- Principes : modularité · scalabilité horizontale · résilience · sécurité

> Notes : remplacer ce bloc texte par ton vrai schéma (Draw.io / Excalidraw) dans Gamma.

---

## Modélisation — choix UML

Méthode retenue : **UML** (architecture orientée objet).

- **Diagramme de cas d'utilisation** — acteurs : Gestionnaire, Chauffeur, Admin, Système IoT
- **Diagramme de classes** — Conteneur, Mesure, Tournée, Alerte, Utilisateur
- **Diagrammes de séquence** — ex. « Remontée d'alerte IoT » et « Authentification 2FA »

> Notes : insérer les 3 diagrammes en images. Justifier UML (objet) vs BPMN (process) vs MERISE (données).

---

## Planification Agile — Scrum

- **Cadre Scrum** : sprints de **2 semaines**, **8 sprints** = 16 semaines
- **Backlog** : 15-20 user stories, priorisation **MoSCoW**, estimation en **story points**
- Exemple : *« En tant que gestionnaire, je veux voir la carte temps réel afin de visualiser les niveaux »* — MUST · 8 SP

| Sprint | Objectif |
|---|---|
| S1-2 | Socle technique, CI/CD |
| S3-4 | Module IoT & ingestion |
| S5-6 | Interface gestionnaire |
| S7-8 | Optimisation tournées (TSP) |

---

## Pilotage — KPIs de suivi

- **Vélocité** : 25 ± 3 SP / sprint
- **Couverture de tests** : ≥ 80 %
- **Temps de réponse API** : < 200 ms
- **Disponibilité** : ≥ 99,5 %
- **Bugs critiques (P1) ouverts** : 0

> Notes : transition vers le Bloc 2 → « voici comment on a construit la solution ».

---

# BLOC 2

Concevoir et développer des solutions logicielles

---

## Stack technologique retenue

| Couche | Technologie | Justification |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Typage, écosystème, Design System |
| **Backend** | FastAPI / Node.js (microservices) | Perf async, ingestion IoT |
| **Données** | PostgreSQL 15 + PostGIS, TimescaleDB | Géospatial + séries temporelles |
| **Cache / temps réel** | Redis + WebSocket (Socket.io) | Sessions, push live |
| **Infra** | Docker + Docker Compose, Nginx | Reproductibilité, scalabilité |

---

## Architecture logicielle 3-tiers

- **Tier 1 — Présentation** : SPA React (carte Leaflet, dashboards Recharts)
- **Tier 2 — Métier** : 5 microservices (IoT · API · Optimisation · Auth · Notifications)
- **Tier 3 — Données** : PostgreSQL/PostGIS · TimescaleDB · Redis

**Patterns appliqués** : Repository · Strategy (algos d'optimisation interchangeables) · Observer (WebSocket) · Factory

> Notes : relier chaque pattern à un besoin réel (Strategy → glouton OU génétique).

---

## Modèle de données

- Tables clés : `users`, `containers`, `measurements`, `routes`, `alerts`
- **Index géospatiaux GiST** (PostGIS) → requêtes spatiales rapides
- **Partitionnement** des mesures par mois + compression TimescaleDB
- Schéma entité-relation (ERD) → *à joindre en annexe*

> Notes : montrer un extrait d'ERD, pas tout le schéma.

---

## Développement Front-end

- **Design System** : palette, typographie, composants réutilisables (MUI + Tailwind)
- **Accessibilité WCAG 2.1 AA** : contrastes, navigation clavier, attributs ARIA
- **Performance** : score Lighthouse, Core Web Vitals, lazy loading, code splitting
- **Temps réel** : carte des conteneurs mise à jour en live (WebSocket)

> Notes : l'accessibilité est exigée par le référentiel — ne pas l'oublier.

---

## Back-end & conception de l'API

- API **REST** documentée via **OpenAPI / Swagger**
- Conventions de nommage, versionnage, gestion des codes HTTP & erreurs
- Validation des entrées (Pydantic / schémas JSON)
- **Rate limiting** : 1000 req/min par utilisateur

> Notes : montrer 1-2 endpoints significatifs (ex. `GET /containers`, `POST /routes/optimize`).

---

## Sécurité — OWASP Top 10

- **Authentification** : JWT (access 15 min + refresh 7 j) + **2FA TOTP**
- **Autorisation** : RBAC (Admin · Gestionnaire · Chauffeur)
- Protection injections, CORS, headers de sécurité, gestion des secrets
- **Haute disponibilité** intégrée dès la conception

> Notes : citer 3-4 risques OWASP concrets et la parade côté ECOTRACK.

---

## Tests & assurance qualité

- **Pyramide de tests** : unitaires → intégration → end-to-end
- Objectif de **couverture ≥ 80 %**
- **Tests de sécurité** : SAST (analyse statique), DAST (dynamique), audit des dépendances
- Rapports de couverture → *en annexe*

> Notes : montrer un rapport de couverture ou un run CI vert.

---

## Documentation & livrables

- `README` complet · guide d'installation · guide contributeur
- **Documentation API** (Swagger) · guide utilisateur
- **ADR** (Architecture Decision Records) — traçabilité des choix
- Code versionné (GitHub + GitFlow), CI/CD GitHub Actions

---

## Compétences transversales

- **Anglais technique** 🇬🇧
  - Veille sur sources anglophones, doc technique en anglais, références citées
- **Numérique responsable** 🌱
  - Éco-conception : optimisation des requêtes, compression des données, mutualisation conteneurs Docker
  - Réduction des tournées = **−CO₂** (cœur même du projet)

> Notes : le jury évalue ces deux compétences dans CHAQUE bloc — les rendre visibles.

---

## Bilan & perspectives

**Atteint**
- Cadrage complet (Bloc 1) + solution applicative fonctionnelle (Bloc 2)
- Architecture scalable, sécurisée, testée

**Perspectives**
- IA prédictive de remplissage (maintenance préventive)
- Application mobile chauffeur (mode offline)
- Extension multi-villes, Open Data citoyen

---

## Merci — Questions

**ECOTRACK** · Mastère EADL · Filière Développement

> Notes : préparer les questions probables — choix de PostgreSQL vs NoSQL, pourquoi microservices, gestion de la montée en charge IoT, sécurité 2FA, éco-conception. Garder 2-3 slides d'annexe (ERD, schéma archi, capture d'écran).
