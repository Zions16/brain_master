# CONTEXT — Web App (apps/web)

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui  
**Deploy:** https://brain-master-delta.vercel.app  
**Auth:** Supabase Auth via NEXT_PUBLIC_SUPABASE_ANON_KEY

## Estrutura de rotas
- `(auth)/login` — login com Supabase
- `(auth)/cadastro` — novo usuário
- `(dashboard)/*` — área autenticada, guard de sessão no layout

## Arquivos críticos
- `src/lib/api.ts` — cliente HTTP para a API Railway
- `src/store/` — Zustand stores
- `src/components/` — componentes compartilhados

## Regras
- NEXT_PUBLIC_SUPABASE_ANON_KEY apenas aqui — nunca SERVICE_KEY
- API calls sempre via `src/lib/api.ts` com token do Supabase no header
- Nunca chamar Supabase diretamente para dados de negócio — sempre via API
- shadcn/ui como base de componentes — não criar UI do zero se já existe no shadcn
