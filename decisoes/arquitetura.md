# Decisões de Arquitetura — ObrasApp

## Como usar este arquivo
Registre aqui cada decisão técnica importante:
o quê foi decidido, por quê, quais alternativas foram consideradas.

---

## Formato de ADR (Architecture Decision Record)

### ADR-001 — [Título da decisão]
**Data:** YYYY-MM-DD
**Status:** Proposto / Aceito / Substituído

**Contexto:**
[Qual problema ou necessidade motivou esta decisão]

**Decisão:**
[O que foi decidido]

**Alternativas consideradas:**
- Opção A: [descrição] — descartada porque [motivo]
- Opção B: [descrição] — descartada porque [motivo]

**Consequências:**
- Positivas: [o que melhora]
- Negativas / Trade-offs: [o que piora ou complica]

**Revisão em:** [data ou condição para rever a decisão]

---

## Decisões registradas

---

### ADR-001 — Stack tecnológica do MVP
**Data:** 2026-04-08
**Status:** Aceito

**Contexto:**
ObrasApp é um SaaS B2B com três superfícies: app mobile para campo (engenheiro e funcionário),
dashboard web para gestor e API backend. O time é pequeno e o MVP precisa ser entregue
com agilidade sem sacrificar qualidade e segurança.

**Decisão:**
- Mobile: React Native com Expo e TypeScript
- Web: Next.js 14 com TypeScript e Tailwind
- Backend: Node.js com Fastify e TypeScript
- Banco: PostgreSQL com Prisma ORM
- Monorepo: Turborepo com workspaces (apps/mobile, apps/web, apps/api, packages/shared)

**Alternativas consideradas:**
- Flutter — descartado porque o time tem mais familiaridade com JS/TS (React Native aproveita o mesmo ecossistema do Next.js)
- Python/FastAPI — descartado para manter TypeScript em toda a stack (tipos compartilhados via packages/shared)
- Express — descartado em favor do Fastify (melhor performance, TypeScript nativo, plugins oficiais de segurança)
- Supabase — avaliado como opção gerenciada, mas Railway + Prisma dá mais controle e portabilidade

**Consequências:**
- Positivas: TypeScript end-to-end permite compartilhar tipos entre mobile, web e API; Expo acelera o desenvolvimento mobile; Prisma simplifica migrations e type-safety no banco
- Trade-offs: Monorepo exige configuração inicial do Turborepo; React Native tem limitações de performance versus Flutter em animações complexas (não crítico para este produto)

**Revisão em:** Após 3 meses de desenvolvimento ou se surgir necessidade de performance crítica no mobile

---

### ADR-002 — Estrutura de monorepo
**Data:** 2026-04-08
**Status:** Aceito

**Contexto:**
Mobile, web e API compartilham tipos (entidades, DTOs, schemas Zod). Manter em repositórios
separados criaria duplicação de tipos e dessincronização entre frontend e backend.

**Decisão:**
Monorepo com Turborepo:
```
apps/mobile    → React Native (Expo)
apps/web       → Next.js
apps/api       → Fastify
packages/shared     → tipos TypeScript compartilhados
packages/validators → schemas Zod reutilizáveis
```

**Alternativas consideradas:**
- Repositórios separados — descartado por duplicação de tipos e complexidade de sincronização
- Nx — descartado por complexidade desnecessária no início; Turborepo é mais simples para o tamanho atual do projeto

**Consequências:**
- Positivas: tipo `Medicao` definido uma vez, usado em mobile, web e API; mudança de schema propaga automaticamente
- Trade-offs: CI/CD ligeiramente mais complexo (Turborepo resolve com pipeline de build)

---

### ADR-003 — Banco de dados: Supabase (substitui Prisma local)
**Data:** 2026-04-09
**Status:** Aceito — substitui decisão anterior de usar Prisma standalone

**Contexto:**
O schema Prisma documentado inicialmente pressupunha banco gerenciado localmente. Supabase oferece
PostgreSQL gerenciado + Auth + Storage + Realtime em um único serviço, reduzindo infraestrutura
para um MVP e acelerando o desenvolvimento.

**Decisão:**
- Banco: Supabase (PostgreSQL gerenciado)
- Auth: Supabase Auth (JWT emitido pelo Supabase, verificado via `supabase.auth.getUser()`)
- Storage: Supabase Storage (fotos de obras, comprovantes)
- Realtime: Supabase Realtime (alertas ao vivo, atualizações de medição)
- Migrations: SQL versionado em `supabase/migrations/`
- RLS: ativo em todas as tabelas (política padrão: DENY ALL)
- Backend usa `SERVICE_KEY` — cliente usa `ANON_KEY` + RLS

**Alternativas consideradas:**
- Prisma + Railway PostgreSQL — descartado por precisar gerenciar auth separado e mais infraestrutura no MVP
- PlanetScale — descartado por ser MySQL (schema diferente) e sem auth nativo
- Firebase — descartado por ser NoSQL (modelo relacional é necessário para medições e histórico auditável)

**Consequências:**
- Positivas: auth pronto, storage pronto, realtime pronto, sem servidor de banco para gerenciar
- Trade-offs: vendor lock-in no Supabase; mitigado pelo fato de ser PostgreSQL padrão — migração possível
- Atenção: RLS mal configurado é falha de segurança crítica (ver skill `supabase-rls`)
