# Sprint 7b — Teste de Integração Web + Correções

**Data:** 2026-05-26  
**Fase:** Fase 1 — MVP  
**Status:** Concluído ✅

---

## Objetivo

Testar o fluxo completo web+API com dados reais e corrigir os problemas encontrados.

---

## Ponto de partida

Sprint 7 (setup) concluído. App subia limpo em localhost mas não tinha sido testado com dados reais do Supabase.

---

## Fluxo de teste executado

| Tela | Resultado |
|---|---|
| Redirect `/` → `/login` | ✅ |
| Login com usuário real | ✅ |
| Lista de obras | ✅ |
| Detalhe da obra | ✅ |
| Funcionários | ✅ |
| Medições | ✅ |
| Pagamentos (lista) | ✅ |
| Calcular Pagamentos | ❌ → corrigido |
| Serviços | ❌ (não existia) → criado |

---

## Problemas encontrados e corrigidos

### Bug 1 — Calcular retornava erro

**Causa 1:** Web enviava `periodo_inicio/periodo_fim`, schema esperava `inicio/fim`  
**Causa 2:** Schema exigia `funcionario_id` que o web nunca enviava  
**Solução:** API refatorada para calcular todos os funcionários da obra (sem `funcionario_id`)  
**Ver detalhes:** `erros-e-solucoes.md`

### Bug 2 — Pagamentos duplicados na listagem

**Causa:** `criarPagamento` não verificava existência antes de INSERT  
**Solução:** Guard `.maybeSingle()` adicionado antes do INSERT → 409 se duplicata  
**Ver padrão:** `metodos.md` — Guard de duplicata

### Bug 3 — Serviços retornava erro / Calcular sem resultado após correção

**Causa:** Duplo desembrulhamento — `return data.data` em vez de `return data`  
**O interceptor do Axios já desembrulha `{ data: X }` → `X`**  
**Solução:** Corrigido para `return data` nos dois arquivos  
**Ver padrão:** `metodos.md` — Resposta da API no Web

---

## Feature adicionada

### Página de Serviços (`/obras/[id]/servicos`)

A tela de detalhe da obra não tinha acesso a serviços — o gestor não conseguia ver nem cadastrar serviços pelo web.

**Implementado:**
- Tabela: nome, unidade, valor por unidade, status (ativo/inativo)
- Formulário inline: nome, unidade (select com 7 opções), valor
- Botão "Novo serviço" abre o form; "Cancelar" fecha e limpa
- Card "Serviços" adicionado na tela de detalhe (grid 2 → 3 colunas)
- Validação client-side antes de enviar

**API usada:** `GET /obras/:id/servicos` + `POST /obras/:id/servicos` (já existiam nos sprints anteriores)

---

## Arquivos alterados

| Arquivo | Tipo | O que mudou |
|---|---|---|
| `packages/validators/pagamento.ts` | fix | Removido `funcionario_id` do schema de calcular |
| `apps/api/src/modules/pagamentos/pagamentos.service.ts` | fix+feat | `calcularTodosPagamentos()` + guard de duplicata |
| `apps/api/src/modules/pagamentos/pagamentos.controller.ts` | fix | Usa nova função de calcular |
| `apps/web/src/lib/api.ts` | fix | Interceptor de desembrulhamento (já estava, não comitado) |
| `apps/web/src/app/(dashboard)/obras/[id]/pagamentos/calcular/page.tsx` | fix | Params `inicio/fim` + `return data` |
| `apps/web/src/app/(dashboard)/obras/[id]/page.tsx` | feat | Card Serviços + grid 3 colunas |
| `apps/web/src/app/(dashboard)/obras/[id]/servicos/page.tsx` | feat | Página nova |

**Commit:** `3361511`

---

## Método de trabalho desta sessão

1. Teste visual com screenshots do usuário — identificação de 2 erros
2. Leitura dos arquivos relevantes antes de diagnosticar (`service`, `controller`, `validator`, `page`)
3. Diagnóstico pela causa raiz (não pelo sintoma)
4. Para o bug do duplo desembrulhamento: leitura do `api.ts` + comparação com páginas que funcionavam
5. Execução em paralelo onde possível (TypeScript check nas duas apps ao mesmo tempo)
6. Validação por screenshot do usuário antes de commitar

**O que funcionou bem:**
- Ler `api.ts` para entender o contrato do interceptor antes de diagnosticar o bug de serviços
- Comparar com páginas funcionando (`obras/page.tsx`, `funcionarios/page.tsx`) — padrão ficou óbvio

**O que causaria retrabalho no futuro (lição):**
- Ao criar nova página web, sempre verificar `api.ts` primeiro para entender o interceptor
- Ao projetar endpoint de cálculo: pensar em quem vai chamar e o que espera ver

---

## Resultado final

- TypeScript: 0 erros (api + web)
- Fluxo completo funcionando: login → obras → serviços → medições → pagamentos → calcular → realizar
- Nenhuma duplicata possível em pagamentos pendentes

---

## Próximo passo

Sprint 8 — CRUD de obras e funcionários pelo web (hoje só lê, não cria/edita)
