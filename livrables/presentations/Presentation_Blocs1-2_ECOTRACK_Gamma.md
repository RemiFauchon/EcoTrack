# ECOTRACK — Soutenance Blocs 1 & 2

Plateforme intelligente de gestion des déchets urbains

**Mastère EADL — Expert en Architecture et Développement Logiciel (RNCP 38822)**
Filière Développement · M2 · 2025-2026
🔗 Démo en ligne : https://ecotrack.lorisdev.fr

> Notes : se présenter (20 s), annoncer le plan — Bloc 1 = cadrage & planification, Bloc 2 = conception & développement. Préciser qu'une démo live clôturera la présentation. Durée 40 min.

---

## Plan

- **Bloc 1 — Planifier et organiser le projet**
  - Contexte & problématique · Audit & risques · Veille → choix techniques
  - Architecture cible · Modélisation · Planification Agile
- **Bloc 2 — Concevoir et développer la solution**
  - Stack & architecture logicielle · Modèle de données · API & sécurité
  - Optimisation des tournées · Temps réel IoT · Tests · Déploiement
- **Démo live** · Compétences transversales · Bilan & perspectives

---

# BLOC 1

Planifier et organiser un projet de développement logiciel

---

## Le contexte : ECOTRACK

Une métropole de **500 000 habitants**, **2 000 conteneurs** à déchets sur **12 secteurs**.

