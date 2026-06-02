# Build context: repo root (para acessar packages/shared e packages/validators)
# Railway: configure Root Directory = / e Dockerfile Path = apps/api/Dockerfile

FROM node:22-alpine
WORKDIR /app

# Manifests primeiro — camada de cache separada das fontes
COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json  ./packages/shared/
COPY packages/validators/package.json ./packages/validators/
COPY apps/api/package.json ./apps/api/

# Instala todos os workspaces (cria symlinks @brain-master/*)
RUN npm install

# Copia fontes
COPY packages/shared/  ./packages/shared/
COPY packages/validators/ ./packages/validators/
COPY apps/api/src/ ./apps/api/src/

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 3333

# tsx resolve os imports TypeScript cross-package sem build step
CMD ["/app/node_modules/.bin/tsx", "src/server.ts"]
