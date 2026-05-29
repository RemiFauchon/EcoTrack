# ECOTRACK — Plateforme intelligente de gestion des déchets urbains

Projet fil rouge — Mastère EADL (Expert en Architecture et Développement Logiciel, RNCP 38822), filière Développement.
Implémentation de référence du cahier des charges ECOTRACK (`../livrables/cahier-des-charges/`).

## 🎯 Objectif

Faire passer la collecte des déchets d'une logique **calendaire** à une logique **pilotée par la donnée temps réel** :
2 000 conteneurs connectés (capteurs ultrasoniques, mesure MQTT toutes les 15 min), optimisation des tournées
(TSP + 2-opt), engagement citoyen par la gamification.

## 🏗️ Architecture (MVP)

```
                ┌────────────────────────────────────────────┐
  Citoyens /    │  Frontend React + TypeScript + Tailwind      │
  Gestionnaires │  (Dashboard carte temps réel, gamification)  │
                └───────────────┬──────────────────────────────┘
                                │ REST + WebSocket
                ┌───────────────▼──────────────────────────────┐
                │  Backend NestJS (API REST + Socket.io)        │
                │  Modules DDD : Auth · Users · Containers ·     │
                │  Zones · Measurements · Alerts · Routes(TSP) · │
                │  Signalements · Gamification · Reports · IoT   │
                └───┬───────────────┬───────────────┬───────────┘
                    │               │               │
          ┌─────────▼──┐   ┌────────▼───┐   ┌────────▼────────┐
          │ PostgreSQL │   │   Redis    │   │ Mosquitto (MQTT)│
          │ + PostGIS  │   │ cache/leadb│   │ ingestion IoT   │
          └────────────┘   └────────────┘   └─────────────────┘
```

## 🧱 Stack

| Couche | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React-Leaflet, Recharts |
| Backend | NestJS 10, TypeScript, TypeORM, Socket.io |
| Données | PostgreSQL 15 + PostGIS, Redis |
| IoT | MQTT (Mosquitto) + simulateur de capteurs |
| Sécurité | JWT (access/refresh), RBAC 4 rôles, bcrypt, rate limiting |
| Qualité | Jest (unit/e2e), ESLint/Prettier, GitHub Actions (CI) |

## 🚀 Démarrage rapide

```bash
cp .env.example .env
docker compose up --build
```

- API : http://localhost:3000 — doc Swagger : http://localhost:3000/api/docs
- Frontend : http://localhost:5173

## 📁 Structure

```
app/
├── backend/        # API NestJS (modules DDD, TypeORM, WebSocket, MQTT)
├── frontend/       # SPA React (dashboard, carte, gamification)
├── infra/          # config Mosquitto, scripts d'init
├── docker-compose.yml
└── .env.example
```

## 👥 Rôles (RBAC)

`CITOYEN` · `AGENT` · `GESTIONNAIRE` · `ADMIN` — voir le cahier des charges pour les use cases associés.

## 📌 Périmètre MVP

Auth+RBAC · conteneurs & carte temps réel · ingestion IoT (MQTT) + alertes seuils · optimisation de tournées (TSP/2-opt) ·
dashboard gestionnaire · signalement citoyen · gamification (points/badges/leaderboard) · tests + CI.
