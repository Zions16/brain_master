# Brainstorm Estratégico — Ferramentas, MCPs e Eficiência
**Data:** 2026-06-03  
**Status:** Referência permanente  
**Fonte:** Sessão de brainstorm + pesquisa técnica

---

## O que já temos (MCPs ativos)

| MCP | Para quê | Status |
|---|---|---|
| Supabase | DB, migrations, RLS, logs | ✅ Conectado |
| GitHub | PRs, issues, commits | ✅ Conectado |
| Playwright | Testes E2E, automação browser | ✅ Conectado |
| Context7 | Documentação de libs em tempo real | ✅ Conectado |
| Vercel | Deploy, env vars, status | ✅ Conectado |
| Sequential Thinking | Raciocínio complexo | ✅ Conectado |
| Obsidian (filesystem) | Leitura/escrita de notas | ✅ Adicionado |

---

## FRENTE 1 — MCPs e Ferramentas Externas

### 🔴 Alta Prioridade

#### 1. Sentry (Monitoramento de erros)
- **Finalidade:** Monitoramento de erros em tempo real (web + mobile + API)
- **Onde entra:** `apps/web`, `apps/mobile`, `apps/api`
- **Benefício no app:** Stack trace exato de erros em produção
- **Benefício no dev:** Prompt: "quais erros novos no sentry das últimas 24h?" → Claude analisa e propõe fix
- **Custo:** Gratuito até 5k erros/mês
- **Complexidade:** Baixa (SDK em 30min, MCP em mais 30min)
- **Risco:** Não logar dados sensíveis de funcionários
- **Exemplo prático:** Engenheiro trava na tela de medição → erro no Sentry → Claude: "TypeError: servico.valor_pagamento is undefined linha 47"

#### 2. Resend (Emails transacionais)
- **Finalidade:** Notificações por email do fluxo de aprovação
- **Onde entra:** `apps/api`
- **Benefício no app:** Gestor recebe email quando funcionário envia medição para aprovação
- **Custo:** Gratuito até 3k emails/mês
- **Complexidade:** Baixa
- **Exemplo prático:** Medição enviada → API dispara email para o Gestor → ele aprova no app

#### 3. Stripe (Billing SaaS)
- **Finalidade:** Billing dos planos Starter/Pro/Enterprise
- **Onde entra:** `apps/api` + `apps/web`
- **Custo:** 2.9% + R$0,30 por transação. Sem custo fixo
- **Risco:** Precisa de CNPJ e conta Stripe BR ativa
- **Exemplo prático:** Cliente clica "Assinar Pro" → Stripe checkout → Supabase atualiza plano → acesso liberado

#### 4. Linear (Gestão de tarefas integrada ao Claude)
- **Finalidade:** Substituir os `.md` de tarefas manuais
- **Benefício no dev:** Claude cria, atualiza e fecha issues direto da conversa
- **Custo:** Gratuito para time pequeno
- **Exemplo prático:** "Cria issue no Linear: Sprint 25 — Testes de Integração" → feito sem sair do Claude

### 🟡 Média Prioridade

#### 5. Figma MCP (oficial desde 2025)
- **Finalidade:** Design-to-code — Claude lê variáveis, tokens, componentes, variants
- **Remove 60-80% do trabalho manual** de tradução design → código
- **Custo:** Gratuito (API do Figma)
- **Onde:** Toda vez que houver wireframe ou tela no Figma

#### 6. PostHog (Analytics de produto)
- **Finalidade:** O que os usuários fazem no app — funil de conversão, abandono de tela
- **Custo:** Gratuito até 1M eventos/mês
- **Exemplo prático:** "Quantos usuários completaram o fluxo de medição essa semana?"

#### 7. Twilio WhatsApp
- **Finalidade:** Notificações para funcionários (WhatsApp > email no canteiro)
- **Custo:** ~$0.005/mensagem
- **Exemplo prático:** Gestor aprova pagamento → funcionário recebe WhatsApp: "Seu pagamento de R$1.200 foi aprovado"

#### 8. OpenAPI/Swagger MCP
- **Finalidade:** Documentação automática da API Fastify no Claude
- **Onde:** `apps/api` com `@fastify/swagger`
- **Benefício:** Claude lê endpoints sem retrabalho entre sessões

### 🟢 Backlog (Fase 2+)

| Ferramenta | Para quê | Quando |
|---|---|---|
| Zapier MCP | 8.000+ integrações num único MCP | Fase 2 |
| Datadog MCP | Observabilidade avançada | Escala real |
| MidjourneyMCP | Geração de imagem direto no Claude | Fase 2 |
| Cloudflare MCP | CDN + edge computing | Fase 2 |
| Slack MCP | Notificações internas do time dev | Fase 2+ |

---

## FRENTE 2 — UX/UI e Design

| Ferramenta | Uso | Custo | Prioridade |
|---|---|---|---|
| Figma (se não usa) | Design system + wireframes | Gratuito (1 projeto) | Alta |
| shadcn/ui (ampliar uso) | Auditar componentes não usados | Já na stack | Alta |
| Storybook | Visualizar componentes em isolamento | Gratuito | Média |
| Lottie + LottieFiles | Animações de loading/sucesso/erro | Gratuito | Média |
| Chromatic | Visual testing automático entre deploys | Gratuito 5k snapshots | Média |
| React Native Paper | Design system mobile consistente | Gratuito | Baixa |

---

## FRENTE 3 — Segurança e Robustez

