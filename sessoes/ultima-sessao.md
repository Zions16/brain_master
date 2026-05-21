# Última Sessão

## Data
2026-05-21

## Fase / Sprint atual
Fase 1 — Sprint 1 — Fundação e infraestrutura

## O que foi feito

- Todos os .env criados e corrigidos (api, mobile, web)
- .env confirmados no .gitignore — não rastreados pelo git
- Turborepo configurado manualmente (create-turbo não funciona em diretório com arquivos)
- package.json raiz com workspaces, turbo.json, tsconfig.json, .eslintrc.js, .prettierrc criados
- package.json criado para cada app (api, mobile, web) e cada package (shared, validators)
- index.ts criado em packages/validators (exporta auth e medicao)
- npm install concluído com --legacy-peer-deps (conflito de peer deps do React Navigation com RN 0.74)
- .vscode/settings.json criado (format on save, ESLint, Tailwind)
- Expo CLI, EAS CLI e Supabase CLI instalados no computador
- Schema SQL do Sprint 1 executado com sucesso no Supabase:
  - Tabelas: empresa, usuario, obra, obra_usuario
  - Índices: idx_usuario_empresa, idx_obra_empresa, idx_obra_status
  - Funções SECURITY DEFINER: get_minha_empresa(), get_meu_perfil(), obra_vinculada()
  - RLS ativo nas 4 tabelas
  - 10 policies criadas

## Arquivos alterados
- `codigo/package.json` — criado
- `codigo/turbo.json` — criado
- `codigo/tsconfig.json` — criado
- `codigo/.eslintrc.js` — criado
- `codigo/.prettierrc` — criado
- `codigo/.vscode/settings.json` — criado
- `codigo/apps/api/package.json` — criado
- `codigo/apps/mobile/package.json` — criado
- `codigo/apps/web/package.json` — criado
- `codigo/packages/shared/package.json` — criado
- `codigo/packages/validators/package.json` — criado
- `codigo/packages/validators/index.ts` — criado
- `codigo/apps/api/.env` — criado (não commitado)
- `codigo/apps/mobile/.env` — criado (não commitado)
- `codigo/apps/web/.env` — criado (não commitado)
- `supabase/migrations/20260408_sprint1_fundacao.sql` — criado

## Decisões tomadas
- Turborepo configurado manualmente (create-turbo não funciona em dir com arquivos existentes)
- --legacy-peer-deps necessário por conflito @react-navigation/stack vs react-native-screens
- RLS policies usam funções SECURITY DEFINER para cross-table lookups (evita recursão de RLS)

## Onde parou
Schema do banco do Sprint 1 executado com sucesso no Supabase.
Turborepo e dependências instalados.
Sprint 1 critério de conclusão: falta iniciar os apps (npm run dev) e confirmar CI rodando.

## Próxima ação (EXATA)
Sprint 2 — Autenticação:
1. Criar estrutura de pastas da API (src/modules/auth/, src/plugins/, src/middlewares/)
2. Implementar server.ts + app.ts do Fastify
3. Implementar rota POST /auth/login com Supabase Auth
4. Rate limiting no login (5 tentativas / 15 min)

## Commits desta sessão
(pendente — commitar antes de encerrar)
