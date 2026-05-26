# Erros e Soluções — Brain Master

Registro cronológico de erros encontrados durante o desenvolvimento, com causa raiz e solução adotada.

---

## [2026-05-22] Session Pollution no Supabase (Bug Crítico)

**Contexto:** Sprint 6 — módulo de pagamentos  
**Sintoma:** `PATCH /pagamentos/:id/realizar` falhava com `HTTP 500 — 42501: new row violates row-level security policy`. INSERTs passavam, mas UPDATEs falhavam de forma inconsistente.

**Causa raiz:**  
`supabase.auth.signInWithPassword()` e `refreshSession()` eram chamados no **singleton** `supabase` (importado de `lib/supabase.ts`). O Supabase client salva o JWT do usuário na sessão interna quando essas funções são chamadas. Todos os queries PostgREST subsequentes passaram a enviar `Authorization: Bearer {userJwt}` (role: `authenticated`) em vez da service key (role: `service_role`), ativando o RLS.

**Por que o INSERT passava mas o UPDATE não:**  
- INSERT: a policy `WITH CHECK` estava satisfeita pelo usuário GESTOR autenticado
- UPDATE: a policy tinha uma condição implícita no `WITH CHECK` (`status = 'pendente'`) que falhava ao tentar setar `status = 'realizado'`

**Solução adotada:**  
Criação de 3 clientes Supabase separados (ver `metodos.md` — Padrão 3 Clientes):
- `supabase` → apenas queries de banco `.from()`
- `authVerifyClient` → apenas `auth.getUser(jwt)` no middleware
- `authOpsClient` → apenas `signInWithPassword`, `refreshSession`, `signOut`

**Arquivo corrigido:** `codigo/apps/api/src/modules/auth/auth.service.ts`  
**Commit:** `1c7a8cd`

---

## [2026-05-26] `next.config.ts` não suportado no Next.js 14

**Contexto:** Sprint 7 — scaffold do dashboard web  
**Sintoma:** `npm run dev` falhava com:
```
Error: Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

**Causa raiz:**  
Arquivo de configuração criado como `.ts`. Next.js 14 só aceita `next.config.js` ou `next.config.mjs`. Suporte a `.ts` foi adicionado apenas no Next.js 15.

**Solução:** Deletar `next.config.ts` e criar `next.config.js` com `module.exports`.

**Lição:** Ao criar projetos Next.js 14, usar sempre `next.config.js`.

---

## [2026-05-26] Duplo desembrulhamento de resposta da API no web

**Contexto:** Sprint 7 — teste de integração (serviços + calcular pagamentos)  
**Sintoma:** Página de Serviços mostrava "Erro ao carregar serviços." e Calcular Pagamentos não exibia resultados após clicar.

**Causa raiz:**  
O interceptor do Axios em `src/lib/api.ts` já desembrulha `{ data: X }` → `X` automaticamente. Funções novas fizeram `return data.data` em vez de `return data`, resultando em `undefined` nas duas chamadas.

```typescript
// ❌ Errado — duplo desembrulhamento
const { data } = await api.get('/api/v1/obras/:id/servicos')
return data.data  // data já é o array, data.data = undefined

// ✅ Correto — interceptor já desembrulhou
const { data } = await api.get('/api/v1/obras/:id/servicos')
return data
```

**Arquivos corrigidos:**  
- `apps/web/src/app/(dashboard)/obras/[id]/servicos/page.tsx`  
- `apps/web/src/app/(dashboard)/obras/[id]/pagamentos/calcular/page.tsx`

**Lição:** Ao criar nova chamada de API no web, sempre usar `return data` — nunca `return data.data`. O interceptor já resolve o envelope.

---

## [2026-05-26] Calcular pagamentos exigia `funcionario_id` mas web não enviava

**Contexto:** Sprint 7 — teste de integração  
**Sintoma:** `GET /api/v1/obras/:id/pagamentos/calcular` retornava 400 com "Erro ao calcular. Verifique o período."

**Causa raiz (2 problemas simultâneos):**  
1. Web enviava `periodo_inicio/periodo_fim`, API esperava `inicio/fim`  
2. `calculoPagamentoQuerySchema` exigia `funcionario_id` (UUID), mas o web nunca enviava — a tela de calcular não tem seletor de funcionário

**Solução:**  
- Removido `funcionario_id` do schema — endpoint calcula todos os funcionários da obra  
- Nova função `calcularTodosPagamentos()` busca funcionários distintos com medições ativas no período  
- Web corrigido: params `inicio/fim`

**Lição:** Ao projetar endpoint de cálculo agregado, não exigir filtro por entidade filha (funcionário) — o gestor quer ver todos de uma vez.

---

## [2026-05-26] `React.use(params)` não existe no Next.js 14

**Contexto:** Sprint 7 — páginas com dynamic routes `[id]`  
**Sintoma:** `tsc --noEmit` falhou com:
```
error TS2305: Module '"react"' has no exported member 'use'.
```

**Causa raiz:**  
`React.use()` e o padrão `params: Promise<{ id: string }>` são Next.js 15+. No Next.js 14, `params` é um objeto síncrono passado diretamente como prop.

**Solução:**  
```typescript
// ❌ Next.js 15+ (não usar com Next 14)
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
}

// ✅ Next.js 14 (correto)
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}
```

**Lição:** Verificar a versão do Next.js antes de usar APIs de params. Stack usa Next.js 14.2.x.
