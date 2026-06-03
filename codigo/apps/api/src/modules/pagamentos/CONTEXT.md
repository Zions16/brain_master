# CONTEXT — Módulo Pagamentos (API)

## Função
Consolida medições ativas em valor a pagar por funcionário.  
É um **relatório calculado** — não armazena valor fixo, sempre recalcula.

## Regra de negócio
- `total_a_pagar = SUM(quantidade × servico.valor_pagamento)` onde `status = 'ativa'`
- Pagamento aprovado congela o cálculo (snapshot) — medições posteriores não retroagem
- Somente GESTOR aprova pagamento
- Aprovação gera registro em `pagamento` com `status = 'pago'` e timestamp

## Dependências
- Módulo `medicoes` — fonte de dados
- Módulo `servicos` — valor_pagamento por m²
- Módulo `funcionarios` — destinatário do pagamento
