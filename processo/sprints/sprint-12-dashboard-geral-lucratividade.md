# Sprint 12 — Dashboard Geral + Lucratividade + Seed de demonstração

**Data:** 2026-05-27  
**Fase:** 1 — MVP  
**Status:** Concluído

---

## Objetivo

Adicionar visibilidade financeira completa ao produto:
- Painel geral com todas as obras consolidadas
- Cálculo automático de lucratividade (receita − custo M.O.) por obra e por período
- Dados de demonstração realistas para validar os dashboards
- Página de serviços mostrando o que se paga ao funcionário vs o que se cobra do cliente

---

## O que foi feito

### 1. Seed de demonstração (`supabase/seeds/seed_demo.sql`)
- 3 obras: Residencial Parque das Flores (ativa), Galpão Industrial Norte (ativa), Hospital Regional Leste (pausada)
- 12 funcionários distribuídos (5 / 4 / 3 por obra) com funções realistas
- 4 serviços por obra com `valor_pagamento` e `valor_cobranca` definidos
- ~60 medições cobrindo Mar/Abr/Mai 2026 (Obras 1 e 2) e Nov/Dez 2025 (Obra 3)
- Pagamentos com mix realizado/pendente para popular os gráficos históricos
- Executado via `DO $$` com lookup dinâmico de `empresa_id` e `usuario_id` — funciona em qualquer ambiente

### 2. Fix: `valor_cobranca_calculado` (`supabase/seeds/fix_cobranca.sql`)
- UPDATE nas medições do seed para popular `valor_cobranca_calculado = quantidade * valor_cobranca`
- Campo já existia no schema desde o Sprint 1, mas nunca era populado

### 3. API — endpoint `GET /api/v1/obras/resumo`
- Novo endpoint em `obras.service.ts`: `resumoTodasObras(empresaId)`
- Por obra: agrega pagamentos (pago/pendente) + medições ativas (custo, cobrança, funcionários únicos)
- Calcula `progresso_pct` com base em `data_inicio → data_prev_fim` vs hoje
- Registrado antes de `/:id` no Fastify (evita conflito de rota)
- Acesso: GESTOR e FINANCEIRO

### 4. API — `calcularTodosPagamentos` com lucratividade
- `calcularValorPeriodo` agora seleciona `valor_cobranca_calculado` e retorna `valor_cobranca_total`
- `CalculoPagamento` (API e frontend) recebe o novo campo

### 5. Tipos compartilhados (`packages/shared/tipos.ts`)
- `ObraResumo extends Obra` com: `total_pago`, `total_pendente`, `total_medicoes`, `total_funcionarios`, `progresso_pct`, `total_custo_producao`, `total_cobranca_producao`

### 6. Página `/dashboard` (nova — Dashboard Geral)
- Linha 1 de KPIs: Total obras, Total pago M.O., Total pendente, Funcionários ativos
- Linha 2 de KPIs: Receita bruta total, Custo M.O. total, Margem consolidada (card verde/vermelho com %)
- Grid de cards por obra: nome, cliente, datas, status, KPIs (pago/pendente/medições), bloco de lucratividade (receita, custo, margem R$ e %), barra de progresso temporal

### 7. Dashboard individual — seção Lucratividade
- Nova seção entre os KPIs e os gráficos
- 4 métricas: Receita bruta, Custo M.O., Margem R$, Margem %
- Barra visual sobreposta custo/receita
- Badge "Positiva / Negativa" no cabeçalho da seção
- Só aparece quando há dados no período

### 8. Página de Serviços — preços completos
- Formulário: 3 campos de preço em linha (Pago ao func. | Cobrado do cliente | Margem/unid. calculada em tempo real)
- Tabela: 3 colunas de preço com ícone TrendingUp/TrendingDown e % de margem por serviço
- Footer com médias dos serviços ativos que têm cobrança cadastrada

### 9. Sidebar + Middleware
- "Dashboard" adicionado como primeiro item da nav (ícone `LayoutDashboard`)
- Redirect pós-login: `/obras` → `/dashboard`

---

## Bug corrigido

### `fetchCalculo` com duplo desembrulhamento (`data.data`)
- **Sintoma:** "Produção por funcionário" e "Ranking de equipe" sempre mostravam "Sem dados", mesmo com medições no banco
- **Causa:** `fetchCalculo` fazia `return data.data`, mas o interceptor Axios já desembrulha `{ data: X }` → `X`. Resultado: `data` já era o array, `.data` retornava `undefined`, `calculo ?? []` virava `[]`
- **Solução:** `return data` (linha 29 de `obras/[id]/dashboard/page.tsx`)
- **Por que não apareceu antes:** Antes do seed não havia medições, o endpoint retornava `[]` de qualquer forma

---

## Decisões técnicas

- **N+2 queries por obra no `/resumo`:** Aceitável para MVP com ≤10 obras. Se escalar, migra para aggregate SQL no Supabase
- **Progresso temporal calculado server-side:** `data_inicio → data_prev_fim` vs `Date.now()`. Se obra pausada ou encerrada, o % reflete o tempo decorrido, não o físico — documentado como limitação futura
- **`valor_cobranca` opcional:** Obras sem valor de cobrança cadastrado mostram "—" na tabela e são excluídas dos cálculos de margem (não forçam erro)
- **Seed com `DO $$` dinâmico:** Não usa IDs hardcoded — roda em qualquer instância Supabase do projeto

---

## Arquivos alterados

| Arquivo | Tipo | O que mudou |
|---|---|---|
| `supabase/seeds/seed_demo.sql` | Criado | Seed completo: 3 obras, 12 funcs, 4 serv/obra, ~60 medições, pagamentos |
| `supabase/seeds/fix_cobranca.sql` | Criado | UPDATE para popular `valor_cobranca_calculado` |
| `packages/shared/tipos.ts` | Editado | `ObraResumo` adicionado com campos de lucratividade |
| `apps/api/obras.service.ts` | Editado | `resumoTodasObras` — novo endpoint de resumo com lucratividade |
| `apps/api/obras.controller.ts` | Editado | `handleResumoObras` |
| `apps/api/obras.routes.ts` | Editado | `GET /resumo` antes de `/:id` |
| `apps/api/pagamentos.service.ts` | Editado | `calcularValorPeriodo` retorna `valor_cobranca_total` |
| `apps/web/types/calculo.ts` | Editado | `CalculoPagamento` com `valor_cobranca_total` |
| `apps/web/(dashboard)/dashboard/page.tsx` | Criado | Dashboard Geral com KPIs + margem + cards de obra |
| `apps/web/(dashboard)/obras/[id]/dashboard/page.tsx` | Editado | Seção lucratividade + fix `data.data` → `data` |
| `apps/web/(dashboard)/obras/[id]/servicos/page.tsx` | Editado | Formulário e tabela com preços duplos e margem |
| `apps/web/components/Sidebar.tsx` | Editado | Item Dashboard adicionado |
| `apps/web/middleware.ts` | Editado | Redirect pós-login para `/dashboard` |
| `sessoes/ultima-sessao.md` | Editado | Estado atualizado |

---

## Próximo passo sugerido

- Testar lucratividade com dados reais do cliente
- Avaliar se `valor_cobranca` deve virar obrigatório ou continuar opcional
- Considerar página de relatório exportável (PDF) — candidato para Sprint 13
