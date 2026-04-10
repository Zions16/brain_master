# Ontem — 2026-04-10

**Data:** 2026-04-10
**Etapa do projeto:** Fase 1 — Sprint 1 (pronto para iniciar)
**Hora de referência:** fim do dia

---

## O que foi feito

- Cronograma master completo: 4 fases, 20 sprints, 80+ tarefas detalhadas com SQL e código de exemplo prontos para usar
- Sistema de documentação evolutiva implementado: `ontem.md`, `semana-atual.md`, `historico/dia-*.md`, `historico/semana-*.md`
- Histórico completo migrado: dias 2026-04-08, 2026-04-09, 2026-04-10 e semana W15 arquivados em `cronograma/historico/`
- `regras/negocio.md` criado com 12 regras formalizadas antes de iniciar código
- `.github/workflows/ci.yml` — lint + type-check + npm audit automáticos em todo PR
- `tarefas/em-andamento.md`, `concluidas.md`, `backlog.md`, `problemas.md` criados

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `cronograma/plano-geral.md` | Substituído pelo cronograma master (4 fases, 20 sprints) |
| `cronograma/semana-atual.md` | Atualizado para Semana W16 / Sprint 1 |
| `cronograma/ontem.md` | Criado (este arquivo) |
| `cronograma/historico/dia-2026-04-08.md` | Criado — migrado de sessoes/historico.md |
| `cronograma/historico/dia-2026-04-09.md` | Criado — migrado de sessoes/historico.md |
| `cronograma/historico/dia-2026-04-10.md` | Criado — sessão anterior |
| `cronograma/historico/semana-2026-W15.md` | Criado — semana de setup consolidada |
| `regras/negocio.md` | Criado — 12 regras de negócio |
| `.github/workflows/ci.yml` | Criado — GitHub Actions |
| `tarefas/em-andamento.md` | Criado |
| `tarefas/concluidas.md` | Criado |
| `tarefas/backlog.md` | Criado |
| `tarefas/problemas.md` | Criado |

## Decisões tomadas

- Sistema de documentação evolutiva adotado como padrão permanente do projeto
- `ontem.md` é sempre sobrescrito com o trabalho do ciclo mais recente
- Conteúdo antigo de `ontem.md` vai para `historico/dia-YYYY-MM-DD.md` antes de sobrescrever
- Semana encerrada vai para `historico/semana-YYYY-WW.md`
- `sessoes/` mantida para compatibilidade mas `cronograma/` passa a ser o sistema principal

## Problemas encontrados

Nenhum.

## Próximos passos

1. Criar conta e projeto no **Supabase** (supabase.com)
2. Copiar `SUPABASE_URL`, `ANON_KEY` e `SERVICE_KEY`
3. Inicializar Turborepo: `cd ~/Brain\ Master/ObrasApp/codigo && npx create-turbo@latest . --package-manager npm`
4. Preencher `.env` com as chaves
5. Executar schema SQL do Sprint 1 no SQL Editor do Supabase
6. Ativar RLS nas tabelas `empresa`, `usuario`, `obra`
7. Verificar `npm run dev` sem erros

## Commit
`524449a` + commit desta sessão (após push)
