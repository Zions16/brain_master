# CONTEXT — Módulo Auth (API)

## Função
Autenticação delegada ao Supabase Auth.  
A API apenas valida o JWT e carrega o perfil do usuário.

## Fluxo
1. Frontend autentica direto no Supabase (anon key)
2. Supabase retorna JWT
3. Frontend envia JWT no header `Authorization: Bearer <token>`
4. Middleware `autenticar.ts` valida via `authVerifyClient` (SERVICE_KEY isolado)
5. Popula `request.usuario: UsuarioSession` com id, empresa_id, perfil

## Regras
- `authVerifyClient` usa SERVICE_KEY mas com `persistSession: false` — não polui o cliente de queries
- Perfis: GESTOR | ENGENHEIRO | FUNCIONARIO | COMPRAS | FINANCEIRO
- Perfil vem da tabela `usuario` no Supabase, não do JWT claim direto
