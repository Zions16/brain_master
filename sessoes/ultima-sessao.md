# Última Sessão

## Data
2026-06-02

## Fase / Sprint atual
Fase 1 — Sprint 23 — Deploy Staging (Railway + Vercel)

## O que foi feito

### Arquivos criados
- `codigo/apps/api/Dockerfile` — build da API a partir do contexto raiz do monorepo; usa `tsx` como runtime para resolver imports TypeScript cross-package sem build step; `node:20-alpine`
- `codigo/apps/api/railway.toml` — builder dockerfile, health check em `/health`, restart on failure
- `codigo/apps/web/vercel.json` — build via `turbo build --filter=@brain-master/web`, install desde a raiz
- `codigo/.dockerignore` — exclui `apps/mobile`, `apps/web`, `node_modules`, arquivos de teste

### Arquivos atualizados
- `apps/api/.env.example` — adicionado `JWT_SECRET` (estava em uso no app.ts mas ausente no template)
- `apps/web/.env.example` — anotação de URL staging para `NEXT_PUBLIC_API_URL`
- `apps/api/tsconfig.json` — `exclude` agora inclui `__tests__`, `*.test.ts`, `vitest.config.ts` (resolvia erro de tsc --noEmit)

### TypeScript
- `tsc --noEmit` limpo em API e Web após ajuste do tsconfig

## Decisões tomadas
- `tsx` como runtime de produção (staging): evita build step para resolver cross-package TS imports (`@brain-master/shared` e `@brain-master/validators` têm `.ts` como main entry)
- Build context = repo root (necessário para copiar `packages/` no Docker)
- Dockerfile em multi-layer com manifests separados para cache eficiente

## Onde parou
Configuração de staging pronta. Falta o usuário executar os 2 comandos abaixo.

## Próxima ação (EXATA)

### API → Railway
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto e vincular
cd codigo
railway init           # ou: railway link (se já existe o projeto)
railway up             # faz deploy

# 4. Adicionar variáveis de ambiente no dashboard Railway:
# SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, NODE_ENV=production
# ALLOWED_ORIGINS=https://[seu-projeto].vercel.app
```

### Web → Vercel
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
cd codigo/apps/web
vercel

# Dashboard Vercel:
# - Root Directory: apps/web
# - Framework: Next.js (auto-detectado)
# Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
#           NEXT_PUBLIC_API_URL=https://[seu-servico].up.railway.app
```

## Commit
872266c — chore(deploy): sprint 23 — configuração de staging (Railway + Vercel)