- Collecte **calendaire** : tournées à fréquence fixe, sans connaître le remplissage réel
- **30 à 40 %** des arrêts portent sur des conteneurs quasi vides
- Débordements, coûts élevés (carburant, main d'œuvre), CO₂ évitable

> Notes : poser le problème métier en 1 min. Insister sur « collecte à l'aveugle ».

---

## La problématique

> Comment passer d'une collecte **planifiée à l'aveugle** à une collecte **pilotée par la donnée temps réel** — tout en impliquant les citoyens ?

**4 profils utilisateurs** : Citoyen (15 000), Agent (50), Gestionnaire (10), Administrateur (3).

> Notes : c'est le fil rouge de toute la solution.

---

## Objectifs & indicateurs

| Objectif | Cible |
|---|---|
| Réduction des distances de tournée | **−20 %** |
| Taux de débordement | **< 2 %** |
| Coûts opérationnels | **−15 %** |
| Émissions CO₂ | **−18 %** |
| Disponibilité plateforme | **> 99,5 %** |
| Citoyens actifs engagés | **15 000** |

---

## Audit initial & risques

**SWOT (synthèse)** : stack moderne & équipe Agile (forces) · délai 16 semaines & complexité TSP (faiblesses) · extension multi-villes & IA prédictive (opportunités) · adoption citoyenne & cyberattaques (menaces).

**Risques majeurs maîtrisés** :
- Retard fonctionnalité critique → MVP + priorisation MoSCoW
- Montée en charge IoT → tests de charge dès le sprint 3
- RGPD données géolocalisées → privacy by design

> Notes : montrer la méthode (proba × impact), pas réciter.

---

## Veille → choix techniques justifiés

Comparatifs pondérés (note /10) menés sur sources anglophones (*compétence transversale*).

| Brique | Retenu | Pourquoi |
|---|---|---|
| Frontend | **React 18 + TS** | Écosystème, typage, cartographie |
| Backend | **NestJS** | Modularité, « microservices-ready » |
| Données | **PostgreSQL + PostGIS** | Relationnel + géospatial |
| IoT | **MQTT (Mosquitto)** | Standard léger de l'IoT |

> Notes : le jury veut une justification, pas une mode.

---

## Architecture cible

```
Citoyen/Agent/Gestionnaire (React SPA)
        │ REST + WebSocket
   API NestJS (modules DDD + Auth/RBAC)
   │            │              │
PostgreSQL   Redis        MQTT (capteurs)
 +PostGIS    cache        ingestion temps réel
```

Microservices logiques (DDD), API Gateway, temps réel WebSocket, conteneurisé **Docker**.

> Notes : renvoyer au schéma C4 du DCT (Annexe A).

---

## Modélisation (UML)

- **Cas d'utilisation** : 4 acteurs, 14 use cases (signalement citoyen, tournée agent, optimisation gestionnaire, admin, IoT)
- **Diagramme de classes** : Utilisateur, Conteneur, Zone, Mesure, Tournée, Signalement, Alerte, Gamification
- **Séquences** : remontée IoT → alerte ; authentification JWT + MFA

> Notes : insérer 2 diagrammes UML clés (use cases + une séquence).

---

## Planification Agile

- **Scrum**, sprints de 2 semaines, sur **4 mois**
- Jalons : cadrage (S1-3) → socle (S4-7) → fonctionnalités (S8-11) → tests (S12-14) → soutenance (S15-16)
- Backlog priorisé **MoSCoW**, **KPIs** : couverture tests, latence API, vélocité, uptime

> Notes : transition vers le Bloc 2 → « voici ce qu'on a construit ».

---

# BLOC 2

Concevoir et développer des solutions logicielles

---

## Stack technologique

| Couche | Technologies |
|---|---|
| Frontend | React 18 · TypeScript · Vite · Tailwind · React-Leaflet |
| Backend | NestJS · TypeScript · TypeORM · Socket.io |
| Données | PostgreSQL 15 + PostGIS · Redis |
| IoT | MQTT (Mosquitto) + simulateur de capteurs |
| Sécurité | JWT + refresh · RBAC · MFA (TOTP) · bcrypt |
| Qualité | Jest · ESLint · Docker |

> Notes : un seul langage (TypeScript) front + back = cohérence.

---

## Architecture logicielle

- **Modules NestJS** par domaine (DDD) : Auth, Containers, Measurements, Alerts, Routes, Signalements, Gamification, Reports…
- **Patterns** : Repository (accès données), Strategy (algos TSP), Observer/event-driven (temps réel)
- Façade : guards JWT / RBAC / rate limiting, validation des DTO

> Notes : montrer le découpage en modules (lisibilité, testabilité).

---

## Modèle de données

- Entités : **Utilisateur, Conteneur, Zone, Mesure, Tournée, Signalement, Alerte, Badge, Défi**
- **PostGIS** : position des conteneurs en `geometry(Point, 4326)`, index spatial **GiST**
- Requêtes de proximité (`ST_DWithin`) pour l'optimisation et la carte

> Notes : renvoyer à l'ERD (Annexe B du DCT).

---

## Front-end

- **Dashboard gestionnaire** : carte temps réel (conteneurs colorés par état), KPIs, alertes
- **Espace citoyen** : signalement géolocalisé + **gamification** (points, badges, défis, classement)
- **Vue agent** : tournée + **scan QR** de validation
- **Accessibilité** WCAG 2.1 AA (statut par icône + texte + couleur)

> Notes : c'est la partie la plus visuelle — réserver pour la démo.

---

## Back-end & API

- API **REST** : **40 opérations**, documentées **OpenAPI/Swagger** (`/api/docs`)
- **Sécurité OWASP** : JWT (access 15 min + refresh), **RBAC 4 rôles**, **MFA TOTP**, verrouillage après 5 échecs, bcrypt, rate limiting
- Validation stricte des entrées, requêtes paramétrées (anti-injection)

> Notes : ouvrir Swagger en démo, montrer le « Authorize ».

---

## Optimisation des tournées (TSP)

- Algorithme du **voyageur de commerce** : plus proche voisin + raffinement **2-opt**
- Distances géodésiques (Haversine), seuil de collecte **paramétrable**
- Calcul d'une tournée d'une cinquantaine de conteneurs en **quelques secondes**

> Notes : montrer le bouton « Générer une tournée » → itinéraire tracé sur la carte.

---

## Temps réel & chaîne IoT

```
Capteur → MQTT → Ingestion → calcul d'état → alerte → WebSocket → Dashboard
```

- Simulateur de **2 000 capteurs** (mesure toutes les 15 min)
- Mise à jour de la carte **sans rechargement** (pattern Observer)

> Notes : en démo, la carte bouge toute seule au fil des mesures.

---

## Tests & qualité

- **50 tests** automatisés (Jest), **~80 % de couverture** des services métier
- Module d'optimisation TSP couvert à **100 %**
- Scénarios de sécurité testés (verrouillage, MFA)
- **Docker Compose** : toute la stack démarrable en une commande

> Notes : la couverture > 60 % exigée par le CDC est dépassée.

---

## Déploiement

- Conteneurisé (Docker) : API, front, PostgreSQL+PostGIS, Redis, MQTT
- Reverse proxy + **HTTPS** (Let's Encrypt)
- **En ligne : https://ecotrack.lorisdev.fr** 🌍

> Notes : enchaîner directement sur la démo live.

---

## 🖥️ Démonstration live

1. Connexion (gestionnaire) → **carte temps réel** + KPIs
2. **Générer une tournée** optimisée (TSP)
3. Espace **citoyen** : signalement + points/badges
4. **Swagger** : l'API documentée

> Notes : garder ~5 min. Avoir un plan B (captures) si réseau capricieux.

---

## Compétences transversales

- **Anglais technique** 🇬🇧 : veille et documentation sur sources anglophones
- **Numérique responsable** 🌱 :
  - Réduction des tournées (−20 %) = **moins de CO₂**
  - Optimisation des requêtes, cache, images Docker légères, temps réel par événements (vs polling)

> Notes : le jury évalue ces 2 compétences dans chaque bloc.

---

## Bilan & perspectives

**Atteint** : les 14 cas d'utilisation du CDC, application testée, sécurisée (MFA) et **déployée en ligne**.

**Perspectives (M2)** : bus Kafka, orchestration Kubernetes, observabilité (Prometheus/Grafana), IA prédictive de remplissage, app mobile native.

---

## Merci — Questions

**ECOTRACK** · https://ecotrack.lorisdev.fr · Mastère EADL — Développement

> Notes : préparer les questions probables — PostgreSQL vs NoSQL, microservices vs monolithe, montée en charge IoT, sécurité MFA, éco-conception. Garder le DCT + diagrammes en annexe sous la main.
