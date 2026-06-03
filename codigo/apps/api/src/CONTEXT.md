# CONTEXT — API (apps/api)

**Stack:** Fastify + Node.js + TypeScript  
**Base URL prod:** https://brainmaster-production.up.railway.app  
**Padrão de módulo:** `routes → controller → service`

## Arquivos críticos
- `src/lib/supabase.ts` — cliente Supabase com SERVICE_KEY (nunca expor)
- `src/middlewares/autenticar.ts` — valida JWT do Supabase, popula `request.usuario`
- `src/middlewares/autorizar.ts` — guard de perfil: `autorizar('GESTOR', 'ENGENHEIRO')`
- `src/modules/*/` — cada entidade tem routes + controller + service

## Regras invioláveis
- SUPABASE_SERVICE_KEY apenas aqui — nunca no web ou mobile
- Todo endpoint protegido usa `preHandler: [autenticar, autorizar(...)]`
- Medição nunca é deletada — apenas cancelada com motivo em `medicao_historico`
- Queries sempre filtram por `empresa_id` do `request.usuario`

## Tipos compartilhados
- `@brain-master/shared/tipos` — todas as entidades
- `@brain-master/validators` — schemas Zod para input/output
