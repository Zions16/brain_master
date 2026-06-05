# CONTEXT — Funcionários

## Responsabilidade
CRUD de funcionários da empresa. Consulta de produção e pagamentos próprios.
Login por token FUN-XXXXX para acesso à plataforma.

## Arquivos principais
- `funcionarios.service.ts` — CRUD + buscarMeuPerfil + listarPagamentos/Medicoes/Producao
- `funcionarios.controller.ts` — handlers
- `funcionarios.routes.ts` — rotas com autorização por perfil

## Regras de negócio críticas
- `buscarMeuPerfil(id, empresaId)` usa `funcionario.id` do JWT (Fix DT-001 — não mais por nome)
- FUNCIONARIO só acessa seus próprios dados: guard `solicitanteId !== funcionarioId` em producao/medicoes/pagamentos
- `token_acesso = FUN-XXXXX` — gerado aleatoriamente, único por funcionário
- GESTOR cria/edita. ENGENHEIRO lista. FUNCIONARIO apenas `/me` e seus dados.

## Riscos
- Fix DT-001: guard de autorização em listarPagamentosDoFuncionario, listarMedicoesDoFuncionario, calcularProducao
- Nunca buscar por nome para identificar funcionário — usar sempre ID
- empresa_id obrigatório em toda query para isolamento multiempresa

## Antes de alterar
- [ ] buscarMeuPerfil usa ID (não nome)?
- [ ] Guards de FUNCIONARIO presentes nas funções de consulta individual?
- [ ] empresa_id verificado em todas as queries?
