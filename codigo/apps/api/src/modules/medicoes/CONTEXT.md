# CONTEXT — Módulo Medições (API)

**Entidade central do produto.** Tudo gira em torno dela.

## Arquivos
- `medicoes.service.ts` — lógica de negócio (criar, corrigir, cancelar, listar)
- `medicoes.controller.ts` — FastifyRequest/Reply, chama service
- `medicoes.routes.ts` — rotas autenticadas (ENGENHEIRO/GESTOR)
- `medicoes.global.routes.ts` — rotas sem autenticação (verificar se ainda existe)
- `__tests__/` — testes unitários do service

## Regras críticas
- **Nunca deletar** medição — apenas `cancelar` com motivo obrigatório
- Correção gera registro imutável em `medicao_historico` (append-only)
- `valor_calculado = quantidade × servico.valor_pagamento`
- Só medições com `status = 'ativa'` entram no cálculo de pagamento
- Verificar `obra.empresa_id === request.usuario.empresa_id` antes de qualquer operação

## Perfis
- ENGENHEIRO: cria medição
- GESTOR: aprova, corrige, cancela, lista todas
- FUNCIONARIO: apenas lê próprias medições (RLS)
