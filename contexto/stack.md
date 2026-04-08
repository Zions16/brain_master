# Stack Tecnológica — ObrasApp

## Status: DEFINIDA

---

## Stack definitiva

### Mobile — React Native (TypeScript)
- **Framework:** React Native com Expo (SDK gerenciado)
- **Linguagem:** TypeScript
- **Navegação:** React Navigation v6
- **Estado global:** Zustand (simples, leve, sem boilerplate)
- **Requisições HTTP:** Axios com interceptors para JWT
- **Formulários:** React Hook Form + Zod
- **UI Components:** React Native Paper ou NativeBase
- **Notificações push:** Expo Notifications

### Web — Next.js (TypeScript)
- **Framework:** Next.js 14+ com App Router
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Estado:** Zustand + React Query (TanStack Query)
- **Requisições:** Axios ou fetch nativo com React Query
- **Formulários:** React Hook Form + Zod

### Backend — Node.js (TypeScript)
- **Runtime:** Node.js 20+
- **Framework:** Fastify (performance superior ao Express, TypeScript nativo)
- **Linguagem:** TypeScript
- **ORM:** Prisma (type-safe, migrations, PostgreSQL)
- **Validação:** Zod
- **Autenticação:** JWT (access token 1h) + Refresh Token com rotação
- **Senhas:** bcrypt (salt rounds: 12)
- **Rate limiting:** @fastify/rate-limit
- **Segurança:** @fastify/helmet, @fastify/cors
- **Logs:** Pino (nativo do Fastify)

### Banco de Dados
- **Principal:** PostgreSQL 15+
- **Gerenciado via:** Prisma ORM
- **Row Level Security (RLS):** ativo para isolamento por empresa

### Infraestrutura (MVP)
- **Backend:** Railway (simples, barato, CI/CD direto do GitHub)
- **Banco:** Railway PostgreSQL ou Supabase DB
- **Frontend Web:** Vercel
- **Mobile:** Expo Go (dev) → EAS Build (produção)
- **Storage (futura fase):** Cloudflare R2 ou Supabase Storage

### Ferramentas de desenvolvimento
- Claude Code
- GitHub (controle de versão, CI/CD)
- VS Code / Cursor
- Postman ou Insomnia (testes de API)
- Prisma Studio (visualização do banco)
- ESLint + Prettier (padronização de código)

---

## Estrutura de repositórios

```
brain_master/          ← repositório principal (este)
  apps/
    mobile/            ← React Native (Expo)
    web/               ← Next.js (dashboard)
    api/               ← Node.js / Fastify
  packages/
    shared/            ← tipos TypeScript compartilhados entre apps
    validators/        ← schemas Zod reutilizáveis
```

Monorepo gerenciado com **Turborepo**.

---

## Decisão registrada em
`decisoes/arquitetura.md` — ADR-001
