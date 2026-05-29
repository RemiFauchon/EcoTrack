# ─── Base ───
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++   # build natif (bcrypt)
COPY package*.json ./

# ─── Développement (hot-reload via docker-compose) ───
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ─── Build de production ───
FROM base AS build
RUN npm install
COPY . .
RUN npm run build && npm prune --production

# ─── Image de production ───
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/main.js"]
