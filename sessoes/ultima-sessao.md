# Última Sessão

## Data
2026-06-05

## Fase / Sprint atual
Sprint 28 — Auditoria + Correções de Segurança

---

## O que foi feito

### Etapa 1 — Documentação de status
- `cronograma/plano-geral.md` — bloco STATUS ATUAL adicionado; bloco histórico "código não iniciado" marcado como obsoleto
- `tarefas/em-andamento.md` — Sprint 27 marcado como concluído; Sprint 28 detalhado
- `sessoes/historico.md` — sprints pulados classificados; entrada Sprint 28 adicionada

### Etapa 2 — Fix DT-001 (privacidade de pagamentos)
- `funcionarios.service.ts`: `buscarMeuPerfil` usa `funcionario.id` do JWT (não `.ilike('nome')`)
- Guards `perfil === 'FUNCIONARIO' && solicitanteId !== funcionarioId → 403` em listarPagamentos, listarMedicoes, calcularProducao
- `funcionarios.controller.ts`: handlers passam `request.usuario.id` e `perfil`
- Migration `20260605_dt001_fix_pagamento_rls_nome.sql`: RLS policy corrigida

### Etapa 3 — CONTEXT.md por feature
- Criados: `funcionarios/CONTEXT.md`, `obras/CONTEXT.md`, `(dashboard)/CONTEXT.md`
- Atualizados: `auth/CONTEXT.md`, `pagamentos/CONTEXT.md`, `medicoes/CONTEXT.md`

### Etapa 4 — Sprints pulados
- `sessoes/historico.md` — tabela "Sprints não implementados" adicionada

### Etapa 5 — Suite mínima Playwright
- Criados: `playwright.config.ts`, `e2e/auth.spec.ts`, `e2e/privacidade-pagamentos.spec.ts`, `e2e/README.md`
- `tsconfig.json` — e2e excluído do type-check principal
- **Status:** estrutura criada, requer `npm install --save-dev @playwright/test` para rodar

### Etapa 6 — Onboarding mínimo
- `dashboard/page.tsx` — empty state com checklist de 5 primeiros passos e CTA quando `obras.length === 0`

### Etapa 7 — Billing
- Não implementado — gateway não decidido (Stripe vs Asaas em aberto)
- Ação: decidir gateway antes de implementar

### Etapa 8 — MCP Google Drive
- Status: "Needs authentication" — não está sendo usado
- Recomendação: remover com `claude mcp remove "claude.ai Google Drive"` ou autenticar se precisar

### Etapa 9 — DT-002 e DT-003
- DT-002: `@fastify/jwt` está em uso ativo — fechado como falso positivo
- DT-003: Rate limit adicionado em `/refresh` (30 req/15 min)

---

## Arquivos alterados
- `cronograma/plano-geral.md`, `tarefas/em-andamento.md`, `sessoes/historico.md`
- `eficiencia/dividas-tecnicas.md`, `processo/erros-e-solucoes.md`
- `codigo/apps/api/src/modules/funcionarios/funcionarios.service.ts` — fix DT-001
- `codigo/apps/api/src/modules/funcionarios/funcionarios.controller.ts` — fix DT-001
- `codigo/apps/api/src/modules/auth/auth.routes.ts` — fix DT-003
- `supabase/migrations/20260605_dt001_fix_pagamento_rls_nome.sql` — criado
- 6 arquivos CONTEXT.md criados/atualizados
- `codigo/apps/web/playwright.config.ts`, `tsconfig.json`, `e2e/` — estrutura E2E
- `codigo/apps/web/src/app/(dashboard)/dashboard/page.tsx` — onboarding

---

## Decisões tomadas
- DT-001 corrigido no backend (API usa service key que bypassa RLS — correção mais efetiva é no service/controller)
- RLS corrigida também (defense in depth — só ativa com Supabase JWT nativo, futuro mobile)
- DT-002 fechado — @fastify/jwt é essencial para tokens FUN/ENG
- Billing aguarda decisão de gateway

---

## Onde parou
Sprint 28 em andamento. DT-001, DT-003 corrigidos. Todos os type-checks passando. Branch não mergeada.

## Próxima ação exata
1. Mergear `fix/auditoria-brain-master-sprint-28` → `main`
2. Instalar `@playwright/test` e adicionar `data-testid` no login para os testes rodarem
3. Decidir gateway (Stripe vs Asaas) → implementar billing
4. Remover ou autenticar MCP Google Drive

## Commit sugerido
```bash
git add -A
git commit -m "fix(security): resolve DT-001 pagamento privacy + DT-003 refresh rate limit"
git commit -m "docs: update brain master status docs + sprints history + CONTEXT.md per feature"
git commit -m "feat(web): add onboarding empty state + e2e test structure"
```
