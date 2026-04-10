# Ontem — 2026-04-11

**Data:** 2026-04-11
**Etapa do projeto:** Fase 1 — Sprint 1 (pré-código: bugs corrigidos)
**Hora de referência:** fim do dia

---

## O que foi feito

Code review completo por Senior Engineer + Tech Lead antes de qualquer código de aplicação.
8 bugs identificados e todos corrigidos nesta sessão.

## Bugs corrigidos

| Bug | Arquivo | Problema | Correção |
|-----|---------|----------|----------|
| BUG-001 | `validators/medicao.ts` | `.cuid()` rejeita UUIDs do Supabase | `.uuid()` nos campos `funcionario_id` e `servico_id` |
| BUG-002 | `tipos.ts` | Enums uppercase incompatíveis com SQL | Enums em lowercase: `'ativa'`, `'pendente'`, `'realizado'` |
| BUG-003 | `tipos.ts` | Campos em camelCase incompatíveis com Supabase | snake_case em todos os campos: `empresa_id`, `obra_id`, `created_at` |
| BUG-004 | `tipos.ts` + `validators/auth.ts` | `RefreshToken` / `refreshToken` — Supabase gerencia tokens | Removidos `RefreshToken`, `refreshTokenSchema`, `AuthResponse.refreshToken` |
| BUG-005 | `plano-geral.md` Sprint 4 | `GENERATED ALWAYS AS` com subquery (SQL inválido) | `valor_calculado` como coluna normal — calculado no backend |
| BUG-006 | `plano-geral.md` Sprint 1 | `obras_ids UUID[]` sem FK e sem auditoria | Tabela `obra_usuario (obra_id, usuario_id)` com PK composta |
| BUG-007 | `docs/modelo-banco.md` | Schema em Prisma (ADR-003 escolheu Supabase SQL) | Reescrito inteiro em SQL puro para Supabase migrations |
| BUG-008 | `validators/auth.ts` | Senha mínima 6 chars (fraca) | Mínimo alterado para 8 chars |

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `codigo/packages/validators/medicao.ts` | `.cuid()` → `.uuid()`, nomes snake_case |
| `codigo/packages/validators/auth.ts` | min 8 chars, removido `refreshTokenSchema` |
| `codigo/packages/shared/tipos.ts` | Reescrito: enums lowercase, snake_case, sem RefreshToken, novos tipos agregados |
| `docs/modelo-banco.md` | Reescrito de Prisma para SQL puro |
| `cronograma/plano-geral.md` | Sprint 1: `obras_ids` → `obra_usuario` join table |

## Decisões tomadas

- `StatusMedicao` agora inclui `'pendente_aprovacao'` (alinha com RN-005: ENGENHEIRO cria como pendente, GESTOR aprova)
- `StatusPagamento` corrigido para `'pendente' | 'realizado'` (sem `'PAGO'` ou `'PARCIAL'` que não existem no SQL)
- `AuthResponse` simplificado: `{ access_token: string, usuario: UsuarioSession }` — Supabase gerencia refresh token internamente
- `modelo-banco.md` passa a ser a fonte de verdade do schema SQL (será a base para migrations)

## Problemas encontrados

Nenhum bug novo. Todos os 8 identificados foram corrigidos.

## Próximos passos

1. Criar conta e projeto no **Supabase** (supabase.com)
2. Copiar `SUPABASE_URL`, `ANON_KEY` e `SERVICE_KEY`
3. Inicializar Turborepo: `cd ~/Brain\ Master/ObrasApp/codigo && npx create-turbo@latest . --package-manager npm`
4. Preencher `.env` com as chaves
5. Executar schema SQL do Sprint 1 no SQL Editor do Supabase
6. Ativar RLS nas tabelas
7. Verificar `npm run dev` sem erros

## Commit

Ver após push desta sessão.
