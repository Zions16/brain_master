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
