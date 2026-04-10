# CRONOGRAMA MASTER — Brain Master
# Use como ponto de entrada de qualquer sessão no Claude Code

---

## LEIA ISTO PRIMEIRO

Antes de qualquer ação, leia nesta ordem:
1. `cronograma/ontem.md` — o que foi feito no último ciclo
2. `cronograma/semana-atual.md` — tarefas desta semana
3. `contexto/produto.md` — o que é o app
4. A skill relevante em `~/.claude/skills/`

Confirme o entendimento em 5 bullets antes de agir.

---

## SISTEMA DE DOCUMENTAÇÃO EVOLUTIVA

```
cronograma/
  plano-geral.md          ← este arquivo — visão estrutural
  semana-atual.md         ← atualizado diariamente
  ontem.md                ← último ciclo de trabalho
  historico/
    dia-YYYY-MM-DD.md     ← conteúdo anterior de ontem.md
    semana-YYYY-WW.md     ← semanas encerradas
```

### Fluxo obrigatório a cada atualização
1. Ler `ontem.md` + `semana-atual.md`
2. Identificar o que foi feito e o que mudou
3. Mover `ontem.md` atual para `historico/dia-YYYY-MM-DD.md`
4. Escrever novo `ontem.md` com o trabalho desta sessão
5. Atualizar `semana-atual.md` com progresso
6. Se semana mudou: mover `semana-atual.md` para `historico/semana-YYYY-WW.md`

**Nunca apagar histórico. Sempre mover. Sempre rastrear.**

---

## CONTEXTO DO PROJETO

**Nome:** Brain Master
**Repositório:** github.com/Zions16/brain_master
**Pasta local:** ~/Brain Master/ObrasApp/
**Stack:** React Native + Expo · Next.js · Fastify + Node.js · Supabase (PostgreSQL + Auth + Storage + Realtime)
**Monorepo:** Turborepo
**Linguagem:** TypeScript em toda a stack

**O que é:**
Plataforma SaaS B2B de gestão operacional de obras. O núcleo é a medição de serviços executados, vinculada a funcionários, com cálculo automático de pagamento por produção. Resolve a dor de empreiteiros e gestores que não sabem com precisão o que foi feito, quanto devem pagar e quanto gastaram.

**Usuários:** Gestor, Engenheiro/Supervisor, Funcionário, Compras, Financeiro
**Modelo:** cobrança por obra ativa/mês (~R$79–99)

---

## VISÃO GERAL DO CRONOGRAMA

| Fase | Título | Período | Sprints | Vende? |
|------|--------|---------|---------|--------|
| Fase 1 | MVP — medição e pagamento | Mês 1–3 | 6 sprints | Sim |
| Fase 2 | Operação completa — materiais e alertas | Mês 4–6 | 4 sprints | Sim |
| Fase 3 | Gestão empresarial multiobra | Mês 7–10 | 6 sprints | Sim |
| Fase 4 | Produto completo — IA e gamificação | Mês 11–12 | 4 sprints | Sim |

Total: 12 meses · 20 sprints de 2 semanas · 80+ tarefas

---

## FASE 1 — MVP: MEDIÇÃO E PAGAMENTO
**Período:** Mês 1–3 (Sprints 1–6)
**Objetivo:** Produto mínimo vendável. Resolver a dor principal: saber exatamente quanto pagar a cada funcionário com base no que foi medido e registrado.
**Complexidade:** Baixa
**Critério de saída:** 10 clientes ativos, NPS ≥ 7, cálculo de pagamento validado por gestor real.

### Sprint 1 — Fundação e infraestrutura (Sem 1–2)

**Objetivo:** Ambiente de desenvolvimento 100% funcional antes de qualquer feature.

Tarefas (executar nesta ordem):
- [ ] Inicializar monorepo Turborepo em `codigo/`
  ```bash
  cd ~/Brain\ Master/ObrasApp/codigo
  npx create-turbo@latest . --package-manager npm
  ```
