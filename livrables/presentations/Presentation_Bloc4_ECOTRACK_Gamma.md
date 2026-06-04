# ECOTRACK — Présentation 4/4 : Bloc 4

Piloter et coordonner l'équipe projet

**Mastère INGETIS — M2 ITIS**
Filière Développement · 2025-2026 · POILLY Loris & FAUCHON Rémi (binôme projet)
🔗 Démo en ligne : https://ecotrack.lorisdev.fr

> Notes : dernière des 4 soutenances. Bloc le plus différent — nous étions deux et nous avons conçu l'équipe cible qui ferait grandir le produit. Le binôme a déjà été un premier germe d'équipe. Format 20 min + 20 min Q&A.

---

## Plan

- Le binôme préfigure l'équipe
- Équipe cible & hiérarchisation des recrutements
- Matrice RACI
- Outils & rituels Scrum
- Exemple de décision collective
- Risques humains anticipés
- CNV + escalade trois niveaux
- Inclusion & handicap
- Plan formation chiffré
- Bilan & santé d'équipe
- Posture — servant leadership
- Compétences transversales
- Bilan du bloc

---

## Le binôme préfigure l'équipe

> Nous étions deux. Le Bloc 4 nous a demandé de penser comment l'équipe grandirait — et notre binôme a été le premier laboratoire.

Coordonner deux flux, arbitrer en cas de divergence, tracer chaque décision pour que l'autre puisse reprendre : ce sont déjà des pratiques d'équipe.
**Si nous ne savons pas expliquer notre architecture à un futur Tech Lead, c'est qu'elle n'est pas claire.**

> Notes : poser la posture avant le contenu. Le binôme n'est pas un alibi mais le germe de l'équipe cible.

---

## Équipe cible — 8,5 ETP

| Rôle | ETP | Profil | Expérience |
|---|---|---|---|
| Product Owner | 1,0 | Métier + produit | Senior |
| **Tech Lead** | **1,0** | **Architecte full-stack** | **Confirmé** |
| Dév back-end | 1,0 | NestJS, PostgreSQL, MQTT | Confirmé |
| Dév front-end | 1,0 | React, TypeScript, A11y | Confirmé |
| Dév full-stack | 1,0 | Polyvalent, axé qualité | Junior à confirmé |
| DevOps / SRE | 1,0 | Docker, CI/CD, sécu ops | Confirmé |
| Ingénieur IoT | 1,0 | LoRaWAN, MQTT | Confirmé |
| QA automaticien | 1,0 | Playwright, k6, ZAP | Confirmé |
| Scrum Master | **0,5** | Facilitateur agile | Confirmé |

**Structure plate assumée** : pas de manager intermédiaire. À 8 ETP, la friction d'un niveau hiérarchique > son bénéfice.

---

## Hiérarchisation des recrutements (T+18 mois)

1. **Tech Lead (T+0)** — sans lui, les recrutements suivants génèrent du code disparate
2. **DevOps (T+2)** — industrialiser avant d'ajouter des contributeurs
3. **Ingénieur IoT (T+4)** — débloque le terrain réel (capteurs)
4. **Front-end (T+6)** — scinder back/front + qualité UX
5. **QA (T+9)** — avec 4 devs actifs, le volume justifie la spécialisation

> Notes : l'ordre n'est pas un détail. Inverser TL et DevOps détruit la cohérence technique.

---

## Matrice RACI

15 activités × 9 rôles. Quelques lignes structurantes :

| Activité | A / R |
|---|---|
| Définir la roadmap produit | **PO** (A,R) |
| Concevoir l'architecture | **TL** (A,R) |
| Maintenir la CI/CD | **TL** (A) · **OPS** (R) |
| Écrire les tests E2E | **TL** (A) · **QA** (R) |
| Gérer un incident prod | **TL** (A) · **OPS/Devs** (R) |
| Animer un rituel Scrum | **SM** (A,R) |
| Recruter un nouveau membre | **PO** (A) · **TL** (R) |

