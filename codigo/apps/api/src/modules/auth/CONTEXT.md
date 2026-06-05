# CONTEXT — Auth

## Responsabilidade
Login email+senha (GESTOR/FINANCEIRO/COMPRAS) e token FUN-XXXXX/ENG-XXXXX (FUNCIONARIO/ENGENHEIRO).
Cadastro de empresa + gestor. Refresh e logout.

## Arquivos principais
- `auth.service.ts` — lógica (3 clientes Supabase separados — NUNCA misturar)
- `auth.controller.ts` — handlers HTTP + `handleTokenLogin` (usa `reply.jwtSign` para FUN/ENG)
- `auth.routes.ts` — rotas públicas (sem middleware `autenticar`)

## Regras de negócio críticas
- **3 clientes Supabase obrigatórios** (ver `processo/metodos.md` — Padrão 3 Clientes):
  - `supabase` → só queries `.from()` — nunca auth ops
  - `authVerifyClient` → só `auth.getUser(jwt)`
  - `authOpsClient` → só `signInWithPassword`, `refreshSession`, `signOut`
- JWT FUNCIONARIO: `sub = funcionario.id` (tabela funcionario — não é auth.users.id)
- JWT ENGENHEIRO: `sub = usuario.id` (tabela usuario = auth.users.id)
- Rate limit: 5 tentativas de login por IP em 15 min no endpoint `/login`

## Riscos
- Chamar `signInWithPassword` no singleton `supabase` corrompe sessão RLS → ver `processo/erros-e-solucoes.md`
- `SUPABASE_SERVICE_KEY` nunca no frontend/mobile
- Token FUN-XXXXX é Fastify JWT, não Supabase JWT — `auth.uid()` não funciona para esses usuários

## Antes de alterar
- [ ] Os 3 clientes continuam separados?
- [ ] Testar login email, token FUN e token ENG separadamente
- [ ] Rate limit ainda ativo após mudança?