- [ ] Configurar ESLint + Prettier + TypeScript base compartilhado em `packages/`
- [ ] Criar projeto no Supabase (supabase.com) e copiar URL + keys para `.env`
- [ ] Criar schema SQL inicial no Supabase: tabelas `empresa`, `usuario`, `obra`
  ```sql
  CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT,
    plano TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('GESTOR','ENGENHEIRO','FUNCIONARIO','COMPRAS','FINANCEIRO')),
    obras_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE obra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome TEXT NOT NULL,
    endereco TEXT,
    responsavel_id UUID REFERENCES usuario(id),
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa','pausada','encerrada')),
    data_inicio DATE,
    data_prev_fim DATE,
    cliente TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Ativar RLS em todas as tabelas (padrão: DENY ALL)
  ```sql
  ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
  ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
  ALTER TABLE obra ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "obra_isolamento_empresa" ON obra
    FOR ALL USING (empresa_id = (
      SELECT empresa_id FROM usuario WHERE id = auth.uid()
    ));
  ```
- [ ] Configurar GitHub Actions: lint + type-check em todo PR
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [pull_request]
  jobs:
    check:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 20 }
        - run: npm ci
        - run: npm run lint
        - run: npm run type-check
  ```

**Dependências:** Nenhuma — este sprint é a base de tudo.
**Critério de conclusão:** `npm run dev` sobe todos os apps sem erro. Supabase conectado. CI rodando.

---

### Sprint 2 — Autenticação (Sem 3–4)

**Objetivo:** Login seguro funcionando em mobile e web antes de qualquer dado de negócio.

Tarefas:
- [ ] Instalar dependências no backend (apps/api)
  ```bash
  cd codigo/apps/api
  npm install fastify @fastify/jwt @fastify/rate-limit @fastify/helmet @fastify/cors
  npm install @supabase/supabase-js zod dotenv
  npm install -D typescript @types/node tsx
  ```
- [ ] Estrutura de pastas do Fastify:
  ```
  apps/api/src/
    server.ts
    plugins/        ← auth.ts, rateLimit.ts, cors.ts, helmet.ts
    routes/         ← auth.ts, obras.ts, funcionarios.ts, medicoes.ts
    middleware/     ← verificarPerfil.ts, autenticar.ts
    services/       ← supabase.ts (service_key — apenas backend)
    schemas/        ← importar de packages/validators
  ```
- [ ] Implementar rota POST /auth/login com Supabase Auth
  ```typescript
  export async function authRoutes(app: FastifyInstance) {
    app.post('/auth/login', async (req, reply) => {
      const { email, senha } = loginSchema.parse(req.body)
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email, password: senha
      })
      if (error) return reply.status(401).send({ erro: 'Credenciais inválidas' })
      return { access_token: data.session.access_token, user: data.user }
    })
  }
  ```
- [ ] Rate limiting: máx 5 tentativas de login por IP em 15 minutos
- [ ] Tela de login no React Native (Expo): `apps/mobile/src/screens/auth/LoginScreen.tsx`
- [ ] Tela de login no Next.js: `apps/web/src/app/(auth)/login/page.tsx`
- [ ] Middleware autenticar.ts: verificar JWT em todas as rotas protegidas
- [ ] RLS policy: usuário só lê/escreve dados da empresa dele

**Dependência:** Sprint 1 completo.
**Critério de conclusão:** Login funcionando em mobile e web. Token inválido retorna 401. 6ª tentativa bloqueada.

---

### Sprint 3 — Obras e funcionários (Sem 5–6)

**Objetivo:** CRUD completo das entidades base.

