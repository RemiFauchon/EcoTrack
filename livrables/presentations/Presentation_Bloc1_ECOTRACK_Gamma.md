# ECOTRACK — Présentation 1/4 : Bloc 1

Planifier et organiser un projet de développement logiciel

**Mastère INGETIS — M2 ITIS**
Filière Développement · 2025-2026 · POILLY Loris & FAUCHON Rémi (binôme projet)
🔗 Démo en ligne : https://ecotrack.lorisdev.fr

> Notes : première des 4 soutenances. Cadrer en 30 s : Bloc 1 = comment on passe d'un besoin métier à un projet techniquement construit, pas seulement rêvé. Format 20 min + 20 min Q&A.

---

## Plan

- Contexte & problématique métier
- Objectifs & indicateurs cibles
- Audit initial & gestion des risques
- Veille technologique → choix justifiés
- Architecture cible & modélisation UML
- Planification Agile & jalons
- Compétences transversales
- Bilan du bloc

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

> Notes : chaque KPI est traçable jusqu'à un test ou une métrique dans la solution.

---

## Audit initial & risques

**SWOT (synthèse)** : stack moderne & équipe Agile (forces) · délai 16 semaines & complexité TSP (faiblesses) · extension multi-villes & IA prédictive (opportunités) · adoption citoyenne & cyberattaques (menaces).

**Risques majeurs maîtrisés** :
- Retard fonctionnalité critique → MVP + priorisation MoSCoW
- Montée en charge IoT → tests de charge dès le sprint 3
- RGPD données géolocalisées → privacy by design

> Notes : montrer la méthode (proba × impact), pas réciter la liste.

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
- Backlog priorisé **MoSCoW**, **KPIs de pilotage** : couverture tests, latence API, vélocité, uptime

> Notes : la planification n'est pas un Gantt fixe, c'est un dispositif de re-priorisation.

---

## Compétences transversales

- **Anglais technique** 🇬🇧 — veille comparative sur sources anglophones (RFC, OWASP, blogs ingénierie)
- **Numérique responsable** 🌱 — critère d'éco-conception intégré dès les choix techniques (cible CO₂, réduction kilométrage)

> Notes : ces 2 compétences sont évaluées dans chaque bloc — je les rappelle dans chaque deck.

---

## Bilan du Bloc 1

**Acquis** : 14 use cases cadrés · 6 KPI métier mesurables · 6 risques majeurs maîtrisés · backlog MoSCoW · architecture cible documentée.

**Sortie du bloc** : un projet **prêt à être codé**, pas seulement rêvé.

**Continuité** : tous les choix de ce bloc seront mesurés ou testés dans les blocs suivants.

> Notes : poser le pont vers Bloc 2 (« concevoir et développer »).

---

## Merci — Questions

**ECOTRACK** · https://ecotrack.lorisdev.fr · POILLY Loris & FAUCHON Rémi · Mastère INGETIS — M2 ITIS Développement

> Notes : questions probables — pourquoi React + NestJS plutôt que stack unique Java/Spring, comment justifier MQTT vs HTTP, MoSCoW vs WSJF, choix monolithe modulaire vs microservices. Garder DCT + matrice risques en annexe.
