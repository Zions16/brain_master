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
- `~/.claude/skills/typescript-nextjs/SKILL.md` — padrões de frontend
- `~/.claude/skills/flutter-dart/SKILL.md` — padrões do app mobile
- `~/.claude/skills/api-integrations/SKILL.md` — integrações externas
- `~/.claude/skills/git-github-flow/SKILL.md` — fluxo de commits e PRs
- `~/.claude/skills/debugging-testing/SKILL.md` — testes e debugging
- `~/.claude/skills/architecture-decisions/SKILL.md` — decisões de arquitetura

## Prioridades
1. Segurança — sempre primeiro
2. Simplicidade — especialmente no mobile (engenheiro em campo)
3. Dados corretos — medição é a unidade central do produto
4. UX simples — funcionário de obra precisa usar sem treinamento

## O que nunca fazer
- Código com credenciais hardcoded
- SQL raw com input do usuário
- Deletar medições (apenas corrigir com histórico)
- Expor dados de um usuário para outro
- Push direto na branch main
