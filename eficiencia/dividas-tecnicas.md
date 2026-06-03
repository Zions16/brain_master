# Dívidas Técnicas — Brain Master

## DT-001 — pagamento: FUNCIONARIO vinculado por nome (crítico)
**Data:** 2026-06-03  
**Severidade:** Alta  
**Tabela:** `pagamento`

### Problema
A policy RLS `pagamento: funcionario ve o proprio` vincula funcionário ao usuário logado via:
```sql
lower(TRIM(f.nome)) = lower(TRIM(u.nome))
```
Se dois funcionários tiverem o mesmo nome na mesma empresa, um vê o pagamento do outro.

### Causa raiz
A tabela `funcionario` não tem coluna `user_id` linkando a `auth.users`.
Funcionário e usuário são entidades separadas ligadas apenas por `empresa_id + nome`.

### Solução correta
1. Adicionar coluna `user_id UUID REFERENCES auth.users(id)` em `funcionario`
2. Migrar os vínculos existentes (matching manual ou fluxo de convite)
3. Substituir a policy por: `funcionario_id IN (SELECT id FROM funcionario WHERE user_id = auth.uid())`

### Quando resolver
Sprint 26 ou antes de abrir cadastro público. Não é bloqueante para MVP fechado.

---

## DT-002 — JWT_SECRET usado pelo @fastify/jwt mas auth é Supabase
**Data:** 2026-06-03  
**Severidade:** Baixa  

### Problema
`@fastify/jwt` está registrado com `JWT_SECRET` mas a autenticação real usa Supabase Auth.
O plugin pode ser uma duplicidade sem uso real.

### Ação
Verificar se `app.jwt.*` é chamado em algum lugar. Se não, remover o registro para reduzir superfície de ataque.

---

## DT-003 — /refresh sem rate limit
**Data:** 2026-06-03  
**Severidade:** Baixa

Endpoint `/api/v1/auth/refresh` não tem rate limit.
Baixo risco (requer token válido), mas vale adicionar na Sprint 26.
