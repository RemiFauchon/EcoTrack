# Déploiement ECOTRACK sur VPS (Docker Compose)

Toute la stack (API NestJS, frontend React, PostgreSQL+PostGIS, Redis, broker MQTT, reverse proxy
HTTPS) tourne en conteneurs. Le reverse proxy **Caddy** gère le routage et le certificat HTTPS
automatiquement.

## 1. Prérequis sur le VPS
- Ubuntu/Debian à jour, accès SSH.
- **Docker + plugin Compose** installés :
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # puis se reconnecter
  ```
- **Ports 80 et 443 ouverts** (pare-feu / groupe de sécurité).
- (Recommandé) un **nom de domaine** avec un enregistrement **A** pointant vers l'IP du VPS
  (ex. `ecotrack.mondomaine.fr` → `203.0.113.10`). Sans domaine, on peut servir en HTTP via l'IP.

## 2. Récupérer le code
```bash
git clone https://github.com/RemiFauchon/EcoTrack.git
cd EcoTrack/app
```

## 3. Configurer les secrets
```bash
cp .env.prod.example .env
nano .env
```
> Le fichier doit s'appeler **`.env`** : Docker Compose le charge automatiquement (pas besoin du flag `--env-file`, non supporté par les versions anciennes).
- `DOMAIN` : votre domaine (HTTPS auto) **ou** `:80` (HTTP via IP, sans certificat).
- `POSTGRES_PASSWORD` : un mot de passe fort.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` : générez-les avec `openssl rand -hex 32`.

## 4. Démarrer
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
- Premier démarrage : build des images + injection automatique des données de démo
  (12 secteurs, 144 conteneurs, comptes de démonstration).
- Caddy obtient le certificat HTTPS automatiquement (si `DOMAIN` est un vrai domaine).

Accès : `https://votre-domaine` (ou `http://IP_DU_VPS` si `DOMAIN=:80`).
API/Swagger : `https://votre-domaine/api/docs`.

## 5. Exploitation
```bash
# Journaux
docker compose -f docker-compose.prod.yml logs -f backend
# État
docker compose -f docker-compose.prod.yml ps
# Mise à jour après un git pull
git pull && docker compose -f docker-compose.prod.yml up -d --build
# Arrêt
docker compose -f docker-compose.prod.yml down
```

## 5 bis. Intégration derrière un reverse proxy DÉJÀ présent sur le VPS

Le VPS héberge déjà des sites (ports 80/443 occupés) : notre stack n'expose donc **que**
`127.0.0.1:8088` (`WEB_PORT=8088`, `DOMAIN=:80`). Il suffit d'ajouter le sous-domaine
**ecotrack.lorisdev.fr** (enregistrement DNS **A** → IP du VPS) dans le proxy existant, qui le route
vers `127.0.0.1:8088`. **Important : transmettre l'upgrade WebSocket** (temps réel Socket.io).

### Si le proxy est Nginx
```nginx
server {
    server_name ecotrack.lorisdev.fr;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket (socket.io) :
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
Puis HTTPS via Certbot : `sudo certbot --nginx -d ecotrack.lorisdev.fr`.

### Si le proxy est Apache
Activer : `sudo a2enmod proxy proxy_http proxy_wstunnel rewrite ssl`.
```apache
<VirtualHost *:443>
    ServerName ecotrack.lorisdev.fr
    # ... SSLCertificateFile / KeyFile (Certbot) ...
    ProxyPreserveHost On
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:8088/$1 [P,L]
    ProxyPass / http://127.0.0.1:8088/
    ProxyPassReverse / http://127.0.0.1:8088/
</VirtualHost>
```
Puis : `sudo certbot --apache -d ecotrack.lorisdev.fr`.

### Si le proxy est Traefik / une autre instance Caddy
Router `ecotrack.lorisdev.fr` → `http://127.0.0.1:8088` avec support WebSocket (par défaut sur
Traefik et sur `reverse_proxy` de Caddy).

> Notre Caddy interne gère ensuite le routage `/api` + `/socket.io` → backend et `/` → frontend :
> le proxy externe n'a qu'**une seule cible** à connaître (`127.0.0.1:8088`).

## 6. Sécurité (à faire avant un usage réel)
- Changer les secrets JWT et le mot de passe PostgreSQL (déjà couverts par `.env.prod`).
- Désactiver/supprimer les comptes de démonstration, ou changer leurs mots de passe.
- Activer la MFA sur les comptes gestionnaire/administrateur (depuis le tableau de bord).
- Pour un vrai prod : remplacer `DB_SYNCHRONIZE=true` par des migrations TypeORM, restreindre le CORS,
  mettre en place des sauvegardes PostgreSQL.

## Architecture des conteneurs
```
Internet → Caddy (80/443, HTTPS)
              ├── /             → frontend (Nginx, SPA React)
              └── /api, /socket.io → backend (NestJS)
backend → postgres (PostGIS) · redis · mosquitto (MQTT)
```
