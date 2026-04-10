# Regras de Negócio — Brain Master

Documento vivo. Atualizar sempre que uma regra for definida, alterada ou removida.

---

## Medição

### RN-001 — Cálculo do valor da medição
```
valor_calculado = quantidade × servico.valor_pagamento
```
- Calculado no backend no momento do INSERT
- Nunca recalculado retroativamente se o valor do serviço mudar
- Valor no momento da medição é o valor que vale para pagamento

### RN-002 — Medição nunca é deletada
- Status permitidos: `ativa`, `corrigida`, `cancelada`, `pendente`
- DELETE é proibido na tabela `medicao`
- RLS não deve ter política DELETE para nenhum perfil

### RN-003 — Correção de medição exige motivo
- Campo `motivo` em `medicao_historico` é NOT NULL e mínimo 10 caracteres
- Fluxo: medição original → status `corrigida` + nova medição com valor correto
- Todo registro em `medicao_historico` é imutável (append-only)

### RN-004 — Somente medições `ativa` entram no pagamento
- Medições com status `corrigida`, `cancelada` ou `pendente` são ignoradas no cálculo
- Após aprovação, status muda de `pendente` para `ativa`

### RN-005 — Quem pode criar medição
- ENGENHEIRO: cria medição com status `pendente` (aguarda aprovação do gestor)
- GESTOR: cria medição com status `ativa` diretamente (sem aprovação necessária)

---

## Pagamento

### RN-010 — Cálculo do total a pagar
```
total_período = SUM(valor_calculado) WHERE
  funcionario_id = X
  AND data BETWEEN periodo_inicio AND periodo_fim
  AND status = 'ativa'
```

### RN-011 — Pagamento realizado não é revertido
- Uma vez marcado como `realizado`, o pagamento não pode mudar de status
- Ajustes devem ser feitos no próximo período com observação

### RN-012 — Período de pagamento
- Configurável por obra: semanal, quinzenal ou mensal
- Padrão: quinzenal
- Período é definido pelo gestor ao fechar o pagamento

---

## Materiais

### RN-020 — Alerta de estoque
- Alerta `material_baixo` quando `quantidade_atual <= quantidade_minima`
- Alerta `material_zerado` quando `quantidade_atual = 0`
- Alerta persiste até que compra seja registrada e estoque suba acima do mínimo

### RN-021 — Movimentação de material é auditável
- Toda entrada e saída registra: usuário, data, quantidade, tipo
- Sem DELETE em `movimentacao_material`

---

## Permissões

### RN-030 — Isolamento por empresa
- Todo acesso a dados é filtrado por `empresa_id` do usuário autenticado
- RLS no Supabase garante isso no nível do banco — não apenas no código

### RN-031 — Isolamento por obra (engenheiro)
- ENGENHEIRO acessa apenas obras vinculadas a ele em `obra_usuario`
- GESTOR e FINANCEIRO acessam todas as obras da empresa

### RN-032 — Funcionário acessa apenas os próprios dados
- FUNCIONARIO vê apenas suas medições e pagamentos
- Nunca vê dados de outros funcionários ou valores financeiros da empresa

### RN-033 — Compras não acessa medições nem pagamentos
- Perfil COMPRAS acessa apenas: materiais, estoque, solicitações, alertas
- Sem visibilidade de valores de mão de obra

---

## Integridade

### RN-040 — `medicao_historico` é append-only
- Sem UPDATE e sem DELETE para qualquer perfil, incluindo service_key
- Garantido por política RLS + ausência de endpoint para isso

### RN-041 — `pagamento` com status `realizado` é imutável
- Sem PATCH/PUT no valor ou status após `realizado`
- Correções no próximo período

---

*Última atualização: 2026-04-10*
