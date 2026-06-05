# Dívidas Técnicas — Brain Master

## DT-001 — pagamento: FUNCIONARIO vinculado por nome
**Data identificação:** 2026-06-03
**Data resolução:** 2026-06-05
**Severidade:** Alta → ✅ RESOLVIDO

### Problema original
A policy RLS e o endpoint `/funcionarios/me` vinculavam funcionário ao usuário por nome.
Dois funcionários com mesmo nome na mesma empresa podiam cruzar dados.

### Causa raiz identificada
Três camadas de bug:
1. `buscarMeuPerfil()` usava `.ilike('nome')` → retornava o primeiro funcionário com aquele nome
2. `GET /:id/pagamentos` não verificava que FUNCIONARIO estava acessando seu próprio ID
3. RLS policy usava `lower(trim(f.nome)) = lower(trim(u.nome))`

### Solução aplicada (Sprint 28 — 2026-06-05)
1. **`funcionarios.service.ts`**: `buscarMeuPerfil(id, empresaId)` agora usa `funcionario.id` do JWT (não nome)
2. **Guards adicionados** em `listarPagamentosDoFuncionario`, `listarMedicoesDoFuncionario`, `calcularProducao`: FUNCIONARIO só acessa seu próprio ID
3. **Migration** `20260605_dt001_fix_pagamento_rls_nome.sql`: RLS policy corrigida (defense in depth)
4. **CONTEXT.md** atualizado em pagamentos e funcionários com aviso do fix

### Próximo passo (futuro — baixa prioridade)
Para completar o isolamento em RLS nativo: adicionar `user_id UUID REFERENCES auth.users(id)` em `funcionario`.
Necessário quando mobile fizer chamadas diretas ao Supabase com JWT nativo.

---

## DT-002 — @fastify/jwt duplicidade
**Data identificação:** 2026-06-03
**Status:** ✅ FALSO POSITIVO — fechado

### Resultado da verificação
`@fastify/jwt` está em uso ativo:
- `reply.jwtSign()` em `auth.controller.ts` (linhas 63 e 75) — assina JWT para FUNCIONARIO e ENGENHEIRO no token-login
- `(request.server as any).jwt.verify()` em `autenticar.ts` — verifica JWT de FUNCIONARIO

O plugin é essencial. Não remover.

---

## DT-003 — /refresh sem rate limit
**Data identificação:** 2026-06-03
**Data resolução:** 2026-06-05
**Severidade:** Baixa → ✅ RESOLVIDO

### Solução aplicada
Rate limit adicionado em `auth.routes.ts`: 30 requests por 15 minutos por IP.
