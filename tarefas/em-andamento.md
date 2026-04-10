# Tarefas em Andamento — Brain Master

---

## 2026-04-10 — Sprint 1: Fundação e infraestrutura

**Sprint:** 1
**Fase:** Fase 1 — MVP
**Status:** pronto para iniciar

### Plano de execução
1. Inicializar monorepo Turborepo em `codigo/`
2. Configurar ESLint + Prettier + TypeScript base
3. Criar projeto no Supabase
4. Executar schema SQL inicial (empresa, usuario, obra)
5. Ativar RLS nas 3 tabelas
6. Configurar GitHub Actions CI

### Dependências
- Conta no Supabase criada
- Node.js 20+ instalado
- Chaves do Supabase em mãos

### Critério de conclusão
- [ ] `npm run dev` sobe todos os apps sem erro
- [ ] Supabase conectado e respondendo
- [ ] CI rodando no GitHub Actions
- [ ] RLS ativo em `empresa`, `usuario`, `obra`
