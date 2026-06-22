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
- **Bloqueios para fechar:**
  - [ ] `STRIPE_WEBHOOK_SECRET` vazio em `apps/api/.env` — configurar webhook no Stripe Dashboard
  - [ ] Aplicar migration `20260605_billing_stripe.sql` no Supabase (Supabase MCP estava com timeout em 2026-06-22)
  - [ ] Testar fluxo com cartão `4242 4242 4242 4242`

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
