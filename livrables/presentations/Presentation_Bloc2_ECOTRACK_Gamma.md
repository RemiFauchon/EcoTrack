# ECOTRACK — Présentation 2/4 : Bloc 2

Concevoir et développer des solutions logicielles

**Mastère INGETIS — M2 ITIS**
Filière Développement · 2025-2026 · POILLY Loris & FAUCHON Rémi (binôme projet)
🔗 Démo en ligne : https://ecotrack.lorisdev.fr

> Notes : suite du Bloc 1. Cible : montrer un produit qui marche, pas seulement une architecture sur slide. Démo live à mi-parcours. Format 20 min + 20 min Q&A.

---

## Plan

- Stack technologique
- Architecture logicielle (modules NestJS + patterns)
- Modèle de données géospatial
- Front-end (rôles + accessibilité)
- API REST sécurisée
- Optimisation des tournées (TSP)
- Temps réel & chaîne IoT
- Tests & déploiement
- **Démonstration live**
- 📱 App iOS native (Capacitor)
- Compétences transversales
- Bilan du bloc

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

> Notes : un seul langage (TypeScript) front + back = cohérence et coût cognitif réduit.

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

## CI/CD & déploiement

- Conteneurisé (Docker) : API, front, PostgreSQL+PostGIS, Redis, MQTT
- Reverse proxy + **HTTPS** (Let's Encrypt)
- **CI GitHub Actions** : lint + tests en < 6 min, déploiement en < 4 min sur main
- **En ligne : https://ecotrack.lorisdev.fr** 🌍

> Notes : le déploiement est intégré au cycle dev — c'est la base du Bloc 3 ensuite.

---

## 🖥️ Démonstration live

1. Connexion (gestionnaire) → **carte temps réel** + KPIs
2. **Générer une tournée** optimisée (TSP)
3. Espace **citoyen** : signalement + points/badges
4. **Swagger** : l'API documentée

> Notes : garder ~5 min. Avoir un plan B (captures du dossier livrables/captures/) si réseau capricieux.

---

## 📱 App iOS native (Capacitor) — sprint additionnel

Pour répondre à la **lecture littérale** du CDC (§111 « application mobile installée »), nous avons embarqué le frontend React dans une **enveloppe iOS native** via **Capacitor 8**.

- **Zéro réécriture** : 100 % du code React/TS conservé
- Stack iOS : **Swift Package Manager**, plugins Geolocation, Network, StatusBar, App, Preferences
- **Scan QR** : double implémentation BarcodeDetector → fallback **jsQR** (compatibilité WKWebView iOS)
- Détection runtime `Capacitor.isNativePlatform()` → API prod `ecotrack.lorisdev.fr`
- Build & install sur **simulateur iPhone 17 Pro** (iOS 26.5) en < 4 h

**Captures en annexe E du rapport** : icône home iOS · login · dashboard temps réel · scan QR actif.

> Notes : en démo si projecteur OK, lancer le simulateur Xcode (~30 s boot). Sinon montrer les captures. Argument clé : l'app est **réellement installable**, l'icône apparaît, le binaire est packaged — la mention « mobile installée » du CDC est honorée sans dette technique.

---

## Compétences transversales

- **Anglais technique** 🇬🇧 — documentation API en anglais, RFC HTTP/MQTT, libs anglophones, choix de nommage technique en EN
- **Numérique responsable** 🌱 — un seul langage = builds + RAM réduits ; cache Redis = moins de calculs ; image Docker légère ; événementiel (vs polling) = moins de requêtes inutiles

> Notes : ces compétences ne sont pas un ajout — elles sont structurelles dans les choix techniques.

---

## Bilan du Bloc 2

**Acquis** : 14 use cases livrés · 40 endpoints documentés Swagger · sécurité OWASP intégrée by design · application **déployée en ligne** + **build iOS native installable**.

**Sortie du bloc** : un produit **utilisable** par 4 rôles distincts, sur lequel on peut désormais mesurer qualité, sécurité et performance — c'est le sujet du Bloc 3.

> Notes : pont vers Bloc 3 (« est-ce que ça tient ? »).

---

## Merci — Questions

**ECOTRACK** · https://ecotrack.lorisdev.fr · POILLY Loris & FAUCHON Rémi · Mastère INGETIS — M2 ITIS Développement

> Notes : questions probables — PostgreSQL vs NoSQL, monolithe modulaire vs microservices, choix Caddy, sécurité JWT/MFA, éco-conception, montée en charge IoT, WebSocket vs SSE. Garder DCT + Swagger + captures en annexe.