**Lecture en colonne** : le Tech Lead est nœud central. C'est volontaire — surveillé via 1:1 hebdo.

---

## Outils — pile réduite et assumée

| Besoin | Outil retenu |
|---|---|
| Sync | Visio (Google Meet) |
| Async | Slack — 3-4 canaux structurés |
| Backlog & tickets | **GitHub Issues + Projects** |
| Doc projet | **Repo Git (Markdown)** |
| Wiki vivant | GitHub Discussions |
| Dashboards ops | Grafana (SRE) |
| Brainstorm | Miro ou tableau physique |

> Notes : pas de Jira, pas de Confluence par défaut. Discipline anti-dispersion.

---

## Rituels Scrum

| Rituel | Cadence | Durée | Animateur |
|---|---|---|---|
| Daily standup | Quotidien | 15 min | Tournant |
| Sprint planning | Début sprint | 1 h 30 | SM + PO |
| Refinement | Mi-sprint | 1 h | SM + PO + équipe |
| Sprint review | Fin sprint | 1 h | PO |
| Rétrospective | Fin sprint | 1 h 15 | SM |
| **1:1 TL ↔ membre** | **Hebdo** | **30 min** | TL |
| Démo all-hands | Mensuel | 45 min | PO + 1 membre |

> Notes : le 1:1 hebdo est l'antidote au burn-out silencieux.

---

## Exemple — décision collective réelle

**Rétro sprint 18** — test E2E Dashboard flaky (~1/12 échec)

Quatre hypothèses formulées :
- TL : « wait conditionnel Leaflet »
- OPS : « augmenter timeout CI »
- QA : « test sur état CSS, non déterministe »
- Dev BE : « retry une fois »

**Solution adoptée** (QA) : valider un état applicatif (`data-loaded=true`) pas un état visuel.
**Résultat** : 0 échec sur les 200 exécutions suivantes.

> Notes : aucune solution n'était proposée par une seule personne au départ. C'est le frottement qui l'a produite.

---

## Risques humains anticipés

| Risque | P × G | Score | Mesure |
|---|---|---|---|
| Conflit interpersonnel | 3 × 4 | **12** | 1:1 + escalade SM→TL→PO + CNV |
| Surcharge / burn-out | 3 × 4 | **12** | Suivi velocity vs capacité + 1:1 santé |
| Départ d'un sachant clé | 2 × 5 | **10** | « Si tu pars, ton remplaçant doit pouvoir reprendre » |
| Décrochage junior | 3 × 3 | 9 | Plan formation + mentorat + pair prog hebdo |
| Sponsor changeant scope | 3 × 3 | 9 | Roadmap trimestrielle co-signée |
| Démotivation post-livrable | 2 × 3 | 6 | Célébration + rotation sujets + hackathon |

---

## CNV + escalade trois niveaux

Cadre Marshall Rosenberg : observation → ressenti → besoin → demande.

1. **Niveau 1** — Dialogue direct, ≤ 48 h, SM facilitateur si demandé
2. **Niveau 2** — Médiation Tech Lead, entretien tripartite, plan d'action écrit
3. **Niveau 3** — Arbitrage Product Owner, décision documentée

> Notes : ce n'est pas un protocole rigide. C'est un référentiel partagé qui sécurise — chacun sait qu'il y a un chemin.

---

## Inclusion & handicap

- **Recrutement inclusif** : annonces non-genrées, grille d'évaluation pré-définie, partenariats associations relais (Mixity, La Coding School, Ada Tech School)
- **Accompagnement RQTH** : référent handicap nommé (TL par défaut), adaptation matérielle financée AGEFIPH, télétravail étendu possible
- **Diversité technique** : 1 junior accompagné par cycle, mixité des formations d'origine, valorisation explicite en code review

> Notes : Loi 2005 + AGEFIPH = cadre légal. Au-delà, c'est une question de culture.

---

## Plan formation — exemple profil DevOps

