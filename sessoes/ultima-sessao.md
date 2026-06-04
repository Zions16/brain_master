# Última Sessão

## Data
2026-06-04

## Fase / Sprint atual
Sprint 26 — Mobile: Scaffold + Auth

## O que foi feito

### 1 — Scaffold completo do app mobile

Estrutura Expo Router v3 criada do zero:

```
apps/mobile/
  app/
    _layout.tsx          ← root com redirect baseado em auth
    (auth)/
      _layout.tsx
      login.tsx          ← email+senha / token (FUN-XXXXX | ENG-XXXXX)
    (app)/
      _layout.tsx        ← layout autenticado (Stack)
      index.tsx          ← placeholder home (obras em Sprint 27)
  lib/
    api.ts               ← axios com interceptor de token + logout 401
    supabase.ts          ← cliente Supabase com AsyncStorage
  store/
    auth.store.ts        ← Zustand + persist AsyncStorage
  constants/
    colors.ts            ← paleta dark (primary #2563EB)
  types/
    global.d.ts          ← patch para expo-router@3.5 + @types/react@19
  app.json
  tsconfig.json
  expo-env.d.ts
```

### 2 — Tela de login

- Dois modos: toggle "Email" / "Token"
- Email: email + senha → `POST /auth/login`
- Token: formato FUN-XXXXX ou ENG-XXXXX → `POST /auth/token-login`
- Loading state, error via Alert, persistência automática

### 3 — Infraestrutura TypeScript

- `@react-native-async-storage/async-storage@1.23.1` instalado
- `typeRoots` removido (causava conflito de instâncias)
- `@types/react` do mobile atualizado para `^19.0.0`
- Override `@types/react: ~18.3.12` adicionado ao root `package.json`
- `@ts-expect-error` nos 3 layouts: bug documentado `expo-router@3.5` + monorepo
- Type check: 0 erros

## Arquivos criados/modificados
- `codigo/apps/mobile/app/_layout.tsx` — root layout com auth guard
- `codigo/apps/mobile/app/(auth)/_layout.tsx` — stack auth
- `codigo/apps/mobile/app/(auth)/login.tsx` — tela de login completa
- `codigo/apps/mobile/app/(app)/_layout.tsx` — stack autenticado
- `codigo/apps/mobile/app/(app)/index.tsx` — home placeholder
- `codigo/apps/mobile/lib/api.ts` — cliente axios
- `codigo/apps/mobile/lib/supabase.ts` — cliente Supabase
- `codigo/apps/mobile/store/auth.store.ts` — store Zustand
- `codigo/apps/mobile/constants/colors.ts` — paleta
- `codigo/apps/mobile/types/global.d.ts` — type patch
- `codigo/apps/mobile/app.json` — config Expo
- `codigo/apps/mobile/tsconfig.json` — config TypeScript
- `codigo/apps/mobile/expo-env.d.ts` — Expo type reference
- `codigo/package.json` — override @types/react

## Decisões tomadas
- `@ts-expect-error` nos layouts → bug `expo-router@3.5` + `@types/react@19` em monorepo; não afeta runtime (Metro/Babel)
- Zustand + AsyncStorage para auth → padrão do projeto, persistência nativa
- Dois modos de login na mesma tela → UX simples; evita telas separadas
- Home como placeholder → obras e medições são Sprint 27

## Onde parou
Scaffold completo. Type check limpo. Auth funcional (depende da API estar rodando).

## Próxima ação exata
Sprint 27 — Obras + Medições:
1. `app/(app)/obras/index.tsx` — lista de obras
2. `app/(app)/obras/[id].tsx` — detalhes da obra
3. `app/(app)/medicoes/nova.tsx` — nova medição (3 toques)
4. Hooks: `useObras.ts`, `useMedicoes.ts`

## Commit
63823b1
