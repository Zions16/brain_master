# Tarefas em Andamento — Brain Master

## DIREÇÃO ATUAL: Web First
Mobile pausado. Foco total no produto web comercial.
Ver decisão: `decisoes/estrategia-web-first.md`

---

## Pendências bloqueantes (resolver antes de abrir cadastro público)

### DT-001 — Bug de privacidade em pagamentos
- **Severidade:** Alta
- **Descrição:** RLS de pagamento vincula funcionário por nome, não por user_id. Funcionários com mesmo nome na mesma empresa veem pagamentos um do outro.
- **Solução:** Adicionar `user_id` na tabela `funcionario` e atualizar policy.
- **Status:** Documentado, não resolvido.

---

## Sprint 27 — Website Comercial (próximo)

### Objetivo
Criar a landing page em `app/(marketing)/page.tsx` com seções:
- Hero section com CTA
- Problema que resolve
- Como funciona (3 passos)
- Principais features
- Planos/preços (placeholder)
- CTA final

### Critério de conclusão
- [ ] `/` exibe landing page (não redireciona para `/obras`)
- [ ] Página de planos com CTAs funcionais (mesmo que placeholder)
- [ ] Responsiva no mobile browser
- [ ] Build sem erros

---

## Backlog web (após landing page)

- [ ] Onboarding: estado vazio com guia de primeiro passo
- [ ] Melhorar UX do cadastro
- [ ] Empty states em todas as páginas
- [ ] Responsividade da plataforma
- [ ] SEO básico (meta tags, OG)
- [ ] Página de planos com lógica de trial
- [ ] Integração de pagamento (decisão de gateway em aberto)