Tarefas:
- [ ] Criar tabelas no Supabase:
  ```sql
  CREATE TABLE funcionario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    obra_id UUID REFERENCES obra(id),
    nome TEXT NOT NULL,
    funcao TEXT,
    tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('POR_PRODUCAO','DIARIA','HORA','MISTO')),
    valor_base NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obra(id),
    nome TEXT NOT NULL,
    unidade_medida TEXT NOT NULL,
    valor_pagamento NUMERIC(10,2) NOT NULL,
    valor_cobranca NUMERIC(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Ativar RLS nas novas tabelas
- [ ] API: GET/POST/PUT/DELETE /obras
- [ ] API: GET/POST/PUT /funcionarios
- [ ] API: GET/POST/PUT /servicos
- [ ] Tela mobile: lista de obras → detalhes da obra
- [ ] Tela mobile: lista de funcionários + adicionar
- [ ] Tela mobile: lista de serviços + adicionar

**Dependência:** Sprint 2 completo.
**Critério de conclusão:** Criar uma obra, 3 funcionários e 2 serviços pelo app mobile.

---

### Sprint 4 — Medição: núcleo do produto (Sem 7–8)

**Objetivo:** O evento central do produto funcionando.

Tarefas:
- [ ] Criar tabelas no Supabase:
  ```sql
  CREATE TABLE medicao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obra(id),
    funcionario_id UUID NOT NULL REFERENCES funcionario(id),
    servico_id UUID NOT NULL REFERENCES servico(id),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
    valor_calculado NUMERIC(10,2) NOT NULL,
    valor_cobranca_calculado NUMERIC(10,2),
    medido_por UUID NOT NULL REFERENCES usuario(id),
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa','corrigida','cancelada','pendente')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE medicao_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicao_id UUID NOT NULL REFERENCES medicao(id),
    alterado_por UUID NOT NULL REFERENCES usuario(id),
    data_alteracao TIMESTAMPTZ DEFAULT NOW(),
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT NOT NULL,
    valor_novo TEXT NOT NULL,
    motivo TEXT NOT NULL
  );
  ```
- [ ] REGRA CRÍTICA: `medicao_historico` é append-only — sem UPDATE, sem DELETE
- [ ] API: POST /medicoes com validação Zod
- [ ] API: GET /medicoes?obra_id=&funcionario_id=&data_inicio=&data_fim=
- [ ] Lógica: valor_calculado = quantidade × servico.valor_pagamento (calculado no backend)
- [ ] Tela mobile: NOVA MEDIÇÃO — máximo 3 toques até salvar
  ```
  Toque 1: selecionar funcionário (lista com busca)
  Toque 2: selecionar serviço (lista com busca)
  Toque 3: digitar quantidade → valor calculado aparece → confirmar
  ```
- [ ] Tela mobile: histórico de medições com filtro

**Dependência:** Sprint 3 completo.
**Critério de conclusão:** Medição registrada em menos de 30 segundos. Cálculo correto em 100% dos casos.

---

### Sprint 5 — Correção de medição e pagamentos (Sem 9–10)

**Objetivo:** Fluxo de correção auditável + cálculo de pagamento por período.

Tarefas:
- [ ] Fluxo de correção:
  ```
  1. Usuário entra na medição → toca "corrigir"
  2. Informa novo valor + motivo (OBRIGATÓRIO, mín. 10 chars)
  3. Sistema: cria registro em medicao_historico (imutável)
  4. Sistema: status da medição original → 'corrigida'
  5. Sistema: cria nova medicao com valor correto
  ```
- [ ] API: PUT /medicoes/:id/corrigir (motivo obrigatório no body)
- [ ] API: PUT /medicoes/:id/cancelar (motivo obrigatório)
- [ ] Criar tabela `pagamento`:
  ```sql
  CREATE TABLE pagamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obra(id),
    funcionario_id UUID NOT NULL REFERENCES funcionario(id),
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL,
    data_pagamento DATE,
    pago_por UUID REFERENCES usuario(id),
    forma_pagamento TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','realizado')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] API: GET /pagamentos?obra_id=&periodo_inicio=&periodo_fim= → totais por funcionário
- [ ] API: PUT /pagamentos/:id/realizar
- [ ] Tela web: dashboard de pagamentos por funcionário no período
- [ ] Middleware: verificarPerfil(['GESTOR', 'FINANCEIRO']) nas rotas de pagamento

**Dependência:** Sprint 4 completo.
**Critério de conclusão:** Gestor fecha pagamento da semana em menos de 5 minutos. Toda correção tem motivo.

---

### Sprint 6 — Dashboard e lançamento do MVP (Sem 11–12)

**Objetivo:** Polimento, testes, deploy e primeiros clientes.

