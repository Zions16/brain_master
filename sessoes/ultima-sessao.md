# Última Sessão

## Data
2026-05-21

## Fase / Sprint atual
Fase 1 — Sprint 1 — Fundação e infraestrutura (concluído)

## O que foi feito

- Leitura completa de todos os arquivos do projeto (diagnóstico inicial)
- .env criados e corrigidos para api, mobile e web
- .env confirmados no .gitignore — não rastreados pelo git
- Turborepo configurado manualmente (create-turbo não funciona em diretório com arquivos)
- package.json raiz com workspaces, turbo.json, tsconfig.json, .eslintrc.js, .prettierrc criados
- package.json criado para cada app (api, mobile, web) e cada package (shared, validators)
- index.ts criado em packages/validators
- npm install concluído com --legacy-peer-deps (1435 pacotes)
- .vscode/settings.json criado (format on save, ESLint, Tailwind, Turbo)
- Expo CLI 6.3.12, EAS CLI 19.0.6 e Supabase CLI 2.101.0 instalados
- Schema SQL Sprint 1 executado no Supabase: empresa, usuario, obra, obra_usuario
- Funções SECURITY DEFINER criadas: get_minha_empresa(), get_meu_perfil(), obra_vinculada()
- RLS ativo nas 9 tabelas com 24 policies no total
- Schema SQL completo executado: funcionario, servico, medicao, medicao_historico, pagamento
- 2 commits publicados no repositório

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
- `supabase/migrations/20260521_schema_completo.sql` — criado
- `sessoes/ultima-sessao.md` — atualizado
- `sessoes/historico.md` — atualizado
- `tarefas/em-andamento.md` — atualizado
- `tarefas/concluidas.md` — atualizado

## Decisões tomadas
- Turborepo configurado manualmente — create-turbo falha em diretório com arquivos existentes
- --legacy-peer-deps necessário por conflito @react-navigation/stack vs react-native-screens
- RLS policies usam funções SECURITY DEFINER para cross-table lookups (evita recursão de RLS e erro de syntax)
- Schema completo criado agora (não nos sprints 3/4) — evita migrations no meio do desenvolvimento

## Status do banco (Supabase)
9 tabelas | RLS ativo em todas | 24 policies

| Tabela | Policies |
|---|---|
| empresa | 1 |
| usuario | 2 |
| obra | 4 |
| obra_usuario | 3 |
| funcionario | 3 |
| servico | 3 |
| medicao | 3 |
| medicao_historico | 2 |
| pagamento | 4 |

## Commits desta sessão
- `d9c2716` — feat: sprint 1 — turborepo, dependências e schema SQL do Supabase
- `c9ac9e6` — feat: schema completo do banco — funcionario, servico, medicao, pagamento

## Onde parou
Sprint 1 concluído. Banco 100% pronto no Supabase.
Falta apenas `npm run dev` subindo (será feito no Sprint 2 ao criar os apps).

## Próxima ação (EXATA)
Sprint 2 — Autenticação:
1. Criar estrutura de pastas da API:
   apps/api/src/server.ts
   apps/api/src/app.ts
   apps/api/src/plugins/ (jwt, cors, helmet, rateLimit)
   apps/api/src/modules/auth/ (routes, controller, service)
   apps/api/src/middlewares/ (autenticar.ts, autorizar.ts)
2. Implementar POST /auth/login com Supabase Auth
3. Rate limiting: 5 tentativas por IP em 15 minutos
4. Middleware autenticar.ts: verifica JWT em todas as rotas protegidas
