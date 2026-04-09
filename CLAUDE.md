# ObrasApp — Instruções para Claude Code

## REGRA PERMANENTE — Execute sempre ao iniciar

Antes de qualquer código, sugestão ou decisão técnica:

1. Leia `contexto/LEIA_PRIMEIRO.md`
2. Leia `regras/seguranca.md`
3. Leia `regras/codigo.md`
4. Leia `contexto/produto.md`
5. Leia `contexto/stack.md`
6. Leia a sessão mais recente em `sessoes/`
7. Confirme o entendimento em 5 bullets
8. Aguarde instrução

## Sobre o projeto
Brain Master / ObrasApp — plataforma SaaS B2B de gestão de obras.
Foco: medição de produção, pagamento por produção, controle de equipes e materiais.
Ver detalhes completos em `contexto/produto.md`.

## Skills globais relevantes
- `~/.claude/skills/react-native/SKILL.md` — padrões do app mobile
- `~/.claude/skills/typescript-nextjs/SKILL.md` — padrões do dashboard web
- `~/.claude/skills/fastify-nodejs/SKILL.md` — padrões da API backend
- `~/.claude/skills/supabase-rls/SKILL.md` — banco, auth e segurança (CRÍTICO)
- `~/.claude/skills/api-integrations/SKILL.md` — integrações externas
- `~/.claude/skills/git-github-flow/SKILL.md` — fluxo de commits e PRs
- `~/.claude/skills/debugging-testing/SKILL.md` — testes e debugging
- `~/.claude/skills/architecture-decisions/SKILL.md` — decisões de arquitetura

## Prioridades
1. Segurança — sempre primeiro
2. Simplicidade — especialmente no mobile (engenheiro em campo)
3. Dados corretos — medição é a unidade central do produto
4. UX simples — funcionário de obra precisa usar sem treinamento

## Banco de dados — Supabase
- Usar `SUPABASE_SERVICE_KEY` apenas no backend (apps/api)
- Usar `EXPO_PUBLIC_SUPABASE_ANON_KEY` no mobile
- Usar `NEXT_PUBLIC_SUPABASE_ANON_KEY` no web
- RLS ativo em todas as tabelas — verificar antes de qualquer deploy
- Migrations versionadas em `supabase/migrations/`
- Ver skill: `~/.claude/skills/supabase-rls/SKILL.md`

## O que nunca fazer
- Código com credenciais hardcoded
- `SUPABASE_SERVICE_KEY` no frontend ou mobile
- Tabela sem RLS ativo
- Deletar medições (apenas cancelar com motivo no histórico)
- Expor dados de uma empresa para outra
- Push direto na branch main