Tarefas:
- [ ] Dashboard web por obra: produção por serviço, valores a pagar, últimas medições
- [ ] Tela mobile do FUNCIONÁRIO:
  - Produção desta semana e deste mês
  - Valor acumulado no período
  - Histórico de pagamentos recebidos
- [ ] Testes de integração: POST /medicoes, PUT /corrigir, GET /pagamentos
- [ ] Auditoria RLS: empresa A não acessa dados da empresa B
- [ ] Deploy: backend → Railway, web → Vercel, mobile → Expo Go
- [ ] Onboarding: 3–5 clientes piloto por videochamada
- [ ] Documentar em `tarefas/concluidas.md`

**Critério de conclusão da Fase 1:**
- [ ] 10 clientes ativos usando medição diariamente
- [ ] Zero medições deletadas — apenas corrigidas com histórico
- [ ] Cálculo de pagamento validado por gestor real
- [ ] NPS ≥ 7
- [ ] RLS auditado

---

## FASE 2 — OPERAÇÃO COMPLETA: MATERIAIS E ALERTAS
**Período:** Mês 4–6 (Sprints 7–10)
**Objetivo:** Material em falta causando obra parada — segunda maior dor do setor.

### Sprint 7 — Materiais e estoque (Sem 13–14)
- [ ] Tabelas: `material`, `estoque_obra`, `movimentacao_material`
- [ ] Trigger: atualizar saldo ao registrar movimentação
- [ ] RLS nas 3 tabelas
- [ ] API: CRUD materiais, GET estoque, POST movimentações
- [ ] Tela web: painel de materiais por obra

### Sprint 8 — Alertas operacionais (Sem 15–16)
- [ ] Tabela: `alerta` (tipo, urgência, status)
- [ ] Trigger Supabase: alerta automático quando estoque ≤ mínimo
- [ ] Supabase Realtime: alertas em tempo real no app
- [ ] Tela mobile: banner de alerta por obra
- [ ] Tela web: painel de alertas com urgência

### Sprint 9 — Compras e solicitações (Sem 17–18)
- [ ] Tabela: `solicitacao_compra`
- [ ] API: POST /solicitacoes (engenheiro), GET priorizadas, PUT /atender (compras)
- [ ] Tela mobile: engenheiro solicita material
- [ ] Tela web — perfil COMPRAS: fila por urgência
- [ ] Notificação push para COMPRAS em solicitação urgente

### Sprint 10 — Aprovação de medição (Sem 19–20)
- [ ] Novo status: `pendente_aprovacao` para medições de engenheiro
- [ ] API: GET pendentes, PUT /aprovar, PUT /rejeitar (motivo obrigatório)
- [ ] Regra: só medições `ativa` entram no cálculo de pagamento
- [ ] Notificação push para gestor: medições pendentes
- [ ] Tela web: fila de aprovação
- [ ] Tela mobile: engenheiro vê status das suas medições

**Critério de conclusão da Fase 2:**
- [ ] Alertas disparando automaticamente em tempo real
- [ ] Solicitações substituindo WhatsApp no fluxo campo→compras
- [ ] Aprovação de medição sem atrito em obra real

---

## FASE 3 — GESTÃO EMPRESARIAL MULTIOBRA
**Período:** Mês 7–10 (Sprints 11–16)

### Sprint 11 — Dashboard multiobra (Sem 21–22)
- [ ] API: KPIs consolidados de todas as obras por empresa
- [ ] Tela web: dashboard executivo com cards por obra + Realtime

### Sprint 12 — Perfis e gestão de usuários (Sem 23–24)
- [ ] Tela web: convidar usuários, definir perfil, vincular obras
- [ ] Testes de isolamento por perfil

### Sprint 13 — Módulo financeiro (Sem 25–26)
- [ ] Campo `valor_contrato` na obra
- [ ] API: custo MO + material, receita, margem por obra
- [ ] Tela web: painel financeiro

### Sprint 14 — Relatórios (Sem 27–28)
- [ ] PDF: pagamentos e produção por período
- [ ] XLSX: materiais
- [ ] Tela web: centro de relatórios

