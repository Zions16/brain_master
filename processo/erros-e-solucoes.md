# Erros e Soluções — Brain Master

Registro cronológico de erros encontrados durante o desenvolvimento, com causa raiz e solução adotada.

---

## [2026-06-22] "Banco perdido" — na verdade pausa por inatividade (FREE)

**Contexto:** Sprint 29 — tentando aplicar migration de billing
**Sintoma:** Supabase MCP dava timeout até num `SELECT 1`. Dashboard mostrava o projeto "App construtora" (`cojljgnuvievwsxmvdaa`) PAUSADO há +90 dias, com aviso "cannot be restored through the dashboard" e oferta de download de backup. Parecia perda do banco de produção.

**Causa raiz:** Projeto no plano **FREE** pausa automaticamente após inatividade. Os dados continuam intactos — só ficam inacessíveis enquanto pausado. A mensagem de "+90 dias / não restaurável pelo dashboard" assusta, mas **abrir o dashboard reativa o projeto**.

**Solução:** Acessar o dashboard da conta dona (**zps@cesar.school**, não .com) e abrir o projeto → reativa. MCP voltou a responder; migration já estava aplicada.

**Prevenção:** Manter acesso frequente OU upgrade para Pro para SaaS em produção. Conferir SEMPRE qual conta/ref antes de assumir perda: ref usado pelo app fica em `apps/api/.env` → `SUPABASE_URL`.

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

## [2026-05-27] `fetchCalculo` retornava `undefined` por duplo desembrulhamento

**Contexto:** Sprint 12 — dashboard por obra (seção "Produção por funcionário")  
**Sintoma:** Seções "Produção por funcionário", "Ranking de equipe" e "Maior produtor" sempre mostravam "Sem dados no período", mesmo após inserir medições via seed.

**Causa raiz:**  
```typescript
// ❌ Errado — data.data = undefined
async function fetchCalculo(...): Promise<CalculoPagamento[]> {
  const { data } = await api.get(`/api/v1/obras/${obraId}/pagamentos/calcular`, ...)
  return data.data  // interceptor já desembrulhou: data = array, .data = undefined
}
```
O interceptor do Axios em `api.ts` já faz `res.data = res.data.data` (desembrulha `{ data: X }` → `X`). A função fazia `.data` uma segunda vez, resultando em `undefined`. Como `calculo ?? []` = `[]`, o componente sempre mostrava "Sem dados".

**Por que não apareceu antes:** Antes do seed não havia medições — endpoint retornava `[]` de qualquer forma, erro era silencioso.

**Solução:** `return data` (linha 29 de `obras/[id]/dashboard/page.tsx`)

**Lição:** Toda chamada nova de API no web deve usar `return data`, nunca `return data.data`. O interceptor já resolve o envelope `{ data: X }`.

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

---

### [2026-06-05] DT-001 — Isolamento de funcionário por nome causava vazamento de dados

**Contexto:** Sprint 28 — Auditoria de segurança  
**Sintoma:** Dois funcionários com mesmo nome na mesma empresa poderiam ver dados (pagamentos, medições, produção) um do outro via endpoint `/funcionarios/me` e consultas por `:id`.

**Causa raiz (3 camadas):**
1. `buscarMeuPerfil()` usava `.ilike('nome', usuarioNome)` — retornava o primeiro registro com aquele nome (não necessariamente o do usuário logado)
2. `GET /:id/pagamentos`, `/:id/medicoes`, `/:id/producao` aceitavam qualquer UUID de funcionário da empresa — não verificavam que o solicitante FUNCIONARIO era o dono daquele ID
3. RLS policy `pagamento: funcionario ve o proprio` também usava match por nome

**Por que não detectado antes:** em produção, funcionários raramente têm nome idêntico. O bug era latente.

**Solução:**
- `buscarMeuPerfil(funcionarioId, empresaId)` — agora usa `id` do JWT (sub = funcionario.id para FUN tokens)
- Guards `if (perfil === 'FUNCIONARIO' && solicitanteId !== funcionarioId) → 403` nas funções de consulta individual
- Migration `20260605_dt001_fix_pagamento_rls_nome.sql` — RLS policy corrigida

**Lição:** Nunca usar campos textuais (nome, email) para identificação de identidade em sistemas multiusuário. Usar sempre IDs únicos. O JWT já transportava o `funcionario.id` correto desde o início — bastava usá-lo.

---

### [2026-06-02] Supabase crash no startup — Node 20 sem WebSocket nativo

**Erro:**
```
Error: Node.js 20 detected without native WebSocket support.
```

**Causa:** `@supabase/supabase-js` (versões recentes) inicializa `RealtimeClient` na criação do client. Node 20 não tem WebSocket nativo (adicionado no Node 22). O throw acontece em tempo de carga de módulo (`supabase.ts`), antes do Fastify subir.

**Solução:** Trocar `FROM node:20-alpine` por `FROM node:22-alpine` no Dockerfile. Node 22 é o LTS atual e tem WebSocket nativo.

**Alternativa descartada:** Instalar `ws` e passar via `transport` no `createClient` — mais verboso e não resolve o EOL do Node 20.
