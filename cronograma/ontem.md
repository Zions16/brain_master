# Ontem — 2026-04-13

**Data:** 2026-04-13
**Etapa do projeto:** Fase 1 — Sprint 1 (pré-código: base 100% corrigida)
**Hora de referência:** fim do dia

---

## O que foi feito

- Code review completo (Senior Engineer + Tech Lead) antes de qualquer código de aplicação
- 8 bugs identificados e corrigidos nos arquivos base do projeto
- `AGENTE_BRAIN_MASTER.md` criado — persona, protocolo e rituais do arquiteto para novas sessões

## Bugs corrigidos

| Bug | Arquivo | Correção |
|-----|---------|----------|
| BUG-001 | `validators/medicao.ts` | `.cuid()` → `.uuid()` + campos snake_case |
| BUG-002 | `tipos.ts` | Enums lowercase: `'ativa'`, `'pendente'`, `'realizado'` |
| BUG-003 | `tipos.ts` | Campos snake_case: `empresa_id`, `obra_id`, `created_at` |
| BUG-004 | `tipos.ts` + `validators/auth.ts` | Removidos `RefreshToken`, `refreshTokenSchema`, `refreshToken` |
| BUG-005 | `plano-geral.md` Sprint 4 | `valor_calculado` como coluna normal (calculado no backend) |
| BUG-006 | `plano-geral.md` Sprint 1 | `obras_ids UUID[]` → tabela `obra_usuario` com FK e PK composta |
| BUG-007 | `docs/modelo-banco.md` | Reescrito de Prisma para SQL puro (Supabase migrations) |
| BUG-008 | `validators/auth.ts` | Senha mínima 6 → 8 caracteres |

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `codigo/packages/shared/tipos.ts` | Reescrito completo |
| `codigo/packages/validators/auth.ts` | Reescrito completo |
| `codigo/packages/validators/medicao.ts` | .cuid() → .uuid(), snake_case |
| `docs/modelo-banco.md` | Reescrito de Prisma para SQL puro |
| `cronograma/plano-geral.md` | Sprint 1: obra_usuario join table |
| `AGENTE_BRAIN_MASTER.md` | Criado |

## Decisões tomadas

- `StatusMedicao` inclui `'pendente_aprovacao'` → alinha com RN-005
- `StatusPagamento`: `'pendente' | 'realizado'` → remove 'PAGO' e 'PARCIAL' que não existiam no SQL
- `AuthResponse`: `{ access_token, usuario }` → Supabase gerencia refresh token internamente
- `modelo-banco.md` é a fonte de verdade do schema SQL para migrations

## Problemas encontrados

Nenhum. Todos os bugs foram resolvidos sem bloqueio.

## Próximos passos

1. Criar conta e projeto no **Supabase** (supabase.com)
2. Copiar `SUPABASE_URL`, `ANON_KEY` e `SERVICE_KEY`
3. Inicializar Turborepo: `cd ~/Brain\ Master/ObrasApp/codigo && npx create-turbo@latest . --package-manager npm`
4. Preencher `.env` com as chaves
5. Executar schema SQL do Sprint 1 no SQL Editor do Supabase
6. Ativar RLS nas tabelas `empresa`, `usuario`, `obra`
7. Verificar `npm run dev` sem erros

## Commits
- `6e09947` — fix: 8 bugs corrigidos
- `aed820f` — docs: AGENTE_BRAIN_MASTER.md
