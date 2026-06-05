# CONTEXT — Pagamentos

## Responsabilidade
Cálculo, registro e realização de pagamentos por funcionário/período.
Valor sempre calculado server-side com base em medições ativas.

## Arquivos principais
- `pagamentos.service.ts` — cálculo por período, CRUD pagamento
- `pagamentos.controller.ts` — handlers
- `pagamentos.routes.ts` — requer perfil GESTOR ou FINANCEIRO

## Regras de negócio críticas
- `valor_total` calculado no servidor (nunca confia no cliente)
- Pagamento realizado é imutável — UPDATE só em status `pendente`
- Deduplicação: `.maybeSingle()` antes de INSERT
- No `realizarPagamento`: recalcula medições ativas do período no momento do fechamento
- Status: `pendente`, `realizado`, `cancelado`

## Riscos
- Acesso restrito a GESTOR/FINANCEIRO (não ENGENHEIRO)
- FUNCIONARIO acessa seus pagamentos via `/funcionarios/:id/pagamentos` (service.ts)
- Fix DT-001: isolamento por funcionario_id (não por nome) — `listarPagamentosDoFuncionario`
- RLS policy: `pagamento: gestor e financeiro veem` + `pagamento: funcionario ve o proprio`

## Antes de alterar
- [ ] Perfil GESTOR ou FINANCEIRO está na rota?
- [ ] valor_total calculado no backend?
- [ ] Status check antes de UPDATE (pendente → realizado)?
- [ ] Guard DT-001 presente em listarPagamentosDoFuncionario?
