# Tarefas em Andamento — Brain Master

---

## 2026-05-22 — Sprint 2: Autenticação

**Sprint:** 2
**Fase:** Fase 1 — MVP
**Status:** em andamento

### Plano de execução
1. [x] Criar estrutura de pastas da API (lib, plugins, middlewares, modules/auth)
2. [x] `lib/supabase.ts` — cliente singleton com service key
3. [x] `plugins/` — cors, helmet, rateLimit
4. [x] `middlewares/autenticar.ts` — verifica JWT via supabase.auth.getUser()
5. [x] `middlewares/autorizar.ts` — verifica perfil
6. [x] `modules/auth/` — routes, controller, service
7. [x] `app.ts` + `server.ts` — Fastify factory + bootstrap
8. [x] `tsconfig.json` — configurado para monorepo
9. [ ] Testar `POST /auth/login` manualmente com usuário real do Supabase
10. [ ] Criar usuário de teste no Supabase para validação

### Dependências
- [x] Supabase com schema completo e RLS ativo (Sprint 1)
- [x] .env com SUPABASE_URL e SUPABASE_SERVICE_KEY

### Critério de conclusão
- [x] TypeScript compila sem erros
- [ ] `npm run dev` na API sobe sem erro
- [ ] POST /auth/login retorna access_token + usuario
- [ ] POST /auth/refresh renova token
- [ ] POST /auth/logout invalida sessão
- [ ] Rate limit: 6ª tentativa de login bloqueada
