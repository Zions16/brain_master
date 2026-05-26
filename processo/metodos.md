# Métodos e Padrões — Brain Master

Referência rápida de padrões testados e aprovados. Usar antes de implementar algo novo.

---

## Padrão: 3 Clientes Supabase (CRÍTICO — nunca misturar)

**Onde:** `codigo/apps/api/src/`  
**Status:** Testado e validado no Sprint 6

```
supabase (service key)         → lib/supabase.ts
                                  SOMENTE queries .from()
                                  NUNCA chamar auth.signInWithPassword / refreshSession / getUser

authVerifyClient (service key) → middlewares/autenticar.ts
                                  SOMENTE auth.getUser(jwt)

authOpsClient (service key)    → modules/auth/auth.service.ts
                                  SOMENTE signInWithPassword / refreshSession / signOut
```

**Por quê:** `signInWithPassword()` no singleton salva o JWT do usuário na sessão interna, corrompendo todos os queries PostgREST subsequentes (ativa RLS em vez de usar service_role). Ver `erros-e-solucoes.md` para o caso completo.

---

## Padrão: Auth no Dashboard Web (Next.js 14)

**Onde:** `codigo/apps/web/`  
**Status:** Implementado no Sprint 7

**Fluxo:**
1. Login → `POST /api/v1/auth/login` (Fastify) → recebe `{ access_token, usuario }`
2. Token salvo em cookie `bm_token` (lido pelo middleware Next.js)
3. Dados do usuário salvos no Zustand com `persist` (localStorage)
4. Next.js middleware verifica cookie em cada request → redireciona para `/login` se ausente

**Por que cookie e não localStorage:**  
Middleware do Next.js é executado no edge (antes da renderização). Só tem acesso a cookies, não ao localStorage. Sem cookie, não é possível proteger rotas no servidor.

**Por que chamar a API Fastify e não o Supabase diretamente:**  
Reutiliza toda a lógica de negócio e validação já construída (sprints 2–6). Evita duplicar regras de autorização no frontend.

**Implementação chave:**
```typescript
// src/middleware.ts
const token = request.cookies.get('bm_token')?.value
if (!token && !isPublic) return NextResponse.redirect(new URL('/login', request.url))

// src/lib/api.ts — lê token do cookie em runtime
const match = document.cookie.split(';').find(c => c.trim().startsWith('bm_token='))
const token = match?.split('=')[1]
if (token) config.headers.Authorization = `Bearer ${token}`
```

---

## Padrão: Dynamic Routes no Next.js 14

**Onde:** Qualquer `app/(dashboard)/[id]/page.tsx`  
**Status:** Corrigido no Sprint 7 após erro de tipo

```typescript
// ✅ Next.js 14 — params é objeto síncrono
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}

// ❌ Next.js 15+ — NÃO usar nesta stack
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
}
```

---

## Padrão: Data Fetching no Dashboard Web

**Onde:** Pages no `(dashboard)/`  
**Status:** Implementado no Sprint 7

Usar `@tanstack/react-query` com `useQuery` para GET e `useMutation` para POST/PATCH.

```typescript
// GET
const { data, isLoading, isError } = useQuery({
  queryKey: ['obras'],
  queryFn: () => api.get('/api/v1/obras').then(r => r.data),
})

// POST/PATCH com invalidação de cache
const { mutate } = useMutation({
  mutationFn: (id) => api.patch(`/api/v1/obras/${id}/...`),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['obras'] }),
})
```

**Por que React Query e não useEffect + fetch:**  
Cache automático (30s staleTime), deduplicação de requests, loading/error states prontos, invalidação de cache após mutations.

---

## Padrão: Configuração Next.js 14

**Arquivo:** `next.config.js` (não `.ts`, não `.mjs`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

**Por quê `.js` e não `.ts`:** Next.js 14 não suporta `next.config.ts`. Suporte TypeScript nativo foi adicionado no Next.js 15.

---

## Padrão: Estrutura de Rotas no App Router (Next.js 14)

```
app/
├── layout.tsx              ← root layout (Providers aqui)
├── page.tsx                ← redirect para /obras
├── (auth)/                 ← route group (sem prefixo na URL)
│   └── login/page.tsx
└── (dashboard)/            ← route group com layout próprio
    ├── layout.tsx          ← Sidebar + main wrapper
    ├── obras/page.tsx
    ├── obras/[id]/page.tsx
    └── funcionarios/page.tsx
```

**Route groups `(nome)`:** agrupam rotas sem afetar a URL, permitem layouts diferentes por seção.

---

## Padrão: Resposta da API no Web — nunca usar `data.data`

**Onde:** Qualquer função de fetch em `apps/web/src/`  
**Status:** Confirmado no Sprint 7 (teste de integração)

O interceptor em `src/lib/api.ts` já desembrulha `{ data: X }` → `X` para todas as respostas:

```typescript
// src/lib/api.ts (NÃO modificar este comportamento)
api.interceptors.response.use((res) => {
  if (res.data !== null && typeof res.data === 'object' && 'data' in res.data) {
    res.data = res.data.data  // desembrulha aqui
  }
  return res
})
```

**Uso correto em todas as pages:**
```typescript
// ✅ Correto
const { data } = await api.get('/api/v1/obras')
return data  // já é o array/objeto final

// ❌ Errado — duplo desembrulhamento → retorna undefined
return data.data
```

---

## Padrão: Guard de duplicata antes de INSERT no Supabase

**Onde:** Qualquer `criarX()` no service da API onde duplicatas são problema  
**Status:** Implementado em `pagamentos.service.ts` — Sprint 7

Antes de inserir, verificar existência com `.maybeSingle()`:

```typescript
const { data: existente } = await supabase
  .from('pagamento')
  .select('id')
  .eq('obra_id', obraId)
  .eq('funcionario_id', input.funcionario_id)
  .eq('periodo_inicio', input.periodo_inicio)
  .eq('periodo_fim', input.periodo_fim)
  .eq('status', 'pendente')
  .maybeSingle()

if (existente) throw { statusCode: 409, message: 'Já existe um pagamento pendente para este período' }
```

**Por que `.maybeSingle()` e não `.single()`:**  
`.single()` lança erro se não encontrar nenhum registro. `.maybeSingle()` retorna `null` se não encontrar — comportamento correto para verificação de existência.

---

## Padrão: Endpoint de cálculo agregado — não exigir filtro por entidade filha

**Onde:** Routes de cálculo/relatório  
**Status:** Refatorado no Sprint 7

Ao projetar endpoint de cálculo que o gestor vai usar:

```typescript
// ❌ Exige seleção prévia de funcionário — ruim para o gestor
GET /obras/:id/pagamentos/calcular?funcionario_id=UUID&inicio=...&fim=...

// ✅ Calcula para todos, gestor vê tudo de uma vez
GET /obras/:id/pagamentos/calcular?inicio=...&fim=...
// → retorna array com um item por funcionário que tem medições no período
```

**Regra:** Se o usuário da rota é o GESTOR e o contexto é "calcular/visualizar tudo", o endpoint deve agregar sem exigir filtro por entidade filha.

---

## Padrão: Verificação de TypeScript antes de rodar

Sempre rodar `npm run type-check` antes de `npm run dev` para pegar erros de tipo sem precisar aguardar o servidor subir.

```bash
cd codigo/apps/web && npm run type-check
```

Tempo médio: ~3s. Economiza tempo vs esperar o servidor compilar e retornar erro em runtime.
