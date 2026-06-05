# CONTEXT — Medições

## Responsabilidade
Evento central do produto. Registro de trabalho executado por funcionário em serviço específico.
Gera valor calculado automaticamente. Alimenta o cálculo de pagamento.

## Arquivos principais
- `medicoes.service.ts` — criar, corrigir, cancelar, listar, aprovar
- `medicoes.routes.ts` — rotas por obra (ENGENHEIRO/GESTOR)
- `medicoes.global.routes.ts` — rota global de pendentes (GESTOR)
- `__tests__/medicoes.service.test.ts` — testes unitários

## Regras de negócio críticas
- **NUNCA deletar** — apenas cancelar com motivo obrigatório (mín. 10 chars)
- Correção gera registro imutável em `medicao_historico` (append-only)
- `valor_calculado = quantidade × servico.valor_pagamento` (calculado no backend)
- Só medições com `status = 'ativa'` entram no cálculo de pagamento
- Status: `pendente`, `ativa`, `corrigida`, `cancelada`, `pendente_aprovacao`

## Riscos
- Nunca aceitar `valor_calculado` do cliente — sempre recalcular no servidor
- Verificar `empresa_id` antes de qualquer operação (isolamento multiempresa)
- Engenheiro cria medições em `pendente_aprovacao` — Gestor aprova → muda para `ativa`

## Antes de alterar
- [ ] Regra de não-deleção está sendo respeitada?
- [ ] valor_calculado calculado no backend?
- [ ] empresa_id verificado antes da operação?
- [ ] Testes unitários passando?
