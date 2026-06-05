# Tarefas em Andamento — Brain Master

## DIREÇÃO ATUAL: Web First
Mobile pausado. Foco total no produto web comercial.
Ver decisão: `decisoes/estrategia-web-first.md`

**Atualizado em:** 2026-06-05

---

## Sprint 28 — Auditoria + Correções de Segurança (em andamento)

### Objetivo
Resolver pendências identificadas na auditoria geral do Brain Master antes de abrir cadastro público.

### Tarefas

#### 1. DT-001 — Bug de privacidade em pagamentos [EM EXECUÇÃO]
- **Severidade:** Alta — bloqueia cadastro público
- **Diagnóstico completo:**
  - `buscarMeuPerfil()` busca funcionário por `.ilike('nome')` → primeiro encontrado com o nome → ID errado no localStorage
  - `GET /:id/pagamentos` não valida que FUNCIONARIO está acessando seu próprio ID
  - RLS policy também usa match por nome (defense in depth — corrigir)
- **Solução:** Corrigir `/funcionarios/me` para usar `request.usuario.id` (JWT já tem o ID correto) + guard de autorização nos endpoints de consulta individual
- **Branch:** `fix/auditoria-brain-master-sprint-28`

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

#### 6. Billing [PENDENTE — aguarda decisão de gateway]
- Gateway: Stripe vs Asaas (EM ABERTO)
- Página de planos já existe na landing page (placeholder)

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