| Ação | Ferramenta | Custo | Prioridade |
|---|---|---|---|
| Script RLS audit (SQL) | Supabase MCP | Zero | 🔴 Crítica |
| Dependabot | GitHub | Gratuito | 🔴 Alta |
| Helmet + Rate Limit na API | @fastify/helmet, @fastify/rate-limit | Gratuito | 🔴 Alta |
| Logs estruturados | Pino (nativo Fastify) | Gratuito | 🔴 Alta |
| Suite Playwright fluxo crítico | Playwright MCP | Gratuito | 🔴 Alta |
| Análise HTTP vulns | OWASP ZAP ou Nuclei | Gratuito | 🟡 Média |
| Deps com CVE | Snyk | Gratuito (small team) | 🟡 Média |

**Script RLS audit (rodar no Supabase):**
```sql
-- Tabelas sem RLS ativo
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies
);
```

---

## FRENTE 4 — Eficiência com Claude Code

### Os 5 maiores desperdícios de crédito

| Problema | Solução | Impacto |
|---|---|---|
| Contexto grande por falta de estrutura | CONTEXT.md de 10 linhas por feature | -40% contexto por sessão |
| Prompts vagos que geram retrabalho | Template de prompt estruturado | -60% rodadas de correção |
| Não usar `/clear` entre tarefas | `/clear` antes de cada nova tarefa | Elimina contaminação de contexto |
| Pedir explicação + código no mesmo prompt | Separar: primeiro pergunta, depois executa | -30% tokens por tarefa |
| Sessão muito longa | Encerrar a cada 3-4 tarefas | Contexto limpo e relevante |

**Template de prompt estruturado:**
```
Arquivo: [caminho exato]
Problema: [descrição exata]
Regra de negócio: [o que deve acontecer]
Restrição: [o que NÃO pode mudar]
Output esperado: [código / diff / explicação]
```

### Tabela de práticas

| Prática | Impacto | Esforço |
|---|---|---|
| CONTEXT.md por feature (10 linhas) | Alto | Baixo |
| Template de prompt padrão | Alto | Baixo |
| `/clear` entre tarefas | Alto | Zero |
| Sessões curtas (3-4 tarefas max) | Médio | Baixo |
| Skills customizadas por área | Alto | Médio |
| `--continue` para retomar sessão | Médio | Zero |

---

## FRENTE 5 — Geração de Imagens e Visual

| Ferramenta | Uso | Custo | Prioridade |
|---|---|---|---|
| Leonardo.ai | Imagens para website (150 créditos/dia grátis) | **Gratuito** | 🔴 Alta |
| Lottie + LottieFiles | Animações no app (loading, sucesso, erro) | **Gratuito** | 🔴 Alta |
| Midjourney | Imagens premium de alta qualidade | $10/mês | 🟡 Média |
| Magnific AI | Upscale de imagens geradas para 4K | $39/mês | 🟡 Média |
| Runway ML / Kling AI | Vídeo de background para hero section | $12/mês | 🟢 Baixa |
| MidjourneyMCP | Geração de imagem direto no Claude | Créditos Midjourney | 🟢 Baixa |

---

## Registries de MCPs para explorar

- [glama.ai/mcp](https://glama.ai/mcp/servers) — 22.775 servidores catalogados
- [pulsemcp.com](https://www.pulsemcp.com/) — 11.840+ revisados à mão
- [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/) — registro oficial
- [github.com/wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)

---

## Plano de Ação

### Etapa 1 — Produtividade e economia de créditos (esta semana)
- [ ] Criar `PROMPTS.md` com template padrão de prompt
- [ ] Criar `CONTEXT.md` em cada pasta de feature (10 linhas cada)
- [ ] Ativar Dependabot no GitHub (`.github/dependabot.yml`)
- [ ] Documentar regra de `/clear` entre tarefas no AGENTE_BRAIN_MASTER.md

### Etapa 2 — Segurança e qualidade (próxima semana)
- [ ] Rodar script RLS audit no Supabase
- [ ] Verificar `@fastify/helmet` e `@fastify/rate-limit` na API
- [ ] Criar suite Playwright para fluxo crítico (login → medição → pagamento)
- [ ] Verificar logs estruturados com Pino na API

### Etapa 3 — UX/UI e visual (Sprint 26)
- [ ] Auditar componentes shadcn não usados → substituir código customizado
- [ ] Gerar imagens para o website via Leonardo.ai (gratuito)
- [ ] Adicionar Lottie em estados de loading/sucesso no mobile
- [ ] Avaliar Storybook para `packages/ui`

### Etapa 4 — MCPs e automações (Sprint 27)
- [ ] Integrar Sentry no web + mobile + API
- [ ] Integrar Resend para emails transacionais
- [ ] Configurar MCP Sentry no Claude Code
- [ ] Instalar plugin Local REST API no Obsidian → upgrade do MCP Obsidian

### Etapa 5 — Integrações criativas (Fase 2)
- [ ] Vídeo de background no hero do website (Runway/Kling)
- [ ] Notificações WhatsApp via Twilio
- [ ] Analytics de produto com PostHog
- [ ] Stripe para billing dos planos

---

## Resumo — O que realmente vale agora

**Hoje (zero custo, alto retorno):**
1. Template de prompt estruturado
2. Dependabot no GitHub
3. Script RLS audit

**Esta sprint (baixo custo, alto impacto):**
1. Sentry (gratuito) → visibilidade em produção
2. Resend (gratuito) → emails do fluxo de aprovação
3. Playwright suite → testes do fluxo crítico

**Backlog (quando tiver receita):**
- Stripe, Twilio WhatsApp, Magnific + Runway
