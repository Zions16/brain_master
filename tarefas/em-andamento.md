# Tarefas em Andamento — Brain Master

## DIREÇÃO ATUAL: Web First
Mobile pausado. Foco total no produto web comercial.
Ver decisão: `decisoes/estrategia-web-first.md`

**Atualizado em:** 2026-06-22

---

## Sprint 28 — Auditoria + Correções de Segurança (em andamento)

### Objetivo
Resolver pendências identificadas na auditoria geral do Brain Master antes de abrir cadastro público.

### Tarefas

#### 1. DT-001 — Bug de privacidade em pagamentos [✅ CONCLUÍDO]
- **Severidade:** Alta — bloqueava cadastro público
- **Verificado em 2026-06-22 (auditoria de código):**
  - `buscarMeuPerfil(id, empresaId)` usa `request.usuario.id` do JWT — não mais `.ilike('nome')` ✅
  - Guard `solicitantePerfil === 'FUNCIONARIO' && solicitanteId !== funcionarioId → 403` em pagamentos/medicoes/producao ✅
  - Documentado em `apps/api/src/modules/funcionarios/CONTEXT.md`
- **Fix já commitado** (parte do encerramento sprint 28)

#### 2. Documentação de status [✅ CONCLUÍDO]
- `cronograma/plano-geral.md` — bloco STATUS ATUAL adicionado no topo
- `tarefas/em-andamento.md` — este arquivo atualizado

#### 3. CONTEXT.md por feature [PENDENTE]
- Criar 5–7 arquivos curtos nas pastas principais do código
- Reduz contexto carregado por sessão

#### 4. Suite mínima Playwright [PENDENTE]
- Login GESTOR → dashboard
- Criar medição
- Validar isolamento de pagamentos

#### 5. Onboarding web [PENDENTE]
- Empty state no dashboard com checklist de primeiros passos

#### 6. Billing — Stripe [EM ANDAMENTO — Sprint 29]
- Gateway decidido: **Stripe** ✅
- Código completo e commitado (commit `390d196`): API (lib/stripe + módulo billing), Web (páginas + Sidebar), migration `20260605_billing_stripe.sql`
- Migration `20260605_billing_stripe.sql` **aplicada e verificada** no banco (colunas + índices presentes) ✅
- **Único bloqueio para fechar:**
  - [ ] `STRIPE_WEBHOOK_SECRET` vazio — configurar webhook no Stripe Dashboard (passo manual)
  - [ ] Testar fluxo com cartão `4242 4242 4242 4242`
- Código no **PR #1** (`feat/billing-stripe`)

---

## Sprint 28.1 — Saneamento de CI (2026-06-22)

O CI **nunca rodou de verdade** (falhava no setup por lockfile no path errado), mascarando dívida do repo. Corrigido:

### Feito ✅
- `ci.yml`: roda em `codigo/` (working-directory + `cache-dependency-path`); lint exclui `mobile` (pausado)
- `tsconfig.json` em `packages/shared` e `packages/validators` (type-check antes pegava o monorepo inteiro)
- **API lint-clean**: 48 `catch (err: any)` → helper tipado `lib/erros.ts` (`responderErro`); 8 `as any` tipados ou com `eslint-disable` justificado (boundaries de Supabase/Stripe/Fastify); código morto removido
- **Política de lint por camada** (`.eslintrc.js`): `no-explicit-any` = **erro no backend**, **warning no web** (UI tem `any` de boundary de libs; dívida visível, paga gradual)
- Verificado local: lint (exceto mobile) ✅ · type-check 5/5 ✅ · build API ✅

### Dívida registrada (follow-ups)
- [ ] 🟠 **Segurança — requer migração Fastify 5** (investigado 2026-06-22): `fast-jwt@4.0.5` (via `@fastify/jwt@8`) tem advisories de bypass de auth JWT. **Não é patch simples:** o fix limpo é `@fastify/jwt@9/10`, que exige **Fastify 4→5** (breaking em todo o app). Série `@fastify/jwt@8` (única p/ Fastify 4) só tem 8.0.0/8.0.1, fixando `fast-jwt@^4` — sem release corrigida. Override forçando `fast-jwt@6.2.4` quebra (API incompatível com jwt@8). **Exploitabilidade real é baixa nesta config** (HS256 com `JWT_SECRET` estático, não-vazio) — vários advisories (iss/crit/RSA confusion) não se aplicam. → Planejar como **sprint própria: migração Fastify 5 + @fastify/jwt@10 + reteste de auth**. Audit do CI fica **não-bloqueante** até lá.
- [ ] Tipar de verdade os `any` de boundary no web (hoje warnings) — gerar tipos do Supabase
- [ ] Upgrades de deps vulneráveis (next/postcss/esbuild/expo) — deliberado, com teste
- [ ] Re-incluir `mobile` no lint do CI quando sair da pausa

---

## Sprint 27 — Website Comercial [✅ CONCLUÍDO em 2026-06-04]
- Landing page 8 seções deployada no Vercel
- Build limpo (Tailwind v3 fix)
- Decisão Web First registrada em `decisoes/estrategia-web-first.md`

---

## Backlog web

- [ ] Responsividade completa da plataforma
- [ ] SEO básico (meta tags, OG)
- [ ] Página de planos com lógica de trial
- [ ] Integração de pagamento (gateway não decidido)
- [ ] Empty states em todas as páginas
- [ ] Melhorar UX do cadastro
