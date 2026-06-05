# CONTEXT — Dashboard Web (Next.js 14)

## Responsabilidade
Interface web da plataforma para todos os perfis. Consome a API Fastify via `src/lib/api.ts`.
Sem chamadas diretas ao Supabase — tudo via API backend.

## Arquivos principais
- `src/lib/api.ts` — cliente Axios com interceptor de token (cookie `bm_token`) e desembrulho automático
- `src/middleware.ts` — proteção de rotas (cookie `bm_token` no edge)
- `src/store/auth.ts` — Zustand com persist (localStorage)
- `(dashboard)/layout.tsx` — Sidebar + layout principal

## Regras de negócio críticas
- Token armazenado em cookie `bm_token` (não localStorage) — obrigatório para middleware Next.js funcionar
- Interceptor já desembrulha `{ data: X }` → `X`. **Nunca usar `data.data`** — retorna undefined
- React Query para todos os fetches: `useQuery` (GET) + `useMutation` (POST/PATCH)
- `params` em dynamic routes é síncrono no Next.js 14: `{ params: { id: string } }` (não Promise)

## Perfis e páginas
- GESTOR: tudo
- ENGENHEIRO: `/engenheiro` (suas obras) + form de medição
- FUNCIONARIO: `/minha-producao` (busca por funcionario.id do JWT, não por nome — Fix DT-001)
- FINANCEIRO: dashboard + obras (sem criação)

## Riscos
- Duplo desembrulhamento: sempre `return data`, nunca `return data.data` (ver erros-e-solucoes.md)
- `next.config.js` (não .ts, não .mjs) — Next.js 14 não suporta next.config.ts
- `React.use(params)` é Next.js 15+, não usar

## Antes de alterar
- [ ] Novo fetch usa `return data` (não `return data.data`)?
- [ ] Nova rota tem proteção no middleware.ts?
- [ ] Tipo de `params` é síncrono `{ id: string }` (não Promise)?
