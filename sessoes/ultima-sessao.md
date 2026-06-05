# Última Sessão

## Data
2026-06-05

## Fase / Sprint atual
Sprint 28 — Auditoria + Correções (concluído) → Sprint 29 — Billing Stripe (próximo)

---

## O que foi feito nesta sessão

Sprint 28 completo e mergeado para main (commit `11f7d27`):

- **DT-001 resolvido** — privacidade de pagamentos corrigida em 3 camadas (service, controller, RLS)
- **DT-003 resolvido** — rate limit adicionado em `/refresh`
- **DT-002 fechado** — @fastify/jwt é essencial (falso positivo)
- **6 CONTEXT.md** criados/atualizados nas pastas principais do código
- **Documentação de status** atualizada (plano-geral, tarefas, histórico de sprints)
- **Onboarding mínimo** — card com checklist de 5 passos no dashboard quando sem obras
- **Suite E2E** estruturada (playwright.config.ts + 2 specs — requer install para rodar)

---

## Decisão de billing tomada

**Gateway:** Stripe (decidido)

**Modelo de preços definido:**
- R$79 por obra ativa por mês
- Linear (1 obra = R$79, 2 obras = R$158, etc.)
- 10+ obras: 10% de desconto automático (R$71,10/obra)
- Implementação no Stripe: tiered pricing (tier 1–9: R$79, tier 10+: R$71,10)

**Decisões ainda em aberto para Sprint 29:**
- Trial: sem cartão (mais conversão) ou com cartão desde o cadastro?
- Escopo: só Stripe Checkout hospedado (MVP) ou gestão dentro do dashboard?
- Conta Stripe criada? (confirmar antes de implementar)

---

## Arquivos alterados nesta sessão
Ver commit `11f7d27` no git log.

---

## Onde parou
Billing definido (Stripe, R$79/obra, 10% acima de 10 obras).
Sprint 29 ainda não iniciado — aguardando respostas sobre trial e escopo.

## Próxima ação exata
Ao iniciar nova conversa, responder:
1. Trial com ou sem cartão?
2. Checkout hospedado (Stripe) ou gestão no dashboard também?
3. Conta Stripe já criada?

Depois iniciar Sprint 29 — Billing Stripe.

## Commit
`11f7d27` — mergeado em main em 2026-06-05
