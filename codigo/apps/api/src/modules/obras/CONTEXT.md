# CONTEXT — Obras

## Responsabilidade
CRUD de obras da empresa. Vínculo de usuários (obra_usuario). Contexto de todo o produto.

## Arquivos principais
- `obras.service.ts` — CRUD + membros + dados financeiros (orçamento)
- `obras.routes.ts` — rotas com autorização por perfil
- `obras.controller.ts` — handlers

## Regras de negócio críticas
- Toda entidade filha (funcionario, servico, medicao, pagamento) é vinculada a uma obra
- `obra.empresa_id` é a âncora de isolamento multiempresa
- `obra_usuario` vincula usuários (ENGENHEIRO) a obras específicas
- Função `obra_vinculada(obra_id)` no banco verifica acesso — usada em todas as RLS policies filhas
- GESTOR/FINANCEIRO veem todas as obras da empresa. ENGENHEIRO só as suas.

## Riscos
- `obra_vinculada()` no banco usa `get_minha_empresa()` — garante isolamento cross-empresa
- Não deletar obras com medições ativas (CASCADE pode destruir histórico)
- empresa_id sempre do `request.usuario.empresa_id` — nunca do body

## Antes de alterar
- [ ] empresa_id vem do request.usuario (não do body)?
- [ ] Obra vinculada ao usuário antes de permitir operação de ENGENHEIRO?
- [ ] RLS policy de obras filhas ainda funciona após mudança?
