# Semana Atual — 2026-W16

**Período:** 2026-04-13 a 2026-04-18
**Sprint:** 1 — Fundação e infraestrutura
**Fase:** Fase 1 — MVP

---

## Objetivo da semana

Ambiente de desenvolvimento 100% funcional.
Turborepo rodando, Supabase conectado, schema SQL inicial criado, RLS ativo, CI funcionando.

---

## Tarefas

### Pré-requisito (fora do código)
- [ ] Criar conta no Supabase: supabase.com → New project
- [ ] Copiar: `SUPABASE_URL`, `ANON_KEY`, `SERVICE_KEY`

### Sprint 1 — Fundação
- [ ] Inicializar Turborepo em `codigo/`
  ```bash
  cd ~/Brain\ Master/ObrasApp/codigo
  npx create-turbo@latest . --package-manager npm
  ```
- [ ] Configurar ESLint + Prettier + TypeScript base compartilhado
- [ ] Preencher `.env` com chaves do Supabase
- [ ] Executar schema SQL no Supabase (empresa, usuario, obra)
- [ ] Ativar RLS nas 3 tabelas
- [ ] Verificar: `npm run dev` sobe sem erro
- [ ] Confirmar CI rodando no GitHub Actions

---

## Progresso

```
Sprint 1:  0/7 tarefas concluídas
Fase 1:    0% — aguardando início do código
Bloqueio:  criar projeto no Supabase
Pré-código: 8 bugs corrigidos antes de iniciar (tipos, validators, modelo-banco, plano-geral)
```

---

## Mudanças importantes esta semana

- Sistema de documentação evolutiva implementado
- Estrutura `cronograma/historico/` criada com todo o histórico migrado
- Semana W15 (setup) arquivada em `historico/semana-2026-W15.md`

---

## Próximos passos

Assim que o Supabase for criado:
```bash
cd ~/Brain\ Master/ObrasApp/codigo
npx create-turbo@latest . --package-manager npm
```
