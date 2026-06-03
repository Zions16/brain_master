# CONTEXT — Funcionários (Web Dashboard)

## Função
Cadastro e gestão de funcionários vinculados a obras.

## Perfis
- GESTOR: cria, edita, desativa funcionários
- ENGENHEIRO: lê funcionários da obra
- FUNCIONARIO: vê apenas próprios dados

## Entidade
- Funcionário pertence a `empresa` (não a obra diretamente)
- Vínculo com obra via tabela `obra_funcionario`
- Tem `valor_diaria` e lista de serviços que executa

## Dependências de API
- `GET /funcionarios` — lista da empresa
- `POST /funcionarios` — criar (GESTOR)
- `GET /funcionarios/:id` — detalhe com histórico de medições

## RLS crítico
Funcionário nunca vê dados de outro funcionário. Filtrar sempre por `id = auth.uid()` para perfil FUNCIONARIO.
