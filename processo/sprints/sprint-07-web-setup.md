# Sprint 7 — Dashboard Web: Setup Completo

**Data:** 2026-05-26  
**Fase:** Fase 1 — MVP  
**Duração da sessão:** ~1h  
**Status:** Concluído ✅

---

## Objetivo

Scaffold completo do dashboard web (`apps/web/`) em Next.js 14: configuração, auth, layout, rotas protegidas e páginas principais.

---

## Ponto de partida

`apps/web/` existia no monorepo mas continha apenas `package.json`, `.env` e `node_modules`. Zero código fonte.

`package.json` já tinha as dependências corretas pré-definidas:
- `next@^14.2.5`, `react@^18`, `typescript`
- `@tanstack/react-query`, `zustand`, `axios`
- `tailwindcss`, `react-hook-form`, `zod`

---

## Decisões de arquitetura

### 1. Web chama API Fastify, não Supabase diretamente
**Alternativa considerada:** Chamar Supabase diretamente do browser com anon key + JWT  
**Decisão:** Chamar a API Fastify (`http://localhost:3333`)  
**Motivo:** Reutiliza toda a lógica de negócio dos sprints 2–6 (validação, cálculo de valores, regras de pagamento). Evita duplicar lógica e manter consistência entre mobile e web.

### 2. JWT em cookie (não localStorage)
**Alternativa considerada:** Salvar token no localStorage via Zustand persist  
**Decisão:** Salvar em cookie `bm_token` (+ dados do usuário no Zustand/localStorage)  
**Motivo:** Next.js middleware roda no edge e só tem acesso a cookies. Sem cookie, não é possível proteger rotas server-side. Com cookie, o middleware redireciona antes de qualquer renderização.

### 3. `QueryClientProvider` em componente separado (`Providers.tsx`)
**Motivo:** `useState` não pode ser usado em Server Components (layout.tsx é server component por padrão). Isolar o provider em `'use client'` é o padrão recomendado pelo Next.js 14.

---

## Erros encontrados durante a sessão

### Erro 1: `next.config.ts` não suportado
**Método inicial:** Criar `next.config.ts` (TypeScript) seguindo o padrão moderno  
**Resultado:** Servidor falhou ao iniciar — Next.js 14 não suporta `.ts`  
**Tempo perdido:** ~2 min  
**Solução:** Recriar como `next.config.js` com `module.exports`  
**Registrado em:** `erros-e-solucoes.md`

### Erro 2: `React.use(params)` não existe no Next.js 14
**Método inicial:** Usar o padrão Next.js 15+ com `Promise<{ id: string }>` e `React.use()`  
**Resultado:** `tsc` retornou `error TS2305: Module '"react"' has no exported member 'use'`  
**Tempo perdido:** ~3 min  
**Solução:** Reverter para padrão Next.js 14 — params como objeto síncrono  
**Detectado por:** `npm run type-check` (antes de rodar o servidor — economizou tempo)  
**Registrado em:** `erros-e-solucoes.md`

---

## Método de trabalho desta sessão

1. **Leitura de contexto:** `ultima-sessao.md` + `project_brain_master.md` (memória)
2. **Checagem do estado atual:** `ls apps/` + `cat package.json` + rotas da API
3. **Checagem dos tipos compartilhados:** `packages/shared/tipos.ts` (para tipagem das páginas)
4. **Plano apresentado antes de executar** (aprovado pelo usuário)
5. **Criação em batches paralelos** (config → lib/store → app core → páginas)
6. **Validação:** `npm run type-check` → erros encontrados e corrigidos
7. **Validação final:** `npm run dev` → servidor subiu em 3.9s, retornou 307 (correto)

**O que funcionou bem:**
- Ler `tipos.ts` do shared package antes de escrever as páginas — tipagem correta de primeira
- Verificar rotas da API antes de escrever os `api.get()` — zero URLs erradas
- `type-check` antes de `dev` — pegou o erro de `React.use` antes de rodar o servidor

**O que causou retrabalho:**
- Não verificar a versão do Next.js antes de escolher o padrão de `params` e `next.config`
- Ambos os erros eram previsíveis consultando o `package.json` antes

---

## Arquivos criados (21 arquivos)

| Arquivo | Finalidade |
|---|---|
| `next.config.js` | Config do Next.js (sem TypeScript — Next 14) |
| `tsconfig.json` | TypeScript com path alias `@/*` |
| `tailwind.config.ts` | Tailwind com content paths corretos |
| `postcss.config.js` | PostCSS para Tailwind |
| `src/middleware.ts` | Proteção de rotas via cookie `bm_token` |
| `src/lib/api.ts` | Axios → Fastify API, injeta token do cookie |
| `src/store/auth.ts` | Zustand persist com dados do usuário |
| `src/components/Providers.tsx` | QueryClient wrapper (client component) |
| `src/components/Sidebar.tsx` | Navegação lateral com logout |
| `src/components/LoadingSpinner.tsx` | Spinner reutilizável |
| `src/app/globals.css` | Tailwind directives |
| `src/app/layout.tsx` | Root layout com Providers |
| `src/app/page.tsx` | Redirect → /obras |
| `src/app/(auth)/login/page.tsx` | Formulário de login |
| `src/app/(dashboard)/layout.tsx` | Layout com Sidebar |
| `src/app/(dashboard)/obras/page.tsx` | Lista de obras em cards |
| `src/app/(dashboard)/obras/[id]/page.tsx` | Detalhe da obra |
| `src/app/(dashboard)/obras/[id]/medicoes/page.tsx` | Tabela de medições |
| `src/app/(dashboard)/obras/[id]/pagamentos/page.tsx` | Tabela + botão realizar |
| `src/app/(dashboard)/obras/[id]/pagamentos/calcular/page.tsx` | Calcular por período + gerar |
| `src/app/(dashboard)/funcionarios/page.tsx` | Tabela de funcionários |

---

## Resultado final

- TypeScript: 0 erros
- Servidor: sobe em 3.9s
- Rota `/`: retorna 307 → `/obras` → `/login` (sem cookie) ✅
- `SUPABASE_SERVICE_KEY` removido do `.env` do web ✅

---

## Próximo passo

Teste de integração completo com API rodando:
1. Subir API (`apps/api`)
2. Subir web (`apps/web`)
3. Login com usuário real → verificar fluxo completo
4. Testar calcular + realizar pagamento