### Sprint 15 — Progresso físico (Sem 29–30)
- [ ] `quantidade_prevista` em serviço
- [ ] % de conclusão por serviço e por obra
- [ ] Alerta: serviço abaixo do ritmo esperado

### Sprint 16 — Estabilização (Sem 31–32)
- [ ] Auditoria completa de RLS
- [ ] Testes de carga: 10 obras, 50 usuários simultâneos
- [ ] Revisar índices PostgreSQL
- [ ] Documentar regras de negócio em `regras/negocio.md`

---

## FASE 4 — IA E GAMIFICAÇÃO
**Período:** Mês 11–12 (Sprints 17–20)

### Sprint 17 — Gamificação (Sem 33–34)
- [ ] Ranking de produtividade por serviço/período
- [ ] Metas configuráveis pelo gestor
- [ ] Tela mobile: posição + meta + notificação ao superar

### Sprint 18 — IA generativa (Sem 35–36)
- [ ] `npm install @anthropic-ai/sdk`
- [ ] Resumo semanal em linguagem natural por obra
- [ ] Recibo de pagamento gerado por IA
- [ ] Detecção de medição atípica (> 2 desvios padrão)

### Sprint 19 — Previsão de material (Sem 37–38)
- [ ] Template: X unidades de material por Y m² de serviço
- [ ] Índice de desperdício: real vs previsto
- [ ] Planejamento de compras baseado em meta de produção

### Sprint 20 — Offline e enterprise (Sem 39–40)
- [ ] Fila offline: `react-native-mmkv` + sync ao reconectar
- [ ] Multi-tenant para contas enterprise (100+ obras)
- [ ] Importação de dados via CSV

---

## REGRAS OBRIGATÓRIAS DE EXECUÇÃO

### Início de cada sessão (SEMPRE)
1. Ler `sessoes/ultima-sessao.md`
2. Ler a skill relevante em `~/.claude/skills/`
3. Confirmar entendimento em bullets antes de agir
4. Registrar plano em `tarefas/em-andamento.md`

### Antes de qualquer mudança importante
1. Criar `backups/AAAA-MM-DD-descricao/`
2. Registrar em `tarefas/em-andamento.md`
3. Executar a mudança
4. Validar: lint, type-check, teste manual

### Fim de cada sessão (SEMPRE)
1. Atualizar `sessoes/ultima-sessao.md`
2. Adicionar linha em `sessoes/historico.md`
3. Mover tarefa para `tarefas/concluidas.md`
4. Registrar problemas em `tarefas/problemas.md` se houver
5. ```bash
   cd ~/Brain\ Master/ObrasApp
   git add -A
   git commit -m "sessao: AAAA-MM-DD — [resumo]"
   git push origin main
   ```

### Segurança (INEGOCIÁVEL)
- NUNCA commitar `.env` com valores reais
- `SUPABASE_SERVICE_KEY` apenas no backend
- RLS ativo em toda tabela nova — padrão: DENY ALL
- Inputs validados com Zod antes de qualquer operação
- Medições nunca deletadas — apenas canceladas com motivo

---

## STATUS ATUAL DO PROJETO

```
Fase atual:        Fase 1 — Sprint 1
Status:            Documentação completa. Código não iniciado.
Próxima ação:      Inicializar Turborepo + criar projeto Supabase
Último commit:     dcd49ab — sessao: 2026-04-09
Branch:            main
```

---

## PRÓXIMOS PASSOS IMEDIATOS

```bash
# 1. Entrar na pasta do projeto
cd ~/Brain\ Master/ObrasApp/codigo

# 2. Inicializar Turborepo
npx create-turbo@latest . --package-manager npm

# 3. Criar projeto no Supabase
# → supabase.com → New project → copiar URL e ANON_KEY

# 4. Preencher .env
cp codigo/apps/api/.env.example codigo/apps/api/.env
# → Editar com chaves do Supabase

# 5. Executar schema SQL do Sprint 1 no SQL Editor do Supabase

# 6. Confirmar
npm run dev
```

---

*Última atualização: 2026-04-10*