**Budget cible** : 5 jours + **3 500 €** par ETP/an

| Trimestre | Action | Coût |
|---|---|---|
| Q1 | Certification CKAD | 395 € |
| Q2 | KubeCon Europe (3 j) | 1 200 € |
| Q2 | Formation OWASP avancée (2 j) | 850 € |
| Q3 | Pair-mentoring inverse junior | 0 € |
| Q3 | Atelier interne « incident response » | 0 € |
| Q4 | Lecture pro (3 ouvrages) | 120 € |
| Q4 | Reste à arbitrer | 935 € |
| **Total** | — | **3 500 €** |

---

## Bilan collectif

**Forces structurelles**

- Compétences pleinement couvertes (back, front, DevOps, IoT, QA)
- Triple capacité d'évolution (produit · technique · processus)
- Connaissance opérationnelle formalisée (ADR, RACI, runbook)
- Cadre conflit outillé, pas seulement déclaré

**Axes d'amélioration**

- Mono-expertise IoT → doublonner sur back-end senior
- Pas de rôle support N1 → rotation interne 6 mois puis recrutement
- Pas de représentant utilisateur → stage immersif agent terrain
- Surcharge TL projetée → envisager Engineering Manager à 6 mois

---

## Santé d'équipe — indicateurs trimestriels

| Indicateur | Cible |
|---|---|
| eNPS interne | ≥ 50 |
| Taux de présence en rituel | ≥ 90 % |
| Distribution charge bug fix | variation < 30 % moyenne |
| Taux de rotation annualisé | < 10 % |
| Satisfaction formation continue | ≥ 4/5 |

> Notes : la santé d'équipe n'est pas un sentiment. Elle se mesure aussi.

---

## Posture — servant leadership

Trois engagements structurants :

1. **Servir les conditions d'efficacité** de l'équipe avant l'image du leader
2. **Reconnaître publiquement** les contributions, **en privé** les erreurs
3. **Protéger l'équipe** des interférences hors-sprint

> Notes : posture exigeante. Suppose une vigilance permanente sur son rapport au pouvoir. Mais c'est la seule compatible avec la conviction qu'un service public se construit avec les agents, pas contre.

---

## Compétences transversales

- **Anglais technique** 🇬🇧 — veille à 80 % sur sources anglophones (RFC, OWASP, ACM, blogs ingénierie), termes techniques employés sans francisation forcée
- **Numérique responsable** 🌱 — éco-conception (bundles minifiés, lazy loading, AVIF, cache HTTP, pagination) · Boavizta < 4 kg CO₂e / utilisateur actif / an · **solde net : 78 t CO₂e économisées / an / collectivité** grâce au − 25 % kilométrage

> Notes : c'est la dernière soutenance — réaffirmer que ces compétences sont structurelles, pas décoratives.

---

## Bilan du Bloc 4 & ouverture

**Acquis Bloc 4** : équipe 8,5 ETP dimensionnée · RACI 15×9 · plan formation chiffré (3 500 €/ETP/an) · cadre CNV + escalade · posture leadership formalisée.

**Ce que ce parcours m'a appris** : le code n'est qu'un sous-produit. La valeur est dans la documentation des décisions, l'automatisation des contrôles, la transmissibilité des intentions.

> Notes : conclure sur la transformation de la pratique professionnelle. C'est la dernière image que le jury garde de ma soutenance complète.

---

## Merci — Questions

**ECOTRACK** · https://ecotrack.lorisdev.fr · POILLY Loris & FAUCHON Rémi · Mastère INGETIS — M2 ITIS Développement

> Notes : questions probables — pourquoi monolithe et pas microservices côté équipe, dimensionnement équipe (pourquoi pas 5 ETP ? pourquoi pas 12 ?), articulation TL/EM, exemple concret de CNV en pratique, ratio formation/budget, comment garantir la qualité avec un seul TL nœud central. Garder runbook + DCT + matrice RACI complète en annexe.
