# Última Sessão

## Data
2026-06-04

## Fase / Sprint atual
Sprint 27 — Landing Page + Estratégia Web First

---

## O que foi feito

### Parte 1 — Mobile Sprint 26 (início da sessão)
- Mobile scaffoldado do zero: Expo Router v3, grupos `(auth)` e `(app)`
- Tela de login completa: email+senha / token (FUN-XXXXX | ENG-XXXXX)
- Zustand store com persistência AsyncStorage
- Axios client com interceptor de token + logout 401
- Supabase client configurado para mobile
- Upgrade SDK 51 → 52 → 54 (para compatibilidade com Expo Go do celular)
- Fix: `react-native-safe-area-context`, `react-native-screens`, `expo-linking` instalados
- **Mobile pausado aqui** — decisão de focar em Web First

### Parte 2 — Diagnóstico Web First
Diagnóstico completo do produto:
- **Existe:** plataforma web com 20+ páginas em produção (Vercel + Railway)
- **Faltava:** landing page, planos, onboarding, pagamento
- **Bug crítico:** DT-001 — funcionário pode ver pagamento de outro com mesmo nome (antes de abrir cadastro público)
- Decisão registrada no Brain Master: `decisoes/estrategia-web-first.md`
- `tarefas/em-andamento.md` atualizado com nova direção

### Parte 3 — Sprint 27: Landing Page
- `app/page.tsx` substituído — era `redirect('/obras')`, virou landing page completa
- 8 seções: Navbar · Hero · Problema · Como funciona · Features · Perfis · Planos · CTA + Footer
- Build corrigido (pré-existente quebrado):
  - Removidos imports Tailwind v4 incompatíveis (`tw-animate-css`, `shadcn/tailwind.css`)
  - `tailwind.config.ts` atualizado com color tokens (background, foreground, border)
  - `badge.tsx` reescrito (dependência `@base-ui/react` incompatível)
  - Instalados: `class-variance-authority`, `tailwind-merge`, `clsx`
- Build: ✓ 15 páginas geradas
- Deploy: pushado para main → Vercel automático

---

## Arquivos criados/modificados
- `codigo/apps/mobile/app/_layout.tsx`
- `codigo/apps/mobile/app/(auth)/login.tsx`
- `codigo/apps/mobile/app/(app)/index.tsx`
- `codigo/apps/mobile/store/auth.store.ts`
- `codigo/apps/mobile/lib/api.ts` + `lib/supabase.ts`
- `codigo/apps/mobile/package.json` — SDK 54, todas as deps
- `codigo/apps/web/src/app/page.tsx` — landing page completa
- `codigo/apps/web/src/app/globals.css` — fix Tailwind v3
- `codigo/apps/web/tailwind.config.ts` — color tokens
- `codigo/apps/web/src/components/ui/badge.tsx` — reescrito
- `decisoes/estrategia-web-first.md` — criado
- `tarefas/em-andamento.md` — atualizado

---

## Decisões tomadas
- **Web First** → mobile pausado até produto web comercialmente pronto
- Expo SDK 54 → compatível com Expo Go atual do celular Android
- Landing page em `app/page.tsx` direto (não em route group separado) → menos complexidade
- `@base-ui/react` removido → dependência experimental, reescrita simples

---

## Onde parou
Landing page em produção (Vercel). Build limpo. Estratégia web registrada no Brain Master.

## Próxima ação exata
**Sprint 28 — Onboarding + DT-001:**
1. Resolver DT-001 (bug privacidade pagamentos) — obrigatório antes de abrir cadastro público
2. Empty states com guia de primeiro passo no dashboard
3. Melhorar fluxo pós-cadastro (usuário novo cai no dashboard vazio)

## Commits
- `63823b1` — feat(mobile): sprint 26 scaffold + auth
- `d5c6346` — fix(mobile): ajv@8 + expo/tsconfig.base
- `3cfb41c` — chore(mobile): upgrade sdk 52
- `8bd8a16` — chore(mobile): upgrade sdk 54
- `f6dc6fa` — fix(mobile): safe-area-context + screens
- `45db298` — feat(web): landing page + fix build tailwind v3
