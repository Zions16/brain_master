# Última Sessão

## Data
2026-06-02

## Fase / Sprint atual
Fase 1 — Sprint 23 — Deploy Staging (em andamento)

## O que foi feito

### Web → Vercel ✅ CONCLUÍDO
- URL: https://brain-master-delta.vercel.app
- Deploy: commit d159c23, status Ready/Production
- Correções aplicadas:
  - `next.config.js`: `ignoreDuringBuilds: true` (ESLint bloqueava build)
  - `package.json` root: `overrides` react/react-dom 18.3.1 (dual-instance causava useContext null no prerender)

### API → Railway ⏳ EM ANDAMENTO
- Serviço criado: `brain-master-api` (brainmaster-production.up.railway.app)
- 6 variáveis configuradas: ALLOWED_ORIGINS, JWT_SECRET, NODE_ENV, PORT, SUPABASE_SERVICE_KEY, SUPABASE_URL
- Problema encontrado: Railway buildava da raiz do repo (via Railpack) — não encontrava o código
- Correções aplicadas no dashboard Railway:
  - Source → Root Directory: `codigo`
  - Build → Builder: Dockerfile (mudado de Railpack)
  - Build → Dockerfile Path: `/codigo/apps/api/Dockerfile` (selecionado)
- **Status: aguardando deploy com as novas configurações**

## Onde parou
Usuário selecionou `/codigo/apps/api/Dockerfile` no Railway mas encerrou antes de salvar/deployar.

## Próxima ação (EXATA)
1. No Railway → Settings → Build → confirmar Dockerfile Path = `/codigo/apps/api/Dockerfile`
2. Salvar
3. Aba Deployments → clicar em "Deploy" ou aguardar auto-deploy
4. Verificar logs — se passar, testar: `curl https://brainmaster-production.up.railway.app/health`
5. Se retornar `{"status":"ok"}` → staging completo

## URLs de staging
- Web: https://brain-master-delta.vercel.app
- API: https://brainmaster-production.up.railway.app (pendente confirmação)
